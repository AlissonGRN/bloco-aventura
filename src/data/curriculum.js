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
const makeTrails = (titles, prompts) => titles.map((title, j) => ({ number: j + 1, title, first: j * 10 + 1, last: j * 10 + 10, discussion: prompts[j] }));
export const WORLDS = [
  ...WORLDS_BASE.map((w, i) => ({ ...w, name: i === 2 ? 'Vale dos padrões' : w.name, topic: topics[i], description: descriptions[i], skill: guidance[i], teacher: guidance[i], trails: makeTrails(trails[i], discussions[i]) })),
  { id: 6, name: 'Labirinto das setas', short: 'Labirinto', topic: 'Rotas, obstáculos e caminho mínimo', description: 'Leia o mapa, contorne paredes e encontre a menor rota.', color: '#397c86', soft: '#e1f2f1', type: 'maze-arrows', icon: 'grid', skill: 'Planejar rotas em uma grade, evitar paredes e comparar o tamanho dos caminhos. As setas aparecem primeiro; repetir é liberado nas trilhas finais.', teacher: 'Conversem sobre caminhos possíveis e contem os passos. Nas trilhas 3 e 4, os blocos repetir ajudam a representar trechos iguais. O objetivo é alcançar a bandeira pelo menor caminho.', trails: makeTrails(['Ler o mapa', 'Contornar paredes', 'Rotas mais curtas', 'Mestre do labirinto'], ['Que caminho vocês imaginaram antes de montar as setas?', 'Qual parede obrigou Bip a mudar de direção?', 'Como sabemos que a rota tem menos passos?', 'Onde uma repetição economiza blocos?']) },
  { id: 7, name: 'Labirinto dos padrões', short: 'Padrões', topic: 'Repetições, decomposição e funções', description: 'Use padrões para atravessar mapas cheios de paredes.', color: '#765c99', soft: '#eee7f6', type: 'maze-loops', icon: 'blocks', skill: 'Representar rotas mínimas com laços, decompor um trajeto e reutilizar trechos em funções.', teacher: 'Os desafios começam usando repetir. Nas últimas trilhas, Meu bloco permite guardar um trecho do caminho e chamá-lo no programa principal. Incentive a equipe a conferir o menor número de passos.', trails: makeTrails(['Primeiros padrões', 'Repetições no mapa', 'Peças reutilizáveis', 'Funções no labirinto'], ['Que trecho do caminho se repete?', 'Como representar o mesmo padrão com menos blocos?', 'Que parte da rota poderia virar Meu bloco?', 'A função ajudou a organizar o caminho?']) },
  { id: 8, name: 'Algoritmos do dia a dia', short: 'Algoritmos', topic: 'Algoritmos, decomposição e depuração', description: 'Coloque instruções simples na ordem certa e teste sua lógica.', color: '#508a72', soft: '#e4f2e9', type: 'sequence-words', icon: 'sequence', skill: 'Ler instruções, decompor uma rotina, comparar dependências entre etapas e corrigir sequências.', teacher: 'Antes de mover os cartões, leiam as ações e expliquem quais dependem umas das outras. Compare ordens alternativas e procure uma sequência válida.', trails: makeTrails(['Instruções em ordem', 'Rotinas e dependências', 'Corrija a sequência', 'Desafios de lógica'], ['Qual instrução precisa vir primeiro?', 'Que etapa depende do que veio antes?', 'Qual cartão está fora do lugar? Por quê?', 'Existe mais de uma ordem que funciona?']) },
];
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

