import { useState } from 'react';
import { ArrowRight, Check, Plus, Users, UserRound, ShieldCheck } from 'lucide-react';
import { Brand } from './UI';
import { Robot, WorldArt } from './Art';
import { CloudStatus } from './ClassroomExtras';
import { WORLDS } from '../data/curriculum';

const avatarColors = ['#f2c75c', '#9cbad5', '#b3bd8c', '#c2a6d4', '#e5a18b'];
export function TeamAvatar({ team, size = 'normal' }) {
  return <span className={`team-avatar ${size}`} style={{ background: `${avatarColors[team?.avatar || 0]}35` }}><Robot color={avatarColors[team?.avatar || 0]}/></span>;
}
export function TeamForm({ initial, onSave, onCancel, classes = [] }) {
  const [size, setSize] = useState(initial?.members.length || 1);
  const [names, setNames] = useState(initial ? [...initial.members, '', '', ''].slice(0, 4) : ['', '', '', '']);
  const [name, setName] = useState(initial?.name || '');
  const [avatar, setAvatar] = useState(initial?.avatar || 0);
  const [classId, setClassId] = useState(initial?.classId || '');
  const [error, setError] = useState('');
  function submit(e) {
    e.preventDefault();
    const members = names.slice(0, size).map(n => n.trim());
    if (members.some(n => !n)) { setError('Preencha o primeiro nome de cada explorador.'); return; }
    if (!classId) { setError('Escolha a turma da equipe.'); return; }
    const label = name.trim() || (size === 1 ? members[0] : `Equipe ${members[0]}`);
    onSave({ name: label, members, avatar, classId }, initial?.id);
  }
  return <form onSubmit={submit} className="team-form">
    <label><span className="field-label">Qual é a turma?</span><select value={classId} onChange={e => setClassId(e.target.value)} required aria-label="Turma da equipe"><option value="">Escolha ano e turma</option>{[1, 2, 3, 4, 5].map(grade => { const options = classes.filter(c => c.grade === grade && (!c.archived || c.id === initial?.classId)).sort((a, b) => a.section.localeCompare(b.section)); return options.length ? <optgroup key={grade} label={`${grade}º ano`}>{options.map(c => <option key={c.id} value={c.id}>Turma {c.section}{c.classroomId ? " · online" : ""}</option>)}</optgroup> : null; })}</select></label>
    <label className="field-label">Quantos vão jogar?</label>
    <div className="team-sizes" role="group" aria-label="Quantidade de alunos">{[1, 2, 3, 4].map(n => <button type="button" key={n} className={size === n ? 'selected' : ''} aria-pressed={size === n} onClick={() => setSize(n)}><span className="size-people">{Array.from({ length: n }, (_, i) => <UserRound key={i} size={16}/>)}</span><span>{['Individual', 'Dupla', 'Trio', 'Quarteto'][n - 1]}</span></button>)}</div>
    <div className="name-fields">{Array.from({ length: size }, (_, i) => <label key={i}><span className="field-label">{size === 1 ? 'Como você se chama?' : `Explorador ${i + 1}`}</span><input autoComplete="off" maxLength={40} required value={names[i]} onChange={e => setNames(ns => ns.map((n, j) => j === i ? e.target.value : n))} placeholder="Primeiro nome"/></label>)}</div>
    {size > 1 && <label><span className="field-label">Nome da equipe <span className="optional">(opcional)</span></span><input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="Ex.: Exploradores do futuro"/></label>}
    <div className="avatar-select"><span className="field-label">Escolha seu Bip</span><div>{avatarColors.map((color, i) => <button key={color} type="button" className={avatar === i ? 'selected' : ''} aria-label={`Bip ${['amarelo', 'azul', 'verde', 'lilás', 'coral'][i]}`} aria-pressed={avatar === i} onClick={() => setAvatar(i)}><Robot color={color}/>{avatar === i && <Check size={12}/>}</button>)}</div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions">{onCancel && <button type="button" className="btn secondary" onClick={onCancel}>Voltar</button>}<button type="submit" className="btn primary grow">{initial ? 'Salvar equipe' : 'Vamos explorar'}<ArrowRight size={19}/></button></div>
  </form>;
}

