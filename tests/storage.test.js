import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSave, mergeSave, emptySave, STICKERS, ROBOT_SKINS, unlockedRobotSkins, skinUnlocked } from '../src/data/classroom.js';
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
  assert.deepEqual(data.classes.map(c=>`${c.grade}-${c.section}`),['1-A','1-B','1-C','2-A','2-B','3-A','3-B','3-C','4-A','4-B','4-C','5-A','5-B','5-C']);
});
test('classroom stickers include positive behavior, respect, care, participation and learning attitudes',()=>{
  const ids = new Set(STICKERS.map(s => s.id));
  const additions=['kindness','respect','care','participation','learning-buddies','organization','responsibility','patience','bravery','celebration'];
  for (const id of additions) assert.ok(ids.has(id), `missing ${id}`);
  const data=validateSave({version:2,teams:[{...original,stickers:additions.map((type,i)=>({id:`s${i}`,type}))}]});
  assert.equal(data.teams[0].stickers.length,additions.length);
});
test('Bip skins unlock from completed challenges or teacher stickers and saved teams cannot select locked skins',()=>{
  assert.equal(ROBOT_SKINS.length,21);
  assert.equal(unlockedRobotSkins({}),5);
  assert.equal(unlockedRobotSkins(Object.fromEntries(Array.from({length:15},(_,i)=>[`1-${i+1}`,{stars:2}]))),7);
  const progress=Object.fromEntries(Array.from({length:4},(_,i)=>[`1-${i+1}`,{stars:2}]));
  const team=validateSave({version:2,teams:[{...original,progress,avatar:8}] }).teams[0];
  assert.equal(team.avatar,4,'a locked appearance is clamped to the highest unlocked skin');
  const earned=Array.from({length:25},(_,i)=>({id:`sticker-${i}`,type:'logic'}));
  assert.equal(unlockedRobotSkins({},earned),11,'5 base skins plus 6 sticker rewards are available at 25 stickers');
  assert.equal(skinUnlocked(13,{},earned),true);
  assert.equal(skinUnlocked(19,{},earned),false);
  const awarded=validateSave({version:2,teams:[{...original,stickers:earned,avatar:13}]}).teams[0];
  assert.equal(awarded.avatar,13,'the cloud/local saved team can equip a skin earned from stickers');
  const teacherGift=validateSave({version:2,teams:[{...original,avatar:20,bonusSkins:[20,20,-1,22]}]}).teams[0];
  assert.deepEqual(teacherGift.bonusSkins,[20],'specific teacher unlocks are kept and invalid indices are discarded');
  assert.equal(teacherGift.avatar,20,'a teacher-granted skin can be equipped without earning its sticker threshold');
  assert.equal(unlockedRobotSkins({},[],[20]),6,'a manual unlock counts once even if it is not adjacent to other skins');
  assert.equal(skinUnlocked(20,{},[],[20]),true);
  const locked=validateSave({version:2,teams:[{...original,stickers:earned.slice(0,2),avatar:13}]}).teams[0];
  assert.equal(locked.avatar,4,'skin unlocked by stickers cannot be selected early');
});
test('Backup merge preserves best stars and unions history without duplicating teams',()=>{
  const first=validateSave({version:1,teams:[original]});
  const next=validateSave({version:2,classes:first.classes,teams:[{...original,progress:{'1-1':{stars:2},'1-2':{stars:3}},sessions:[{id:'s1',startedAt:'2026-10-06T10:00:00Z',endedAt:'2026-10-06T10:50:00Z',feeling:'loved',difficulty:'right',played:['1-2'],completed:['1-2'],attempts:2,note:'Gostei!'}],stickers:[{id:'r1',type:'logic',note:'Boa ideia!'}]}]});
  const result=mergeSave(mergeSave(first,next),next);
  assert.equal(result.teams.length,1); assert.equal(result.teams[0].progress['1-1'].stars,3); assert.equal(result.teams[0].progress['1-2'].stars,3);
  assert.equal(result.teams[0].sessions.length,1); assert.equal(result.teams[0].stickers.length,1);
  const granted=mergeSave(validateSave({version:2,teams:[{...original,bonusSkins:[19]}]}),validateSave({version:2,teams:[{...original,bonusSkins:[20]}]}));
  assert.deepEqual(granted.teams[0].bonusSkins,[19,20],'merged team backups preserve manually granted skins');
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


test('retired challenge progress and previously earned skins survive curriculum pruning', () => {
  const legacyProgress = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [
    `12-${index + 1}`,
    { stars: 3, completedAt: '2026-10-05T10:00:00Z' },
  ]));
  const save = validateSave({
    version: 2,
    teams: [{
      ...original,
      progress: legacyProgress,
      attempts: { '7-3': { count: 4, lastAt: '2026-10-05T10:00:00Z' } },
      lastLevel: '12-5',
      avatar: 5,
      sessions: [{
        id: 'legacy-session', startedAt: '2026-10-05T09:00:00Z',
        endedAt: '2026-10-05T09:50:00Z', played: ['12-1'], completed: ['12-1'],
        attempts: 2, feeling: 'okay', difficulty: 'right',
      }],
    }],
  });
  const team = save.teams[0];
  assert.deepEqual(Object.keys(team.progress).sort(), Object.keys(legacyProgress).sort());
  assert.equal(team.attempts['7-3'].count, 4);
  assert.equal(team.lastLevel, '12-5');
  assert.equal(team.avatar, 5, 'a skin earned before curriculum pruning remains usable');
  assert.deepEqual(team.sessions[0].completed, ['12-1']);
  assert.equal(ROBOT_SKINS[team.avatar].name, 'Cosmos');
});
