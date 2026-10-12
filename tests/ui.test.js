import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { pathToFileURL } from 'node:url';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

// DOM interaction checks, not a replacement for visual verification in a browser.
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost:4173' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true });
window.scrollTo = () => {};
const { act, createElement } = await import('react');
const { createRoot } = await import('react-dom/client');
const dir = path.resolve('.test-build');
await mkdir(dir, { recursive: true });
await build({ stdin: { contents: `export { default as App } from './src/App.jsx'; export { default as Game } from './src/components/Game.jsx'; export { default as SequenceGame } from './src/components/SequenceGame.jsx'; export { StickerNotification } from './src/components/ClassroomExtras.jsx'; export { validateSave, STORAGE_KEY } from './src/hooks/useClassroom.js'; export { getLevel } from './src/data/curriculum.js';`, resolveDir: process.cwd(), loader: 'jsx' }, outfile: path.join(dir, 'ui.mjs'), bundle: true, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
const { App, Game, SequenceGame, StickerNotification, validateSave, STORAGE_KEY, getLevel } = await import(pathToFileURL(path.join(dir, 'ui.mjs')));
let root;
async function mount(element) {
  if (root) await act(async () => root.unmount());
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(element));
}
async function click(button) {
  assert.ok(button, 'Button must exist');
  assert.equal(button.disabled, false, 'Button must be enabled');
  await act(async () => button.click());
}
const button = label => [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === label || b.textContent.trim() === label);
async function change(input, value) {
  const proto = input.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
  await act(async () => { Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value); input.dispatchEvent(new window.Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); });
}
async function submit(form) { await act(async () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))); }
const readSave = () => JSON.parse(localStorage.getItem(STORAGE_KEY));
const team = (id, name, progress = {}) => ({ id, name, members: [name], avatar: 0, progress, lastLevel: '1-1' });
async function finishBySteps() {
  for (let i = 0; i < 80 && !document.querySelector('.win-modal'); i++) await click(button('Executar um passo'));
  assert.ok(document.querySelector('.win-modal'), 'A correct program should complete the challenge');
}

test('Create individual team, complete first challenge, reload and recover progress without audio', async () => {
  localStorage.clear(); await mount(createElement(App));
  assert.match(document.body.textContent, /Quem vai explorar hoje/);
  await change(document.querySelector('select'), 'class-1-a');
  await change(document.querySelector('input'), 'Ana');
  await submit(document.querySelector('form'));
  assert.equal(readSave().teams[0].members[0], 'Ana');
  await click(button('Começar aventura'));
  assert.ok(document.querySelector('.demo-modal'), 'First challenge shows a visual walkthrough');
  await click(button('Vamos jogar'));
  assert.equal(document.querySelectorAll('.palette-block').length, 1, 'Only the needed arrow appears');
  await click(button('Adicionar direita'));
  await finishBySteps();
  assert.equal(readSave().teams[0].progress['1-1'].stars, 3);
  await mount(createElement(App));
  assert.match(document.querySelector('.team-switcher').textContent, /Ana/);
  assert.equal(readSave().teams[0].progress['1-1'].stars, 3);
  assert.doesNotMatch(document.body.textContent, /Ouvir|Ativar som|Silenciar/);
});

test('Switch teams without sharing progress; create quartet and edit its membership', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, teams: [team('a', 'Equipe A', { '1-1': { stars: 3 } }), team('b', 'Equipe B')], activeId: 'a', unlocked: false }));
  await mount(createElement(App));
  await click(document.querySelector('.team-switcher'));
  await click([...document.querySelectorAll('.team-row')].find(b => b.textContent.includes('Equipe B')));
  assert.equal(readSave().activeId, 'b'); assert.equal(Object.keys(readSave().teams[1].progress).length, 0); assert.equal(readSave().teams[0].progress['1-1'].stars, 3);
  await click(button('Minhas equipes')); await click(button('Nova equipe')); await click(button('Quarteto'));
  await change(document.querySelector('.modal select'), 'class-2-b');
  const fields = document.querySelectorAll('.modal input');
  for (const [i, name] of ['Bia', 'Caio', 'Duda', 'Eva', 'Quarteto do jardim'].entries()) await change(fields[i], name);
  await submit(document.querySelector('.modal form'));
  assert.deepEqual(readSave().teams[2].members, ['Bia', 'Caio', 'Duda', 'Eva']);
  await click(button('Minhas equipes'));
  assert.equal(button('Editar Quarteto do jardim'), undefined, 'students cannot edit team profiles');
  await click(button('Jogar com esta equipe'));
  assert.deepEqual(readSave().teams[2].members, ['Bia', 'Caio', 'Duda', 'Eva']); assert.equal(readSave().teams[0].progress['1-1'].stars, 3);
});

