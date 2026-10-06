import { LEVELS as ORIGINAL, WORLDS as WORLDS_BASE, level as createMission, boardFromPath, move, repeat, branch, call, countBlocks } from './baseCurriculum.js';
export { DIRS, DIRECTIONS, move, repeat, branch, call, countBlocks, boardFromPath } from './baseCurriculum.js';

export const MISSIONS_PER_LEVEL = 40;
export const MISSIONS_PER_TRAIL = 10;
export const KIND_LABELS = { build: 'Monte o caminho', debug: 'Encontre o erro', optimize: 'Use menos blocos', adapt: 'Teste os cenários', compose: 'Combine suas ideias' };
const topics = ['Sequências, direções e correção', 'Planejamento, padrões e repetições', 'Repetições, decisões e otimização', 'Condições, funções e depuração', 'Integração e resolução de problemas'];
const descriptions = ['Observe, organize, teste e descubra novas possibilidades.', 'Planeje o trajeto e descubra jeitos de economizar blocos.', 'Um padrão pode se repetir. Uma escolha pode mudar tudo.', 'Olhe ao redor, escolha uma direção e reutilize suas ideias.', 'Transforme tudo o que descobriu em grandes invenções.'];
const trails = [
  ['Primeiros passos', 'Caminhos e padrões', 'Detetives das setas', 'Expedição do jardim'],
  ['Planejar e conferir', 'Rotas e tesouros', 'Descobrindo repetições', 'Planos mais inteligentes'],
  ['O poder dos padrões', 'Repetir e corrigir', 'Primeiras decisões', 'Juntar as peças'],
  ['Decidir pelo caminho', 'Um plano, muitos cenários', 'Oficina de correções', 'Inventar e reutilizar'],
  ['Peças de uma invenção', 'Decompor e combinar', 'Laboratório de testes', 'Grandes expedições'],
];
const discussions = [
  ['Qual seta fez o Bip mudar de direção?', 'Qual parte do caminho parece com outra?', 'Onde o Bip parou de fazer o que vocês imaginaram?', 'Conseguem explicar o caminho usando gestos?'],
  ['O que vocês planejaram antes de executar?', 'Duas equipes podem criar planos diferentes?', 'Que sequência aparece mais de uma vez?', 'O que mudou quando vocês usaram menos blocos?'],
  ['O que fica dentro da repetição?', 'Como descobrir qual repetição está errada?', 'O que o sensor verifica antes de escolher?', 'Quando vale a pena juntar repetir com se/senão?'],
  ['Por que um caminho fixo não resolve todos os cenários?', 'O que continuou funcionando quando o caminho mudou?', 'Qual foi o menor ajuste que corrigiu o erro?', 'Qual parte merece virar um bloco próprio?'],
  ['Como dividir o problema em partes menores?', 'Como escolher o que guardar na função?', 'Como testar a correção em todos os cenários?', 'Quais soluções diferentes a turma encontrou?'],
];
const guidance = [
  'Comece com gestos e setas. Depois compare sequências e corrija programas. As imagens e a demonstração permitem jogar sem ler ou ouvir.',
  'Peça uma previsão antes da execução. Nas duas últimas trilhas, compare sequências longas com soluções que usam repetir.',
  'Alterne construção, correção e economia de blocos. As trilhas finais introduzem se/senão e o combinam com repetições.',
  'Teste cada programa em cenários diferentes. A última trilha introduz funções em problemas de sequência, repetição e decisão.',
  'Misture todos os conceitos. Algumas missões exigem função; outras permitem escolher a estratégia. Priorize a explicação e os testes.',
];
export const WORLDS = WORLDS_BASE.map((w, i) => ({ ...w, name: i === 2 ? 'Vale dos padrões' : w.name, topic: topics[i], description: descriptions[i], skill: guidance[i], teacher: guidance[i], trails: trails[i].map((title, j) => ({ number: j + 1, title, first: j * 10 + 1, last: j * 10 + 10, discussion: discussions[i][j] })) }));
const seq = text => [...text].map(move);
const dirs = ['R', 'U', 'L', 'D'];
const rot = (d, n) => dirs[(dirs.indexOf(d) + n) % 4];
const rotPath = (p, n) => [...p].map(d => rot(d, n)).join('');
const rotBlocks = (blocks, n) => blocks.map(b => ({ ...b, ...(b.direction ? { direction: rot(b.direction, n) } : {}), ...(b.body ? { body: rotBlocks(b.body, n) } : {}), ...(b.elseBody ? { elseBody: rotBlocks(b.elseBody, n) } : {}) }));
const choose = () => branch('R', [move('R')], [move('U')]);
const broken = p => [move(rot(p[0], 2)), ...seq(p.slice(1))];
const extra = [];
function add(grade, number, title, path, solution, options = {}) {
  const kind = options.kind || 'build';
  const instruction = kind === 'debug' ? 'Algo está errado neste programa. Corrija a ideia e teste novamente.' : kind === 'optimize' ? 'O caminho pode ficar menor. Respeite a meta de blocos e colete todos os cristais.' : kind === 'compose' ? 'Planeje em partes. Combine os blocos para pegar os cristais e chegar à bandeira.' : undefined;
  extra.push(createMission(grade, number, title, path, solution, { maxBlocks: Math.max(28, path.length + 5), kind, ...(instruction ? { instruction } : {}), ...options }));
}
const gardenPaths = ['UUR', 'RRD', 'DLL', 'LLUU', 'DDRR', 'RUUR', 'URRU', 'RRDLL', 'UURDD', 'RRUULLD', 'RUURR', 'UURRD', 'RRDDLL', 'LLURR', 'DDRUU', 'RRUUUL', 'UURRDL', 'LLDDRR', 'RRDLLU', 'UURRDDLL', 'RRRUU', 'UUURR', 'RRUULLUU', 'UURRDDRR', 'DDRRUURR', 'LLUURRU', 'RRDDLLDD', 'UURRUULL', 'RRUULLUURR', 'UURRDDLLDDRR'];
const gardenNames = ['Suba até a curva', 'Hora de descer', 'Olhe para a esquerda', 'Um canto do jardim', 'Uma curva diferente', 'Siga os brilhos', 'Troque a ordem', 'Contorne as flores', 'Suba e volte', 'Quatro direções', 'Uma seta trocada', 'O cristal esquecido', 'Conserte a volta', 'Um começo diferente', 'Bip se confundiu', 'A curva errada', 'Revise o plano', 'Gire sua ideia', 'Encontre a primeira seta', 'Uma volta bem pensada', 'A trilha comprida', 'Primeiro lá em cima', 'Duas curvas iguais', 'A ponte do jardim', 'Uma nova saída', 'A volta das flores', 'Uma grande descida', 'Zigue-zague verde', 'O passeio dos cristais', 'Expedição completa'];
gardenPaths.forEach((p, i) => add(1, i + 11, gardenNames[i], p, seq(p), i >= 10 && i < 20 ? { kind: 'debug', starter: broken(p), concept: 'Observar e corrigir sequências' } : {}));
const islandPaths = ['RRUURR', 'UURRDDRR', 'RRDDLLUU', 'UURRUULL', 'LLDDRRDD', 'RRUULLUURR', 'DDRRUURRUU', 'RRRUUULLDD', 'UURRDDRRUU', 'RRUUULLUURR'];
islandPaths.forEach((p, i) => add(2, 11 + i, ['Rota da praia', 'Depois da ponte', 'Contorne a lagoa', 'O alto da ilha', 'Vire o mapa', 'Busque os cristais', 'Plano em duas partes', 'Volta pelo mirante', 'O caminho esquecido', 'Grande passeio'][i], p, seq(p), i % 3 === 2 ? { kind: 'debug', starter: broken(p) } : {}));
const loopPatterns = [['R', 4], ['U', 4], ['D', 3], ['L', 4], ['RU', 3], ['RD', 3], ['LU', 3], ['RRU', 2], ['RUU', 2], ['RRUU', 2]];
loopPatterns.forEach(([p, n], i) => {
  const path = p.repeat(n), sol = [repeat(n, seq(p))];
  add(2, 21 + i, ['Um comando repetido', 'Repetir para subir', 'Repetir para descer', 'Voltar em quatro passos', 'O padrão da escada', 'Uma escada para baixo', 'O padrão espelhado', 'Dois passos e uma curva', 'Subidas em dobro', 'Um padrão de quatro'][i], path, sol, { required: ['repeat'], concept: 'Sequências e primeiras repetições', instruction: 'Descubra a parte que se repete e coloque essa sequência dentro de repetir.', hint: 'Monte a parte repetida dentro do bloco amarelo e escolha quantas vezes ela acontece.' });
  const turned = rotPath(path, 1), solution = rotBlocks(sol, 1);
  add(2, 31 + i, ['Encurte a caminhada', 'Menos setas, mesma ideia', 'O padrão economiza', 'Uma sequência menor', 'A escada compacta', 'Repetir sem se perder', 'Duas ideias combinadas', 'O plano da ponte', 'Economize os blocos', 'Mestre da ilha'][i], turned, solution, { kind: 'optimize', starter: seq(turned), required: ['repeat'], budget: countBlocks(solution), concept: 'Planejamento, repetição e otimização' });
});
const patterns = [['RU', 4], ['RRD', 3], ['UUL', 3], ['DDR', 3], ['LLUU', 2], ['RRUU', 3], ['RRRU', 2], ['DLL', 3], ['UURR', 3], ['RRDD', 3]];
patterns.forEach(([p, n], i) => {
  const path = p.repeat(n), sol = [repeat(n, seq(p))];
  add(3, 11 + i, ['Reconheça o desenho', 'A contagem errada', 'Um padrão para a esquerda', 'Depure a descida', 'Compare os blocos', 'Três partes iguais', 'Encurte a ponte', 'Revise a repetição', 'O mesmo resultado', 'Uma boa combinação'][i], path, sol, i % 2 ? { kind: 'debug', starter: [repeat(n > 2 ? n - 1 : 3, seq(p))], required: ['repeat'] } : { kind: 'optimize', starter: seq(path), required: ['repeat'], budget: countBlocks(sol) });
});
const adaptivePaths = [['R', 'U'], ['RR', 'UU'], ['RRUU', 'UURR'], ['RRRUU', 'UURRR'], ['RRUURR', 'UURRUU'], ['RRRUUU', 'UUURRR'], ['RRUURRU', 'UURRUUR'], ['RRRUURRR', 'UURRRUUU'], ['RRUURRUU', 'UURRUURR'], ['RRRUUURRRUUU', 'UUURRRUUURRR']];
function adaptive(grade, number, title, paths, turns = 0, options = {}) {
  const turned = paths.map(p => rotPath(p, turns));
  const sol = rotBlocks(paths[0].length === 1 ? [choose()] : [repeat(paths[0].length, [choose()])], turns);
  add(grade, number, title, turned[0], sol, { kind: 'adapt', boards: turned.map(p => boardFromPath(p)), required: ['if'], concept: 'Sequências, repetições e decisões', instruction: `Resolva os ${paths.length} cenários com o mesmo programa.`, hint: 'O sensor pergunta se há caminho na direção escolhida. Use se/senão para decidir e repetir para continuar tomando essa decisão.', ...options });
}
adaptivePaths.forEach((paths, i) => adaptive(3, 21 + i, ['Uma nova pergunta', 'Se estiver livre', 'A escolha da curva', 'Repetir uma decisão', 'Conferir o caminho', 'Dois cenários', 'Olhar antes de andar', 'O teste da equipe', 'Duas rotas, um plano', 'Misturando ideias'][i], paths));
adaptivePaths.forEach((paths, i) => adaptive(3, 31 + i, ['Decisão espelhada', 'Outra direção', 'O sensor errado', 'Escolha com poucos blocos', 'Corrija a pergunta', 'Repetir e escolher', 'Revise os dois caminhos', 'Uma solução enxuta', 'O plano que se adapta', 'Expedição pelo vale'][i], paths, 1, i % 2 ? { kind: 'optimize', budget: paths[0].length === 1 ? 3 : 4 } : { kind: 'debug', starter: seq(rotPath(paths[0], 1)) }));
const three = [['RRUU', 'UURR', 'RURU'], ['RRRUU', 'UURRR', 'RURRU'], ['RRRUUU', 'UUURRR', 'RURURU'], ['RRRRUU', 'UURRRR', 'RRURRU'], ['RRUURRUU', 'UURRUURR', 'RURURURU'], ['RRRUUURR', 'UURRRRUU', 'RURURURU'], ['RRRRUUUU', 'UUUURRRR', 'RRUURRUU'], ['RRRUUURRR', 'UUURRRRRR', 'RURURURRR'], ['RRRUUURRUU', 'UURRUUURRR', 'RURURURURU'], ['RRRUUURRRUUU', 'UUURRRUUURRR', 'RRUURRUURRUU']];
three.forEach((paths, i) => adaptive(4, 11 + i, ['Mais de uma resposta', 'Um terceiro caminho', 'A mesma regra', 'Observe os cenários', 'Escada e curva', 'Plano flexível', 'Mudou o desenho', 'Teste antes de concluir', 'A regra continua', 'Três caminhos resolvidos'][i], paths, i % 4));
three.forEach((paths, i) => adaptive(4, 21 + i, ['Conserte o sensor', 'Revise a repetição', 'O caminho funciona?', 'Encurte a decisão', 'O teste que faltava', 'Uma correção pequena', 'Planeje, teste, ajuste', 'A regra mais simples', 'Confira os cenários', 'Oficina concluída'][i], paths, (i + 2) % 4, i % 2 ? { kind: 'optimize', budget: 4 } : { kind: 'debug', starter: seq(rotPath(paths[0], (i + 2) % 4)) }));
const functions = [['RU', 2], ['RRU', 2], ['UR', 3], ['RDD', 2], ['LLU', 3], ['RRUU', 2], ['DDR', 3]];
functions.forEach(([p, n], i) => add(4, 31 + i, ['Guarde uma sequência', 'Use sua ideia de novo', 'A escada vira um bloco', 'Uma peça para descer', 'Uma invenção diferente', 'Repetir uma função', 'Corrija a função'][i], p.repeat(n), [repeat(n, [call()])], { kind: i === 6 ? 'debug' : 'compose', required: ['call'], definition: seq(p), ...(i === 6 ? { starter: [repeat(n, [call()])], starterDefinition: broken(p) } : {}), concept: 'Sequências, funções e repetições', hint: 'Monte a sequência em Meu bloco. Depois use F no programa principal para chamar sua criação.' }));
for (let i = 0; i < 3; i++) {
  const paths = three[i + 2];
  add(4, 38 + i, ['Um bloco com uma escolha', 'Função que se adapta', 'Guardião das ideias'][i], paths[0], [repeat(paths[0].length, [call()])], { kind: 'compose', boards: paths.map(p => boardFromPath(p)), definition: [choose()], required: ['call', 'if'], concept: 'Condições, repetições e funções', instruction: 'Crie um bloco que decide. Use sua função para resolver todos os cenários.' });
}
patterns.forEach(([p, n], i) => {
  const path = p.repeat(n), def = seq(p), sol = [repeat(n, [call()])];
  add(5, 11 + i, ['Divida a escada', 'A peça da ponte', 'Invenção espelhada', 'Um plano em partes', 'Compare duas soluções', 'A função econômica', 'Crie uma peça maior', 'Reutilize a curva', 'Duas formas de resolver', 'Arquiteto de caminhos'][i], path, sol, { kind: i % 2 ? 'optimize' : 'compose', definition: def, required: ['call'], ...(i % 2 ? { budget: countBlocks(sol) + countBlocks(def), starter: seq(path) } : {}), concept: 'Decomposição, padrões e funções' });
});
three.forEach((paths, i) => {
  const turns = i % 4, def = rotBlocks([choose()], turns), sol = [repeat(paths[0].length, [call()])];
  add(5, 21 + i, ['Função com defeito', 'O teste da decisão', 'Um cenário esquecido', 'Mude só uma peça', 'Depure por partes', 'Melhore sua regra', 'Conferir para confiar', 'Três testes, uma função', 'Corrija e explique', 'Laboratório concluído'][i], rotPath(paths[0], turns), sol, { kind: 'debug', boards: paths.map(p => boardFromPath(rotPath(p, turns))), definition: def, starter: [repeat(Math.max(2, paths[0].length - 1), [call()])], starterDefinition: def, required: ['call', 'if'], concept: 'Depuração, repetição, condições e funções' });
});
three.forEach((paths, i) => {
  const turns = (i + 1) % 4, withFunction = i % 2 === 1, def = withFunction ? rotBlocks([choose()], turns) : [];
  const sol = withFunction ? [repeat(paths[0].length, [call()])] : rotBlocks([repeat(paths[0].length, [choose()])], turns);
  add(5, 31 + i, ['A escolha é de vocês', 'Invente sua estratégia', 'O caminho surpresa', 'Código em equipe', 'Poucas peças, muitas rotas', 'O plano reutilizável', 'Uma regra para explorar', 'Integre as descobertas', 'A expedição final', 'Inventores do futuro'][i], rotPath(paths[0], turns), sol, { kind: 'compose', boards: paths.map(p => boardFromPath(rotPath(p, turns))), definition: def, required: withFunction ? ['call', 'repeat', 'if'] : ['repeat', 'if'], budget: countBlocks(sol) + countBlocks(def), concept: 'Integração: planejar, decompor, testar e melhorar', instruction: 'Resolva os cenários com o mesmo programa e respeite a meta de blocos.' });
});

export const LEVELS = [...ORIGINAL, ...extra].sort((a, b) => a.grade - b.grade || a.number - b.number).map(l => {
  const allowed = ['move'];
  if (l.grade >= 3 || (l.grade === 2 && l.number >= 21)) allowed.push('repeat');
  if (l.grade >= 4 || (l.grade === 3 && l.number >= 21)) allowed.push('if');
  if (l.grade === 5 || (l.grade === 4 && l.number >= 31)) allowed.push('call');
  const trail = Math.floor((l.number - 1) / 10) + 1;
  return { ...l, kind: l.kind || (l.starter ? 'debug' : l.boards.length > 1 ? 'adapt' : 'build'), allowed, trail, discussion: WORLDS[l.grade - 1].trails[trail - 1].discussion };
});
export const TOTAL_MISSIONS = LEVELS.length;
export const levelsFor = difficulty => LEVELS.filter(l => l.grade === difficulty);
export const getLevel = id => LEVELS.find(l => l.id === id);
export function referenceCount(level) { return countBlocks(level.solution) + countBlocks(level.definition); }
export const nextLevel = level => getLevel(`${level.grade}-${level.number + 1}`) || null;