const mazeDirections = ['R', 'D', 'L', 'U'];
function mazeBoard(variant) {
  const cols = 8, rows = 7, start = { x: 0, y: variant % 2 ? 6 : 0 }, goal = { x: 7, y: variant % 2 ? 0 : 6 };
  const walls = [];
  const gateOptions = [1, 3, 5];
  const gateA = gateOptions[variant % 3], gateB = gateOptions[Math.floor(variant / 3) % 3];
  for (let y = 0; y < rows; y++) {
    if (y !== gateA) walls.push({ x: 2, y });
    if (y !== gateB) walls.push({ x: 5, y });
  }
  const wallSet = new Set(walls.map(p => `${p.x},${p.y}`));
  const cells = Array.from({ length: rows * cols }, (_, i) => ({ x: i % cols, y: Math.floor(i / cols) })).filter(p => !wallSet.has(`${p.x},${p.y}`));
  const cellSet = new Set(cells.map(p => `${p.x},${p.y}`));
  const queue = [start], previous = new Map([[`${start.x},${start.y}`, null]]);
  for (let i = 0; i < queue.length && !previous.has(`${goal.x},${goal.y}`); i++) {
    const p = queue[i];
    for (const d of mazeDirections) {
      const [dx, dy] = ({ R: [1, 0], D: [0, 1], L: [-1, 0], U: [0, -1] })[d];
      const next = { x: p.x + dx, y: p.y + dy }, key = `${next.x},${next.y}`;
      if (cellSet.has(key) && !previous.has(key)) { previous.set(key, { ...p, direction: d }); queue.push(next); }
    }
  }
  const path = [];
  for (let cursor = `${goal.x},${goal.y}`; previous.get(cursor);) { const p = previous.get(cursor); path.push(p.direction); cursor = `${p.x},${p.y}`; }
  path.reverse();
  return { layout: 'maze', cols, rows, start, goal, cells, walls, crystals: [], shortestMoves: path.length, solutionPath: path };
}
function compressPath(path) {
  const blocks = [];
  for (let i = 0; i < path.length;) {
    let end = i + 1;
    while (end < path.length && path[end] === path[i]) end++;
    const count = end - i;
    blocks.push(count > 1 ? repeat(count, [move(path[i])]) : move(path[i]));
    i = end;
  }
  return blocks;
}
const mazeTitles = [
  ['A entrada do labirinto', 'Primeiro corredor', 'Parede à frente', 'A curva azul', 'Portão estreito', 'Caminho de pedra', 'Vire no momento certo', 'Duas paredes', 'Rota do jardim secreto', 'A primeira saída', 'Corredor comprido', 'Desvio à esquerda', 'Mapa embaralhado', 'Entre as muralhas', 'A passagem escondida', 'Caminho de ida e volta', 'A muralha alta', 'Rota pelo centro', 'Desafio das três paredes', 'Explorador de labirintos', 'Mais passos, mesmo mapa', 'Economize as setas', 'Repetir no corredor', 'Uma curva repetida', 'Padrões entre paredes', 'Repetição no desvio', 'Rota compacta', 'Caminho em partes', 'Menos blocos, mesma rota', 'A volta inteligente', 'Labirinto avançado', 'O corredor dos padrões', 'Desvio econômico', 'Repetir para avançar', 'O caminho mais curto', 'Rota de especialista', 'A última muralha', 'Padrão escondido', 'Mestre das setas', 'Saída do labirinto'],
  ['Repetir para começar', 'O primeiro desvio', 'Corredor em dobro', 'Padrão entre muros', 'Repita e vire', 'Uma rota compacta', 'Paredes alternadas', 'O mapa sinuoso', 'Dois corredores', 'Saída em zigue-zague', 'O padrão continua', 'Caminho com curvas', 'Repita para contornar', 'Sequência bem guardada', 'Entre quatro paredes', 'Rota de ida e volta', 'Desvio repetido', 'Padrões no mapa', 'Labirinto em partes', 'O caminho econômico', 'Uma função a caminho', 'Prepare sua sequência', 'Separe o trajeto', 'Uma peça reutilizável', 'F de função', 'Chame sua criação', 'Meu bloco no mapa', 'Repetir e chamar', 'Função no corredor', 'Organize a rota', 'Função e labirinto', 'Chame duas vezes', 'Peças que se repetem', 'Um caminho em blocos', 'Desvio reutilizável', 'Função para avançar', 'O mapa mais difícil', 'Construa sua estratégia', 'Últimas paredes', 'Mestre das funções'],
];
for (const grade of [6, 7]) {
  for (let number = 1; number <= MISSIONS_PER_LEVEL; number++) {
    const board = mazeBoard(number - 1), path = board.solutionPath;
    let solution = grade === 6 && number < 21 ? path.map(move) : compressPath(path), definition = [], required = grade === 6 ? (number >= 21 ? ['repeat'] : []) : ['repeat'];
    let allowed = grade === 6 ? (number >= 21 ? ['move', 'repeat'] : ['move']) : (number >= 31 ? ['move', 'repeat', 'call'] : ['move', 'repeat']);
    if (grade === 7 && number >= 31) {
      const first = solution.shift();
      definition = first.type === 'repeat' ? [first] : [first];
      solution = [call(), ...solution];
      required = ['repeat', 'call'];
    }
    const concept = grade === 6
      ? number < 21 ? 'Setas e planejamento de rotas' : 'Repetições e caminho mínimo'
      : number < 31 ? 'Repetições e caminhos mínimos' : 'Decomposição e funções';
    extra.push({ id: `${grade}-${number}`, grade, number, title: mazeTitles[grade - 6][number - 1], concept, instruction: `Chegue à bandeira pelo menor caminho. Há ${board.shortestMoves} passos na rota mais curta; evite as paredes.`, hint: grade === 6 && number < 21 ? 'Conte os passos e procure uma rota sem encostar nas paredes.' : grade === 7 && number >= 31 ? 'Guarde o primeiro trecho em Meu bloco e use F no programa. Confirme que Bip percorre a menor rota.' : 'Agrupe os passos repetidos em um bloco amarelo. Compare a quantidade de passos com o caminho mais curto.', boards: [board], solution, definition, required, allowed, kind: 'maze', maxBlocks: 40, shortestPath: true });
  }
}

