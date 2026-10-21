import { LEVELS as ORIGINAL, WORLDS as WORLDS_BASE, level as createMission, boardFromPath, move, repeat, branch, call, countBlocks } from './baseCurriculum.js';
export { DIRS, DIRECTIONS, move, repeat, branch, call, countBlocks, boardFromPath } from './baseCurriculum.js';

export const MISSIONS_PER_LEVEL = 40;
export const MISSIONS_PER_TRAIL = 10;
export const actionBlock = (type, direction = 'R') => ({ type, direction });
export const KIND_LABELS = { build: 'Monte o caminho', debug: 'Encontre o erro', optimize: 'Use menos blocos', adapt: 'Teste os cenários', compose: 'Combine suas ideias' };
const topics = ['Sequências e direções', 'Planejamento e depuração', 'Repetições e padrões', 'Condições e cenários', 'Funções e reutilização'];
const descriptions = ['Programe pequenos trajetos com setas e observe o resultado.', 'Planeje rotas, corrija erros e experimente padrões de repetir.', 'Agrupe comandos para expressar uma ideia repetida.', 'Observe os cenários e use condições para escolher caminhos.', 'Guarde sequências em Meu bloco e reutilize-as com repetir.'];
const trails = [
  ['Primeiros passos'],
  ['Planejar uma rota', 'Corrigir o plano'],
  ['Descobrir repetir'],
  ['Decidir pelo caminho', 'Uma regra para vários mapas'],
  ['Criar e chamar', 'Reutilizar uma ideia', 'Funções mais compactas'],
];
const discussions = [
  ['Qual seta fez o Bip mudar de direção?'],
  ['O que vocês planejaram antes de executar?', 'Qual passo estava errado e como descobriram?'],
  ['Qual trecho do caminho se repete?'],
  ['Que pista fez vocês escolherem uma direção?', 'Como conferir a mesma regra em todos os mapas?'],
  ['O que acontece quando chamamos F?', 'Que parte da solução vale guardar e usar de novo?', 'Como combinar repetir dentro da função e no programa principal sem copiar comandos?'],
];
const guidance = [
  'Comece com setas e demonstrações visuais. Não exige leitura para montar o primeiro programa.',
  'As rotas ficam maiores. Peça que a equipe preveja o resultado e depois identifique o menor ajuste para corrigir um erro.',
  'A repetição aparece como a nova ferramenta central. Em mundos posteriores, ela será aplicada a labirintos e decisões em movimento.',
  'Os cenários mudam, então uma sequência fixa não basta. Compare os mapas e teste a condição nos dois.',
  'O foco é decompor e reutilizar: definir uma função, chamá-la mais de uma vez e combinar repetir dentro dela quando isso economizar comandos.',
];
const makeTrails = (titles, prompts) => titles.map((title, j) => ({ number: j + 1, title, first: j * 10 + 1, last: j * 10 + 10, discussion: prompts[j] }));
export const WORLDS = [
  ...WORLDS_BASE.map((w, i) => ({ ...w, name: i === 2 ? 'Vale dos padrões' : w.name, topic: topics[i], description: descriptions[i], skill: guidance[i], teacher: guidance[i], trails: makeTrails(trails[i], discussions[i]) })),
  { id: 6, name: 'Labirinto com obstáculos', short: 'Labirinto', topic: 'Repetições em mapas com paredes', description: 'Use os padrões que já conhece para encontrar rotas curtas entre paredes.', color: '#397c86', soft: '#e1f2f1', type: 'maze-arrows', icon: 'grid', skill: 'Transferir repetir para mapas com obstáculos e validar o caminho mais curto.', teacher: 'Este mundo não reapresenta o uso básico das setas: todas as missões exigem repetir em um labirinto com paredes. A equipe aplica o padrão conhecido em um espaço diferente e confere o número de passos.', trails: makeTrails(['Padrões entre paredes', 'Rotas mais curtas'], ['Que trecho pode ser escrito com repetir sem atravessar uma parede?', 'Como provar que a rota é curta e o programa continua correto?']) },
  { id: 7, name: 'Labirinto dos padrões', short: 'Padrões', topic: 'Repetições, decomposição e funções', description: 'Use padrões para atravessar mapas cheios de paredes.', color: '#765c99', soft: '#eee7f6', type: 'maze-loops', icon: 'blocks', skill: 'Aplicar repetir em labirintos: identificar trechos recorrentes, contornar paredes e comparar rotas curtas.', teacher: 'A turma já conhece repetir em caminhos simples. Aqui o desafio é transferir essa ideia para mapas com paredes: identificar padrões que respeitem o espaço disponível e conferir se a rota continua sendo a menor. As funções já foram apresentadas no mundo anterior e não precisam ser reapresentadas aqui.', trails: makeTrails(['Padrões no labirinto', 'Rotas com paredes'], ['Que sequência se repete sem atravessar uma parede?', 'Como conferir se a rota é curta e se o programa usa repetir?']) },
  { id: 8, name: 'Algoritmos do dia a dia', short: 'Algoritmos', topic: 'Algoritmos, decomposição e depuração', description: 'Coloque instruções simples na ordem certa e teste sua lógica.', color: '#508a72', soft: '#e4f2e9', type: 'sequence-words', icon: 'sequence', skill: 'Ler instruções, decompor uma rotina, comparar dependências entre etapas e corrigir sequências.', teacher: 'Antes de mover os cartões, leiam as ações e expliquem quais dependem umas das outras. Compare ordens alternativas e procure uma sequência válida.', trails: makeTrails(['Instruções em ordem', 'Rotinas e dependências', 'Corrija a sequência', 'Desafios de lógica'], ['Qual instrução precisa vir primeiro?', 'Que etapa depende do que veio antes?', 'Qual cartão está fora do lugar? Por quê?', 'Existe mais de uma ordem que funciona?']) },
  { id: 9, name: 'Expedição das ações', short: 'Expedição', topic: 'Sequências, ações e interação', description: 'Além de andar, ensine Bip a pegar itens, saltar buracos, afastar criaturas e abrir portas.', color: '#c5784f', soft: '#f8e9df', type: 'actions', icon: 'hand', skill: 'Planejar ações no momento certo, combinar comandos com deslocamentos e reutilizar sequências.', teacher: 'Neste mundo, algumas casas têm itens, criaturas, portas e buracos. Pegar, atacar/afastar e abrir agem na casa indicada; pular atravessa exatamente um buraco. Peça que a equipe preveja o resultado de cada comando.', trails: makeTrails(['Pegar e levar', 'Pular com cuidado', 'Combinar ações'], ['Quando Bip precisa pegar o item: antes ou depois de andar até ele?', 'Qual casa está faltando no caminho e como Bip pode atravessá-la?', 'Como combinar atacar e abrir com movimentos sem perder a ordem?']) },
  { id: 10, name: 'Oficina das ações', short: 'Ações', topic: 'Ações, setas e repetições', description: 'Ative botões, abra passagens e planeje o momento certo para cada ação.', color: '#c5784f', soft: '#f8e9df', type: 'actions', icon: 'hand', skill: 'Use ativar em uma passagem, combine movimentos com repetir e depois coordene dois botões para atravessar mais de um obstáculo.', teacher: 'As duas primeiras trilhas apresentam um botão e depois reforçam a ordem das ações com repetir. A terceira trilha exige planejar duas ativações diferentes; os desafios de função foram retirados daqui porque a função já foi ensinada no mundo 5.', trails: makeTrails(['Ativar e avançar', 'Repetir para planejar', 'Duas passagens'], ['Qual botão libera a passagem?', 'Como agrupar os movimentos sem ativar o botão tarde demais?', 'Qual botão abre cada parede e em que ordem devem ser ativados?']).map((trail, index) => ({ ...trail, focus: ['Ações + setas · introdutória', 'Ações + repetir · intermediária', 'Duas ativações · avançada'][index] })) },
  { id: 11, name: 'Trilha dos imprevistos', short: 'Imprevistos', topic: 'Condições e repetição em cenários dinâmicos', description: 'O mapa muda. Use pistas do cenário para escolher uma rota com o mesmo programa.', color: '#8265a7', soft: '#eee8f6', type: 'maze-surprise', icon: 'grid', skill: 'Introduza se/senão em dois mapas possíveis e depois combine a decisão com repetir para percorrer a rota sem codificar cada passo manualmente.', teacher: 'A primeira trilha trabalha a condição em cenários que mudam. A segunda exige integrar a condição ao bloco repetir. Os desafios extras de depuração e funções foram retirados daqui porque repetiam o mesmo mapa e habilidades já exercitadas; as funções continuam no mundo 5.', trails: makeTrails(['Caminhos que mudam', 'Decidir e repetir'], ['Qual pista mostra que o mapa mudou?', 'Como combinar se/senão e repetir sem escrever cada passo?']).map((trail, index) => ({ ...trail, focus: ['Se/senão · introdução', 'Se/senão + repetir · integração'][index] })) },

];

