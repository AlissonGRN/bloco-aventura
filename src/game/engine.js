import { DIRS, countBlocks, referenceCount } from '../data/curriculum.js';

const key = p => `${p.x},${p.y}`;
export const same = (a, b) => a.x === b.x && a.y === b.y;
export function withIds(blocks) {
  return blocks.map(b => ({ ...b, id: globalThis.crypto?.randomUUID?.() ?? `b-${Math.random().toString(36).slice(2)}`, ...(b.body ? { body: withIds(b.body) } : {}), ...(b.elseBody ? { elseBody: withIds(b.elseBody) } : {}) }));
}
export function typesIn(blocks) {
  return blocks.flatMap(b => [b.type, ...typesIn(b.body || []), ...typesIn(b.elseBody || [])]);
}

// Pure interpreter: no eval, no browser dependency. Every state is a snapshot.
export function simulate(level, program, definition = [], scenario = 0) {
  const board = level.boards[scenario];
  const cells = new Set(board.cells.map(key));
  const crystals = new Set(board.crystals.map(key));
  let position = { ...board.start };
  const collected = new Set();
  const timeline = [];
  let failure = null;
  let instructions = 0;
  let moves = 0;
  const usedTypes = new Set();
  function snapshot(block, extra = {}) {
    timeline.push({ position: { ...position }, collected: [...collected], blockId: block.id, moves, ...extra });
  }
  function canMove(direction) {
    const d = DIRS[direction];
    return !!d && cells.has(`${position.x + d[0]},${position.y + d[1]}`);
  }
  function execute(blocks, inFunction = false, depth = 0) {
    if (depth > 12) { failure = 'Este programa tem blocos demais dentro de outros blocos. Vamos simplificar?'; return; }
    for (const b of blocks) {
      if (failure) return;
      if (++instructions > 400) { failure = 'Bip deu muitos passos. Tente diminuir as repetições.'; return; }
      usedTypes.add(b.type);
      if (b.type === 'move') {
        if (!canMove(b.direction)) {
          failure = 'Ops! Não há caminho nessa direção. Veja a seta destacada e tente outra ideia.';
          snapshot(b, { kind: 'blocked', direction: b.direction });
          return;
        }
        position.x += DIRS[b.direction][0];
        position.y += DIRS[b.direction][1];
        moves++;
        if (crystals.has(key(position))) collected.add(key(position));
        snapshot(b, { kind: 'move', direction: b.direction });
      } else if (b.type === 'repeat') {
        if (!Number.isInteger(b.times) || b.times < 2 || b.times > 16 || !b.body?.length) {
          failure = 'Coloque comandos dentro do repetir e escolha um número de 2 a 16.'; snapshot(b, { kind: 'blocked' }); return;
        }
        for (let i = 0; i < b.times && !failure; i++) {
          snapshot(b, { kind: 'repeat', iteration: i + 1 });
          execute(b.body, inFunction, depth + 1);
        }
      } else if (b.type === 'if') {
        if (!b.body?.length && !b.elseBody?.length) { failure = 'Coloque comandos dentro do bloco se ou senão.'; snapshot(b, { kind: 'blocked' }); return; }
        const condition = canMove(b.direction);
        snapshot(b, { kind: 'condition', condition, direction: b.direction });
        execute(condition ? (b.body || []) : (b.elseBody || []), inFunction, depth + 1);
      } else if (b.type === 'call') {
        if (inFunction) { failure = 'Meu bloco não pode chamar a si mesmo. Tire o F de dentro dele.'; snapshot(b, { kind: 'blocked' }); return; }
        if (!definition.length) { failure = 'Primeiro coloque uma sequência na área Meu bloco.'; snapshot(b, { kind: 'blocked' }); return; }
        snapshot(b, { kind: 'call' });
        execute(definition, true, depth + 1);
      } else { failure = 'Este bloco não é reconhecido.'; return; }
    }
  }
  if (!program.length) failure = 'Escolha alguns blocos para começar.';
  else if (countBlocks(program) + countBlocks(definition) > level.maxBlocks) failure = 'Há muitos blocos. Tente deixar seu programa menor.';
  else if (level.allowed && [...typesIn(program), ...typesIn(definition)].some(t => !level.allowed.includes(t))) failure = 'Use os blocos disponíveis nesta missão.';
  else execute(program);
  if (!failure && !same(position, board.goal)) failure = 'Ainda falta chegar à bandeira. Seu plano está quase lá!';
  if (!failure && board.shortestMoves && moves > board.shortestMoves) failure = `Bip chegou, mas deu ${moves} passos. Tente encontrar o menor caminho: ${board.shortestMoves} passos.`;
  if (!failure && collected.size < crystals.size) failure = 'Faltou pegar um cristal. Passe por todos antes de terminar.';
  if (!failure && level.required.some(t => !usedTypes.has(t))) {
    const names = { repeat: 'repetir', if: 'se/senão', call: 'F (Meu bloco)' };
    failure = `Você encontrou o caminho! Agora resolva usando ${level.required.filter(t => !usedTypes.has(t)).map(t => names[t]).join(' e ')}, a ideia desta missão.`;
  }
  if (!failure && level.budget && countBlocks(program) + countBlocks(definition) > level.budget) failure = `Caminho resolvido! Agora simplifique o plano para usar até ${level.budget} blocos.`;
  return { success: !failure, failure, timeline, position, collected: [...collected], moves, scenario, stars: failure ? 0 : (countBlocks(program) + countBlocks(definition) <= referenceCount(level) ? 3 : 2) };
}

export function evaluateAll(level, program, definition = []) {
  const results = level.boards.map((_, i) => simulate(level, program, definition, i));
  return { results, success: results.every(r => r.success), stars: Math.min(...results.map(r => r.stars)) };
}

// Immutable tree operations support nested editor targets and undo history.
export function editList(tree, path, operation) {
  if (!path.length) return operation(tree);
  const [id, branchName, ...rest] = path;
  return tree.map(block => block.id === id ? { ...block, [branchName]: editList(block[branchName] || [], rest, operation) } : block);
}
export function patchBlock(tree, id, changes) {
  return tree.map(b => b.id === id ? { ...b, ...changes } : { ...b, ...(b.body ? { body: patchBlock(b.body, id, changes) } : {}), ...(b.elseBody ? { elseBody: patchBlock(b.elseBody, id, changes) } : {}) });
}