// Sequencing challenges: symbol-only cards support emerging readers; text cards
// build the same algorithmic reasoning with short, concrete instructions.
export const SEQUENCE_TASKS = [
  { title:'Lavar as mãos', icon:'Droplets', steps:[['Droplets','Abrir a torneira'],['Hand','Molhar as mãos'],['Sparkles','Passar sabonete'],['Waves','Enxaguar'],['Wind','Secar as mãos']] },
  { title:'Preparar a mochila', icon:'Backpack', steps:[['BookOpen','Escolher o material'],['FolderOpen','Guardar os cadernos'],['Pencil','Colocar lápis e borracha'],['ListChecks','Conferir a lista'],['Backpack','Fechar a mochila']] },
  { title:'Escovar os dentes', icon:'Smile', steps:[['CupSoda','Pegar a escova'],['Droplets','Molhar as cerdas'],['Sparkles','Colocar pasta'],['Brush','Escovar os dentes'],['Waves','Enxaguar a boca']] },
  { title:'Fazer um desenho', icon:'Palette', steps:[['Lightbulb','Escolher uma ideia'],['Pencil','Desenhar o contorno'],['Paintbrush','Colorir o desenho'],['Eye','Observar o resultado']] },
  { title:'Cuidar de uma planta', icon:'Sprout', steps:[['Eye','Observar a planta'],['Droplets','Regar a terra'],['Sun','Colocar perto da luz'],['Heart','Acompanhar o crescimento']] },
  { title:'Fazer um sanduíche', icon:'Sandwich', steps:[['Sandwich','Separar o pão'],['Sandwich','Escolher o recheio'],['Layers','Montar o sanduíche'],['Utensils','Comer com cuidado'],['Trash2','Guardar a embalagem']] },
  { title:'Entrar na sala', icon:'DoorOpen', steps:[['Footprints','Chegar à porta'],['Hand','Bater ou pedir licença'],['DoorOpen','Abrir a porta'],['Footprints','Entrar com cuidado'],['Armchair','Organizar o material']] },
  { title:'Preparar-se para dormir', icon:'Moon', steps:[['BookOpen','Guardar os brinquedos'],['Brush','Escovar os dentes'],['Shirt','Colocar o pijama'],['BookOpen','Ler uma história'],['Bed','Deitar para dormir']] },
  { title:'Fazer uma atividade', icon:'BookOpen', steps:[['Eye','Ler ou ouvir a tarefa'],['Pencil','Separar o material'],['Brain','Pensar numa estratégia'],['Pencil','Resolver a atividade'],['Check','Conferir a resposta']] },
  { title:'Organizar a mesa', icon:'Table', steps:[['Trash2','Retirar o que não será usado'],['Waves','Limpar a mesa'],['BookOpen','Separar os cadernos'],['Pencil','Organizar os lápis'],['Check','Conferir se está pronta']] },
  { title:'Fazer um avião de papel', icon:'Plane', steps:[['File','Pegar uma folha'],['FoldHorizontal','Dobrar ao meio'],['FoldVertical','Dobrar as pontas'],['Plane','Abrir as asas'],['Send','Testar o voo']] },
  { title:'Escolher um livro', icon:'Library', steps:[['Eye','Observar os livros'],['Hand','Escolher um livro'],['BookOpen','Abrir na primeira página'],['BookOpen','Ler a história'],['Bookmark','Guardar o marcador']] },
  { title:'Separar o lixo', icon:'Recycle', steps:[['Trash2','Juntar os materiais'],['Eye','Observar o material'],['Recycle','Separar recicláveis'],['Trash2','Descartar cada parte']] },
  { title:'Preparar-se para sair', icon:'Sun', steps:[['Eye','Ver como está o tempo'],['Shirt','Escolher a roupa'],['Footprints','Calçar os sapatos'],['Backpack','Pegar o que precisa'],['DoorOpen','Sair com um adulto']] },
  { title:'Montar um brinquedo', icon:'Puzzle', steps:[['Package','Abrir a caixa'],['Eye','Observar as peças'],['ListChecks','Ler ou ver o passo a passo'],['Puzzle','Montar as partes'],['Check','Testar o brinquedo']] },
  { title:'Fazer pipoca', icon:'Popcorn', steps:[['Bowl','Separar os ingredientes'],['CookingPot','Colocar na panela'],['Flame','Aquecer com um adulto'],['Ear','Esperar os estouros pararem'],['Popcorn','Servir com cuidado']] },
  { title:'Atravessar com segurança', icon:'TrafficCone', steps:[['Footprints','Parar na calçada'],['Eye','Olhar para os dois lados'],['Ear','Ouvir o trânsito'],['Hand','Esperar um adulto'],['Footprints','Atravessar na faixa']] },
  { title:'Fazer um cartão', icon:'Mail', steps:[['File','Pegar papel e lápis'],['FoldHorizontal','Dobrar o papel'],['Pencil','Escrever uma mensagem'],['Heart','Fazer um desenho'],['Mail','Entregar o cartão']] },
  { title:'Arrumar os brinquedos', icon:'ToyBrick', steps:[['Blocks','Juntar os brinquedos'],['Shapes','Separar por tipo'],['Package','Guardar cada grupo'],['Check','Conferir o chão']] },
  { title:'Cuidar de um machucado', icon:'HeartPulse', steps:[['Hand','Chamar um adulto'],['Waves','Lavar com cuidado'],['Bandage','Colocar um curativo'],['Heart','Descansar e avisar se doer']] },
  { title:'Montar uma torre', icon:'Blocks', steps:[['Blocks','Separar os blocos'],['Shapes','Escolher uma base larga'],['Blocks','Empilhar com cuidado'],['Eye','Observar se está firme'],['Check','Contar os andares']] },
  { title:'Plantar uma semente', icon:'Sprout', steps:[['Shovel','Preparar a terra'],['CircleDot','Colocar a semente'],['Shovel','Cobrir com terra'],['Droplets','Regar um pouco'],['Sun','Deixar num lugar iluminado']] },
  { title:'Fazer uma ligação', icon:'Phone', steps:[['Phone','Pegar o telefone'],['Contact','Escolher o contato'],['PhoneCall','Iniciar a chamada'],['MessageCircle','Falar com a pessoa'],['PhoneOff','Encerrar a chamada']] },
  { title:'Preparar uma fruta', icon:'Apple', steps:[['Apple','Escolher a fruta'],['Waves','Lavar a fruta'],['Hand','Pedir ajuda para cortar'],['Utensils','Comer a fruta'],['Trash2','Descartar o que sobrou']] },
  { title:'Ir à biblioteca', icon:'Library', steps:[['Footprints','Chegar à biblioteca'],['VolumeX','Falar baixinho'],['BookOpen','Escolher um livro'],['Contact','Registrar o empréstimo'],['BookOpen','Levar para ler']] },
  { title:'Fazer uma experiência de papel', icon:'FlaskConical', steps:[['Lightbulb','Fazer uma pergunta'],['File','Separar os materiais'],['Brain','Imaginar o que pode acontecer'],['FlaskConical','Testar com cuidado'],['NotebookPen','Anotar o resultado']] },
  { title:'Enviar um desenho', icon:'Mail', steps:[['Pencil','Fazer o desenho'],['Eye','Conferir o desenho'],['File','Escrever para quem é'],['Mail','Colocar no envelope'],['Send','Entregar ao destinatário']] },
  { title:'Preparar a lancheira', icon:'ShoppingBag', steps:[['Hand','Lavar as mãos'],['Apple','Escolher a fruta'],['Sandwich','Separar o lanche'],['CupSoda','Encher a garrafinha'],['ShoppingBag','Guardar tudo na lancheira']] },
  { title:'Construir uma ponte de papel', icon:'Construction', steps:[['File','Separar folhas'],['Ruler','Medir o espaço'],['FoldHorizontal','Dobrar o papel'],['Construction','Montar a ponte'],['Scale','Testar com objetos leves']] },
  { title:'Observar o céu', icon:'CloudSun', steps:[['Eye','Olhar o céu com um adulto'],['CloudSun','Observar as nuvens'],['Sun','Ver onde está o sol'],['NotebookPen','Desenhar o que viu']] },
  { title:'Resolver um problema', icon:'CircleHelp', steps:[['CircleHelp','Entender o que aconteceu'],['Brain','Pensar em possibilidades'],['ListChecks','Escolher um plano'],['Play','Testar o plano'],['RefreshCw','Mudar algo se não funcionar']] },
  { title:'Fazer um marcador', icon:'Bookmark', steps:[['File','Escolher um papel'],['Scissors','Recortar com ajuda'],['Palette','Decorar o marcador'],['Bookmark','Colocar no livro']] },
  { title:'Arrumar a sala', icon:'House', steps:[['Blocks','Reunir os brinquedos'],['Shapes','Separar os materiais'],['Package','Guardar nos lugares'],['Sparkles','Conferir e limpar o espaço']] },
  { title:'Criar uma brincadeira', icon:'Gamepad2', steps:[['Lightbulb','Imaginar uma brincadeira'],['Users','Combinar as regras'],['ListChecks','Separar o que será usado'],['Play','Brincar juntos'],['MessageCircle','Conversar sobre como foi']] },
  { title:'Preparar salada de frutas', icon:'Salad', steps:[['Apple','Escolher as frutas'],['Waves','Lavar as frutas'],['Hand','Pedir ajuda para cortar'],['CookingPot','Misturar numa tigela'],['Utensils','Servir em porções']] },
  { title:'Fazer uma dobradura', icon:'Origami', steps:[['File','Escolher uma folha'],['FoldHorizontal','Dobrar uma ponta'],['FoldVertical','Juntar as bordas'],['Origami','Repetir as dobras'],['Eye','Abrir e observar a forma']] },
  { title:'Cuidar dos livros', icon:'BookOpen', steps:[['BookOpen','Reunir os livros'],['Eye','Conferir se estão inteiros'],['Waves','Limpar as capas com cuidado'],['Library','Guardar na estante']] },
  { title:'Escolher um caminho', icon:'Map', steps:[['Map','Observar o mapa'],['Flag','Localizar o destino'],['Eye','Comparar os caminhos'],['Brain','Escolher uma rota segura'],['Footprints','Seguir com um adulto']] },
  { title:'Montar uma cabana', icon:'House', steps:[['Users','Combinar com a equipe'],['Armchair','Separar almofadas'],['House','Montar uma base estável'],['Eye','Conferir se está segura'],['Play','Brincar com cuidado']] },
  { title:'Contar uma história', icon:'BookOpen', steps:[['Users','Escolher quem começa'],['Lightbulb','Imaginar um personagem'],['MessageCircle','Contar o começo'],['MessageCircle','Inventar o que acontece depois'],['Check','Criar um final']] },

];

