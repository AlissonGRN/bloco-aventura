import { useState } from 'react';
import { Apple, Armchair, Backpack, Bandage, Bed, Blocks, BookOpen, Bookmark, Brain, Brush, Check, Circle, CircleDot, CircleHelp, CloudSun, Construction, Contact, CookingPot, CupSoda, DoorOpen, Droplets, Ear, Eye, File, Flag, Flame, FlaskConical, FoldHorizontal, FoldVertical, FolderOpen, Footprints, Hand, Heart, House, Layers, Library, Lightbulb, ListChecks, Mail, Map, MessageCircle, NotebookPen, Origami, Package, Paintbrush, Palette, Pencil, Phone, PhoneCall, PhoneOff, Plane, Play, Popcorn, Puzzle, Recycle, RefreshCw, Ruler, Sandwich, Scale, Scissors, Send, Shapes, Shirt, ShoppingBag, Shovel, Sparkles, Sun, Trash2, Users, Utensils, VolumeX, Waves, Wind, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { WORLDS, getLevel } from '../data/curriculum';
import { Modal, Stars } from './UI';
import { Robot } from './Art';

const ICONS = { Apple, Armchair, Backpack, Bandage, Bed, Blocks, BookOpen, Bookmark, Brain, Brush, Check, CircleDot, CircleHelp, CloudSun, Construction, Contact, CookingPot, CupSoda, DoorOpen, Droplets, Ear, Eye, File, Flag, Flame, FlaskConical, FoldHorizontal, FoldVertical, FolderOpen, Footprints, Hand, Heart, House, Layers, Library, Lightbulb, ListChecks, Mail, Map, MessageCircle, NotebookPen, Origami, Package, Paintbrush, Palette, Pencil, Phone, PhoneCall, PhoneOff, Plane, Play, Popcorn, Puzzle, Recycle, RefreshCw, Ruler, Sandwich, Scale, Scissors, Send, Shapes, Shirt, ShoppingBag, Shovel, Sparkles, Sun, Trash2, Users, Utensils, VolumeX, Waves, Wind };
const icon = (name, size = 36) => {
  const Component = ICONS[name] || Circle;
  return <Component size={size} strokeWidth={2.2} aria-hidden="true"/>;
};

export default function SequenceGame({ level, team, onBack, onNext, onWorld, onComplete, onAttempt }) {
  const task = level.steps;
  const world = WORLDS[level.grade - 1];
  const [order, setOrder] = useState(() => task.map((_, i) => i).sort(() => Math.random() - .5));
  const [message, setMessage] = useState('');
  const [win, setWin] = useState(null);
  const [tries, setTries] = useState(0);
  const completed = Boolean(team.progress[level.id]);
  const swap = (index, delta) => {
    setOrder(current => {
      const next = [...current], target = index + delta;
      if (target >= 0 && target < next.length) [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setMessage('');
  };
  const check = () => {
    const attempt = tries + 1;
    setTries(attempt);
    onAttempt?.(level.id);
    if (order.every((step, i) => step === i)) {
      const stars = completed ? team.progress[level.id].stars : attempt === 1 ? 3 : 2;
      onComplete?.(level.id, stars);
      setWin({ stars });
      setMessage('');
    } else {
      setMessage(attempt === 1 ? 'Quase! Observem as pistas e pensem no que precisa acontecer primeiro.' : 'Ainda há etapas fora de ordem. Conversem e tentem outra sequência.');
    }
  };
  const reset = () => { setOrder(task.map((_, i) => i).sort(() => Math.random() - .5)); setMessage(''); setWin(null); setTries(0); };
  const next = () => level.number < 40 ? onNext(getLevel(`${level.grade}-${level.number + 1}`)) : onWorld(level.grade < WORLDS.length ? level.grade + 1 : level.grade);

  return <div className="sequence-game" style={{ '--world': world.color, '--world-soft': world.soft }}>
    <div className="game-breadcrumb"><button className="text-back" onClick={onBack}><ArrowLeft size={18}/><span>{world.short}</span></button><span>Desafio {level.number} de 40</span><span className="game-grade-badge">Nível {level.grade}</span><Stars count={team.progress[level.id]?.stars || 0}/></div>
    <header className="sequence-heading"><div><span className="eyebrow">ALGORITMOS DO COTIDIANO</span><h1>Coloque na ordem</h1><p>{level.instruction}</p></div><div className="sequence-scene" aria-hidden="true">{icon(task[0].icon, 30)}<span>{task[0].title}</span></div></header>
    <section className="sequence-board word-mode" aria-label={`Etapas de ${task[0].title}`}>
      <div className="sequence-board-title"><strong>O que acontece primeiro?</strong><span>{order.length} etapas</span></div>
      <ol className="sequence-cards">{order.map((stepIndex, position) => {
        const [symbol, text] = task[stepIndex];
        return <li className="sequence-card" key={stepIndex}>
          <span className="sequence-position" aria-label={`Posição ${position + 1}`}>{position + 1}</span>
          <span className="sequence-symbol">{icon(symbol, 27)}</span>
          <span className="sequence-step-text">{text}</span>
          <span className="sr-only">{text}</span>
          <div className="sequence-controls"><button className="icon-btn" disabled={position === 0} aria-label={`Mover ${text} para cima`} onClick={() => swap(position, -1)}><ChevronUp size={20}/></button><button className="icon-btn" disabled={position === order.length - 1} aria-label={`Mover ${text} para baixo`} onClick={() => swap(position, 1)}><ChevronDown size={20}/></button></div>
        </li>;
      })}</ol>
      {message && <p className="sequence-feedback" role="status">{message}</p>}
      <div className="sequence-actions"><button className="btn secondary" onClick={reset}><RotateCcw size={17}/>Misturar de novo</button><button className="btn primary" onClick={check}><Check size={18}/>Conferir sequência</button></div>
    </section>
    <aside className="sequence-hint"><Lightbulb size={19}/><span><strong>Dica da equipe</strong>{level.hint}</span></aside>
    <p className="sequence-discussion">Depois de conferir, expliquem por que escolheram essa ordem: {level.discussion}</p>
    {win && <Modal title="Desafio concluído" onClose={() => setWin(null)} className="win-modal"><div className="celebration-dots"/><Robot happy className="winning-robot"/><span className="eyebrow">MAIS UMA DESCOBERTA!</span><h2>Sequência organizada!</h2><Stars count={win.stars} size={40}/><p>{win.stars === 3 ? 'Vocês observaram as pistas e encontraram a ordem logo na primeira tentativa!' : 'Boa colaboração! Vocês conversaram, testaram e chegaram a uma sequência que funciona.'}</p><p className="discussion-prompt">Conversem: {level.discussion}</p><div className="learned-pill"><Sparkles size={16}/>{world.topic}</div><button className="btn primary full" onClick={next}>{level.number < 40 ? 'Próximo desafio' : level.grade < WORLDS.length ? 'Explorar o próximo nível' : 'Voltar à trilha'}<ArrowRight size={19}/></button><button className="text-button" onClick={reset}>Jogar de novo</button></Modal>}
  </div>;
}
