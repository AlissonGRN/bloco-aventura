import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLASS_OPTIONS, classesForRoom, visibleClassOptions } from '../src/data/classrooms.js';

test('Class choices include 3rd grade B and show one entry for online classes', () => {
  assert.ok(CLASS_OPTIONS.some(c => c.key === '3-b' && c.name === '3º ano B'));
  const visible = visibleClassOptions([...CLASS_OPTIONS.map(c => ({ ...c, id: `class-${c.key}` })), ...classesForRoom('room-a')]);
  assert.equal(visible.filter(c => c.grade === 3 && c.section === 'B').length, 1);
  assert.equal(visible.find(c => c.grade === 3 && c.section === 'B').classroomId, 'room-a');
  assert.equal(visible.filter(c => c.grade === 2 && c.section === 'A').length, 1);
});

