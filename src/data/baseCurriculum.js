export const WORLDS = [
  { id: 1, name: 'Jardim dos primeiros passos', short: 'Jardim', topic: 'Sequências e direções', description: 'Uma seta de cada vez. Uma descoberta a cada passo.', color: '#33785b', soft: '#e6f2e2', type: 'garden', icon: 'sprout', skill: 'Organizar pequenas sequências usando setas e observar o resultado.', teacher: 'Explore o significado das setas com movimentos do corpo. A criança pode tocar nos blocos e observar a demonstração visual; não precisa ler ou ouvir para resolver os desafios.' },
  { id: 2, name: 'Ilha dos caminhos', short: 'Ilha', topic: 'Planejamento e lógica', description: 'Escolha caminhos, teste ideias e encontre a saída.', color: '#247c9d', soft: '#e0f1f7', type: 'island', icon: 'compass', skill: 'Planejar trajetos, ordenar instruções e corrigir sequências.', teacher: 'Antes de executar, convide a equipe a prever onde Bip vai parar. Nas fases de correção, um programa inicial contém um erro: descubram e consertem juntos.' },
  { id: 3, name: 'Vale das repetições', short: 'Vale', topic: 'Padrões e repetições', description: 'Descubra padrões e faça mais com menos blocos.', color: '#a76d2a', soft: '#fbefda', type: 'valley', icon: 'repeat', skill: 'Reconhecer padrões e representar repetições com laços.', teacher: 'Peça que encontrem uma parte que se repete no caminho. O bloco repetir pode guardar vários comandos e até outro repetir.' },
  { id: 4, name: 'Floresta das escolhas', short: 'Floresta', topic: 'Condições e decisões', description: 'E se o caminho mudar? Seu código pode decidir!', color: '#7462a8', soft: '#eee8f7', type: 'forest', icon: 'split', skill: 'Tomar decisões com se/senão e testar um algoritmo em cenários diferentes.', teacher: 'Cada missão tem dois cenários. O mesmo programa precisa resolver ambos. O sensor do bloco se verifica se existe uma casa na direção escolhida.' },
  { id: 5, name: 'Estação das invenções', short: 'Estação', topic: 'Funções e decomposição', description: 'Junte tudo o que aprendeu e crie seus próprios blocos.', color: '#b16a55', soft: '#f8e9e1', type: 'station', icon: 'rocket', skill: 'Dividir problemas em partes, criar uma função e reutilizar instruções.', teacher: 'A área Meu bloco é uma função. Definir a sequência não a executa: é preciso chamar o bloco F no programa principal. As últimas missões integram condições e repetições.' },
];

export const DIRS = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
export const DIRECTIONS = { R: 'direita', L: 'esquerda', U: 'cima', D: 'baixo' };
export const move = direction => ({ type: 'move', direction });
export const repeat = (times, body) => ({ type: 'repeat', times, body });
export const branch = (direction, body, elseBody = []) => ({ type: 'if', direction, body, elseBody });
export const call = () => ({ type: 'call' });
const seq = path => [...path].map(move);
const chooseStep = () => branch('R', [move('R')], [move('U')]);

export function boardFromPath(path, crystals = true) {
  const raw = [{ x: 0, y: 0 }];
  for (const d of path) {
    const [dx, dy] = DIRS[d];
    const last = raw.at(-1);
    raw.push({ x: last.x + dx, y: last.y + dy });
  }
  const minX = Math.min(...raw.map(p => p.x));
  const minY = Math.min(...raw.map(p => p.y));
  const width = Math.max(...raw.map(p => p.x)) - minX + 1;
  const height = Math.max(...raw.map(p => p.y)) - minY + 1;
  const cols = Math.max(5, width + 2);
  const rows = Math.max(5, height + 2);
  const offsetX = Math.floor((cols - width) / 2) - minX;
  const offsetY = Math.floor((rows - height) / 2) - minY;
  const route = raw.map(p => ({ x: p.x + offsetX, y: p.y + offsetY }));
  const unique = [...new Map(route.map(p => [`${p.x},${p.y}`, p])).values()];
  const start = route[0];
  const goal = route.at(-1);
  return {
    cols, rows, start, goal, cells: unique,
    crystals: crystals ? unique.filter(p => !(p.x === start.x && p.y === start.y) && !(p.x === goal.x && p.y === goal.y)) : [],
  };
}

