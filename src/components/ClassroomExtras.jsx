import { useEffect, useRef, useState } from 'react';
import { Smile, Meh, Frown, Sparkles, Users, Flame, Lightbulb, Bug, Focus, Heart, Compass, Flag, Check, Cloud, RefreshCw, X, Ear, HandHeart, Hand, Handshake } from 'lucide-react';
import { STICKERS } from '../data/classroom';
import { Modal } from './UI';
const icons = { users: Users, flame: Flame, lightbulb: Lightbulb, sparkles: Sparkles, bug: Bug, focus: Focus, heart: Heart, compass: Compass, smile: Smile, ear: Ear, 'hand-heart': HandHeart, hand: Hand, handshake: Handshake };
export const FEELINGS = [{ id: 'loved', label: 'Foi legal!', Icon: Smile }, { id: 'okay', label: 'Foi mais ou menos', Icon: Meh }, { id: 'hard', label: 'Precisei de ajuda', Icon: Frown }];
export const DIFFICULTIES = [{ id: 'easy', label: 'Fácil', symbol: '●' }, { id: 'right', label: 'Na medida', symbol: '●●' }, { id: 'hard', label: 'Difícil', symbol: '●●●' }];
export const feelingLabel = id => FEELINGS.find(f => f.id === id)?.label || 'Sem resposta';
export const difficultyLabel = id => DIFFICULTIES.find(f => f.id === id)?.label || 'Sem resposta';
export function Sticker({ type, small = false }) {
  const s = STICKERS.find(s => s.id === type);
  if (!s) return null;
  const Icon = icons[s.icon];
  return <span className={`sticker ${small ? 'small' : ''}`} style={{ '--sticker': s.color }} title={s.description}><span className="sticker-seal"><Icon size={small ? 20 : 32}/><Sparkles className="sticker-spark" size={12}/></span><strong>{s.name}</strong></span>;
}
export function StickerNotification({ notice, onDismiss }) {
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => dismiss.current?.(notice.id), 9000);
    return () => clearTimeout(timer);
  }, [notice?.id]);
  if (!notice) return null;
  return <aside className="sticker-notification" role="status" aria-live="polite">
    <Sticker type={notice.type}/>
    <div><strong>{notice.teamName}, vocês ganharam!</strong><p>Seu professor enviou um sticker.{notice.note ? ` ${notice.note}` : ''}</p></div>
    <button className="icon-btn" aria-label="Fechar notificação de sticker" onClick={() => onDismiss?.(notice.id)}><X size={18}/></button>
  </aside>;
}
export function StickerAlbum({ team }) {
  return <section className="sticker-album"><div className="section-heading"><div><span className="eyebrow">CARINHO POR CADA DESCOBERTA</span><h2>Stickers do professor</h2></div><span className="muted">{team.stickers?.length || 0} recebidos</span></div>{team.stickers?.length ? <div className="stickers-grid">{[...team.stickers].reverse().map(s => <article className="sticker-card" key={s.id}><Sticker type={s.type}/>{s.note && <p>{s.note}</p>}<small>{s.awardedAt && new Date(s.awardedAt).toLocaleDateString('pt-BR')}</small></article>)}</div> : <div className="soft-note"><Sparkles size={28}/><p>Seu professor pode reconhecer suas ideias, sua persistência e o cuidado com a equipe. Os stickers vão aparecer aqui!</p></div>}</section>;
}
export function FeedbackModal({ team, onClose, onFinish }) {
  const [feeling, setFeeling] = useState(null), [difficulty, setDifficulty] = useState(null), [note, setNote] = useState('');
  return <Modal title="Como foi a aventura?" onClose={onClose} className="feedback-modal"><span className="eyebrow">UMA PAUSA PARA CONTAR</span><h2>Como foi a aventura?</h2><p>{team.name}, toda opinião ajuda. Vocês podem responder juntos.</p><div className="session-summary"><Flag size={20}/><strong>{team.currentSession?.completed.length || 0}</strong> desafios resolvidos nesta sessão</div><form onSubmit={e => { e.preventDefault(); onFinish({ feeling, difficulty, note }); }}><fieldset><legend>Como vocês se sentiram?</legend><div className="feedback-options">{FEELINGS.map(({ id, label, Icon }) => <button type="button" key={id} className={feeling === id ? 'selected' : ''} aria-pressed={feeling === id} onClick={() => setFeeling(id)}><Icon size={40}/><span>{label}</span></button>)}</div></fieldset><fieldset><legend>Como estavam os desafios?</legend><div className="feedback-options difficulty-options">{DIFFICULTIES.map(({ id, label, symbol }) => <button type="button" key={id} className={difficulty === id ? 'selected' : ''} aria-pressed={difficulty === id} onClick={() => setDifficulty(id)}><strong aria-hidden="true">{symbol}</strong><span>{label}</span></button>)}</div></fieldset><label><span className="field-label">Querem contar mais alguma coisa? <span className="optional">(opcional)</span></span><textarea rows={3} maxLength={300} value={note} onChange={e => setNote(e.target.value)} placeholder="Uma descoberta, uma dúvida, uma ideia…"/></label><button className="btn primary full" type="submit"><Check size={18}/>Salvar e encerrar</button><button className="text-button full" type="button" onClick={() => onFinish({})}>Encerrar sem responder</button></form></Modal>;
}
export function CloudStatus({ classroom, compact = false }) {
  const [code, setCode] = useState(''), [teamCode, setTeamCode] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  if (!classroom.cloudEnabled) return compact ? <span className="sync-label"><span className="status-dot"/>Salvo neste computador</span> : null;
  const labels = { connecting: 'Conectando…', syncing: 'Sincronizando…', synced: 'Sincronizado', offline: 'Aguardando internet', error: 'Sincronização pendente', unjoined: 'Conecte este computador à sua sala' };
  async function join(e) { e.preventDefault(); setBusy(true); setMessage(''); try { await classroom.join(code); setCode(''); setMessage('Computador conectado. Escolha sua turma online ao criar a equipe.'); } catch (err) { setMessage(err.message); } finally { setBusy(false); } }
  async function joinExistingTeam(e) { e.preventDefault(); setBusy(true); setMessage(''); try { await classroom.joinTeam(teamCode); setTeamCode(''); } catch (err) { setMessage(err.message || 'Não foi possível encontrar essa equipe.'); } finally { setBusy(false); } }
  if (compact) return <span className="sync-label" title={classroom.sync.message}><Cloud size={16}/>{classroom.active && !classroom.data.classes.some(c => c.id === classroom.active.classId && c.classroomId) ? 'Equipe salva só neste PC' : labels[classroom.sync.state]}</span>;
  return <section className="cloud-connect"><strong><Cloud size={18}/>{labels[classroom.sync.state]}</strong>{classroom.sync.message && <p role="status">{classroom.sync.message}</p>}<details open={classroom.sync.state === 'unjoined'}><summary>Conectar à sala do professor</summary><form onSubmit={join}><label className="sr-only" htmlFor="room-code">Código da sala</label><input id="room-code" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6))} placeholder="ABCDEF" required minLength={6} maxLength={6} pattern="[A-Z]{6}" autoComplete="off"/><button className="btn secondary small" disabled={busy}>{busy ? 'Conectando…' : 'Conectar'}</button></form><small>Código de 6 letras. O professor encontra o código no painel. Cada computador precisa ser conectado uma vez.</small></details><details><summary>Já têm uma equipe? Usar código dela</summary><form onSubmit={joinExistingTeam}><label className="sr-only" htmlFor="team-access-code">Código da equipe</label><input id="team-access-code" aria-label="Código da equipe" value={teamCode} onChange={e => setTeamCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8))} placeholder="ABCDEFGH" required minLength={8} maxLength={8} pattern="[A-Z]{8}" autoComplete="off"/><button className="btn secondary small" disabled={busy}>{busy ? 'Conectando…' : 'Entrar na equipe'}</button></form><small>Peça ao professor o código de 8 letras da equipe. Ele libera somente o progresso desse grupo.</small></details><button className="text-button" onClick={classroom.syncNow}><RefreshCw size={14}/>Tentar sincronizar</button>{message && <p role="status">{message}</p>}</section>;
}
