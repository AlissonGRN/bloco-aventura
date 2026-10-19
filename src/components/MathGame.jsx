import { useState } from 'react';
import { ArrowLeft, ArrowRight, Calculator, Check, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import { WORLDS, getLevel } from '../data/curriculum';
import { Modal, Stars } from './UI';
import { Robot } from './Art';

export default function MathGame({ level, team, onBack, onNext, onWorld, onComplete, onAttempt }) {
  const world = WORLDS[level.grade - 1];
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [win, setWin] = useState(null);
  const [tries, setTries] = useState(0);
  const completed = Boolean(team.progress[level.id]);

  function checkAnswer() {
    if (selected === null) {
      setMessage('Escolham uma resposta antes de conferir.');
      return;
    }
    const attempt = tries + 1;
    setTries(attempt);
    onAttempt?.(level.id);
    if (selected === level.answer) {
      const stars = completed ? team.progress[level.id].stars : attempt === 1 ? 3 : 2;
      onComplete?.(level.id, stars);
      setMessage('');
      setWin({ stars });
    } else {
      setMessage('Ainda não. Releiam a situação, confiram a operação e tentem outra vez.');
      setSelected(null);
    }
  }

  function reset() {
    setSelected(null);
    setMessage('');
    setWin(null);
    setTries(0);
  }

  function next() {
    if (level.number < 40) onNext(getLevel(`${level.grade}-${level.number + 1}`));
    else onWorld(level.grade < WORLDS.length ? level.grade + 1 : level.grade);
  }

  return <div className="math-game" style={{ '--world': world.color, '--world-soft': world.soft }}>
    <div className="game-breadcrumb"><button className="text-back" onClick={onBack}><ArrowLeft size={18}/><span>{world.short}</span></button><span>Desafio {level.number} de 40</span><span className="game-grade-badge">Nível {level.grade}</span><Stars count={team.progress[level.id]?.stars || 0}/></div>
    <header className="math-heading"><div><span className="eyebrow">MATEMÁTICA + PENSAMENTO COMPUTACIONAL</span><h1>{level.title}</h1><p>Leiam o desafio, escolham uma resposta e expliquem como chegaram ao resultado.</p></div><div className="math-scene" aria-hidden="true"><Calculator size={43}/></div></header>
    <div className="math-progress"><span>Desafio {level.number} de 40</span><div className="progress-track"><span style={{ width: `${level.number / 40 * 100}%` }}/></div></div>
    <section className="math-card" aria-label="Desafio de matemática">
      <div className="math-card-top"><strong>Qual é o resultado?</strong><span>{level.operation === 'multiplication' ? 'Multiplicação' : 'Adição e subtração'}</span></div>
      <div className="math-equation" aria-label={level.equation}>{level.equation}</div>
      <p className="math-question">{level.prompt}</p>
      <div className="math-choices" role="group" aria-label="Escolha uma resposta">
        {level.choices.map(value => <button key={value} className={`math-choice ${selected === value ? 'selected' : ''}`} aria-pressed={selected === value} onClick={() => { setSelected(value); setMessage(''); }}>{value}</button>)}
      </div>
      {message && <p className={`math-feedback ${selected === null ? 'error' : ''}`} role="status">{message}</p>}
      <div className="sequence-actions"><button className="btn secondary" onClick={reset}><RotateCcw size={17}/>Recomeçar</button><button className="btn primary" onClick={checkAnswer}><Check size={18}/>Conferir resposta</button></div>
    </section>
    <div className="math-plan" aria-label="Etapas do pensamento computacional">
      <div><b>1</b><span><strong>Entender</strong>Identifiquem o que a situação pede.</span></div>
      <div><b>2</b><span><strong>Planejar</strong>{level.strategy}</span></div>
      <div><b>3</b><span><strong>Conferir</strong>Estimem o resultado e vejam se faz sentido.</span></div>
    </div>
    <aside className="math-hint"><Lightbulb size={19}/><span><strong>Dica da equipe</strong>{level.hint}</span></aside>
    <p className="math-discussion">Depois de resolver, conversem: {level.discussion}</p>
    {win && <Modal title="Desafio concluído" onClose={() => setWin(null)} className="win-modal"><div className="celebration-dots"/><Robot happy className="winning-robot"/><span className="eyebrow">MAIS UMA DESCOBERTA!</span><h2>Conta resolvida!</h2><Stars count={win.stars} size={40}/><p>{win.stars === 3 ? 'Vocês escolheram a operação e conferiram o resultado logo na primeira tentativa.' : 'Boa estratégia! Vocês testaram, revisaram a conta e encontraram o resultado.'}</p><p className="discussion-prompt">Conversem: {level.discussion}</p><div className="learned-pill"><Sparkles size={16}/>{world.topic}</div><button className="btn primary full" onClick={next}>{level.number < 40 ? 'Próximo desafio' : level.grade < WORLDS.length ? 'Explorar o próximo nível' : 'Voltar à trilha'}<ArrowRight size={19}/></button><button className="text-button" onClick={reset}>Jogar de novo</button></Modal>}
  </div>;
}
