import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Flag, Lightbulb, Play, Pause, RotateCcw, Footprints, Check, ChevronRight, Rabbit, Turtle, Hand, PackageOpen, KeyRound, Bug, DoorClosed, DoorOpen, ToggleRight } from 'lucide-react';
import { WORLDS, nextLevel, referenceCount } from '../data/curriculum';
import { evaluateAll, withIds } from '../game/engine';
import { Robot, Gem } from './Art';
import { Modal, Stars } from './UI';
import BlockEditor from './BlockEditor';

function Board({ board, frame, grade, skin = 0 }) {
  const walls = new Set(frame.blockedCells ?? (board.walls || []).map(p => `${p.x},${p.y}`));
  const path = new Set(board.cells.filter(p => !walls.has(`${p.x},${p.y}`)).map(p => `${p.x},${p.y}`));
  const crystals = new Set(board.crystals.map(p => `${p.x},${p.y}`));
  const gaps = new Set((board.gaps || []).map(p => `${p.x},${p.y}`));
  const switches = new Map((board.switches || []).filter(item => !(frame.activatedSwitches || []).includes(`${item.x},${item.y}`)).map(item => [`${item.x},${item.y}`, item]));
  const surpriseTiles = new Set((board.surprises || []).map(event => `${event.at.x},${event.at.y}`));
  const items = new Map((board.items || []).filter(item => !(frame.itemsPicked || []).includes(`${item.x},${item.y}`)).map(item => [`${item.x},${item.y}`, item]));
  const enemies = new Set((board.enemies || []).filter(p => !(frame.defeated || []).includes(`${p.x},${p.y}`)).map(p => `${p.x},${p.y}`));
  const doors = new Map((board.doors || []).map(p => [`${p.x},${p.y}`, { ...p, open: (frame.opened || []).includes(`${p.x},${p.y}`) }]));
  const collected = new Set(frame.collected || []);
  return <div className={`board-scene scene-${grade}`}><div className="board-cloud cloud-one"/><div className="board-cloud cloud-two"/><div className="board-ground"><div className="game-board" style={{ '--cols': board.cols, '--rows': board.rows, aspectRatio: `${board.cols} / ${board.rows}` }} role="img" aria-label={`Caminho com ${board.cols} colunas e ${board.rows} linhas. Bip está na coluna ${frame.position.x + 1}, linha ${frame.position.y + 1}. Bandeira na coluna ${board.goal.x + 1}, linha ${board.goal.y + 1}.`}>
    {Array.from({ length: board.rows * board.cols }, (_, i) => {
      const x = i % board.cols, y = Math.floor(i / board.cols), k = `${x},${y}`;
      const isPath = path.has(k), isGoal = x === board.goal.x && y === board.goal.y;
      const item = items.get(k), door = doors.get(k), enemy = enemies.has(k), button = switches.get(k);
      const entity = item ? item.item === 'key' ? <KeyRound className="action-object key-object"/> : <PackageOpen className="action-object item-object"/> : enemy ? <Bug className="action-object enemy-object"/> : door ? door.open ? <DoorOpen className="action-object open-door-object"/> : <DoorClosed className="action-object door-object"/> : button ? <ToggleRight className="action-object switch-object"/> : null;
      return <div className={`board-cell ${isPath ? 'path-cell' : gaps.has(k) ? 'gap-cell' : walls.has(k) ? 'wall-cell' : 'grass-cell'} ${isGoal ? 'goal-cell' : ''}`} key={k}>{isPath && <><span className="tile-top"/>{entity || (isGoal ? <Flag className="goal-flag" fill="currentColor"/> : crystals.has(k) && !collected.has(k) ? <Gem className="board-gem"/> : x === board.start.x && y === board.start.y ? <span className="start-mark"/> : <span className="path-pebble"/>)}</>}{surpriseTiles.has(k) && <span className="surprise-marker" aria-label="Evento surpresa">✦</span>}{gaps.has(k) && <span className="action-gap" aria-label="Buraco no caminho"/>}{walls.has(k) && <span className="maze-wall" aria-hidden="true"/>}{!isPath && !walls.has(k) && !gaps.has(k) && (i * 7 + grade) % 9 === 0 && <span className="grass-tuft">⌁</span>}{!isPath && !walls.has(k) && !gaps.has(k) && (i * 3 + grade) % 19 === 0 && <span className="board-flower">✿</span>}</div>;
    })}
    <div className={`board-robot ${frame.kind === 'blocked' ? 'bump' : ''}`} style={{ left: `${frame.position.x / board.cols * 100}%`, top: `${frame.position.y / board.rows * 100}%`, width: `${100 / board.cols}%`, height: `${100 / board.rows}%` }}><Robot happy={frame.kind === 'win'} skin={skin}/></div>
  </div></div><span className="board-decoration leaf-one">✦</span><span className="board-decoration leaf-two">✦</span></div>;
}