test('All missions are open, with four independent trails per level', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, teams: [team('a', 'Ana')], activeId: 'a' }));
  await mount(createElement(App));
  await click(document.querySelector('.world-card'));
  assert.equal(document.querySelectorAll('.level-node:disabled').length, 0);
  assert.equal(document.querySelectorAll('.trail-tabs button').length, 4);
  await click(document.querySelectorAll('.trail-tabs button')[3]);
  assert.equal(document.querySelectorAll('.level-node').length, 10);
  assert.match(document.querySelector('.level-node').getAttribute('aria-label'), /Desafio 31/);
  assert.doesNotMatch(document.body.textContent, /º ano|º ANO/);
});

test('Nested repeat editor executes chosen count and supports undo', async () => {
  let completed = 0;
  await mount(createElement(Game, { level: getLevel('3-1'), team: team('a', 'Ana'), onComplete: () => completed++, onBack() {}, onNext() {}, onWorld() {} }));
  await click(button('Adicionar repetir')); await click(document.querySelector('.code-block.repeat .add-target')); await click(button('Adicionar direita'));
  await change(document.querySelector('select'), '3'); await finishBySteps(); assert.equal(completed, 1);
  await click(button('Jogar de novo')); await click(button('Desfazer última alteração')); assert.equal(document.querySelector('select').value, '2');
});

test('If/else editor solves both scenarios with one program', async () => {
  let completed = 0;
  await mount(createElement(Game, { level: getLevel('4-1'), team: team('a', 'Ana'), onComplete: () => completed++, onBack() {}, onNext() {}, onWorld() {} }));
  await click(button('Adicionar se/senão'));
  await click(document.querySelectorAll('.code-block.if > .block-body .add-target')[0]); await click(button('Adicionar direita'));
  await click(document.querySelectorAll('.code-block.if > .block-body .add-target')[1]); await click(button('Adicionar cima'));
  await finishBySteps(); assert.equal(completed, 1); assert.match(document.querySelector('.success-scenarios').textContent, /2 cenários/);
});

test('Function definition is reusable and runs from its call inside repeat', async () => {
  let completed = 0;
  await mount(createElement(Game, { level: getLevel('5-2'), team: team('a', 'Ana'), onComplete: () => completed++, onBack() {}, onNext() {}, onWorld() {} }));
  await click(document.querySelector('.function-workspace .add-target')); await click(button('Adicionar direita')); await click(button('Adicionar cima'));
  assert.equal(button('Adicionar Meu bloco').disabled, true, 'Self-recursion cannot be added');
  await click(document.querySelector('.program-workspace > .block-list > .add-target')); await click(button('Adicionar repetir'));
  await click(document.querySelector('.program-workspace .code-block.repeat .add-target')); await click(button('Adicionar Meu bloco'));
  await finishBySteps(); assert.equal(completed, 1);
});

test('Validate imported saves, filter invalid progress, and reject malformed teams', () => {
  assert.throws(() => validateSave({ version: 99, teams: [] }));
  assert.throws(() => validateSave({ version: 1, teams: [{ ...team('a', 'A'), members: [''] }] }));
  assert.throws(() => validateSave({ version: 1, teams: [team('a', 'A'), team('a', 'B')] }));
  const validated = validateSave({ version: 1, activeId: 'missing', teams: [team('a', 'A', { '1-1': { stars: 3 }, '1-2': { stars: 7 }, 'x': { stars: 3 } })] });
  assert.deepEqual(Object.keys(validated.teams[0].progress), ['1-1']); assert.equal(validated.activeId, null);
});

test('End a session with visual feedback and recover it after reload', async () => {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,teams:[team('a','Equipe Lua')],activeId:'a'}));
  await mount(createElement(App));
  await click(button('Encerrar sessão'));
  assert.ok(document.querySelector('.feedback-modal'));
  await click(button('Foi legal!')); await click([...document.querySelectorAll('.difficulty-options button')][1]);
  await submit(document.querySelector('.feedback-modal form'));
  const saved=readSave();
  assert.equal(saved.activeId,null); assert.equal(saved.teams[0].sessions.at(-1).feeling,'loved'); assert.equal(saved.teams[0].sessions.at(-1).difficulty,'right');
  await mount(createElement(App));
  assert.match(document.body.textContent,/Que bom ter vocês de volta/);
  await click(document.querySelector('.team-row'));
  assert.ok(readSave().teams[0].currentSession);
  assert.equal(readSave().teams[0].sessions.length,1);
});