export function Welcome({ classroom }) {
  const [create, setCreate] = useState(classroom.data.teams.length === 0);
  return <div className="welcome-page">
    <header className="welcome-header"><Brand onClick={() => {}}/><span className="welcome-kicker"><span className="status-dot"/> APRENDER É UMA AVENTURA</span></header>
    <main className="welcome-main">
      <section className="welcome-story"><span className="eyebrow"><span/>PEQUENOS BLOCOS. GRANDES IDEIAS.</span><h1>O próximo passo<br/>é uma <span>descoberta.</span></h1><p>Um mundo de desafios para pensar, criar<br className="desktop-only"/> e aprender brincando. Vamos juntos?</p><WorldArt hero className="welcome-art"/><div className="welcome-chips"><span><Check size={16}/> 5 níveis para explorar</span><span><Check size={16}/> No seu ritmo</span><span><Check size={16}/> Em equipe</span></div></section>
      <section className="welcome-card"><span className="little-label">SUA AVENTURA COMEÇA AQUI</span><h2>{create ? 'Quem vai explorar hoje?' : 'Que bom ter vocês de volta!'}</h2><p>{create ? 'Conte para o Bip quem está desse lado.' : 'Escolha sua equipe para continuar a jornada.'}</p>
        {create ? <TeamForm classes={classroom.data.classes} onSave={classroom.saveTeam} onCancel={classroom.data.teams.length ? () => setCreate(false) : null}/> : <><div className="welcome-team-list">{classroom.data.teams.map(t => <button key={t.id} className="team-row" onClick={() => classroom.select(t.id)}><TeamAvatar team={t}/><span><strong>{t.name}</strong><small>{t.members.join(', ')}</small></span><ArrowRight size={19}/></button>)}</div><button className="btn secondary full" onClick={() => setCreate(true)}><Plus size={18}/>Criar outra equipe</button></>}
    <CloudStatus classroom={classroom}/><div className="local-note"><ShieldCheck size={17}/><span>{classroom.cloudEnabled ? 'Progresso sincronizado com o professor nas equipes conectadas.' : 'Nomes e progresso ficam salvos neste navegador.'}</span></div>
      </section>
    </main>
    <footer className="welcome-footer"><span>Cinco mundos. Infinitas ideias.</span><div>{WORLDS.map(w => <span key={w.id} style={{ '--world': w.color }}><i/>Nível {w.id}</span>)}</div><span>Feito para aprender, juntos.</span></footer>
  </div>;
}

export function TeamsPage({ classroom, onNew, onSelect }) {
  return <><div className="page-heading"><div><span className="eyebrow">CADA EQUIPE, UMA HISTÓRIA</span><h1>Quem está na aventura?</h1><p>Um espaço para cada grupo. As descobertas ficam guardadas.</p></div><button className="btn primary" onClick={onNew}><Plus size={19}/>Nova equipe</button></div><div className="teams-grid">{classroom.data.teams.map(t => <article className="team-card" key={t.id}><div className="flex items-center justify-between"><TeamAvatar team={t} size="large"/>{classroom.active?.id === t.id && <span className="pill">Equipe atual</span>}</div><h2>{t.name}</h2><p>{t.members.join(' · ')}</p><span className="class-label">{classroom.data.classes.find(c => c.id === t.classId)?.name || 'Sem turma'}</span><div className="team-card-stats"><span><Users size={17}/>{t.members.length} {t.members.length === 1 ? 'explorador' : 'exploradores'}</span><span>{Object.keys(t.progress).length}/200 desafios</span></div><button className={`btn full ${classroom.active?.id === t.id ? 'secondary' : 'primary'}`} onClick={() => onSelect(t.id)}>{classroom.active?.id === t.id ? 'Continuar explorando' : 'Jogar com esta equipe'}<ArrowRight size={17}/></button></article>)}</div><div className="soft-note"><ShieldCheck size={20}/><p>As equipes deste computador ficam disponíveis aqui. Cada equipe tem seu próprio progresso, e trocar de equipe não apaga nenhuma conquista.</p></div></>;
}