export default function Game({ level, team, onBack, onNext, onWorld, onComplete, onAttempt }) {
  const world = WORLDS[level.grade - 1];
  const followingLevel = nextLevel(level);
const SPEED_PREFERENCE_KEY = 'bloco.game.speed.v1';
  const [history, setHistory] = useState([{ program: withIds(level.starter || []), definition: withIds(level.starterDefinition || []) }]);
  const value = history.at(-1);
  const [target, setTarget] = useState({ root: 'program', path: [] });
  const [scenario, setScenario] = useState(0);
  const [frame, setFrame] = useState({ position: level.boards[0].start, collected: [], itemsPicked: [], defeated: [], opened: [], moves: 0 });
  const [mode, setMode] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [win, setWin] = useState(null);
  const [hint, setHint] = useState(false);
  const [demo, setDemo] = useState(level.id === '1-1' && !team.progress[level.id]);
  const [slow, setSlow] = useState(() => { try { return localStorage.getItem(SPEED_PREFERENCE_KEY) !== 'fast'; } catch { return true; } });
  function toggleSpeed() { setSlow(current => { const next = !current; try { localStorage.setItem(SPEED_PREFERENCE_KEY, next ? 'slow' : 'fast'); } catch { /* Keep the current session preference if storage is unavailable. */ } return next; }); }
  const playback = useRef(null), timer = useRef(null), playbackMode = useRef('idle');
  const board = level.boards[scenario];

  useEffect(() => () => { clearTimeout(timer.current); playbackMode.current = 'idle'; }, []);
  function stop() { clearTimeout(timer.current); playbackMode.current = 'idle'; playback.current = null; setMode('idle'); }
  function reset(index = scenario) { stop(); setScenario(index); setFrame({ position: level.boards[index].start, collected: [], itemsPicked: [], defeated: [], opened: [], moves: 0 }); setFeedback(null); }
  function change(next) { reset(); setHistory(h => [...h.slice(-39), next]); }
  function prepare() {
    onAttempt?.(level);
    const outcome = evaluateAll(level, value.program, value.definition);
    const events = [];
    for (const result of outcome.results) {
      events.push({ kind: 'scene', scenario: result.scenario, position: level.boards[result.scenario].start, collected: [], itemsPicked: [], defeated: [], opened: [], moves: 0 });
      result.timeline.forEach(f => events.push({ ...f, scenario: result.scenario }));
      if (!result.success) break;
    }
    events.push({ kind: 'finish', outcome });
    playback.current = { events, index: 0 };
    setFeedback(null);
    return playback.current;
  }
  function apply(event) {
    if (event.kind === 'finish') {
      const { outcome } = event;
      playbackMode.current = 'done'; setMode('done');
      if (outcome.success) {
        setFrame(f => ({ ...f, kind: 'win', blockId: null }));
        setWin(outcome); onComplete(level, outcome.stars);
      } else {
        const failed = outcome.results.find(r => !r.success);
        setFeedback(failed.failure);
      }
      return false;
    }
    setScenario(event.scenario); setFrame(event);
    return true;
  }
  function tick() {
    const current = playback.current;
    if (!current || playbackMode.current !== 'running') return;
    const event = current.events[current.index++];
    if (!event || !apply(event)) return;
    timer.current = setTimeout(tick, ['move', 'jump', 'pick', 'attack', 'open', 'press', 'surprise', 'scene', 'blocked'].includes(event.kind) ? (slow ? 650 : 260) : (slow ? 240 : 100));
  }
  function run() {
    if (mode === 'running') { clearTimeout(timer.current); playbackMode.current = 'paused'; setMode('paused'); return; }
    if (mode !== 'paused' || !playback.current) { reset(0); prepare(); }
    playbackMode.current = 'running'; setMode('running'); tick();
  }
  function step() {
    clearTimeout(timer.current);
    if (!playback.current || mode === 'done' || mode === 'idle') prepare();
    playbackMode.current = 'paused'; setMode('paused');
    const current = playback.current;
    let event = current.events[current.index++];
    if (event?.kind === 'scene') { apply(event); event = current.events[current.index++]; }
    if (event) apply(event);
  }
  const robotText = feedback || (mode === 'running' ? frame.kind === 'condition' ? (frame.condition ? 'Caminho livre! Vamos pelo “se”.' : 'Não está livre. Vamos pelo “senão”.') : frame.kind === 'surprise' ? frame.surpriseMessage : frame.kind === 'press' ? 'Botão ativado! O cenário mudou.' : frame.kind === 'pick' ? 'Peguei! Um passo de cada vez.' : frame.kind === 'jump' ? 'Saltei o buraco com segurança!' : frame.kind === 'attack' ? 'Caminho livre! Vamos continuar.' : frame.kind === 'open' ? 'A porta abriu! A chave foi útil.' : 'Estou seguindo seu plano…' : mode === 'paused' ? 'Pausa para pensar. Qual será o próximo passo?' : level.kind === 'actions' ? 'Observe o que há no caminho. Qual ação Bip precisa fazer?' : level.kind === 'debug' ? 'Vamos observar e corrigir este programa?' : level.kind === 'optimize' ? 'Como usar menos blocos para chegar ao mesmo lugar?' : 'Primeiro, imagine o caminho. Depois, monte seu plano!');
  return <div className={`game-page grade-${level.grade}`} style={{ '--world': world.color, '--world-soft': world.soft }}>
    <div className="game-breadcrumb"><button className="text-back" onClick={onBack}><ArrowLeft size={18}/><span>{world.short}</span></button><ChevronRight size={14}/><span>Desafio {level.number} de 40</span><span className="game-grade-badge">Nível {world.displayNumber}</span><Stars count={team.progress[level.id]?.stars || 0}/></div>
    <div className="game-title"><div><span className="eyebrow">{level.concept}</span><h1>{level.title}</h1></div><div className="flex items-center gap-2"><button className="btn secondary small" onClick={() => setDemo(true)}><Play size={15}/>Como jogar</button></div></div>
    <div className="mission-bar"><div className="visual-mission"><Robot skin={team.avatar}/><ArrowRight size={21}/>{board.crystals.length > 0 && <><Gem/><ArrowRight size={21}/></>}<Flag size={25} fill="currentColor"/></div><p>{level.instruction}</p><span className="mission-label">SUA MISSÃO</span></div>
    <div className="game-layout"><section className="game-stage"><div className="board-toolbar"><span><span className="status-dot"/>{level.boards.length > 1 ? `O mesmo código, ${level.boards.length} caminhos` : level.kind === 'maze' ? 'Encontre a menor rota' : level.kind === 'actions' ? 'Explore, aja e chegue à bandeira' : 'O caminho do Bip'}</span>{level.kind === 'maze' ? <div className="crystal-counter move-counter">Passos: {frame.moves}<span>/ {board.shortestMoves}</span></div> : level.kind === 'actions' ? <div className="crystal-counter"><PackageOpen/>{(frame.itemsPicked || []).length}<span>/ {board.items.length} itens</span></div> : <div className="crystal-counter"><Gem/>{frame.collected.length}<span>/ {board.crystals.length}</span></div>}</div>
      {level.boards.length > 1 && <div className="scenario-tabs" role="group" aria-label="Cenário do desafio">{level.boards.map((_, i) => <button key={i} className={scenario === i ? 'selected' : ''} disabled={mode === 'running'} onClick={() => reset(i)}>Cenário {i + 1}</button>)}</div>}
      <Board board={board} frame={frame} grade={level.grade} skin={team.avatar}/>
      <div className={`bip-message ${feedback ? 'needs-help' : ''}`} role="status" aria-live="polite"><Robot skin={team.avatar}/><div><span>BIP DIZ</span><p>{robotText}</p></div>{feedback && <RotateCcw size={24} className="visual-retry" aria-hidden="true"/>}</div>
      <div className="board-actions"><button className="help-link" onClick={() => setHint(h => !h)}><Lightbulb size={18}/>{hint ? 'Fechar dica' : 'Uma ajudinha?'}</button><button className="speed-button" onClick={toggleSpeed} disabled={mode === 'running'} aria-label={slow ? 'Mudar para velocidade rápida' : 'Mudar para velocidade lenta'}>{slow ? <Turtle size={19}/> : <Rabbit size={19}/>}<span>{slow ? 'Sem pressa' : 'Mais rápido'}</span></button></div>
      {hint && <div className="hint-box"><p>{level.hint}</p></div>}
      {level.grade === 1 && <div className="visual-guide"><span><b>1</b><Hand size={24}/><ArrowRight size={25}/></span><ChevronRight size={16}/><span><b>2</b><Play size={25} fill="currentColor"/></span><ChevronRight size={16}/><span><b>3</b><Flag size={25}/></span></div>}
    </section><section className="game-code"><BlockEditor level={level} value={value} onChange={change} target={target} setTarget={setTarget} activeId={frame.blockId} running={mode === 'running'} onUndo={() => { reset(); setHistory(h => h.length > 1 ? h.slice(0, -1) : h); setTarget({ root: 'program', path: [] }); }} canUndo={history.length > 1}/><div className="execution-controls"><button className="btn run-button" onClick={run} aria-label={mode === 'running' ? 'Pausar execução' : mode === 'paused' ? 'Continuar execução' : 'Executar programa'}>{mode === 'running' ? <Pause size={23} fill="currentColor"/> : <Play size={23} fill="currentColor"/>}{mode === 'running' ? 'Pausar' : mode === 'paused' ? 'Continuar' : 'Vamos lá!'}</button><button className="btn secondary step-button" onClick={step} disabled={mode === 'running'} aria-label="Executar um passo" title="Um passo de cada vez"><Footprints size={20}/><span>Um passo</span></button><button className="icon-btn reset-button" onClick={() => reset()} aria-label="Voltar Bip ao início" title="Voltar ao início"><RotateCcw size={21}/></button></div><p className="code-footer"><span className="status-dot"/>Você pode tentar quantas vezes quiser.</p></section></div>
    {demo && <Modal title="Como jogar" onClose={() => setDemo(false)} className="demo-modal"><span className="eyebrow">PENSAR · MONTAR · EXPERIMENTAR</span><h2>Vamos aprender com o Bip?</h2><div className="demo-animation"><div className="demo-arrow"><ArrowRight size={33}/></div><Hand className="demo-hand" size={31}/><div className="demo-play"><Play size={25} fill="currentColor"/></div><div className="demo-path"><Robot/><span/><span/><Flag size={28}/></div></div><ol className="demo-steps"><li><b>1</b><span><strong>Escolha uma seta.</strong> Cada seta anda uma casa.</span></li><li><b>2</b><span><strong>Monte a ordem dos blocos.</strong> Use as setinhas pequenas para trocar a posição ou a lixeira para remover.</span></li><li><b>3</b><span><strong>Toque no botão verde.</strong> Observe o resultado e tente outra ideia se precisar.</span></li></ol>{level.allowed.includes('repeat') && <p className="demo-extra">Para colocar comandos dentro de repetir ou se/senão, toque em <strong>Adicionar aqui</strong> dentro do bloco. Depois escolha os comandos na parte de cima.</p>}{level.allowed.includes('call') && <p className="demo-extra">Monte a função na área <strong>Meu bloco</strong>. Adicione <strong>F</strong> ao programa principal para executar essa sequência.</p>}<div className="form-actions"><button className="btn primary" onClick={() => setDemo(false)}>Vamos jogar<Play size={18} fill="currentColor"/></button></div></Modal>}
    {win && <Modal title="Desafio concluído" onClose={() => setWin(null)} className="win-modal"><div className="celebration-dots"/><Robot happy className="winning-robot"/><span className="eyebrow">MAIS UMA DESCOBERTA!</span><h2>Vocês conseguiram!</h2><Stars count={win.stars} size={40}/><p>{win.stars === 3 ? 'Uma ideia brilhante e um plano bem pensado.' : `Caminho resolvido! Experimente usar até ${referenceCount(level)} blocos para conquistar a terceira estrela.`}</p>{level.boards.length > 1 && <div className="success-scenarios"><Check size={17}/>O mesmo programa resolveu os {level.boards.length} cenários!</div>}<p className="discussion-prompt">Conversem: {level.discussion}</p><div className="learned-pill"><Lightbulb size={16}/>{world.topic}</div><button className="btn primary full" onClick={() => followingLevel ? onNext(followingLevel) : onWorld(level.grade)}>{followingLevel ? 'Próximo desafio' : 'Voltar à trilha'}<ArrowRight size={19}/></button><button className="text-button" onClick={() => { setWin(null); reset(); }}>Jogar de novo</button></Modal>}
  </div>;
}
