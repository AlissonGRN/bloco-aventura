import { useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Star, Flag, LockKeyhole, Check, Play, Sparkles, Trophy, Users, Lightbulb, Download, Upload, BookOpen, Compass, Hand, Heart, ShieldCheck } from 'lucide-react';
import { WORLDS, LEVELS, levelsFor, getLevel } from '../data/curriculum';
import { Robot, WorldArt, worldIcon } from './Art';
import { StickerAlbum } from './ClassroomExtras';
import { Stars } from './UI';
import { SkinSelector } from './Teams';

export function Dashboard({ team, proposal, onWorld, onLevel }) {
  const done = Object.keys(team.progress).length;
  const stars = Object.values(team.progress).reduce((s, p) => s + p.stars, 0);
  const last = getLevel(team.lastLevel) || LEVELS[0];
  const next = levelsFor(last.grade).find(l => !team.progress[l.id]) || last;
  const proposed = proposal?.level_ids?.map(id => getLevel(id)).filter(Boolean) || [];
  return <>
    {proposed.length > 0 && <section className="student-proposal"><span className="eyebrow">ATIVIDADE PROPOSTA PELO PROFESSOR</span><h2>{proposal.title || 'Atividade proposta para a aula'}</h2><p>Estes são os desafios indicados para a aula. Os outros mundos continuam disponíveis.</p><div className="student-proposal-levels">{proposed.map(level => <button key={level.id} onClick={() => onLevel(level)}><strong>Nível {level.grade} · Desafio {level.number}</strong><span>{level.title}</span><ArrowRight size={17}/></button>)}</div></section>}
    <div className="dashboard-greeting"><span>UM NOVO DIA PARA DESCOBRIR</span><span className="save-status"><i/>Uma descoberta de cada vez</span></div>
    <section className="hero-card"><div className="hero-copy"><span className="hero-pill"><Sparkles size={15}/> OI, {team.name.toLocaleUpperCase('pt-BR')}!</span><h1>Pequenos passos.<br/>Grandes <span>descobertas.</span></h1><p>Monte blocos, explore caminhos e dê vida às suas ideias.<br className="desktop-only"/> O Bip está pronto para a próxima aventura!</p><button className="btn primary" onClick={() => onLevel(done ? next : LEVELS[0])}><Play size={17} fill="currentColor"/>{done ? 'Continuar aventura' : 'Começar aventura'}<ArrowRight size={18}/></button><span className="hero-caption">{done ? `Nível ${next.grade} · Desafio ${next.number}` : 'Comece pelo jardim dos primeiros passos'}</span></div><WorldArt className="hero-art" hero/><span className="art-caption"><span className="status-dot"/> Bip, seu companheiro de descobertas</span></section>
    <section className="journey-stats" aria-label="Seu progresso"><div><span className="stat-icon mint"><Flag size={21}/></span><span><strong>{done}<small> / {LEVELS.length}</small></strong><p>Desafios concluídos</p></span></div><div><span className="stat-icon gold"><Star size={22}/></span><span><strong>{stars}</strong><p>Estrelas conquistadas</p></span></div><div><span className="stat-icon lavender"><Compass size={22}/></span><span><strong>{WORLDS.filter(w => levelsFor(w.id).some(l => team.progress[l.id])).length}<small> / {WORLDS.length}</small></strong><p>Mundos explorados</p></span></div><div className="stats-encouragement"><Lightbulb size={23}/><span>Toda grande ideia começa<br/>com uma pequena tentativa.</span></div></section>
    <div className="section-heading"><div><span className="eyebrow">UM MUNDO DE POSSIBILIDADES</span><h2>Escolha sua próxima aventura</h2></div><span className="muted">{WORLDS.length} níveis livres · {LEVELS.length} desafios</span></div>
    <div className="world-grid">{WORLDS.map(w => <WorldCard key={w.id} world={w} team={team} onClick={() => onWorld(w.id)}/>)}</div>
    <section className="bottom-note"><span className="note-doodle"><Heart size={24}/></span><div><strong>Aqui, tentar de novo faz parte.</strong><p>Sem pressa, sem perder vidas. Cada tentativa ensina uma coisa nova.</p></div><span className="note-stars">✦</span></section>
  </>;
}
function WorldCard({ world: w, team, onClick }) {
  const levels = levelsFor(w.id), done = levels.filter(l => team.progress[l.id]).length;
  const Icon = worldIcon[w.icon];
  return <button className="world-card" onClick={onClick} style={{ '--world': w.color, '--world-soft': w.soft }}><div className="world-art-wrap"><span className="year-badge">Nível {w.id}</span><span className="world-number">0{w.id}</span><WorldArt type={w.type}/></div><div className="world-info"><span className="world-topic"><Icon size={15}/>{w.topic}</span><h3>{w.name}</h3><p>{w.description}</p><div className="world-progress-label"><span>{done ? `${done} de ${levels.length} desafios` : `${levels.length} desafios para descobrir`}</span><ArrowRight size={18}/></div><div className="progress-track"><span style={{ width: `${done / levels.length * 100}%` }}/></div></div></button>;
}

