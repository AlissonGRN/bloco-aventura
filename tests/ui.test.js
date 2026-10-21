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
await build({ stdin: { contents: `export { default as App } from './src/App.jsx'; export { default as Game } from './src/components/Game.jsx'; export { default as SequenceGame } from './src/components/SequenceGame.jsx'; export { StickerNotification } from './src/components/ClassroomExtras.jsx'; export { validateSave, STORAGE_KEY } from './src/hooks/useClassroom.js'; export { getLevel } from './src/data/curriculum.js'; export { Robot } from './src/components/Art.jsx';`, resolveDir: process.cwd(), loader: 'jsx' }, outfile: path.join(dir, 'ui.mjs'), bundle: true, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
const { App, Game, SequenceGame, StickerNotification, validateSave, STORAGE_KEY, getLevel, Robot } = await import(pathToFileURL(path.join(dir, 'ui.mjs')));
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

test('Missions remain open and each world shows only the trails it uses', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, teams: [team('a', 'Ana')], activeId: 'a' }));
  await mount(createElement(App));
  await click(document.querySelectorAll('.world-card')[2]);
  assert.equal(document.querySelectorAll('.level-node:disabled').length, 0);
  assert.equal(document.querySelectorAll('.trail-tabs button').length, 2);
  await click(document.querySelectorAll('.trail-tabs button')[1]);
  assert.equal(document.querySelectorAll('.level-node').length, 10);
  assert.match(document.querySelector('.level-node').getAttribute('aria-label'), /Desafio 11/);
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
  await click(button('Ver progresso de Equipe Lua'));
  await click(button('Editar cadastro da equipe'));
  await change(document.querySelector('.team-detail-modal input'), 'Ana Editada');
  await submit(document.querySelector('.team-detail-modal .team-form'));
  assert.equal(readSave().teams[0].members[0], 'Ana Editada');
  await click(button('Stickers'));
  await click(document.querySelectorAll('.sticker-picker button')[1]); await submit(document.querySelector('.team-detail-modal form'));
  assert.equal(readSave().teams[0].stickers[0].type,'persistence');
  await click(document.querySelectorAll('.sticker-picker button')[8]); await submit(document.querySelector('.team-detail-modal form'));
  assert.equal(readSave().teams[0].stickers[1].type,'kindness','New classroom stickers can be selected and awarded');
  assert.match(document.querySelector('.team-detail-modal [role="status"]').textContent,/entregue com sucesso/i);
  await click(button('Skins'));
  await click(document.querySelectorAll('.teacher-skin-card button')[20]);
  assert.ok(readSave().teams[0].bonusSkins.includes(20),'the teacher can grant a specific skin to the selected team');
  await click(document.querySelectorAll('.teacher-skin-card button')[24]);
  assert.ok(readSave().teams[0].bonusSkins.includes(24),'the teacher can grant a new exclusive skin to the selected team');
  await click(button('Fechar')); await click(button('Sair do painel'));
  assert.equal(document.querySelector('.team-progress-table'),null);
  await click(button('Conquistas')); assert.match(document.querySelector('.sticker-album').textContent,/Não desistiu/);
  const giftedSkin=document.querySelector('[aria-label="Skin Fada das Engrenagens"]');
  assert.ok(giftedSkin && !giftedSkin.disabled,'the selected team can equip a skin granted by the teacher');
  await click(giftedSkin); assert.equal(readSave().teams[0].avatar,20);
  const unicornSkin = [...document.querySelectorAll('.skin-option')].find(item => item.textContent.includes('Unicórnio Algodão Doce'));
  assert.ok(unicornSkin && !unicornSkin.disabled, 'a teacher-granted exclusive skin is available to its team');
  await click(unicornSkin);
  assert.equal(readSave().teams[0].avatar,24);
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


test('Teacher planning tab renders the full lesson plan without crashing', async () => {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 2,
    classes: [{ id: 'class-a', name: '1º A' }, { id: 'class-b', name: '2º B' }],
    teams: [],
    activeId: null,
  }));
  await mount(createElement(App));
  await click(button('Espaço do professor'));
  for (const el of document.querySelectorAll('.teacher-login input')) await change(el, 'professor-test-42');
  await act(async () => {
    document.querySelector('.teacher-login form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 2500));
  });
  assert.ok(document.querySelector('.teacher-stats'), 'Teacher panel should open');
  await click(button('Planejar aulas'));
  assert.ok(document.querySelector('.proposed-activity-editor'), 'Planning editor should render');
  assert.match(document.body.textContent, /Organize os encontros/);
  assert.ok(document.querySelectorAll('.planning-grid > section').length > 0, 'World-by-world lesson plans should be visible');
  await change(document.querySelectorAll('.proposed-activity-editor select')[1], '1');
  assert.ok(document.querySelector('.proposal-world-preview'), 'Selecting a world should show its preview');
});

