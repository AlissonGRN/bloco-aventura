import { LEVELS } from './curriculum.js';
import { localClasses } from './classrooms.js';

export const STORAGE_KEY = 'bloco.classroom.v1'; // Keep the key to migrate existing classrooms.
export const STICKERS = [
  { id: 'teamwork', name: 'Equipe unida', icon: 'users', color: '#458b70', description: 'Todo mundo ajudou a construir a solução.' },
  { id: 'persistence', name: 'Não desistiu!', icon: 'flame', color: '#c67c54', description: 'Tentou, ajustou e continuou aprendendo.' },
  { id: 'logic', name: 'Ideia brilhante', icon: 'lightbulb', color: '#bd953c', description: 'Pensou antes de montar os blocos.' },
  { id: 'creativity', name: 'Mente criativa', icon: 'sparkles', color: '#9b78b4', description: 'Encontrou um jeito diferente de resolver.' },
  { id: 'debugger', name: 'Caça-erros', icon: 'bug', color: '#6589aa', description: 'Observou o problema e corrigiu o programa.' },
  { id: 'focus', name: 'Superatenção', icon: 'focus', color: '#b77684', description: 'Prestou atenção aos detalhes do desafio.' },
  { id: 'helper', name: 'Mão amiga', icon: 'heart', color: '#ca8178', description: 'Ajudou alguém a entender, sem fazer por ele.' },
  { id: 'explorer', name: 'Explorador', icon: 'compass', color: '#80a35b', description: 'Experimentou novos caminhos e novas ideias.' },
  { id: 'kindness', name: 'Bom comportamento', icon: 'smile', color: '#6d9a83', description: 'Agiram com gentileza e ajudaram a manter um bom clima na aula.' },
  { id: 'respect', name: 'Respeito e escuta', icon: 'ear', color: '#6689ae', description: 'Ouviram as ideias dos colegas com atenção e respeito.' },
  { id: 'care', name: 'Guardiões do cuidado', icon: 'hand-heart', color: '#bd817d', description: 'Cuidaram dos materiais e usaram o computador com responsabilidade.' },
  { id: 'participation', name: 'Participação', icon: 'hand', color: '#b18a43', description: 'Participaram da atividade e compartilharam suas ideias.' },
  { id: 'learning-buddies', name: 'Parceiros de aprendizagem', icon: 'handshake', color: '#8a75aa', description: 'Colaboraram e ajudaram todos da equipe a aprender.' },
  { id: 'organization', name: 'Equipe organizada', icon: 'list-checks', color: '#658a9b', description: 'Organizaram as ideias, os blocos e o espaço de trabalho.' },
  { id: 'responsibility', name: 'Equipe responsável', icon: 'shield-check', color: '#6f8d63', description: 'Cumpriram os combinados e cuidaram bem da atividade.' },
  { id: 'patience', name: 'Paciência de mestre', icon: 'hourglass', color: '#a47d52', description: 'Esperaram a vez e deram tempo para todos participarem.' },
  { id: 'bravery', name: 'Coragem para tentar', icon: 'rocket', color: '#b87758', description: 'Tiveram coragem de experimentar, mesmo sem saber o resultado.' },
  { id: 'celebration', name: 'Torcida amiga', icon: 'party-popper', color: '#a16e9b', description: 'Comemoraram as conquistas dos colegas com alegria e respeito.' },
];
export const ROBOT_SKINS = [
  { name: 'Sol', color: '#f2c75c', accent: '#d98a35', material: 'gloss', unlockAt: 0 },
  { name: 'Mar', color: '#9cbad5', accent: '#4387a4', material: 'gloss', unlockAt: 0 },
  { name: 'Folha', color: '#b3bd8c', accent: '#547d4e', material: 'gloss', unlockAt: 0 },
  { name: 'Lilás', color: '#c2a6d4', accent: '#795ba7', material: 'gloss', unlockAt: 0 },
  { name: 'Coral', color: '#e5a18b', accent: '#b75f62', material: 'gloss', unlockAt: 0 },
  { name: 'Cosmos', color: '#8871c8', accent: '#e3c9ff', material: 'cosmos', unlockAt: 5 },
  { name: 'Gelo', color: '#68c6d1', accent: '#e2fcff', material: 'ice', unlockAt: 15 },
  { name: 'Vulcão', color: '#e66f52', accent: '#ffd16d', material: 'lava', unlockAt: 30 },
  { name: 'Ninja', color: '#596b82', accent: '#eb5c65', material: 'ninja', unlockAt: 50 },
  { name: 'Floresta', color: '#5f9c69', accent: '#b6d674', material: 'wood', unlockAt: 80 },
  { name: 'Dourado', color: '#d5a92f', accent: '#fff1a0', material: 'royal', unlockAt: 120 },
  { name: 'Neon', color: '#dc70ad', accent: '#70fff2', material: 'neon', unlockAt: 180 },
  { name: 'Arco-íris', color: '#8875bc', accent: '#f1b5d5', material: 'rainbow', unlockAt: 240 },
  { name: 'Dragão das nuvens', color: '#df705c', accent: '#ffd36a', material: 'dragon', unlockAt: 0, stickerUnlockAt: 3 },
  { name: 'Submarino Coral', color: '#4d9dac', accent: '#f3ca68', material: 'submarine', unlockAt: 0, stickerUnlockAt: 6 },
  { name: 'Nave Estelar', color: '#6473b7', accent: '#a7f3e8', material: 'spaceship', unlockAt: 0, stickerUnlockAt: 10 },
  { name: 'Guardião Cogumelo', color: '#b96954', accent: '#d9e895', material: 'mushroom', unlockAt: 0, stickerUnlockAt: 15 },
  { name: 'Foguete Pinguim', color: '#657f9d', accent: '#f4bd69', material: 'penguin', unlockAt: 0, stickerUnlockAt: 20 },
  { name: 'Caranguejo Inventor', color: '#d97854', accent: '#f1d46f', material: 'crab', unlockAt: 0, stickerUnlockAt: 25 },
  { name: 'Abelha Mensageira', color: '#edbd4d', accent: '#754f3f', material: 'bee', unlockAt: 0, stickerUnlockAt: 30 },
  { name: 'Fada das Engrenagens', color: '#9278bb', accent: '#e9b8d8', material: 'fairy', unlockAt: 0, stickerUnlockAt: 40 },
];
export const unlockedRobotSkins = (progress, stickers = [], bonusSkins = []) => {
  const completed = Object.keys(progress || {}).length;
  const received = Array.isArray(stickers) ? stickers.length : nonNegative(stickers);
  const progressUnlocked = ROBOT_SKINS.filter(skin => !skin.stickerUnlockAt && skin.unlockAt <= completed).length;
  const stickerUnlocked = ROBOT_SKINS.filter(skin => skin.stickerUnlockAt && received >= skin.stickerUnlockAt).length;
  return progressUnlocked + stickerUnlocked + (Array.isArray(bonusSkins) ? bonusSkins.filter(index => Number.isInteger(index) && index >= 0 && index < ROBOT_SKINS.length && !skinUnlocked(index, progress, stickers)).length : 0);
};
export const skinUnlocked = (index, progress = {}, stickers = [], bonusSkins = []) => {
  const skin = ROBOT_SKINS[index];
  if (!skin) return false;
  if (Array.isArray(bonusSkins) && bonusSkins.includes(index)) return true;
  return skin.stickerUnlockAt ? (stickers?.length || 0) >= skin.stickerUnlockAt : Object.keys(progress || {}).length >= skin.unlockAt;
};
export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const h = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export const defaultClasses = localClasses;
export const emptySave = () => ({ version: 2, teams: [], classes: defaultClasses(), activeId: null });
const known = new Set(LEVELS.map(l => l.id));
const cleanIds = value => Array.isArray(value) ? [...new Set(value.filter(id => known.has(id)))] : [];
const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
const nonNegative = value => Math.min(100000, Math.max(0, Math.floor(Number(value) || 0)));
export const newSession = () => ({ id: uid(), startedAt: new Date().toISOString(), played: [], completed: [], attempts: 0 });
function cleanSession(s, finished = true) {
  if (!s || typeof s.id !== 'string' || !date(s.startedAt)) return null;
  return { id: s.id.slice(0, 100), startedAt: date(s.startedAt), ...(finished ? { endedAt: date(s.endedAt) || date(s.startedAt), feeling: ['loved', 'okay', 'hard'].includes(s.feeling) ? s.feeling : null, difficulty: ['easy', 'right', 'hard'].includes(s.difficulty) ? s.difficulty : null, note: typeof s.note === 'string' ? s.note.slice(0, 300) : '' } : {}), played: cleanIds(s.played), completed: cleanIds(s.completed), attempts: nonNegative(s.attempts) };
}
export function validateSave(value) {
  if (!value || ![1, 2].includes(value.version) || !Array.isArray(value.teams)) throw new Error('Este arquivo não é um backup válido do Bloco.');
  if (value.teams.length > 1000) throw new Error('O backup tem mais de 1.000 equipes.');
  const classIds = new Set();
  const classes = (Array.isArray(value.classes) ? value.classes : defaultClasses()).filter(c => c && typeof c.id === 'string' && typeof c.name === 'string' && c.name.trim() && !classIds.has(c.id) && classIds.add(c.id)).map(c => ({ id: c.id.slice(0, 100), name: c.name.trim().slice(0, 40), ...(Number.isInteger(c.grade) ? { grade: c.grade } : {}), ...(typeof c.section === 'string' ? { section: c.section } : {}), archived: c.archived === true, ...(typeof c.classroomId === 'string' ? { classroomId: c.classroomId } : {}) }));
  const seen = new Set();
  const teams = value.teams.map(t => {
    if (!t || typeof t.id !== 'string' || seen.has(t.id) || !Array.isArray(t.members) || t.members.length < 1 || t.members.length > 4 || t.members.some(n => typeof n !== 'string' || !n.trim() || n.length > 40)) throw new Error('Há uma equipe inválida no backup.');
    seen.add(t.id);
    const progress = {}, attempts = {};
    for (const l of LEVELS) {
      const p = t.progress?.[l.id];
      if (p && [2, 3].includes(p.stars)) progress[l.id] = { stars: p.stars, completedAt: date(p.completedAt) };
      const a = t.attempts?.[l.id];
      if (a) attempts[l.id] = { count: nonNegative(a.count), lastAt: date(a.lastAt) };
    }
    const sessions = (Array.isArray(t.sessions) ? t.sessions : []).slice(-100).map(s => cleanSession(s)).filter(Boolean);
    const stickers = (Array.isArray(t.stickers) ? t.stickers : []).filter(s => s && typeof s.id === 'string' && STICKERS.some(b => b.id === s.type)).slice(-100).map(s => ({ id: s.id, type: s.type, awardedAt: date(s.awardedAt), note: typeof s.note === 'string' ? s.note.slice(0, 160) : '' }));
    const bonusSkins = [...new Set((Array.isArray(t.bonusSkins) ? t.bonusSkins : []).filter(index => Number.isInteger(index) && index >= 0 && index < ROBOT_SKINS.length))];
    const requestedAvatar = Math.floor(Number(t.avatar) || 0);
    const fallbackAvatar = ROBOT_SKINS.reduce((last, skin, index) => skinUnlocked(index, progress, stickers, bonusSkins) ? index : last, 0);
    const avatar = skinUnlocked(requestedAvatar, progress, stickers, bonusSkins) ? requestedAvatar : fallbackAvatar;
    return { id: t.id, name: typeof t.name === 'string' && t.name.trim() ? t.name.trim().slice(0, 40) : t.members.join(' e '), members: t.members.map(n => n.trim()), classId: classes.some(c => c.id === t.classId) ? t.classId : null, avatar, progress, attempts, sessions, stickers, bonusSkins, currentSession: cleanSession(t.currentSession, false), lastLevel: known.has(t.lastLevel) ? t.lastLevel : '1-1', updatedAt: date(t.updatedAt), ...(typeof t.cloudOwner === 'string' ? { cloudOwner: t.cloudOwner } : {}), ...(t.sharedAccess === true ? { sharedAccess: true } : {}) };
  });
  return { version: 2, teams, classes, activeId: teams.some(t => t.id === value.activeId) ? value.activeId : null };
}
export function mergeTeams(old, fresh) {
  const progress = { ...old.progress };
  for (const [id, p] of Object.entries(fresh.progress || {})) if (!progress[id] || p.stars > progress[id].stars || (p.stars === progress[id].stars && Date.parse(p.completedAt || 0) > Date.parse(progress[id].completedAt || 0))) progress[id] = p;
  const attempts = { ...old.attempts };
  for (const [id, a] of Object.entries(fresh.attempts || {})) if (!attempts[id] || a.count > attempts[id].count) attempts[id] = a;
  const recent = Date.parse(fresh.updatedAt || 0) > Date.parse(old.updatedAt || 0) ? fresh : old;
  return { ...old, ...recent, progress, attempts, sessions: [...new Map([...(old.sessions || []), ...(fresh.sessions || [])].map(s => [s.id, s])).values()].sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt)).slice(-100), stickers: [...new Map([...(old.stickers || []), ...(fresh.stickers || [])].map(s => [s.id, s])).values()].slice(-100), bonusSkins: [...new Set([...(old.bonusSkins || []), ...(fresh.bonusSkins || [])])] };
}
export function mergeSave(current, incoming) {
  const valid = validateSave(incoming);
  const classes = [...new Map([...current.classes, ...valid.classes].map(c => [c.id, c])).values()];
  const map = new Map(current.teams.map(t => [t.id, t]));
  for (const t of valid.teams) map.set(t.id, map.has(t.id) ? mergeTeams(map.get(t.id), t) : t);
  return { ...current, classes, teams: [...map.values()] };
}