export function WorldMap({ world: w, team, proposal, onBack, onLevel }) {
  const levels = levelsFor(w.id);
  const done = levels.filter(l => team.progress[l.id]).length;
  const next = levels.find(l => !team.progress[l.id]);
  const [trail, setTrail] = useState(next?.trail || 1);
  const Icon = worldIcon[w.icon];
  return <div className="world-page" style={{ '--world': w.color, '--world-soft': w.soft }}><button className="text-back" onClick={onBack}><ArrowLeft size={17}/>Todos os mundos</button><section className="map-hero"><div><span className="hero-pill"><Icon size={16}/>NÍVEL {w.id} · MUNDO 0{w.id}</span><h1>{w.name}</h1><p>{w.description}</p><div className="map-progress"><span>{done} de {levels.length} desafios concluídos</span><div className="progress-track"><span style={{ width: `${done / levels.length * 100}%` }}/></div></div></div><WorldArt type={w.type} hero/></section>
    <div className="map-intro"><div><span className="eyebrow">SUA TRILHA DE DESCOBERTAS</span><h2>{done === 40 ? 'Um mundo inteiro de conquistas!' : 'Vamos dar o próximo passo?'}</h2></div></div>
    <div className="trail-tabs" role="group" aria-label="Trilhas do nível">{w.trails.map(t => <button key={t.number} className={trail === t.number ? "selected" : ""} aria-pressed={trail === t.number} onClick={() => setTrail(t.number)}><b>0{t.number}</b><span>{t.title}<small>{t.focus ? `${t.focus} · ` : ''}Desafios {t.first}–{t.last}</small></span><span>{levels.filter(l => l.trail === t.number && team.progress[l.id]).length}/10</span></button>)}</div><p className="trail-instruction">{w.id >= 10 ? 'Há duas trilhas novas: uma começa com ações e setas; a outra já começa com setas e repetir. O professor pode indicar a mais adequada para a equipe.' : 'Todos os desafios estão abertos. Escolham por onde começar.'}</p>
    <section className="level-map"><div className="map-line"/>{levels.filter(l => l.trail === trail).map((l, i) => {
      const progress = team.progress[l.id];
      const available = true;
      const current = l.id === next?.id;
      const proposed = proposal?.level_ids?.includes(l.id);
      return <button className={`level-node ${progress ? 'complete' : ''} ${current ? 'current' : ''} ${proposed ? 'proposed' : ''} ${!available ? 'locked' : ''}`} key={l.id} disabled={!available} onClick={() => onLevel(l)} aria-label={`Desafio ${l.number}: ${l.title}${available ? '' : '. Complete o desafio anterior para abrir.'}`}><span className="node-top">{proposed ? 'PROPOSTO PARA A AULA' : current ? 'VOCÊ ESTÁ AQUI' : progress ? 'CONCLUÍDO' : 'DESAFIO ' + l.number}</span><span className="node-circle">{!available ? <LockKeyhole size={26}/> : progress ? <Check size={33}/> : current ? <Play size={27} fill="currentColor"/> : l.number}<span className="node-number">{l.number}</span></span><Stars count={progress?.stars || 0}/><strong>{l.title}</strong>{l.starter && <span className="debug-tag">Ache o erro</span>}</button>;
    })}</section>
    <div className="map-tips"><div className="tip-icon"><Lightbulb size={25}/></div><div><strong>{w.id === 1 ? 'Olhe, toque, descubra.' : `Aqui você vai aprender: ${w.topic.toLowerCase()}.`}</strong><p>{w.id === 1 ? 'As setas mostram o caminho. A animação mostra como jogar, sem precisar ler ou ouvir. Você pode pedir ajuda para começar!' : w.skill}</p></div></div>
  </div>;
}

