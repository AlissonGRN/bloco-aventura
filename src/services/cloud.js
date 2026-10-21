import { createClient } from '@supabase/supabase-js';
import { validateSave } from '../data/classroom.js';
import { classesForRoom } from '../data/classrooms.js';
const url = import.meta.env?.VITE_SUPABASE_URL;
const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
export const CLOUD_ENABLED = Boolean(url && key);
// Separate identities: a teacher login must never replace the device's student session.
export const studentClient = CLOUD_ENABLED ? createClient(url, key, { auth: { storageKey: 'bloco.cloud.student', detectSessionInUrl: false } }) : null;
export const teacherClient = CLOUD_ENABLED ? createClient(url, key, { auth: { storageKey: 'bloco.cloud.teacher', persistSession: false, detectSessionInUrl: false } }) : null;
function unwrap(result) { if (result.error) throw result.error; return result.data; }
let identityTask;
export async function studentIdentity() {
  if (identityTask) return identityTask;
  identityTask = authenticateStudent();
  try { return await identityTask; } finally { identityTask = null; }
}
async function authenticateStudent() {
  const session = unwrap(await studentClient.auth.getSession()).session;
  if (session) return session.user;
  return unwrap(await studentClient.auth.signInAnonymously()).user;
}
export async function joinRoom(code) {
  await studentIdentity();
  return unwrap(await studentClient.rpc('join_bloco_classroom', { room_code: code.trim().toUpperCase() }));
}
export async function joinTeam(code) {
  await studentIdentity();
  return unwrap(await studentClient.rpc('claim_bloco_team', { team_code: code.trim().toUpperCase() }));
}
const classFromRow = c => ({ id: c.id, name: c.name, grade: c.grade, section: c.section, archived: !c.active, classroomId: c.classroom_id });
export function teamFromRow(t, stickers = []) {
  return { id: t.id, name: t.name, members: t.members, avatar: t.avatar, classId: t.class_id, cloudOwner: t.owner_id, progress: t.progress || {}, attempts: t.attempts || {}, sessions: t.sessions || [], stickers: stickers.filter(s => s.team_id === t.id).map(s => ({ id: s.id, type: s.type, note: s.note, awardedAt: s.created_at })), bonusSkins: t.bonus_skins || [], currentSession: null, lastLevel: t.last_level, updatedAt: t.updated_at };
}
export async function studentSnapshot() {
  const user = await studentIdentity();
  const [classes, teams, stickers] = await Promise.all([
    studentClient.from('class_groups').select('*').order('name'),
    studentClient.from('bloco_teams').select('*'),
    studentClient.from('team_stickers').select('*'),
  ]);
  const awards = unwrap(stickers);
  return { user, ...validateSave({ version: 2, classes: unwrap(classes).map(classFromRow), teams: unwrap(teams).map(t => ({ ...teamFromRow(t, awards), sharedAccess: t.owner_id !== user.id })) }) };
}
export async function subscribeToTeamStickers(teamId, onSticker) {
  if (!CLOUD_ENABLED || !teamId || typeof onSticker !== 'function') return () => {};
  await studentIdentity();
  const channel = studentClient.channel(`stickers:${teamId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_stickers', filter: `team_id=eq.${teamId}` }, ({ new: row }) => {
      if (row?.id && row.type) onSticker({ id: row.id, type: row.type, note: row.note || '', awardedAt: row.created_at || new Date().toISOString() });
    })
    .subscribe();
  return () => { void studentClient.removeChannel(channel); };
}
export async function requestTeacherHelp(teamId, classroomId) {
  await studentIdentity();
  const result = await studentClient.from('teacher_help_requests').insert({ team_id: teamId, classroom_id: classroomId }).select().single();
  if (result.error?.code === '23505') {
    return unwrap(await studentClient.from('teacher_help_requests').select('*').eq('team_id', teamId).is('resolved_at', null).single());
  }
  return unwrap(result);
}
export async function subscribeToTeamHelp(teamId, onStatus) {
  if (!CLOUD_ENABLED || !teamId || typeof onStatus !== 'function') return () => {};
  await studentIdentity();
  let active = true;
  const channel = studentClient.channel(`team-help:${teamId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_help_requests', filter: `team_id=eq.${teamId}` }, payload => {
      const row = payload.new || payload.old;
      if (row?.id) onStatus(payload.eventType !== 'DELETE' && !row.resolved_at);
    })
    .subscribe(status => {
      if (status !== 'SUBSCRIBED') return;
      void studentClient.from('teacher_help_requests').select('id').eq('team_id', teamId).is('resolved_at', null).maybeSingle()
        .then(result => { if (active && !result.error) onStatus(!!result.data); });
    });
  return () => { active = false; void studentClient.removeChannel(channel); };
}
export async function deleteStudentTeam(teamId) { if (!CLOUD_ENABLED || !teamId) return; unwrap(await studentClient.rpc('delete_bloco_team_for_owner', { target_team_id: teamId })); }
export async function saveStudentTeams(teams, classes) {
  const user = await studentIdentity();
  // Teacher-granted skins are server-owned. Student sync never writes this field.
  const deletedIds = new Set(unwrap(await studentClient.from('deleted_bloco_teams').select('team_id')).map(row => row.team_id));
  const records = teams.filter(t => !deletedIds.has(t.id) && classes.some(c => c.id === t.classId && c.classroomId) && (!t.cloudOwner || t.cloudOwner === user.id || t.sharedAccess)).map(t => ({ id: t.id, owner_id: t.cloudOwner || user.id, classroom_id: classes.find(c => c.id === t.classId).classroomId, class_id: t.classId, name: t.name, members: t.members, avatar: t.avatar, progress: t.progress, attempts: t.attempts, sessions: t.sessions, last_level: t.lastLevel }));
  const owned = records.filter(t => t.owner_id === user.id);
  const shared = records.filter(t => t.owner_id !== user.id);
  if (owned.length) {
    // A PostgREST upsert also evaluates UPDATE RLS while creating a new row.
    // That policy looks up the current owner, so first-time team creation is denied.
    // Split inserts and updates, and never send identity/classroom fields to UPDATE.
    const existing = new Set(unwrap(await studentClient.from('bloco_teams').select('id').in('id', owned.map(t => t.id))).map(t => t.id));
    const created = owned.filter(t => !existing.has(t.id));
    if (created.length) unwrap(await studentClient.from('bloco_teams').insert(created));
    for (const team of owned.filter(t => existing.has(t.id))) {
      const { id, owner_id, classroom_id, class_id, ...updates } = team;
      unwrap(await studentClient.from('bloco_teams').update(updates).eq('id', id));
    }
  }
  for (const team of shared) {
    const { id, owner_id, classroom_id, class_id, ...updates } = team;
    unwrap(await studentClient.from('bloco_teams').update(updates).eq('id', id).select('id').single());
  }
  return { ownerId: user.id, ids: records.map(t => t.id), owners: Object.fromEntries(records.map(t => [t.id, t.owner_id])) };
}
export async function issueTeamCode(teamId) { return unwrap(await teacherClient.rpc('rotate_bloco_team_code', { team_id: teamId })); }
export async function teacherLogin(email, password) {
  const { user } = unwrap(await teacherClient.auth.signInWithPassword({ email, password }));
  const profile = await teacherClient.from('teacher_profiles').select('id').eq('id', user.id).maybeSingle();
  if (profile.error || !profile.data) { await teacherClient.auth.signOut(); throw new Error('Esta conta não está autorizada como professor.'); }
  return user;
}
export const teacherLogout = () => teacherClient?.auth.signOut();
export async function saveTeacherProposal(classGroupId, title, levelIds) {
  const user = unwrap(await teacherClient.auth.getUser()).user;
  const group = unwrap(await teacherClient.from('class_groups').select('id,classroom_id').eq('id', classGroupId).single());
  const row = { class_group_id: classGroupId, classroom_id: group.classroom_id, title: title.trim().slice(0, 100), level_ids: [...new Set(levelIds)].slice(0, 40), updated_at: new Date().toISOString(), updated_by: user.id };
  return unwrap(await teacherClient.from('classroom_proposals').upsert(row, { onConflict: 'class_group_id' }).select().single());
}
export async function removeTeacherProposal(classGroupId) { unwrap(await teacherClient.from('classroom_proposals').delete().eq('class_group_id', classGroupId)); }
export async function fetchClassProposal(classGroupId) {
  if (!classGroupId) return null;
  if (!CLOUD_ENABLED) { try { return JSON.parse(localStorage.getItem('bloco.proposal.' + classGroupId) || 'null'); } catch { return null; } }
  await studentIdentity();
  return unwrap(await studentClient.from('classroom_proposals').select('class_group_id,title,level_ids,updated_at').eq('class_group_id', classGroupId).maybeSingle());
}
export async function teacherSnapshot() {
  const user = unwrap(await teacherClient.auth.getUser()).user;
  let rooms = unwrap(await teacherClient.from('classrooms').select('*').eq('teacher_id', user.id));
  if (!rooms.length) rooms = unwrap(await teacherClient.from('classrooms').insert({ teacher_id: user.id, name: 'Minha sala' }).select());
  const expected = classesForRoom(rooms[0].id);
  const current = unwrap(await teacherClient.from('class_groups').select('id').eq('classroom_id', rooms[0].id));
  const currentIds = new Set(current.map(c => c.id));
  const missing = expected.filter(c => !currentIds.has(c.id)).map(c => ({ id: c.id, classroom_id: rooms[0].id, name: c.name, grade: c.grade, section: c.section, active: true }));
  if (missing.length) unwrap(await teacherClient.from('class_groups').insert(missing));
  const [classes, teams, stickers, helpRequests, proposals, deletedTeams] = await Promise.all([teacherClient.from('class_groups').select('*').eq('classroom_id', rooms[0].id).order('grade').order('section'), teacherClient.from('bloco_teams').select('*').eq('classroom_id', rooms[0].id).order('name'), teacherClient.from('team_stickers').select('*'), teacherClient.from('teacher_help_requests').select('*').eq('classroom_id', rooms[0].id).is('resolved_at', null).order('created_at'), teacherClient.from('classroom_proposals').select('*').eq('classroom_id', rooms[0].id), teacherClient.from('deleted_bloco_teams').select('team_id')]);
  const awards = unwrap(stickers);
  return { room: rooms[0], helpRequests: unwrap(helpRequests), proposals: unwrap(proposals), ...validateSave({ version: 2, classes: unwrap(classes).map(classFromRow), teams: unwrap(teams).filter(t => !new Set(unwrap(deletedTeams).map(row => row.team_id)).has(t.id)).map(t => teamFromRow(t, awards)) }) };
}
export function subscribeToTeacherHelp(classroomId, onChange) {
  if (!CLOUD_ENABLED || !classroomId || typeof onChange !== 'function') return () => {};
  const channel = teacherClient.channel(`teacher-help:${classroomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_help_requests', filter: `classroom_id=eq.${classroomId}` }, payload => onChange({ eventType: payload.eventType, row: payload.new || payload.old }))
    .subscribe();
  return () => { void teacherClient.removeChannel(channel); };
}
export async function resolveTeacherHelp(id) {
  const rows = unwrap(await teacherClient.from('teacher_help_requests').update({ resolved_at: new Date().toISOString() }).eq('id', id).is('resolved_at', null).select('id'));
  if (!rows?.length) throw new Error('Este pedido já foi atendido ou não está disponível.');
}
export async function updateCloudTeam(teamId, values) {
  const rows = unwrap(await teacherClient
    .from('bloco_teams')
    .update({
      name: values.name.trim().slice(0, 40),
      members: values.members,
      avatar: values.avatar,
      class_id: values.classId,
    })
    .eq('id', teamId)
    .select('id'));

  if (!rows?.length) {
    throw new Error('Nenhuma equipe foi atualizada. Atualize o painel e tente novamente; se persistir, verifique a permissão do professor no Supabase.');
  }
  return rows[0];
}
export async function grantCloudSkin(teamId, skinIndex, currentlyGranted = []) {
  if (!Number.isInteger(skinIndex) || skinIndex < 0 || skinIndex > 20) throw new Error('Skin inválida.');
  const bonusSkins = [...new Set([...currentlyGranted, skinIndex])].sort((a, b) => a - b);
  const rows = unwrap(await teacherClient.from('bloco_teams').update({ bonus_skins: bonusSkins }).eq('id', teamId).select('id'));
  if (!rows?.length) throw new Error('Equipe não encontrada ou sem permissão para liberar esta skin.');
}
export async function cloudAward(teamId, type, note) { return unwrap(await teacherClient.from('team_stickers').insert({ team_id: teamId, type, note }).select()); }
export async function cloudRemoveAward(id) { unwrap(await teacherClient.from('team_stickers').delete().eq('id', id)); }
export async function cloudDeleteTeam(id) {
  unwrap(await teacherClient.from('deleted_bloco_teams').upsert({ team_id: id, deleted_by: (await teacherClient.auth.getUser()).data.user.id }, { onConflict: 'team_id' }));
  const rows = unwrap(await teacherClient.from('bloco_teams').delete().eq('id', id).select('id'));
  if (!rows?.length) throw new Error('Equipe não encontrada ou sem permissão para excluí-la.');
}


export async function sendClassroomNotification(classroomId, targetClassGroupId, title, message, kind = 'standard') {
  if (!CLOUD_ENABLED) throw new Error('As notificações precisam da conexão com o Supabase.');
  const user = unwrap(await teacherClient.auth.getUser()).user;
  return unwrap(await teacherClient.from('classroom_notifications').insert({
    classroom_id: classroomId,
    target_class_group_id: targetClassGroupId || null,
    title: title.trim().slice(0, 100),
    message: message.trim().slice(0, 500),
    kind,
    created_by: user.id,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  }).select().single());
}
export async function fetchStudentNotifications(classGroupId) {
  if (!CLOUD_ENABLED || !classGroupId) return [];
  await studentIdentity();
  const group = unwrap(await studentClient.from('class_groups').select('classroom_id').eq('id', classGroupId).maybeSingle());
  if (!group?.classroom_id) return [];
  const rows = unwrap(await studentClient.from('classroom_notifications').select('*').eq('classroom_id', group.classroom_id).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(20));
  return rows.filter(row => !row.target_class_group_id || row.target_class_group_id === classGroupId);
}