test('The updated character skins render as their own SVG variants', async () => {
  const variants = [
    [13, 'dragon', /M36 47C23 37 15 20 7 7/],
    [14, 'spaceship', /M46 29 60 8 74 29/],
    [16, 'mushroom', /M17 38C19 19 37 7 60 7/],
    [18, 'lion', /M29 39/],
    [20, 'fairy', /M41 87/],
    [21, 'cat', /M82 101C103 111 116 94 109 81/],
    [25, 'ghost', /M19 78V51C19 34 31 24 47 24/],
    [26, 'alien', /M43 29/],
  ];
  for (const [index, name, drawing] of variants) {
    await mount(createElement(Robot, { skin: index }));
    const svg = document.querySelector('svg.bip-robot');
    assert.ok(svg, name + ' skin renders an SVG');
    assert.ok(svg.classList.contains('bip-skin-' + index), name + ' uses its saved skin index');
    assert.match(svg.outerHTML, drawing, name + ' includes its defining visual details');
  }
});

after(async () => { if (root) await act(async () => root.unmount()); dom.window.close(); await rm(dir, { recursive: true, force: true }); });

test('The daily-life sequence level remains available with written actions', async () => {
  let result;
  const sequence=getLevel('8-1');
  await mount(createElement(SequenceGame,{level:sequence,team:team('sequence-team','Equipe Leitura'),onAttempt:()=>{},onComplete:(...args)=>{result=args;}}));
  assert.ok(document.querySelectorAll('.sequence-step-text').length>0,'sequence cards show written actions');
  for(let position=0;position<sequence.steps.length;position++){
    let cards=[...document.querySelectorAll('.sequence-card')];
    let current=cards.findIndex(card=>card.querySelector('.sr-only').textContent===sequence.steps[position][1]);
    while(current>position){await click(cards[current].querySelectorAll('.sequence-controls button')[0]);cards=[...document.querySelectorAll('.sequence-card')];current--;}
  }
  await click(button('Conferir sequência'));
  assert.deepEqual(result,['8-1',3]);
  assert.ok(document.querySelector('.win-modal'));
});

test('Action challenges show tools and let Bip pick an item on the board', async () => {
  let completed = 0;
  const level = getLevel('9-1');
  await mount(createElement(Game, { level, team: team('action-team', 'Equipe Bip'), onComplete: () => completed++, onBack() {}, onNext() {}, onWorld() {} }));
  assert.ok(document.querySelector('.action-object'), 'the item is visible in the grid');
  for (const block of level.solution) await click(button(block.type === 'move' ? 'Adicionar direita' : 'Adicionar Pegar'));
  await finishBySteps();
  assert.equal(completed, 1);
  assert.match(document.querySelector('.win-modal').textContent, /Vocês conseguiram/);

  await mount(createElement(Game, { level: getLevel('9-11'), team: team('jump-team', 'Equipe Salto'), onBack() {}, onNext() {}, onWorld() {} }));
  assert.ok(document.querySelector('.action-gap'), 'the gap is visible in a jumping challenge');
  assert.ok(button('Adicionar Pular'), 'the jump command is available');
});

test('Surprise trail presents the new activate action to the team', async () => {
  await mount(createElement(Game, { level: getLevel('10-11'), team: team('a', 'Equipe'), onComplete() {}, onBack() {}, onNext() {}, onWorld() {} }));
  assert.ok(button('Adicionar Ativar'));
  assert.match(document.body.textContent, /ative o botão correto, atravesse a ponte/i);
  assert.ok(document.querySelector('.switch-object'));
});

test('Game speed choice is remembered when opening another level', async () => {
  localStorage.removeItem('bloco.game.speed.v1');
  const props = { team: team('speed-team', 'Equipe Velocidade'), onBack() {}, onNext() {}, onWorld() {} };
  await mount(createElement(Game, { ...props, level: getLevel('1-1') }));
  await click(button('Mudar para velocidade rápida'));
  assert.equal(localStorage.getItem('bloco.game.speed.v1'), 'fast');
  await mount(createElement(Game, { ...props, level: getLevel('1-2') }));
  assert.ok(button('Mudar para velocidade lenta'), 'The next level keeps the selected fast speed');
});
