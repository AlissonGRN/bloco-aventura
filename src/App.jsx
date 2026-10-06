import { useEffect, useState } from 'react';
import { Compass, Trophy, Users, BookOpen, ChevronDown, ArrowRight, Plus, Check, Sparkles } from 'lucide-react';
import { useClassroom } from './hooks/useClassroom';
import { WORLDS, getLevel } from './data/curriculum';
import { Brand, Modal } from './components/UI';
import { Robot } from './components/Art';
import { Welcome, TeamAvatar, TeamForm, TeamsPage } from './components/Teams';
import { Dashboard, WorldMap, Achievements } from './components/Pages';
import Game from './components/Game';
import TeacherPage from './components/Teacher';
import { FeedbackModal, CloudStatus } from './components/ClassroomExtras';

export default function App() {
  const classroom = useClassroom();
  const [route, setRoute] = useState({ page: 'explore' });
  const [modal, setModal] = useState(null);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [route]);
  function navigate(page) { setRoute({ page }); }
  function openWorld(grade) { setRoute({ page: 'world', grade }); }
  function openLevel(level) { classroom.remember(level); setRoute({ page: 'game', levelId: level.id }); }
  function selectTeam(id) { classroom.select(id); setModal(null); navigate('explore'); }
  function saveTeam(values, id) { classroom.saveTeam(values, id); setModal(null); navigate('explore'); }
  const nav = [{ page: 'explore', label: 'Explorar mundos', icon: Compass }, { page: 'achievements', label: 'Conquistas', icon: Trophy }, { page: 'teams', label: 'Minhas equipes', icon: Users }];
  const isExploring = ['explore', 'world', 'game'].includes(route.page);
  const team = classroom.active;
  if (!team && route.page !== 'teacher') return <><Welcome classroom={classroom}/><button className="welcome-teacher-link" onClick={() => navigate('teacher')}><BookOpen size={15}/>Espaço do professor</button>{classroom.error && <div className="storage-warning" role="alert">{classroom.error}</div>}</>;
  return <div className={`app-shell ${route.page === 'game' ? 'playing' : ''}`}>
    <a href="#main-content" className="skip-link">Ir para o conteúdo</a>
    <aside className="sidebar"><Brand onClick={() => navigate('explore')}/><span className="sidebar-label">SUA JORNADA</span><nav aria-label="Menu principal">{nav.map(item => <button className={`nav-item ${(item.page === 'explore' ? isExploring : route.page === item.page) ? 'active' : ''}`} key={item.page} onClick={() => navigate(item.page)} title={item.label}><item.icon size={21}/><span>{item.label}</span>{item.page === 'explore' && <i/>}</button>)}</nav><div className="sidebar-bip"><Robot happy/><strong>Uma ideia de cada vez.</strong><p>Você tem tudo para<br/>ir muito longe!</p><span>✦</span></div><div className="sidebar-bottom"><button className={`nav-item teacher-nav ${route.page === 'teacher' ? 'active' : ''}`} onClick={() => navigate('teacher')} title="Espaço do professor"><BookOpen size={20}/><span>Espaço do professor</span></button><div className="sidebar-footer"><span className="status-dot"/>Feito para mentes curiosas</div></div></aside>
    <div className="app-main"><header className="topbar"><div className="topbar-context"><span className="mini-logo"><Robot/></span><span>{route.page === 'teacher' ? 'Aprender juntos vai mais longe.' : 'Pensar. Criar. Descobrir.'}</span></div><div className="topbar-actions"><CloudStatus classroom={classroom} compact/>{team && route.page !== 'teacher' && <button className="btn secondary small end-session" onClick={() => { if (route.page === 'game') openWorld(getLevel(route.levelId).grade); setModal({ type: 'feedback' }); }}><Check size={17}/>Encerrar sessão</button>}{team ? <button className="team-switcher" onClick={() => setModal({ type: 'switch' })}><TeamAvatar team={team}/><span><strong>{team.name}</strong><small>Trocar equipe</small></span><ChevronDown size={17}/></button> : <button className="btn primary small" onClick={() => navigate('explore')}>Criar equipe<ArrowRight size={17}/></button>}</div></header>
      <main id="main-content" className="main-content">{classroom.error && <div className="storage-warning inline" role="alert">{classroom.error}</div>}
        {route.page === 'explore' && team && <Dashboard team={team} onWorld={openWorld} onLevel={openLevel}/>}
        {route.page === 'world' && team && <WorldMap world={WORLDS[route.grade - 1]} team={team} key={route.grade} onBack={() => navigate('explore')} onLevel={openLevel}/>}
        {route.page === 'game' && team && <Game key={`${team.id}-${route.levelId}`} level={getLevel(route.levelId)} team={team} onBack={() => openWorld(getLevel(route.levelId).grade)} onNext={openLevel} onWorld={openWorld} onComplete={classroom.complete} onAttempt={classroom.attempt}/>}
        {route.page === 'achievements' && team && <Achievements team={team} onExplore={() => navigate('explore')}/>}
        {route.page === 'teams' && team && <TeamsPage classroom={classroom} onNew={() => setModal({ type: 'new' })} onSelect={selectTeam}/>}
        {route.page === 'teacher' && <TeacherPage classroom={classroom}/>}
      </main>{route.page !== 'game' && <footer className="app-footer"><span>bloco. <span>Pequenos blocos, grandes ideias.</span></span><span>Aprender também é brincar <Sparkles size={14}/></span></footer>}
    </div>
    {modal?.type === 'feedback' && team && <FeedbackModal team={team} onClose={() => setModal(null)} onFinish={feedback => { classroom.endSession(feedback); setModal(null); navigate('explore'); }}/>}
    {modal && modal.type !== 'feedback' && <Modal title={modal.type === 'switch' ? 'Trocar equipe' : 'Criar equipe'} onClose={() => setModal(null)} className="teams-modal"><span className="eyebrow">JUNTOS NA AVENTURA</span><h2>{modal.type === 'switch' ? 'Quem vai explorar agora?' : 'Uma nova equipe, novas ideias.'}</h2>{modal.type === 'switch' ? <><p>Escolha uma equipe para continuar de onde parou.</p><div className="switch-team-list">{classroom.data.teams.map(t => <button className={`team-row ${team?.id === t.id ? 'selected' : ''}`} key={t.id} onClick={() => selectTeam(t.id)}><TeamAvatar team={t}/><span><strong>{t.name}</strong><small>{t.members.join(', ')}</small></span>{team?.id === t.id ? <Check size={20}/> : <ArrowRight size={19}/>}</button>)}</div><button className="btn secondary full" onClick={() => setModal({ type: 'new' })}><Plus size={18}/>Criar nova equipe</button></> : <TeamForm classes={classroom.data.classes} initial={modal.team} onSave={saveTeam} onCancel={() => setModal(null)}/>}</Modal>}

  </div>;
}