test('Teacher password gate, class filter, reward and logout persist correctly', async () => {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEY,JSON.stringify({version:2,classes:[{id:'a',name:'Manhã'},{id:'b',name:'Tarde'}],teams:[{...team('a','Equipe Lua'),classId:'a'},{...team('b','Equipe Sol'),classId:'b'}],activeId:'a'}));
  await mount(createElement(App)); await click(button('Espaço do professor'));
  assert.equal(document.querySelector('.team-progress-table'),null);
  for(const el of document.querySelectorAll('.teacher-login input')) await change(el,'professor-test-42');
  await act(async()=>{ document.querySelector('.teacher-login form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})); await new Promise(resolve=>setTimeout(resolve,2500)); });
  assert.ok(document.querySelector('.teacher-stats'));
  assert.equal(document.querySelector('.team-switcher'),null,'The teacher area must not show which student team was active.');
  assert.doesNotMatch(localStorage.getItem('bloco.teacher.lock.v1'),/professor-test-42/);
  await change(document.querySelector('[aria-label="Filtrar por turma"]'),'a');
  assert.match(document.querySelector('.team-progress-table').textContent,/Equipe Lua/);
  assert.doesNotMatch(document.querySelector('.team-progress-table').textContent,/Equipe Sol/);
  await click(button('Ver progresso de Equipe Lua')); await click(button('Stickers'));
  await click(document.querySelectorAll('.sticker-picker button')[1]); await submit(document.querySelector('.team-detail-modal form'));
  assert.equal(readSave().teams[0].stickers[0].type,'persistence');
  await click(button('Fechar')); await click(button('Sair do painel'));
  assert.equal(document.querySelector('.team-progress-table'),null);
  await click(button('Conquistas')); assert.match(document.querySelector('.sticker-album').textContent,/Não desistiu/);
  await click(button('Espaço do professor'));
  for(const el of document.querySelectorAll('.teacher-login input')) await change(el,'professor-test-42');
  await act(async()=>{ document.querySelector('.teacher-login form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})); await new Promise(resolve=>setTimeout(resolve,2500)); });
  await change(document.querySelector('[aria-label="Filtrar por turma"]'),'b');
  await click(button('Ver progresso de Equipe Sol')); await click(button('Excluir equipe'));
  assert.match(document.querySelector('.delete-team-confirm').textContent,/progresso.*sessões.*stickers/i);
  await click(button('Excluir permanentemente'));
  assert.deepEqual(readSave().teams.map(t=>t.name),['Equipe Lua']);
  await click(button('Sair do painel'));
  await click(button('Conquistas')); assert.match(document.querySelector('.sticker-album').textContent,/Não desistiu/);
  await click(button('Espaço do professor'));
  assert.ok(document.querySelector('.teacher-login'));
});

test('A sticker notification tells the team what the teacher sent and can be dismissed', async () => {
  let dismissed;
  await mount(createElement(StickerNotification,{notice:{id:'award-1',type:'logic',note:'Pensaram juntos!',teamName:'Equipe Lua'},onDismiss:id=>{dismissed=id;}}));
  assert.match(document.querySelector('.sticker-notification').textContent,/Equipe Lua, vocês ganharam/);
  assert.match(document.querySelector('.sticker-notification').textContent,/Ideia brilhante/);
  assert.match(document.querySelector('.sticker-notification').textContent,/Pensaram juntos/);
  await click(button('Fechar notificação de sticker'));
  assert.equal(dismissed,'award-1');
});

after(async () => { if (root) await act(async () => root.unmount()); dom.window.close(); await rm(dir, { recursive: true, force: true }); });

test('Sequence challenges display symbol-only cards or reading cards and save completed progress', async () => {
  const visualTeam = team('seq-visual', 'Equipe Figura');
  let result;
  await mount(createElement(SequenceGame, { level: getLevel('8-1'), team: visualTeam, onAttempt: () => {}, onComplete: (...args) => { result = args; } }));
  assert.ok(document.querySelector('.sequence-board.symbol-mode'));
  assert.equal(document.querySelectorAll('.sequence-card .sequence-step-text').length, 0, 'non-reading mode has no visible action text');
  for (let position = 0; position < getLevel('8-1').steps.length; position++) {
    let cards = [...document.querySelectorAll('.sequence-card')];
    let current = cards.findIndex(el => el.querySelector('.sr-only').textContent === getLevel('8-1').steps[position][1]);
    while (current > position) {
      await click(cards[current].querySelectorAll('.sequence-controls button')[0]);
      cards = [...document.querySelectorAll('.sequence-card')]; current--;
    }
  }
  await click(button('Conferir sequência'));
  assert.equal(result[0], '8-1'); assert.equal(result[1], 3);
  assert.ok(document.querySelector('.win-modal'));
  await mount(createElement(SequenceGame, { level: getLevel('9-1'), team: team('seq-words', 'Equipe Leitura'), onComplete: () => {} }));
  assert.ok(document.querySelector('.sequence-board.word-mode'));
  assert.ok(document.querySelectorAll('.sequence-step-text').length > 0, 'reading mode includes written actions');
});