export function Achievements({ team, onExplore, onSkinChange }) {
  const complete = Object.keys(team.progress).length;
  const stars = Object.values(team.progress).reduce((s, p) => s + p.stars, 0);
  const badges = [
    { title: 'Primeiro passo', description: 'Conclua seu primeiro desafio.', won: complete >= 1, icon: Flag, color: '#4c8966' },
    { title: 'Mente curiosa', description: 'Conclua 10 desafios.', won: complete >= 10, icon: Lightbulb, color: '#c69b38' },
    { title: 'Coleção brilhante', description: 'Conquiste 30 estrelas.', won: stars >= 30, icon: Star, color: '#b58535' },
    { title: 'Grande explorador', description: `Conclua os ${LEVELS.length} desafios.`, won: complete === LEVELS.length, icon: Trophy, color: '#9b70ac' },
  ];
  return <><div className="page-heading"><div><span className="eyebrow">CADA DESCOBERTA CONTA</span><h1>Olha só até onde vocês chegaram!</h1><p>As conquistas da equipe {team.name}.</p></div><span className="big-star-count"><Star fill="currentColor" size={24}/>{stars}<small>estrelas</small></span></div><div className="badges-grid">{badges.map(b => <article key={b.title} className={`achievement-badge ${b.won ? 'won' : ''}`}><span style={{ color: b.color }}><b.icon size={34}/></span><h3>{b.title}</h3><p>{b.description}</p><small>{b.won ? '✓ Conquistado!' : 'Uma nova descoberta espera'}</small></article>)}</div><section className="skin-collection"><div className="section-heading"><div><span className="eyebrow">VISUAIS PARA O BIP</span><h2>Conquistem novas skins!</h2></div><Robot skin={team.avatar}/></div><SkinSelector progress={team.progress} stickers={team.stickers} bonusSkins={team.bonusSkins} avatar={team.avatar} onChange={onSkinChange}/></section><StickerAlbum team={team}/><div className="section-heading"><h2>Sua jornada, mundo a mundo</h2></div><div className="progress-list">{WORLDS.map(w => {
    const levels = levelsFor(w.id), done = levels.filter(l => team.progress[l.id]).length, Icon = worldIcon[w.icon];
    return <div key={w.id} className="progress-world" style={{ '--world': w.color }}><span className="progress-world-icon" style={{ background: w.soft }}><Icon size={25}/></span><div><strong>Nível {w.id} · {w.name}</strong><div className="progress-track"><span style={{ width: `${done / levels.length * 100}%` }}/></div></div><span>{done}/{levels.length}</span>{done === levels.length && <Trophy className="gold-text" size={23}/>}</div>;
  })}</div>{!complete && <div className="empty-inline"><Robot/><div><h3>A primeira conquista está logo ali.</h3><p>Escolha um mundo e dê seu primeiro passo com o Bip.</p></div><button className="btn primary" onClick={onExplore}>Explorar<ArrowRight size={18}/></button></div>}</>;
}

