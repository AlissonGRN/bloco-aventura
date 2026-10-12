import { useState } from 'react';
import { ArrowLeft, ArrowRight, Cable, Check, Cpu, Lightbulb, RotateCcw, Sparkles, Trash2, Zap } from 'lucide-react';
import { WORLDS, getLevel } from '../data/curriculum';
import { Modal, Stars } from './UI';

const edgeKey = ([a,b]) => [a,b].sort().join('::');
const portNames = { GND:'GND', D2:'D2', '5V':'5V', R1A:'Resistor A', R1B:'Resistor B', R2A:'Resistor A', R2B:'Resistor B', 'L1+':'LED +', 'L1−':'LED −', 'L2+':'LED +', 'L2−':'LED −', B1:'Botão · lado 1', B2:'Botão · lado 2' };

export default function CircuitGame({ level, team, onBack, onNext, onWorld, onComplete, onAttempt }) {
  const world = WORLDS[level.grade - 1];
  const [wires, setWires] = useState(() => (level.starter || []).map(edge => [...edge]));
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [win, setWin] = useState(null);
  const [tries, setTries] = useState(0);
  const completed = Boolean(team.progress[level.id]);
  const correct = wires.length === level.connections.length && wires.every(edge => level.connections.some(target => edgeKey(target) === edgeKey(edge)));
  const connect = terminal => {
    if (!selected) { setSelected(terminal); setMessage(''); return; }
    if (selected === terminal) { setSelected(null); return; }
    const edge = [selected, terminal];
    if (wires.some(existing => edgeKey(existing) === edgeKey(edge))) setMessage('Esse fio já está conectado.');
    else setWires(current => [...current, edge]);
    setSelected(null);
  };
  const removeWire = index => setWires(current => current.filter((_, i) => i !== index));
  const check = () => {
    const attempt = tries + 1;
    setTries(attempt);
    onAttempt?.(level.id);
    if (correct) {
      const stars = completed ? team.progress[level.id].stars : attempt === 1 ? 3 : 2;
      onComplete?.(level.id, stars);
      setWin({ stars });
      setMessage('');
    } else {
      setMessage(wires.length < level.connections.length ? 'Ainda falta ligar alguns pontos.' : 'O circuito não fechou do jeito esperado. Confiram os pinos, o resistor e os lados + e − do LED.');
    }
  };
  const reset = () => { setWires((level.starter || []).map(edge => [...edge])); setSelected(null); setMessage(''); setWin(null); setTries(0); };
  const next = () => level.number < 40 ? onNext(getLevel(`${level.grade}-${level.number + 1}`)) : onWorld(level.grade < WORLDS.length ? level.grade + 1 : level.grade);
  const terminalLabel = terminal => portNames[terminal] || terminal;

  return <div className="circuit-game" style={{ '--world':world.color, '--world-soft':world.soft }}>
    <div className="game-breadcrumb"><button className="text-back" onClick={onBack}><ArrowLeft size={18}/><span>{world.short}</span></button><span>Desafio {level.number} de 40</span><span className="game-grade-badge">Nível {level.grade}</span><Stars count={team.progress[level.id]?.stars || 0}/></div>
    <header className="circuit-heading"><div><span className="eyebrow">OFICINA DE ELETRÔNICA · ARDUINO</span><h1>{level.title}</h1><p>{level.instruction}</p></div><div className={`circuit-lamp ${correct?'lit':''}`} aria-label={correct?'LED aceso':'LED apagado'}><span/><strong>{correct?'Circuito fechado':'Monte o circuito'}</strong></div></header>
    <section className="circuit-workspace">
      <div className="circuit-parts-panel"><div className="circuit-panel-title"><Cpu size={20}/><strong>Peças da bancada</strong></div><p className="circuit-select-help">Toquem em dois terminais para colocar um fio entre eles.</p>
        <div className="circuit-parts">{level.parts.map(part => <article className={`circuit-part ${part.name.startsWith('LED')?'led-part':''}`} key={part.name}><strong>{part.name}</strong><small>{part.note}</small><div className="circuit-ports">{part.ports.map(port => <button key={port.id} data-terminal={port.id} aria-label={`${part.name} · ${port.label}`} className={selected===port.id?'selected':''} aria-pressed={selected===port.id} onClick={()=>connect(port.id)}><i/>{port.label}</button>)}</div></article>)}</div>
      </div>
      <aside className="circuit-wires-panel"><div className="circuit-panel-title"><Cable size={19}/><strong>Fios conectados</strong><span>{wires.length}/{level.connections.length}</span></div>{!wires.length && <p className="circuit-empty">Ainda não há fios. Escolham os terminais na bancada.</p>}<ol className="circuit-wires">{wires.map((wire,index)=><li key={`${edgeKey(wire)}-${index}`}><span><i/> {terminalLabel(wire[0])}<ArrowRight size={14}/>{terminalLabel(wire[1])}</span><button className="icon-btn" onClick={()=>removeWire(index)} aria-label={`Remover fio ${terminalLabel(wire[0])} para ${terminalLabel(wire[1])}`}><Trash2 size={16}/></button></li>)}</ol>
        {message&&<p className="circuit-feedback" role="status">{message}</p>}
        <div className="circuit-actions"><button className="btn secondary" onClick={reset}><RotateCcw size={17}/>Recomeçar</button><button className="btn primary" onClick={check}><Check size={18}/>Testar circuito</button></div>
      </aside>
    </section>
    <aside className="circuit-concept"><Zap size={19}/><span><strong>Ideia importante</strong>{level.concept}. {level.hint}</span></aside>
    <p className="sequence-discussion">Conversem: {level.discussion}</p>
    {win&&<Modal title="Circuito funcionando" onClose={()=>setWin(null)} className="win-modal"><div className="celebration-dots"/><div className="circuit-win-lamp"><Lightbulb size={47}/></div><span className="eyebrow">MAIS UMA DESCOBERTA!</span><h2>A luz acendeu!</h2><Stars count={win.stars} size={40}/><p>{win.stars===3?'Um circuito bem pensado: cada fio no lugar certo!':'Vocês testaram as conexões e fizeram o circuito funcionar.'}</p><p className="discussion-prompt">Conversem: {level.discussion}</p><div className="learned-pill"><Sparkles size={16}/>{world.topic}</div><button className="btn primary full" onClick={next}>{level.number<40?'Próximo desafio':level.grade<WORLDS.length?'Explorar o próximo nível':'Voltar à trilha'}<ArrowRight size={19}/></button><button className="text-button" onClick={reset}>Jogar de novo</button></Modal>}
  </div>;
}