export function level(grade, number, title, path, solution, extra = {}) {
  return {
    id: `${grade}-${number}`, grade, number, title,
    concept: WORLDS[grade - 1].topic,
    instruction: grade === 1 ? 'Toque nas setas. Depois, toque no botão verde para levar o Bip até a bandeira.' : 'Pegue todos os cristais e leve o Bip até a bandeira.',
    hint: 'Observe o caminho. Cada seta faz o Bip andar uma casa naquela direção.',
    boards: [boardFromPath(path, number > 2 || grade > 1)],
    solution, definition: [], required: [],
    maxBlocks: grade < 3 ? Math.max(path.length + 5, 8) : 24,
    ...extra,
  };
}

const firstPaths = ['R', 'RR', 'RRR', 'RU', 'RRU', 'RUU', 'RRUU', 'UURR', 'RRULL', 'RRUULLD'];
const firstNames = ['Olá, Bip!', 'Mais um passo', 'Siga as setas', 'Uma nova direção', 'Ache o cristal', 'Vamos subir?', 'A curva do jardim', 'Primeiro, para cima', 'De volta pelo jardim', 'Explorador do jardim'];
const track1 = firstPaths.map((p, i) => level(1, i + 1, firstNames[i], p, seq(p)));

const secondPaths = ['RRUU', 'UURR', 'RRDDRR', 'URRUL', 'RRUUR', 'UURRDD', 'RRUUULL', 'UURRUUR', 'RRUULLUURR', 'RUURRDDRUU'];
const secondNames = ['Uma ilha para explorar', 'Pense antes de andar', 'Contorne a praia', 'Algo fora do lugar', 'O caminho dos cristais', 'Uma grande volta', 'Encontre o erro', 'Plano de explorador', 'O tesouro da ilha', 'Conserte a expedição'];
const track2 = secondPaths.map((p, i) => level(2, i + 1, secondNames[i], p, seq(p), [3, 6, 9].includes(i) ? {
  concept: 'Encontrar e corrigir erros',
  instruction: 'Este programa tem um erro. Observe as setas, corrija o caminho e teste sua ideia.',
  hint: 'Compare cada seta com o caminho. Use os botões para remover ou mudar a ordem dos blocos.',
  starter: seq(p).map((b, j) => j === 1 ? move(b.direction === 'R' ? 'L' : 'D') : b),
} : {}));

const loopSpecs = [
  ['O primeiro padrão', 'RRR', [repeat(3, [move('R')])]],
  ['Subir e repetir', 'UUUU', [repeat(4, [move('U')])]],
  ['Dois blocos, um padrão', 'RURURU', [repeat(3, seq('RU'))]],
  ['Passinhos em dobro', 'RRURRU', [repeat(2, seq('RRU'))]],
  ['A escada do vale', 'RUURUURUU', [repeat(3, seq('RUU'))]],
  ['Duas repetições', 'RRRRUUU', [repeat(4, [move('R')]), repeat(3, [move('U')])]],
  ['Repita a curva', 'RRUURRUU', [repeat(2, [repeat(2, [move('R')]), repeat(2, [move('U')])])]],
  ['Um padrão maior', 'RRRURRRU', [repeat(2, [repeat(3, [move('R')]), move('U')])]],
  ['Depois do padrão', 'RURURURR', [repeat(3, seq('RU')), repeat(2, [move('R')])]],
  ['Mestre das repetições', 'RRUURRUURRUU', [repeat(3, [repeat(2, [move('R')]), repeat(2, [move('U')])])]],
];
const track3 = loopSpecs.map(([name, p, solution], i) => level(3, i + 1, name, p, solution, {
  required: ['repeat'],
  instruction: 'Encontre o padrão do caminho e use o bloco repetir para chegar à bandeira.',
  hint: 'Coloque dentro do repetir a menor sequência que aparece várias vezes. Escolha quantas vezes ela vai acontecer.',
  ...(i === 9 ? {
    kind: 'optimize',
    starter: seq(p),
    budget: countBlocks(solution),
    instruction: 'O programa funciona, mas está cheio de setas. Reescreva o plano com repetir e respeite o limite de blocos.',
  } : {}),
}));