const sequenceLevels = SEQUENCE_TASKS.slice(0, MISSIONS_PER_LEVEL).map((task, index) => ({
  id: `8-${index + 1}`, grade: 8, number: index + 1, title: task.title,
  concept: 'Algoritmos, leitura e depuração',
  instruction: 'Leia as instruções e coloque cada etapa na ordem correta.',
  hint: 'Pense no que precisa acontecer antes e no que só pode acontecer depois.',
  kind: 'sequence', sequenceMode: 'words', steps: task.steps,
  solution: task.steps.map((_, i) => i), allowed: [], maxBlocks: task.steps.length,
}));

export const LEVELS = [...ORIGINAL, ...extra, ...sequenceLevels].sort((a, b) => a.grade - b.grade || a.number - b.number).map(l => {
  const allowed = l.allowed || ['move'];
  if (!l.allowed && (l.grade >= 3 || (l.grade === 2 && l.number >= 21))) allowed.push('repeat');
  if (!l.allowed && (l.grade >= 4 || (l.grade === 3 && l.number >= 21))) allowed.push('if');
  if (!l.allowed && (l.grade === 5 || (l.grade === 4 && l.number >= 31))) allowed.push('call');
  const trail = Math.floor((l.number - 1) / 10) + 1;
  return { ...l, kind: l.kind || (l.starter ? 'debug' : l.boards?.length > 1 ? 'adapt' : 'build'), allowed, trail, discussion: WORLDS[l.grade - 1]?.trails[trail - 1]?.discussion || 'Que pistas ajudaram sua equipe a resolver este desafio?' };
});
export const TOTAL_MISSIONS = LEVELS.length;
export const levelsFor = difficulty => LEVELS.filter(l => l.grade === difficulty);
export const getLevel = id => LEVELS.find(l => l.id === id);
export function referenceCount(level) { return countBlocks(level.solution) + countBlocks(level.definition); }
export const nextLevel = level => getLevel(`${level.grade}-${level.number + 1}`) || null;
