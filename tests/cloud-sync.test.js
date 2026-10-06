import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
const dom = new JSDOM('<div id="root"></div>',{url:'http://localhost'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true});
const {act,createElement}=await import('react');
const {createRoot}=await import('react-dom/client');
const tmp=await mkdtemp(path.join(process.cwd(),'.cloud-test-'));
const state={remote:{user:{id:'device'},classes:[{id:'class-a',name:'Manhã',classroomId:'room-a'}],teams:[]},failure:null,saves:[]};
globalThis.__cloudState=state;
await build({stdin:{contents:`export {useClassroom} from './src/hooks/useClassroom.js'; export {getLevel} from './src/data/curriculum.js';`,resolveDir:process.cwd(),loader:'js'},outfile:path.join(tmp,'hook.mjs'),bundle:true,format:'esm',platform:'node',packages:'external',logLevel:'silent',plugins:[{name:'cloud-adapter',setup(build){build.onResolve({filter:/services\/cloud\.js$/},()=>({path:'cloud-stub',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export const CLOUD_ENABLED=true;
export async function joinRoom(){}
export async function studentSnapshot(){return structuredClone(globalThis.__cloudState.remote);}
export async function saveStudentTeams(teams,classes){const s=globalThis.__cloudState;if(s.failure)throw new Error(s.failure);const valid=teams.filter(t=>classes.some(c=>c.id===t.classId&&c.classroomId));s.saves.push(structuredClone(valid));s.remote.teams=valid.map(t=>({...t,currentSession:null,cloudOwner:'device',stickers:s.remote.teams.find(r=>r.id===t.id)?.stickers||[]}));return{ownerId:'device',ids:valid.map(t=>t.id)};}` }));}}]});
const {useClassroom,getLevel}=await import(pathToFileURL(path.join(tmp,'hook.mjs')));
let hook, root;
function Harness(){hook=useClassroom();return null;}
test('Offline progress and session feedback survive failed sync, then upload and receive teacher rewards',async()=>{
  Object.defineProperty(window.navigator,'onLine',{value:false,configurable:true});
  localStorage.setItem('bloco.classroom.v1',JSON.stringify({version:2,activeId:'team-a',classes:state.remote.classes,teams:[{id:'team-a',name:'Lua',members:['Ana'],classId:'class-a',progress:{},attempts:{},sessions:[],stickers:[]}]}));
  root=createRoot(document.getElementById('root'));
  await act(async()=>root.render(createElement(Harness)));
  await act(async()=>{await hook.syncNow();hook.attempt(getLevel('1-1'));hook.complete(getLevel('1-1'),3);});
  await act(async()=>hook.endSession({feeling:'loved',difficulty:'right',note:'Descobrimos a seta!'}));
  assert.equal(hook.sync.state,'offline'); assert.equal(state.saves.length,0);
  assert.equal(JSON.parse(localStorage.getItem('bloco.classroom.v1')).teams[0].sessions.length,1);
  Object.defineProperty(window.navigator,'onLine',{value:true,configurable:true});state.failure='network unavailable';
  await act(async()=>await hook.syncNow());assert.equal(hook.sync.state,'error');assert.equal(hook.data.teams[0].progress['1-1'].stars,3);
  state.failure=null;await act(async()=>await hook.syncNow());
  assert.equal(hook.sync.state,'synced');assert.equal(state.saves.at(-1)[0].sessions[0].note,'Descobrimos a seta!');
  assert.equal(state.saves.at(-1)[0].attempts['1-1'].count,1);
  state.remote.teams[0].stickers=[{id:'award-a',type:'logic',note:'Boa ideia!',awardedAt:new Date().toISOString()}];
  await act(async()=>{hook.select('team-a');hook.attempt(getLevel('1-2'));});
  const sessionId=hook.active.currentSession.id;
  await act(async()=>await hook.syncNow());
  assert.equal(hook.active.currentSession.id,sessionId,'Polling must preserve the current session');
  assert.equal(hook.active.stickers[0].type,'logic');
  state.remote.teams[0].stickers=[];
  await act(async()=>await hook.syncNow());assert.equal(hook.active.stickers.length,0,'Removed rewards must not return from local merge');
});
after(async()=>{if(root)await act(async()=>root.unmount());dom.window.close();await rm(tmp,{recursive:true,force:true});delete globalThis.__cloudState;});
