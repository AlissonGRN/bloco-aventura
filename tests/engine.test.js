import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, WORLDS, SEQUENCE_TASKS, move, repeat, branch, call, countBlocks, getLevel } from '../src/data/curriculum.js';
import { simulate, evaluateAll, withIds, editList } from '../src/game/engine.js';

test('360 unique missions, 40 per level', () => {
  assert.equal(LEVELS.length, 360);
  assert.equal(new Set(LEVELS.map(l => l.id)).size, 360);
  for (let grade = 1; grade <= 9; grade++) assert.equal(LEVELS.filter(l => l.grade === grade).length, 40);
  assert.equal(WORLDS.length, 9);
});
for (const l of LEVELS.filter(l => !['sequence','circuit'].includes(l.kind))) test(`All scenarios solvable: ${l.id} ${l.title}`, () => {
  const result = evaluateAll(l, withIds(l.solution), withIds(l.definition));
  assert.equal(result.success, true, result.results.map(r => r.failure).join(' / '));
  assert.equal(result.stars, 3);
  assert.ok(countBlocks(l.solution) + countBlocks(l.definition) <= l.maxBlocks);
  for (const b of l.boards) {
    assert.ok(b.cells.every(p => p.x >= 0 && p.x < b.cols && p.y >= 0 && p.y < b.rows));
    assert.equal(new Set(b.cells.map(p => `${p.x},${p.y}`)).size, b.cells.length);
  }
});
test('Arduino circuit and reading sequence levels each have 40 progressively designed challenges', () => {
  assert.equal(SEQUENCE_TASKS.length, 40);
  const circuits = LEVELS.filter(l => l.grade === 8), reading = LEVELS.filter(l => l.grade === 9);
  assert.equal(circuits.length, 40); assert.equal(reading.length, 40);
  assert.ok(circuits.every(l => l.kind === 'circuit' && l.parts.length >= 3 && l.connections.length >= 3));
  assert.ok(reading.every(l => l.sequenceMode === 'words' && l.steps.length >= 4));
  for (const l of reading) assert.deepEqual(l.solution, l.steps.map((_, i) => i));
  assert.ok(circuits[0].connections.length < circuits[10].connections.length);
  assert.ok(circuits[20].connections.length < circuits[30].connections.length);
  for (const l of circuits) {
    const ports = new Set(l.parts.flatMap(part => part.ports.map(port => port.id)));
    assert.ok(l.connections.flat().every(port => ports.has(port)), l.id);
  }
});
test('Reject empty program, walls, unfinished paths and missed crystals', () => {
  assert.equal(simulate(LEVELS[0], []).success, false);
  assert.equal(simulate(LEVELS[0], [move('L')]).success, false);
  assert.equal(simulate(LEVELS[1], [move('R')]).success, false);
  const l = { ...LEVELS[0], boards: [{ ...LEVELS[0].boards[0], crystals: [{ x: 0, y: 0 }] }] };
  assert.match(simulate(l, [move('R')]).failure, /cristal/);
});
test('Condition examines current position; one fixed route does not solve both scenarios', () => {
  const l = getLevel('4-1');
  assert.equal(evaluateAll(l, [branch('R', [move('R')], [move('U')])]).success, true);
  assert.equal(evaluateAll(l, [move('R')]).success, false);
});
test('Reject recursion, empty function and oversized execution', () => {
  assert.match(simulate(getLevel('5-1'), [call()], [call()]).failure, /si mesmo/);
  assert.match(simulate(getLevel('5-1'), [call()], []).failure, /Meu bloco/);
  const huge = [repeat(16, [repeat(16, [repeat(16, [branch('L', [move('L')])])])])];
  assert.match(simulate(getLevel('4-1'), huge).failure, /muitos passos/);
});
test('Required teaching block must actually execute', () => {
  const l = getLevel('3-1');
  assert.match(simulate(l, [move('R'), move('R'), move('R')]).failure, /repetir/);
});
test('Tree editor changes only the selected nested list', () => {
  const tree = withIds([repeat(2, [move('R')]), move('U')]);
  const next = editList(tree, [tree[0].id, 'body'], blocks => [...blocks, move('U')]);
  assert.equal(tree[0].body.length, 1);
  assert.equal(next[0].body.length, 2);
  assert.equal(next[1], tree[1]);
});


test('Concepts mix progressively instead of restricting each level to one block', () => {
  assert.ok(getLevel('2-21').allowed.includes('repeat'));
  assert.ok(getLevel('3-21').allowed.includes('if'));
  assert.ok(getLevel('4-31').allowed.includes('call'));
  assert.equal(getLevel('5-31').required.includes('call'), false);
  for (let difficulty=1; difficulty<=5; difficulty++) {
    const missions=LEVELS.filter(l=>l.grade===difficulty);
    for(let trail=1; trail<=4; trail++) assert.equal(missions.filter(l=>l.trail===trail).length,10);
    if (difficulty<=5) assert.ok(new Set(missions.map(l=>l.kind)).size>=2);
  }
});
test('Optimization budgets are enforced even when the path is solved', () => {
  const l = getLevel('2-31');
  const expanded = l.starter;
  assert.match(simulate({...l,required:[]}, expanded).failure,/simplifique/);
  assert.equal(evaluateAll(l,l.solution,l.definition).success,true);
});
test('Maze walls block movement and the goal only counts when reached by a shortest route', () => {
  const l = getLevel('6-1'), board = l.boards[0];
  assert.equal(board.layout, 'maze');
  assert.ok(board.walls.length > 0);
  assert.equal(evaluateAll(l, withIds(l.solution)).success, true);
  const longer = [...l.solution, move('L'), move('R')];
  assert.match(evaluateAll(l, withIds(longer)).results[0].failure, /menor caminho/);
  assert.match(evaluateAll(l, [move('R'), move('R'), move('D')]).results[0].failure, /parede|caminho/i);
  assert.ok(getLevel('6-20').allowed.includes('move') && !getLevel('6-20').allowed.includes('repeat'));
  assert.ok(getLevel('6-21').allowed.includes('repeat') && getLevel('6-21').required.includes('repeat'));
  assert.ok(getLevel('7-1').allowed.includes('repeat') && getLevel('7-1').required.includes('repeat'));
  assert.ok(!getLevel('7-30').allowed.includes('call') && getLevel('7-31').allowed.includes('call'));
});
test('Debugging starters contain an observable problem and all prescribed blocks are available', () => {
  for (const l of LEVELS) {
    if (['sequence','circuit'].includes(l.kind)) continue;
    if (l.kind==='debug') assert.equal(evaluateAll(l,l.starter||[],l.starterDefinition||[]).success,false,l.id);
    const collect = bs=>bs.flatMap(b=>[b.type,...collect(b.body||[]),...collect(b.elseBody||[])]);
    assert.ok([...collect(l.solution),...collect(l.definition)].every(t=>l.allowed.includes(t)),l.id);
  }
});
