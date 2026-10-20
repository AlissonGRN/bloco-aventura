import { useCallback, useEffect, useRef, useState } from 'react';
import { nextLevel } from '../data/curriculum.js';
import { STORAGE_KEY, emptySave, validateSave, mergeSave, mergeTeams, uid, newSession, STICKERS } from '../data/classroom.js';
import { CLOUD_ENABLED, joinRoom, joinTeam, studentSnapshot, saveStudentTeams, deleteStudentTeam, subscribeToTeamStickers, requestTeacherHelp, subscribeToTeamHelp } from '../services/cloud.js';
export { STORAGE_KEY, validateSave } from '../data/classroom.js';
const now = () => new Date().toISOString();
const unique = values => [...new Set(values)];
export function useClassroom() {
  const [initial] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return { data: raw ? validateSave(JSON.parse(raw)) : emptySave(), error: null }; }
    catch { return { data: emptySave(), error: 'Não foi possível ler os dados salvos. Importe um backup no espaço do professor.' }; }
  });
  const [data, setData] = useState(initial.data), [error, setError] = useState(initial.error);
  const [sync, setSync] = useState({ state: CLOUD_ENABLED ? 'connecting' : 'local', message: '' });
  const [stickerNotices, setStickerNotices] = useState([]);
  const latest = useRef(data), busy = useRef(false), lastSent = useRef('');
  latest.current = data;
  const activeTeam = data.teams.find(t => t.id === data.activeId) || null;
  const activeSessionId = activeTeam?.currentSession?.id || null;
  useEffect(() => {
    if (initial.error && data === initial.data) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setError(null); }
    catch { setError('O navegador não conseguiu salvar. Exporte um backup antes de fechar.'); }
  }, [data, initial]);
  const fingerprint = JSON.stringify(data.teams.map(({ stickers, currentSession, cloudOwner, updatedAt, ...team }) => team));
  const syncNow = useCallback(async () => {
    if (!CLOUD_ENABLED || busy.current) return;
    if (window.navigator.onLine === false) { setSync({ state: 'offline', message: 'Salvo neste computador. Aguardando internet.' }); return; }
    busy.current = true;
    try {
      setSync({ state: 'syncing', message: '' });
      const current = latest.current;
      const hash = JSON.stringify(current.teams.map(({ stickers, currentSession, cloudOwner, updatedAt, ...team }) => team));
      if (hash !== lastSent.current) {
        const saved = await saveStudentTeams(current.teams, current.classes);
        lastSent.current = hash;
        setData(d => ({ ...d, teams: d.teams.map(t => saved.ids.includes(t.id) ? { ...t, cloudOwner: saved.owners?.[t.id] || saved.ownerId, sharedAccess: !!t.sharedAccess } : t) }));
      }
      const remote = await studentSnapshot();
      setData(d => {
        const remoteByGrade = new Map(remote.classes.map(c => [`${c.grade}-${c.section}`, c]));
        const classMap = new Map(d.classes.filter(c => !c.classroomId).map(c => [c.id, remoteByGrade.get(`${c.grade}-${c.section}`)?.id]).filter(([, id]) => id));
        const classes = [...d.classes.filter(c => !c.classroomId && !remoteByGrade.has(`${c.grade}-${c.section}`)), ...remote.classes];
        const map = new Map(d.teams.map(t => [t.id, { ...t, classId: classMap.get(t.classId) || t.classId }]));
        for (const t of remote.teams) {
          const local = map.get(t.id);
          // Keep the local editing/session state; the server owns rewards.
          map.set(t.id, local ? { ...mergeTeams(local, t), ...local, progress: mergeTeams(local, t).progress, sessions: mergeTeams(local, t).sessions, attempts: mergeTeams(local, t).attempts, stickers: t.stickers, bonusSkins: t.bonusSkins, cloudOwner: t.cloudOwner, sharedAccess: t.sharedAccess } : t);
        }
        return { ...d, classes, teams: [...map.values()] };
      });
      const localOnly = latest.current.teams.filter(t => !remote.classes.some(c => c.id === t.classId)).length;
      setSync({ state: remote.classes.length ? 'synced' : 'unjoined', message: localOnly ? `${localOnly} equipe(s) ainda precisam de uma turma online para sincronizar.` : '' });
    } catch (e) {
      const detail = e.message || 'tente novamente';
      const message = /row-level security policy.*bloco_teams/i.test(detail)
        ? 'O banco recusou a sincronização desta equipe. Confira o código da sala e tente novamente; o progresso continua salvo neste computador.'
        : `Salvo neste computador. Não foi possível sincronizar: ${detail}`;
      setSync({ state: 'error', message });
    }
    finally { busy.current = false; }
  }, []);
  useEffect(() => {
    if (!CLOUD_ENABLED) return;
    const timer = setTimeout(syncNow, 900);
    return () => clearTimeout(timer);
  }, [fingerprint, JSON.stringify(data.classes), syncNow]);
  useEffect(() => {
    if (!CLOUD_ENABLED) return;
    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') void syncNow();
    };
    window.addEventListener('online', syncNow);
    document.addEventListener('visibilitychange', syncWhenVisible);
    return () => {
      window.removeEventListener('online', syncNow);
      document.removeEventListener('visibilitychange', syncWhenVisible);
    };
  }, [syncNow]);
  useEffect(() => {
    if (!CLOUD_ENABLED || !data.activeId || !activeSessionId) return;
    const teamId = data.activeId;
    let cancelled = false, unsubscribe;
    void subscribeToTeamStickers(teamId, sticker => {
      const localTeam = latest.current.teams.find(t => t.id === teamId);
      if (latest.current.activeId !== teamId || !localTeam?.currentSession || localTeam.stickers.some(s => s.id === sticker.id)) return;
      const item = { ...sticker, teamName: localTeam.name };
      setData(current => {
        if (current.activeId !== teamId) return current;
        return { ...current, teams: current.teams.map(t => t.id === teamId && !t.stickers.some(s => s.id === sticker.id) ? { ...t, stickers: [...t.stickers, sticker].slice(-100) } : t) };
      });
      setStickerNotices(current => current.some(n => n.id === sticker.id) ? current : [...current, item].slice(-5));
    }).then(cleanup => { if (cancelled) cleanup(); else unsubscribe = cleanup; }).catch(() => {});
    return () => { cancelled = true; unsubscribe?.(); };
  }, [data.activeId, activeSessionId]);
  function updateActive(fn) { setData(d => ({ ...d, teams: d.teams.map(t => t.id === d.activeId ? { ...fn(t), updatedAt: now() } : t) })); }
  function saveTeam(values, id) {
    setStickerNotices([]);
    const teamId = id || uid();
    setData(d => ({ ...d, activeId: teamId, teams: id ? d.teams.map(t => t.id === id ? { ...t, ...values, updatedAt: now(), currentSession: t.currentSession || newSession() } : t) : [...d.teams, { ...values, id: teamId, progress: {}, attempts: {}, sessions: [], stickers: [], currentSession: newSession(), lastLevel: '1-1', updatedAt: now() }] }));
    return teamId;
  }
  function select(id) { setStickerNotices([]); setData(d => ({ ...d, activeId: id, teams: d.teams.map(t => t.id === id ? { ...t, currentSession: t.currentSession || newSession() } : t) })); }
  function attempt(level) { updateActive(t => {
    const s = t.currentSession || newSession();
    return { ...t, attempts: { ...t.attempts, [level.id]: { count: (t.attempts[level.id]?.count || 0) + 1, lastAt: now() } }, currentSession: { ...s, played: unique([...s.played, level.id]), attempts: s.attempts + 1 } };
  }); }
  function complete(level, stars) { updateActive(t => {
    const s = t.currentSession || newSession();
    return { ...t, lastLevel: nextLevel(level)?.id || level.id, progress: { ...t.progress, [level.id]: { stars: Math.max(t.progress[level.id]?.stars || 0, stars), completedAt: now() } }, currentSession: { ...s, played: unique([...s.played, level.id]), completed: unique([...s.completed, level.id]) } };
  }); }
  function endSession(feedback = {}) {
    setStickerNotices([]);
    setData(d => ({ ...d, activeId: null, teams: d.teams.map(t => t.id === d.activeId ? { ...t, currentSession: null, updatedAt: now(), sessions: [...t.sessions, { ...(t.currentSession || newSession()), endedAt: now(), feeling: feedback.feeling || null, difficulty: feedback.difficulty || null, note: (feedback.note || '').slice(0, 300) }].slice(-100) } : t) }));
  }
  function updateTeam(values, id) {
    setData(d => ({ ...d, teams: d.teams.map(t => t.id === id ? { ...t, ...values, updatedAt: now() } : t) }));
  }
  function deleteTeam(id) {
    const team = latest.current.teams.find(t => t.id === id);
    setData(d => ({ ...d, activeId: d.activeId === id ? null : d.activeId, teams: d.teams.filter(t => t.id !== id) }));
    if (CLOUD_ENABLED && team?.cloudOwner) void deleteStudentTeam(id).catch(error => setSync({ state: 'error', message: `A equipe foi removida deste dispositivo, mas não foi possível excluí-la da nuvem: ${error.message || 'erro de sincronização'}` }));
  }
  function award(teamId, type, note = '') {
    if (!STICKERS.some(s => s.id === type)) return;
    setData(d => ({ ...d, teams: d.teams.map(t => t.id === teamId ? { ...t, stickers: [...t.stickers, { id: uid(), type, note: note.slice(0, 160), awardedAt: now() }].slice(-100) } : t) }));
  }
  const requestHelp = useCallback(async teamId => {
    if (!CLOUD_ENABLED) throw new Error('Este computador ainda não está conectado à sala do professor.');
    const team = latest.current.teams.find(t => t.id === teamId);
    const classroomId = latest.current.classes.find(c => c.id === team?.classId)?.classroomId;
    if (!team || !classroomId) throw new Error('Conecte a equipe à sala do professor antes de pedir ajuda.');
    return requestTeacherHelp(teamId, classroomId);
  }, []);
  const watchHelp = useCallback((teamId, onStatus) => {
    if (!CLOUD_ENABLED) { onStatus('offline'); return () => {}; }
    return subscribeToTeamHelp(teamId, onStatus);
  }, []);
  return { data, active: activeTeam, error, saveTeam, select, complete, attempt, endSession, updateTeam, deleteTeam, award, stickerNotices,
    dismissStickerNotice: id => setStickerNotices(current => current.filter(n => n.id !== id)),
    remember: level => updateActive(t => ({ ...t, lastLevel: level.id })),
    removeAward: (teamId, id) => setData(d => ({ ...d, teams: d.teams.map(t => t.id === teamId ? { ...t, stickers: t.stickers.filter(s => s.id !== id) } : t) })),
    importSave: v => setData(d => mergeSave(d, v)), sync, cloudEnabled: CLOUD_ENABLED, syncNow,
    join: async code => { await joinRoom(code); lastSent.current = ''; await syncNow(); },
    joinTeam: async code => { const id = await joinTeam(code); lastSent.current = ''; await syncNow(); setStickerNotices([]); setData(d => ({ ...d, activeId: id })); return id; },
    requestHelp, watchHelp,
  };
}