const conditionPaths = [
  ['R', 'U'], ['RR', 'UU'], ['RRUU', 'UURR'], ['RRRUU', 'UURRR'],
  ['RRUURR', 'UURRUU'], ['RRRUUU', 'UUURRR'], ['RRUURRU', 'UURRUUR'],
  ['RRRUURRR', 'UURRRUUU'], ['RRUURRUU', 'UURRUURR'], ['RRRUUURRRUUU', 'UUURRRUUURRR'],
];
const conditionNames = ['Uma escolha de cada vez', 'Qual caminho está livre?', 'Se… então!', 'Dois caminhos, uma ideia', 'Decidir de novo', 'O sensor do Bip', 'Olhe antes de andar', 'Escolhas pelo caminho', 'Um código, dois cenários', 'Guardião da floresta'];
const track4 = conditionPaths.map(([p, q], i) => level(4, i + 1, conditionNames[i], p, i === 0 ? [chooseStep()] : [repeat(p.length, [chooseStep()])], {
  boards: [boardFromPath(p), boardFromPath(q)], required: ['if'],
  instruction: 'O caminho muda! Use se/senão para resolver os dois cenários com o mesmo programa.',
  hint: 'O bloco se olha se há uma casa na direção escolhida. Se houver, executa o primeiro grupo. Se não houver, executa o grupo senão. Não verifica se há um cristal.',
}));

const fnSpecs = [
  ['Seu primeiro bloco', 'RRU', [call()], seq('RRU')],
  ['Crie e reutilize', 'RURU', [repeat(2, [call()])], seq('RU')],
  ['O bloco da escada', 'RRURRURRU', [repeat(3, [call()])], seq('RRU')],
  ['Uma invenção que sobe', 'RUURUURUU', [repeat(3, [call()])], seq('RUU')],
  ['Peças de uma solução', 'RRUURRUU', [repeat(2, [call()])], [repeat(2, [move('R')]), repeat(2, [move('U')])]],
  ['Antes e depois', 'URRURRUR', [move('U'), repeat(2, [call()]), move('R')], seq('RRU')],
  ['Grande plano, poucas peças', 'RRUURRUURRUU', [repeat(3, [call()])], [repeat(2, [move('R')]), repeat(2, [move('U')])]],
  ['Um bloco que decide', 'RRRUUU', [repeat(6, [call()])], [chooseStep()]],
  ['Uma solução flexível', 'RRUURRUU', [repeat(8, [call()])], [chooseStep()]],
  ['A grande invenção', 'RRRUUURRRUUU', [repeat(6, [call()])], [repeat(2, [chooseStep()])]],
];
const track5 = fnSpecs.map(([name, p, solution, definition], i) => level(5, i + 1, name, p, solution, {
  definition, required: i >= 7 ? ['call', 'if'] : ['call'],
  ...(i >= 7 ? { boards: [boardFromPath(p), boardFromPath(i === 7 ? 'UUURRR' : i === 8 ? 'UURRUURR' : 'UUURRRUUURRR')] } : {}),
  instruction: 'Crie uma sequência na área Meu bloco. Depois use F no seu programa para chamá-la.',
  hint: 'Uma função guarda uma parte da solução para você usar de novo. Monte os comandos em Meu bloco e coloque F no programa principal. Não é possível chamar F dentro dele mesmo.',
}));

export const LEVELS = [...track1, ...track2, ...track3, ...track4, ...track5];
export const levelsFor = grade => LEVELS.filter(l => l.grade === grade);
export const getLevel = id => LEVELS.find(l => l.id === id);
export function countBlocks(blocks) {
  return blocks.reduce((total, block) => total + 1 + countBlocks(block.body || []) + countBlocks(block.elseBody || []), 0);
}
export function referenceCount(level) { return countBlocks(level.solution) + countBlocks(level.definition); }

