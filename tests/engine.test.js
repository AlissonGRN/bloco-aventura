import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, WORLDS, DISPLAY_WORLDS, SEQUENCE_TASKS, move, repeat, branch, call, actionBlock, countBlocks, getLevel, nextLevel } from '../src/data/curriculum.js';
import { simulate, evaluateAll, withIds, editList } from '../src/game/engine.js';

test('230 active missions have stable IDs and a shorter progression per world', () => {
  assert.equal(LEVELS.length, 230);
  assert.equal(new Set(LEVELS.map(l => l.id)).size, 230);
  const expected = { 1:20, 2:20, 3:20, 4:20, 5:20, 6:20, 7:20, 8:10, 9:30, 10:30, 11:20 };
  for (const [grade, count] of Object.entries(expected)) assert.equal(LEVELS.filter(l => l.grade === Number(grade)).length, count);
  assert.equal(WORLDS.length, 11);
  assert.ok(!WORLDS.some(world => [12, 13].includes(world.id)));
  assert.ok(LEVELS.every(level => ![12, 13].includes(level.grade)));
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
test('The daily-life sequence world is a short set of ten transfer challenges', () => {
  assert.equal(SEQUENCE_TASKS.length, 40);
  const reading = LEVELS.filter(l => l.grade === 8);
  assert.equal(reading.length, 10);
  assert.ok(reading.every(l => l.sequenceMode === 'words' && l.steps.length >= 4));
  for (const l of reading) assert.deepEqual(l.solution, l.steps.map((_, i) => i));
});
test('The action world introduces collection, jumping, combat and locked doors without duplicate routes', () => {
  const actions = LEVELS.filter(l => l.grade === 9);
  assert.equal(actions.length, 30);
  assert.ok(actions.every(l => l.kind === 'actions'));
  assert.ok(actions.slice(0, 10).every(l => l.allowed.includes('pick') && l.boards[0].items.length));
  assert.ok(actions.slice(10, 20).every(l => l.solution.some(b => b.type === 'jump')));
  assert.ok(actions.slice(20, 25).every(l => l.boards[0].enemies.length && l.solution.some(b => b.type === 'attack')));
  assert.ok(actions.slice(25, 30).every(l => l.allowed.includes('open') && l.boards[0].doors.length));
  const routeSignature = level => level.boards[0].cells.map(p => `${p.x},${p.y}`).join('|');
  assert.equal(new Set(actions.map(routeSignature)).size, actions.length);
  for (const level of actions) assert.equal(evaluateAll(level, withIds(level.solution), withIds(level.definition)).success, true, level.id);
});
test('The button world progresses from activation to loops and then two separate switches', () => {
  const levels = LEVELS.filter(l => l.grade === 10);
  assert.equal(levels.length, 30);
  assert.equal(levels[0].kind, 'actions');
  assert.ok(levels[0].allowed.includes('press') && levels[0].required.includes('press'));
  assert.ok(levels.slice(0, 20).every(l => !l.allowed.includes('if') && !l.allowed.includes('call')));
  assert.ok(levels[10].required.includes('repeat'));
  assert.ok(levels[20].required.includes('repeat'));
  assert.ok(WORLDS[9].trails[0].focus.includes('Ações'));
  assert.ok(WORLDS[9].trails[2].focus.toLowerCase().includes('duas ativações'));
});
test('The surprise world progresses from dynamic conditions to decisions inside loops', () => {
  const levels = LEVELS.filter(l => l.grade === 11);
  assert.equal(levels.length, 20);
  assert.ok(levels.slice(0, 10).every(l => l.kind === 'adapt' && l.required.includes('if')));
  assert.ok(levels.slice(10, 20).every(l => l.required.includes('if') && l.required.includes('repeat')));
  assert.ok(WORLDS[10].trails[0].focus.includes('Se/senão'));
  assert.ok(WORLDS[10].trails[1].focus.includes('repetir'));
});
test('Switch actions open the bridge and surprise events change routes during execution', () => {
  const switchLevel = getLevel('10-11');
  const switchRun = simulate(switchLevel, withIds(switchLevel.solution));
  assert.equal(switchRun.success, true);
  assert.equal(switchRun.activatedSwitches.length, 1);
  const surpriseLevel = getLevel('11-11');
  const runs = evaluateAll(surpriseLevel, withIds(surpriseLevel.solution)).results;
  assert.ok(runs.every(run => run.success));
  assert.ok(runs.every(run => run.timeline.some(frame => frame.kind === 'surprise')));
  assert.notDeepEqual(runs[0].blockedCells, runs[1].blockedCells);
});
test('Actions require the right target, and a locked door requires its key', () => {
  assert.match(simulate(getLevel('9-11'), [actionBlock('jump', 'U')]).failure, /pular um buraco/);
  const lockedDoor = getLevel('9-26');
  const withoutKey = lockedDoor.solution.filter(block => block.type !== 'pick');
  assert.match(simulate(lockedDoor, withIds(withoutKey)).failure, /pegue a chave/i);
  const withoutAttack = getLevel('9-21').solution.filter(block => block.type !== 'attack');
  assert.match(simulate(getLevel('9-21'), withIds(withoutAttack)).failure, /caminho nessa direção/);
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
  assert.ok(getLevel('3-1').allowed.includes('repeat'));
  assert.ok(getLevel('4-1').allowed.includes('if'));
  assert.ok(getLevel('5-1').allowed.includes('call'));
  for (let difficulty=1; difficulty<=5; difficulty++) {
    const missions=LEVELS.filter(l=>l.grade===difficulty);
    for(let trail=1; trail<=2; trail++) assert.equal(missions.filter(l=>l.trail===trail).length,10);
    assert.ok(new Set(missions.map(l=>l.kind)).size>=2);
  }
});
test('Optimization budgets are enforced even when the path is solved', () => {
  const l = getLevel('3-11');
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
  assert.ok(getLevel('7-1').allowed.includes('repeat') && getLevel('7-1').required.includes('repeat'));
  assert.ok(getLevel('5-11').allowed.includes('call') && getLevel('5-11').required.includes('call'));
  assert.equal(getLevel('7-21'), undefined);
});
test('Debugging starters contain an observable problem and all prescribed blocks are available', () => {
  for (const l of LEVELS) {
    if (l.kind==='sequence') continue;
    if (l.kind==='debug') assert.equal(evaluateAll(l,l.starter||[],l.starterDefinition||[]).success,false,l.id);
    const collect = bs=>bs.flatMap(b=>[b.type,...collect(b.body||[]),...collect(b.elseBody||[])]);
    assert.ok([...collect(l.solution),...collect(l.definition)].every(t=>l.allowed.includes(t)),l.id);
  }
});

test('Display order is pedagogical while internal IDs stay stable', () => {
  assert.deepEqual(DISPLAY_WORLDS.map(world => world.id), [1, 8, 2, 3, 4, 5, 6, 7, 9, 10, 11]);
  assert.deepEqual(DISPLAY_WORLDS.map(world => world.displayNumber), Array.from({ length: 11 }, (_, i) => i + 1));
  assert.equal(nextLevel(getLevel('1-20')).id, '8-1');
  assert.equal(nextLevel(getLevel('8-10')).id, '2-1');
  assert.equal(nextLevel(getLevel('10-30')).id, '11-1');
  assert.equal(nextLevel(getLevel('11-20')), null);
});