// Persistent grade-number IDs stay stable, while the visible catalogue follows a
// pedagogical path. Everyday sequencing is early; maze worlds consolidate skills.
export const CURRICULUM_WORLD_ORDER = [1, 8, 2, 3, 4, 5, 6, 9, 10, 11];
// Keep WORLDS in numeric ID order: persistent level IDs still use grades 1–11.
// Display numbers communicate the new learning sequence without changing saved IDs.
export const DISPLAY_WORLDS = CURRICULUM_WORLD_ORDER.map((id, index) => {
  const world = WORLDS.find(item => item.id === id);
  if (world) world.displayNumber = index + 1;
  return world;
}).filter(Boolean);

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
for (const grade of [6]) {
  for (let number = 1; number <= MISSIONS_PER_LEVEL; number++) {
    const board = mazeBoard(number - 1), path = board.solutionPath;
    let solution = compressPath(path), definition = [], required = ['repeat'];
    let allowed = ['move', 'repeat'];
    if (grade === 7 && number >= 31) {
      const first = solution.shift();
      definition = first.type === 'repeat' ? [first] : [first];
      solution = [call(), ...solution];
      required = ['repeat', 'call'];
    }
    const concept = grade === 6
      ? 'Transferência: repetir em labirintos com paredes'
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

// Extend the function world with distinct challenges. Existing IDs 5-1 through 5-10
// are retained; these are additive challenges with new IDs.
const functionReuseSegments = ['RU', 'RD', 'UR', 'RRU', 'UUR', 'RUR', 'RRD', 'RDU', 'RURD', 'URR'];
for (let index = 0; index < 10; index++) {
  const number = index + 11, segment = functionReuseSegments[index], calls = 2 + (index % 3);
  const path = segment.repeat(calls);
  extra.push({
    id: `5-${number}`, grade: 5, number,
    title: ['Chame sua criação', 'Uma função, dois usos', 'Reutilize o caminho', 'Meu bloco em ação', 'Uma ideia que volta', 'Duas chamadas, um plano', 'Organize a trilha', 'Partes que se repetem', 'Função de explorador', 'Peças bem combinadas'][index],
    concept: 'Funções e reutilização',
    instruction: `Crie em Meu bloco a sequência ${segment.split('').join(' ')} e chame sua função ${calls} vezes.`,
    hint: 'A definição fica em Meu bloco. No programa principal, cada F executa a sequência guardada.',
    kind: 'compose', boards: [boardFromPath(path)], solution: Array.from({ length: calls }, () => call()),
    definition: seq(segment), allowed: ['move', 'call'], required: ['call'], maxBlocks: 40,
  });
}
const functionPatterns = ['RU', 'RRU', 'URR', 'UUR', 'RURU', 'RRUU', 'URRU', 'RUU', 'RRUR', 'UURR'];
for (let index = 0; index < 10; index++) {
  const number = index + 21, pattern = functionPatterns[index], inner = 2 + (index % 2), calls = 2 + (index % 2);
  const path = pattern.repeat(inner * calls);
  extra.push({
    id: `5-${number}`, grade: 5, number,
    title: ['Repetir dentro da função', 'Guarde um padrão', 'Uma função mais compacta', 'Repetição reutilizável', 'Duas camadas de organização', 'Meu bloco econômico', 'Junte repetir e chamar', 'O padrão secreto', 'Menos comandos, mesma rota', 'Laboratório de funções'][index],
    concept: 'Funções, repetição e decomposição',
    instruction: 'Guarde um padrão em Meu bloco, usando repetir na definição, e chame a função para completar o trajeto.',
    hint: 'Primeiro simplifique a sequência dentro de Meu bloco. Depois decida quantas vezes chamar a função.',
    kind: 'compose', boards: [boardFromPath(path)], solution: [repeat(calls, [call()])],
    definition: [repeat(inner, seq(pattern))], allowed: ['move', 'repeat', 'call'], required: ['repeat', 'call'], maxBlocks: 40,
  });
}
for (let index = 0; index < 10; index++) {
  const number = index + 31, steps = index + 2;
  extra.push({
    id: `5-${number}`, grade: 5, number,
    title: ['Uma função que escolhe', 'Duas rotas, uma função', 'Se houver passagem', 'Reutilize sua decisão', 'A função observadora', 'Escolhas organizadas', 'Meu bloco inteligente', 'Teste horizontal e vertical', 'Integração de decisões', 'Mestre das funções'][index],
    concept: 'Funções, condições e testes',
    instruction: 'Crie uma função com se/senão que escolha o próximo passo e chame-a dentro de repetir. O mesmo programa deve resolver os dois mapas.',
    hint: 'Se houver caminho à direita, ande à direita; caso contrário, suba. Testem a função nos dois cenários.',
    kind: 'adapt',
    boards: [boardFromPath('R'.repeat(steps)), boardFromPath('U'.repeat(steps))],
    solution: [repeat(steps, [call()])],
    definition: [branch('R', [move('R')], [move('U')])],
    allowed: ['move', 'repeat', 'if', 'call'], required: ['call', 'if', 'repeat'], maxBlocks: 40,
  });
}

const sequenceLevels = SEQUENCE_TASKS.slice(0, MISSIONS_PER_LEVEL).map((task, index) => ({
  id: `8-${index + 1}`, grade: 8, number: index + 1, title: task.title,
  concept: 'Algoritmos, leitura e depuração',
  instruction: 'Leia as instruções e coloque cada etapa na ordem correta.',
  hint: 'Pense no que precisa acontecer antes e no que só pode acontecer depois.',
  kind: 'sequence', sequenceMode: 'words', steps: task.steps,
  solution: task.steps.map((_, i) => i), allowed: [], maxBlocks: task.steps.length,
}));

const actionRoutes = [
  'RRRRRRR', 'RRURRRDRR', 'RRUURRDRR', 'RRDDRRUUR', 'RURURRDRR',
  'RRRURRDDRR', 'RRUURDDRR', 'RDDRURRR', 'RRURDDRRR', 'RRDDRUURR',
];
const jumpingRoutes = [
  'RRJRRR', 'RURJRRD', 'RRDDJRRU', 'RRUURJRRD', 'RURRRJR',
  'RRJRUUR', 'RRUJRRR', 'RDRJRRU', 'RRUJRDRR', 'RURRUJRR',
];
const advancedRoutes = [
  'RRUURRDDRR', 'RRDDRRUURRR', 'RRDURRRUUD', 'RURRRDRRR', 'RRURRURRDD',
  'RRDRRUURRR', 'RURRDRRRU', 'RRRUURRDD', 'RRDRURRRDD', 'RURRDDRRU',
];
function createActionBoard(route) {
  const start = { x: 0, y: 3 }, positions = [start], gaps = [];
  let current = start;
  for (const step of route) {
    if (step === 'J') {
      gaps.push({ x: current.x + 1, y: current.y });
      current = { x: current.x + 2, y: current.y };
    } else {
      const [dx, dy] = ({ R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] })[step];
      current = { x: current.x + dx, y: current.y + dy };
    }
    positions.push(current);
  }
  return { cols: 8, rows: 7, start, goal: positions.at(-1), cells: positions, gaps, items: [], enemies: [], doors: [], crystals: [] };
}
function compressActionMoves(blocks) {
  const result = [];
  for (let i = 0; i < blocks.length;) {
    const block = blocks[i];
    if (block.type !== 'move') { result.push(block); i++; continue; }
    let end = i + 1;
    while (end < blocks.length && blocks[end].type === 'move' && blocks[end].direction === block.direction) end++;
    const count = end - i;
    result.push(count > 1 ? repeat(count, [move(block.direction)]) : block);
    i = end;
  }
  return result;
}
const actionLevels = Array.from({ length: MISSIONS_PER_LEVEL }, (_, index) => {
  const number = index + 1;
  const route = number <= 10 ? actionRoutes[index] : number <= 20 ? jumpingRoutes[index - 10] : advancedRoutes[(number - 21) % 10];
  const board = createActionBoard(route);
  const typeAt = new Map();
  const place = (positionIndex, type, details = {}) => {
    if (route[positionIndex - 1] === 'J') positionIndex++;
    const position = board.cells[positionIndex];
    if (!position) return;
    const object = { ...position, ...details };
    const list = type === 'pick' ? board.items : type === 'attack' ? board.enemies : board.doors;
    list.push(object);
    typeAt.set(`${position.x},${position.y}`, type);
  };
  if (number <= 10) {
    place(2 + index % 2, 'pick', { item: 'crystal' });
    if (number >= 6) place(5, 'pick', { item: 'crystal' });
  } else if (number <= 20) {
    place(number >= 16 ? 4 : 5, 'pick', { item: 'crystal' });
    if (number >= 16) place(6, 'pick', { item: 'crystal' });
  } else if (number <= 25) {
    place(2, 'pick', { item: 'crystal' });
    place(4, 'attack', { name: 'Criatura guardiã' });
  } else if (number <= 30) {
    place(2, 'pick', { item: 'key' });
    place(4, 'attack', { name: 'Criatura guardiã' });
    place(5, 'open', { name: 'Porta trancada', requiresKey: true });
  } else {
    place(3, 'pick', { item: 'key' });
    place(5, 'attack', { name: 'Criatura guardiã' });
    place(7, 'open', { name: 'Porta trancada', requiresKey: true });
    if (number >= 36) place(8, 'pick', { item: 'crystal' });
  }
  const routeSteps = [...route];
  const operations = [];
  for (let stepIndex = 0; stepIndex < routeSteps.length; stepIndex++) {
    const step = routeSteps[stepIndex];
    if (step === 'J') {
      operations.push(actionBlock('jump', 'R'));
      continue;
    }
    const target = board.cells[stepIndex + 1];
    const targetType = target && typeAt.get(`${target.x},${target.y}`);
    if (targetType) operations.push(actionBlock(targetType, step));
    operations.push(move(step));
  }
  let definition = [], program = operations;
  const allowed = ['move', 'pick'];
  const required = [];
  if (number >= 11) { allowed.push('jump'); if (route.includes('J')) required.push('jump'); }
  if (number >= 21) { allowed.push('attack', 'repeat'); }
  if (number >= 26) { allowed.push('open'); required.push('attack', 'open', 'repeat'); }
  if (number >= 31) {
    allowed.push('call');
    required.push('call');
    definition = [move('R'), move('R')];
    program = [call(), ...operations.slice(2)];
  }
  if (number >= 25) {
    if (number < 31) required.push('attack', 'repeat');
    program = compressActionMoves(program);
  }
  if (number >= 31) program = compressActionMoves(program);
  const title = number <= 10
    ? ['A primeira coleta', 'Pegue antes de seguir', 'Duas peças brilhantes', 'A curva do tesouro', 'Olhe ao redor', 'Cristais pelo caminho', 'Uma pausa para pegar', 'Mais uma descoberta', 'Colete e continue', 'Mochila do Bip'][index]
    : number <= 20
      ? ['O primeiro salto', 'Buraco no caminho', 'Salte e continue', 'Pulo na curva', 'Não caia no lago', 'Um salto comprido', 'Pular antes da curva', 'O salto escondido', 'Lacuna no caminho', 'Salto de especialista'][index - 10]
      : number <= 30
        ? ['Afaste a criatura', 'Guardiã do caminho', 'Pegue e avance', 'A criatura da ponte', 'Ação no momento certo', 'Chave da passagem', 'Abra a porta', 'A chave e a guardiã', 'Pule, pegue e abra', 'A passagem secreta'][index - 20]
        : ['Meu bloco de passos', 'Um caminho em partes', 'Repita e reutilize', 'Pule usando uma função', 'Três ações em sequência', 'A chave do castelo', 'A rota organizada', 'Missão de resgate', 'Tudo no momento certo', 'Mestre das ações'][index - 30];
  const objective = [
    ...(board.items.some(item => item.item === 'key') ? ['pegar a chave'] : board.items.length ? ['pegar os itens'] : []),
    ...(board.enemies.length ? ['afastar as criaturas'] : []),
    ...(board.doors.length ? ['abrir a porta'] : []),
  ];
  const instruction = number <= 10
    ? 'Leve Bip até os itens. Use “pegar” apontado para o item antes de seguir.'
    : number <= 20
      ? 'Atravesse os buracos com “pular” e pegue os itens do caminho.'
      : number <= 25
        ? 'Pegue o item, afaste a criatura com “atacar” e alcance a bandeira.'
        : number <= 30
          ? 'Pegue a chave, afaste a criatura e use “abrir” na porta trancada.'
          : 'Combine pegar, pular, atacar e abrir. Organize partes do plano em repetir e Meu bloco.';
  return {
    id: `9-${number}`, grade: 9, number, title,
    concept: number <= 10 ? 'Ações e sequências' : number <= 20 ? 'Pulos e obstáculos' : number <= 30 ? 'Interação e decisões' : 'Decomposição e funções',
    instruction, hint: number <= 10 ? 'A ação acontece na direção escolhida. Bip pode pegar algo sem sair do lugar.' : number <= 20 ? 'Pular atravessa um buraco e pousa uma casa depois dele.' : number <= 30 ? 'Aponte a ação para o objeto ao lado. A chave abre a porta.' : 'Guarde os primeiros passos em Meu bloco e agrupe passos repetidos.',
    discussion: `Conversem sobre a ordem das ações: ${objective.join(', ').toLocaleLowerCase('pt-BR') || 'chegue à bandeira'}.`,
    kind: 'actions', boards: [board], solution: program, definition, required, allowed, maxBlocks: 40,
  };
});

const eventRoute = (path, start = { x: 0, y: 0 }) => {
  const points = [start];
  const vectors = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
  for (const direction of path) {
    const [dx, dy] = vectors[direction];
    const previous = points.at(-1);
    points.push({ x: previous.x + dx, y: previous.y + dy });
  }
  return points;
};
function compressEventBlocks(blocks) {
  const result = [];
  for (let i = 0; i < blocks.length;) {
    if (blocks[i].type !== 'move') { result.push(blocks[i++]); continue; }
    let end = i + 1;
    while (end < blocks.length && blocks[end].type === 'move' && blocks[end].direction === blocks[i].direction) end++;
    const count = end - i;
    result.push(count > 1 ? repeat(count, [move(blocks[i].direction)]) : blocks[i]);
    i = end;
  }
  return result;
}
const openingRoutes = ['RRRR', 'RRRRR', 'RRRRRR', 'RRRRRRR', 'RRURRRD', 'RRDRRRU', 'RRUURRDD', 'RRDDRRUU', 'RURRRDRR', 'RDRRRURR'];
const openingTitles = ['O botão da ponte', 'Ative para seguir', 'Uma porta no mapa', 'O botão escondido', 'Abra a passagem', 'Bip e o interruptor', 'Repetir para ativar', 'Uma rota mais curta', 'Mais de um botão', 'Mestre das ações'];
const switchTitles = ['Botão da ponte', 'Ponte levadiça', 'Acenda a passagem', 'O botão secreto', 'Porta no corredor', 'Ative antes de seguir', 'Atalho acionado', 'Ponte de madeira', 'A passagem certa', 'Mestre dos botões'];
const eventTitles = ['A ponte mudou', 'Dois caminhos possíveis', 'Siga a pista', 'A passagem surpresa', 'O atalho aparece', 'Repita depois da mudança', 'Uma rota que se adapta', 'Caminho em movimento', 'Contorne o imprevisto', 'Detetives do caminho'];
const advancedTitles = ['Guarde sua estratégia', 'Meu plano reutilizável', 'Função que se adapta', 'A trilha surpresa', 'Repetir e decidir', 'Uma função, duas rotas', 'A ponte que muda', 'Plano dos exploradores', 'A última mudança', 'Mestres dos imprevistos'];
const actionOpeningLevels = openingRoutes.map((path, index) => {
  const baseBoard = boardFromPath(path, false);
  const points = eventRoute(path, baseBoard.start), gateIndex = Math.min(3, points.length - 2), gate = points[gateIndex];
  const before = points[gateIndex - 1];
  const routeCells = new Set(points.map(p => `${p.x},${p.y}`));
  const candidates = [['R', 1, 0], ['D', 0, 1], ['L', -1, 0], ['U', 0, -1]];
  const adjacent = candidates.find(([, dx, dy]) => {
    const p = { x: before.x + dx, y: before.y + dy };
    return p.x >= 0 && p.x < baseBoard.cols && p.y >= 0 && p.y < baseBoard.rows && !routeCells.has(`${p.x},${p.y}`);
  });
  const [switchDirection, sx, sy] = adjacent;
  const switchCell = { x: before.x + sx, y: before.y + sy };
  const board = { ...baseBoard, cells: [...baseBoard.cells, switchCell], walls: [gate], switches: [{ ...switchCell, opens: [gate] }], items: [], enemies: [], doors: [], gaps: [], surprises: [] };
  const operations = [];
  for (let step = 0; step < path.length; step++) {
    if (step === gateIndex - 1) operations.push(actionBlock('press', switchDirection));
    operations.push(move(path[step]));
  }
  const useLoops = index >= 6, solution = useLoops ? compressEventBlocks(operations) : operations;
  return { id: `10-${index + 1}`, grade: 10, number: index + 1, title: openingTitles[index], concept: useLoops ? 'Ações e repetições' : 'Ações e direções', instruction: 'Encontre o botão, ative-o e atravesse a passagem que se abriu.', hint: 'O botão fica ao lado de Bip. Use “ativar” na direção do botão para liberar a passagem.', kind: 'actions', boards: [board], solution, definition: [], allowed: useLoops ? ['move', 'press', 'repeat'] : ['move', 'press'], required: useLoops ? ['press', 'repeat'] : ['press'], maxBlocks: 30 };
});
const switchRoutes = [
  'RRUURRRDDRR', 'RRDDRRUURRR', 'RRURRURRDD', 'RRUURRDDRR',
  'RRDDRUURRR', 'RRUURRDRRU', 'RRDRRUURRR', 'RRUURRDDRRD',
  'RRDRRUURR', 'RRDDRRUURR',
];
const switchLevels = switchRoutes.map((path, index) => {
  const baseBoard = boardFromPath(path, false);
  const points = eventRoute(path, baseBoard.start), gateIndex = Math.min(3, points.length - 2), gate = points[gateIndex];
  const before = points[gateIndex - 1];
  const routeCells = new Set(points.map(p => `${p.x},${p.y}`));
  const candidates = [['R', 1, 0], ['D', 0, 1], ['L', -1, 0], ['U', 0, -1]];
  const adjacent = candidates.find(([, dx, dy]) => {
    const p = { x: before.x + dx, y: before.y + dy };
    return p.x >= 0 && p.x < baseBoard.cols && p.y >= 0 && p.y < baseBoard.rows && !routeCells.has(`${p.x},${p.y}`);
  });
  const [switchDirection, sx, sy] = adjacent;
  const switchCell = { x: before.x + sx, y: before.y + sy };
  const board = { ...baseBoard, cells: [...baseBoard.cells, switchCell], walls: [gate], switches: [{ ...switchCell, opens: [gate] }], items: [], enemies: [], doors: [], gaps: [], surprises: [] };
  const operations = [];
  for (let step = 0; step < path.length; step++) {
    if (step === gateIndex - 1) operations.push(actionBlock('press', switchDirection));
    operations.push(move(path[step]));
  }
  const solution = compressEventBlocks(operations);
  return { id: `10-${index + 11}`, grade: 10, number: index + 11, title: switchTitles[index], concept: 'Ações e repetições', instruction: 'Ative o botão correto, atravesse a ponte e use repetir para organizar as setas.', hint: 'O botão libera a casa com a parede. Agrupe movimentos iguais em repetir.', kind: 'actions', boards: [board], solution, definition: [], allowed: ['move', 'press', 'repeat'], required: ['press', 'repeat'], maxBlocks: 30 };
});
const surpriseBoardsAt = triggerX => [false, true].map(openDetour => ({
  cols: 8, rows: 7, start: { x: 0, y: 2 }, goal: { x: 7, y: 2 },
  cells: [...Array.from({ length: 8 }, (_, x) => ({ x, y: 2 })), ...[triggerX, triggerX + 1, triggerX + 2].filter(x => x < 8).map(x => ({ x, y: 3 }))],
  walls: [{ x: triggerX + 1, y: 2 }, { x: triggerX, y: 3 }],
  crystals: [], items: [], enemies: [], doors: [], gaps: [],
  surprises: [{ id: `surpresa-${triggerX}`, at: { x: triggerX, y: 2 }, open: [openDetour ? { x: triggerX, y: 3 } : { x: triggerX + 1, y: 2 }], close: [openDetour ? { x: triggerX + 1, y: 2 } : { x: triggerX, y: 3 }], label: 'O caminho mudou!', message: 'Surpresa! Observem qual caminho ficou livre.' }],
}));
function eventBranch(triggerX, useLoops, withFunction) {
  const mainCount = 7 - triggerX, detourCount = 5 - triggerX;
  const run = count => useLoops && count > 1 ? [repeat(count, [move('R')])] : Array.from({ length: count }, () => move('R'));
  const detour = [move('D'), ...run(2), move('U'), ...run(detourCount)];
  const decision = branch('R', run(mainCount), detour);
  const prefix = useLoops && triggerX > 1 ? [repeat(triggerX, [move('R')])] : Array.from({ length: triggerX }, () => move('R'));
  return { boards: surpriseBoardsAt(triggerX), definition: withFunction ? [...prefix, decision] : [], solution: withFunction ? [call()] : [...prefix, decision] };
}
function makeSwitchCourseLevel(path, number, { twoSwitches = false, wrapInFunction = false, title }) {
  const baseBoard = createActionBoard(path);
  const points = eventRoute(path, baseBoard.start);
  const routeCells = new Set(points.map(p => `${p.x},${p.y}`));
  const switchCells = new Set();
  const gateIndexes = twoSwitches ? [3, Math.min(7, points.length - 2)] : [Math.min(3, points.length - 2)];
  const walls = [], switches = [], pressDirections = new Map();
  for (const gateIndex of gateIndexes) {
    const gate = points[gateIndex], before = points[gateIndex - 1];
    const candidates = [['R', 1, 0], ['D', 0, 1], ['L', -1, 0], ['U', 0, -1]];
    const adjacent = candidates.find(([, dx, dy]) => {
      const cell = { x: before.x + dx, y: before.y + dy };
      const key = `${cell.x},${cell.y}`;
      return cell.x >= 0 && cell.x < baseBoard.cols && cell.y >= 0 && cell.y < baseBoard.rows
        && !routeCells.has(key) && !switchCells.has(key);
    });
    if (!adjacent) throw new Error(`Não foi possível posicionar o botão do desafio ${number}.`);
    const [direction, dx, dy] = adjacent, cell = { x: before.x + dx, y: before.y + dy };
    switchCells.add(`${cell.x},${cell.y}`);
    walls.push(gate);
    switches.push({ ...cell, opens: [gate] });
    pressDirections.set(gateIndex - 1, direction);
  }
  const board = {
    ...baseBoard,
    cells: [...baseBoard.cells, ...switches.map(({ x, y }) => ({ x, y }))],
    walls,
    switches,
  };
  const operations = [];
  for (let step = 0; step < path.length; step++) {
    if (pressDirections.has(step)) operations.push(actionBlock('press', pressDirections.get(step)));
    operations.push(move(path[step]));
  }
  const definition = wrapInFunction ? compressEventBlocks(operations) : [];
  const solution = wrapInFunction ? [call()] : compressEventBlocks(operations);
  return {
    id: `10-${number}`, grade: 10, number, title,
    concept: wrapInFunction ? 'Ações, repetir e funções' : twoSwitches ? 'Planejamento de duas ativações' : 'Ativar botões e planejar rotas',
    instruction: wrapInFunction
      ? 'Guarde em Meu bloco o plano que ativa os botões e atravessa as passagens. Depois chame F.'
      : twoSwitches
        ? 'Há duas passagens bloqueadas. Ative cada botão no momento certo e agrupe movimentos repetidos.'
        : 'Encontre o botão, ative-o e atravesse a passagem. Planeje a ordem dos movimentos.',
    hint: twoSwitches
      ? 'Cada botão abre uma parede diferente. Ative-o antes de tentar atravessar a parede correspondente.'
      : wrapInFunction
        ? 'A função guarda ações e movimentos. Para executar o plano, chame F no programa principal.'
        : 'O bloco ativar aponta para o botão ao lado de Bip. O botão precisa ser ativado antes de cruzar a parede.',
    kind: wrapInFunction ? 'compose' : 'actions',
    boards: [board], solution, definition,
    allowed: wrapInFunction ? ['move', 'press', 'repeat', 'call'] : ['move', 'press', 'repeat'],
    required: wrapInFunction ? ['press', 'repeat', 'call'] : ['press', 'repeat'],
    maxBlocks: 40,
  };
}
const doubleSwitchRoutes = [
  'RRUURRRDDRR', 'RRDDRRUURRR', 'RRURRURRDD', 'RRUURRDDRR',
  'RRDDRUURRR', 'RRUURRDRRU', 'RRDRRUURRR', 'RRUURRDDRRD',
  'RRDRRUURR', 'RRDDRRUURR',
];
const intermediateLevels = doubleSwitchRoutes.map((path, index) => makeSwitchCourseLevel(path, 21 + index, {
  twoSwitches: true,
  title: ['Duas pontes', 'Ative antes de avançar', 'Dois botões, uma rota', 'A segunda passagem', 'O caminho em etapas', 'Planeje as ativações', 'Passagens em sequência', 'Dois obstáculos', 'Rota com duas passagens', 'Mestre dos interruptores'][index],
}));

const mazePatternLevels = Array.from({ length: 10 }, (_, index) => {
  const number = index + 1, triggerX = index % 5 + 1;
  const event = eventBranch(triggerX, false, false);
  return {
    id: `11-${number}`, grade: 11, number,
    title: ['A primeira surpresa', 'O corredor mudou', 'Escolha a passagem', 'Observe antes de andar', 'O atalho apareceu', 'A ponte inesperada', 'O mapa se transforma', 'Se estiver livre', 'Duas rotas, uma regra', 'Detetives dos imprevistos'][index],
    concept: 'Decisões em cenários que mudam',
    instruction: 'O caminho muda entre os mapas. Use se/senão para escolher a rota certa com um único programa.',
    hint: 'O sensor verifica se a passagem à direita está livre. Se estiver, siga por ela; caso contrário, use o desvio.',
    kind: 'adapt', boards: event.boards, solution: event.solution, definition: [],
    allowed: ['move', 'if'], required: ['if'], maxBlocks: 40,
  };
});
const expandRepeats = blocks => blocks.flatMap(block => block.type === 'repeat'
  ? Array.from({ length: block.times }, () => expandRepeats(block.body || [])).flat()
  : [{ ...block, ...(block.body ? { body: expandRepeats(block.body) } : {}), ...(block.elseBody ? { elseBody: expandRepeats(block.elseBody) } : {}) }]);
const decisionLevels = Array.from({ length: 20 }, (_, index) => {
  const number = index + 11, advanced = number >= 21;
  const cycle = index % 10;
  const triggerX = cycle < 5 ? cycle + 1 : 5 - (cycle - 5);
  const event = eventBranch(triggerX, true, false);
  const kind = !advanced ? 'adapt' : index % 2 === 0 ? 'debug' : 'optimize';
  const starter = kind === 'debug'
    ? [...event.solution.slice(0, -1), { ...event.solution.at(-1), direction: 'L' }]
    : kind === 'optimize' ? expandRepeats(event.solution) : undefined;
  return {
    id: `11-${number}`, grade: 11, number,
    title: !advanced ? eventTitles[index % 10] : ['A condição trocada', 'Enxugue o desvio', 'A repetição incorreta', 'Use menos blocos', 'Conserte o sensor', 'Simplifique o plano', 'A decisão errada', 'Uma rota mais econômica', 'Depuração surpresa', 'O último ajuste'][index - 10],
    concept: advanced ? 'Depuração e otimização com eventos' : 'Repetições, decisões e imprevistos',
    instruction: advanced
      ? kind === 'debug' ? 'O programa inicial escolhe a rota errada em um dos mapas. Corrija a condição e teste os dois cenários.' : 'O caminho funciona, mas o plano está longo. Reescreva-o com repetir e respeite o limite de blocos.'
      : 'O cenário muda durante o desafio. Use se/senão e repetir para resolver os dois mapas.',
    hint: 'Observe onde a passagem ficou livre. A condição precisa testar a direção que realmente distingue os dois cenários.',
    kind, boards: event.boards, solution: event.solution, definition: [],
    ...(starter ? { starter } : {}),
    allowed: ['move', 'repeat', 'if'], required: ['repeat', 'if'],
    ...(kind === 'optimize' ? { budget: countBlocks(event.solution) } : {}),
    maxBlocks: 40,
  };
});
const advancedLevels = Array.from({ length: 10 }, (_, index) => {
  const number = index + 31, triggerX = index % 5 + 1;
  const event = eventBranch(triggerX, true, true);
  const kind = index < 5 ? 'compose' : index % 2 === 1 ? 'debug' : 'optimize';
  const starterDefinition = kind === 'debug'
    ? [...event.definition.slice(0, -1), { ...event.definition.at(-1), direction: 'L' }]
    : kind === 'optimize' ? expandRepeats(event.definition) : undefined;
  return {
    id: `11-${number}`, grade: 11, number,
    title: advancedTitles[index],
    concept: 'Funções, decisões e eventos',
    instruction: kind === 'debug'
      ? 'Meu bloco tem uma condição incorreta. Encontre o erro sem remover a função e teste os dois cenários.'
      : kind === 'optimize'
        ? 'A função resolve os mapas, mas pode usar menos blocos. Simplifique a definição mantendo o mesmo comportamento.'
        : 'Guarde a estratégia em Meu bloco e chame F para resolver os dois cenários surpresa.',
    hint: 'A definição pode conter repetir e se/senão. Lembre-se de chamar F no programa principal.',
    kind, boards: event.boards, solution: event.solution, definition: event.definition,
    ...(starterDefinition ? { starter: [call()], starterDefinition } : {}),
    allowed: ['move', 'if', 'repeat', 'call'], required: ['call', 'if', 'repeat'],
    ...(kind === 'optimize' ? { budget: countBlocks([call()]) + countBlocks(event.definition) } : {}),
    maxBlocks: 40,
  };
});
const lateActionRoutes = [
  'RRURRRDDRR', 'RRUURRRDDR', 'RRDDRRUURR', 'RRURRURRDD', 'RRUURRDDRR',
  'RRDDRUURRR', 'RRUURRDRRU', 'RRDRRUURR', 'RRUURRDDRRD', 'RRDDRRUURRR',
];
const lateActionLevels = lateActionRoutes.map((path, index) => makeSwitchCourseLevel(path, 31 + index, {
  wrapInFunction: true,
  title: ['Função que ativa uma ponte', 'Meu bloco de interruptores', 'Reutilize o plano', 'Uma rota em partes', 'Botões dentro da função', 'Repetir e ativar', 'Automação organizada', 'Função com duas ações', 'Construa e chame', 'Mestre das ações'][index],
}));
const eventLevels = [...actionOpeningLevels, ...switchLevels, ...intermediateLevels, ...lateActionLevels, ...mazePatternLevels, ...decisionLevels, ...advancedLevels];


const ACTIVE_CHALLENGE_COUNTS = Object.freeze({ 1: 10, 2: 20, 3: 10, 4: 20, 5: 30, 6: 20, 7: 0, 8: 10, 9: 30, 10: 30, 11: 20 });
export const LEVELS = [...ORIGINAL, ...extra, ...sequenceLevels, ...actionLevels, ...eventLevels]
  .filter(level => level.number <= (ACTIVE_CHALLENGE_COUNTS[level.grade] || 0))
  .sort((a, b) => a.grade - b.grade || a.number - b.number).map(l => {
  const allowed = l.allowed || ['move'];
  if (!l.allowed && (l.grade >= 3 || (l.grade === 2 && l.number >= 21))) allowed.push('repeat');
  if (!l.allowed && (l.grade >= 4 || (l.grade === 3 && l.number >= 21))) allowed.push('if');
  if (!l.allowed && (l.grade === 5 || (l.grade === 4 && l.number >= 31))) allowed.push('call');
  const trail = Math.floor((l.number - 1) / 10) + 1;
  return { ...l, kind: l.kind || (l.starter ? 'debug' : l.boards?.length > 1 ? 'adapt' : 'build'), allowed, trail, discussion: WORLDS.find(world => world.id === l.grade)?.trails?.[trail - 1]?.discussion || 'Que pistas ajudaram sua equipe a resolver este desafio?' };
});
export const TOTAL_MISSIONS = LEVELS.length;
export const missionCountFor = grade => LEVELS.filter(level => level.grade === grade).length;
for (const world of WORLDS) {
  const trailCount = Math.ceil(missionCountFor(world.id) / MISSIONS_PER_TRAIL);
  world.trails = world.trails.slice(0, trailCount);
}
export const levelsFor = difficulty => LEVELS.filter(l => l.grade === difficulty);
export const getLevel = id => LEVELS.find(l => l.id === id);
export function referenceCount(level) { return countBlocks(level.solution) + countBlocks(level.definition); }
export function orderedLevels() {
  return CURRICULUM_WORLD_ORDER.flatMap(grade =>
    LEVELS.filter(level => level.grade === grade).sort((a, b) => a.number - b.number)
  );
}
export function recommendedLevel(team) {
  const ordered = orderedLevels();
  const lastIndex = ordered.findIndex(level => level.id === team?.lastLevel);
  const start = lastIndex >= 0 ? lastIndex : 0;
  return [...ordered.slice(start), ...ordered.slice(0, start)].find(level => !team?.progress?.[level.id])
    || ordered.at(-1)
    || LEVELS[0];
}
export const nextLevel = level => {
  const ordered = orderedLevels();
  const index = ordered.findIndex(item => item.id === level?.id);
  return index >= 0 ? ordered[index + 1] || null : null;
};
