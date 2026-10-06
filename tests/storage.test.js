import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSave, mergeSave, emptySave } from '../src/data/classroom.js';
import { createLock, verifyPassword, LOCK_KEY } from '../src/services/teacherLock.js';
const original = { id: 'a', name: 'Equipe A', members: ['Ana'], progress: { '1-1': { stars: 3, completedAt:'2026-10-05T10:00:00Z' } } };
test('V1 migration preserves progress and gives existing teams an unassigned class',()=>{
  const data=validateSave({version:1,teams:[original],activeId:'a',unlocked:false});
  assert.equal(data.version,2); assert.equal(data.teams[0].progress['1-1'].stars,3);
  assert.equal(data.teams[0].classId,null); assert.equal(data.activeId,'a');
  assert.deepEqual(data.teams[0].sessions,[]); assert.deepEqual(data.teams[0].stickers,[]);
});
test('the school has exactly the requested class sections',()=>{
  const data=emptySave();
  assert.deepEqual(data.classes.map(c=>`${c.grade}-${c.section}`),['1-A','1-B','1-C','2-A','2-B','3-A','3-C','4-A','4-B','4-C','5-A','5-B','5-C']);
});
test('Backup merge preserves best stars and unions history without duplicating teams',()=>{
  const first=validateSave({version:1,teams:[original]});
  const next=validateSave({version:2,classes:first.classes,teams:[{...original,progress:{'1-1':{stars:2},'1-2':{stars:3}},sessions:[{id:'s1',startedAt:'2026-10-06T10:00:00Z',endedAt:'2026-10-06T10:50:00Z',feeling:'loved',difficulty:'right',played:['1-2'],completed:['1-2'],attempts:2,note:'Gostei!'}],stickers:[{id:'r1',type:'logic',note:'Boa ideia!'}]}]});
  const result=mergeSave(mergeSave(first,next),next);
  assert.equal(result.teams.length,1); assert.equal(result.teams[0].progress['1-1'].stars,3); assert.equal(result.teams[0].progress['1-2'].stars,3);
  assert.equal(result.teams[0].sessions.length,1); assert.equal(result.teams[0].stickers.length,1);
  assert.equal(result.teams[0].sessions[0].note,'Gostei!');
});
test('Teacher password is salted, wrong passwords fail and corrupt locks fail closed',async()=>{
  const data=new Map(); const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  await createLock('Teacher-example-42',storage);
  assert.doesNotMatch(storage.getItem(LOCK_KEY),/Teacher-example-42/);
  assert.equal(await verifyPassword('wrong',storage),false);
  assert.equal(await verifyPassword('Teacher-example-42',storage),true);
  storage.setItem(LOCK_KEY,'broken'); await assert.rejects(verifyPassword('anything',storage));
  assert.throws(()=>validateSave({version:2,teams:[{...original,members:[]}] }));
});
