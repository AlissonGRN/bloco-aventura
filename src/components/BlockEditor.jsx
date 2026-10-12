import { ArrowUp, ArrowDown, Plus, Repeat2, GitFork, Trash2, Undo2, Play, CornerDownRight, PackageOpen, ArrowUpRight, Zap, DoorOpen } from 'lucide-react';
import { directionIcon } from './Art';
import { DIRECTIONS, countBlocks, move, repeat, branch, call, actionBlock } from '../data/curriculum';
import { withIds, editList, patchBlock } from '../game/engine';

export default function BlockEditor({ level, value, onChange, target, setTarget, activeId, running, onUndo, canUndo }) {
  const actionIcons = { pick: PackageOpen, jump: ArrowUpRight, attack: Zap, open: DoorOpen };
  const actionLabels = { pick: 'Pegar', jump: 'Pular', attack: 'Atacar', open: 'Abrir' };
  const firstYearDirections = new Set([...level.solution, ...(level.starter || [])].filter(b => b.type === 'move').map(b => b.direction));
  const specs = ['R', 'U', 'L', 'D'].filter(d => level.grade > 1 || firstYearDirections.has(d)).map(move);
  if (level.allowed.includes('repeat')) specs.push(repeat(2, []));
  if (level.allowed.includes('if')) specs.push(branch('R', [], []));
  if (level.allowed.includes('call')) specs.push(call());
  for (const type of ['pick', 'jump', 'attack', 'open']) if (level.allowed.includes(type)) specs.push(actionBlock(type));
  const total = countBlocks(value.program) + countBlocks(value.definition);
  function updateList(root, path, fn) {
    onChange({ ...value, [root]: editList(value[root], path, fn) });
  }
  function add(spec, dest = target) {
    if (running || total >= level.maxBlocks || (dest.root === 'definition' && spec.type === 'call')) return;
    const block = withIds([spec])[0];
    updateList(dest.root, dest.path, list => [...list, block]);
  }
  function remove(root, path, id) {
    updateList(root, path, list => list.filter(b => b.id !== id));
    setTarget({ root, path });
  }
  function reorder(root, path, index, delta) {
    updateList(root, path, list => {
      const updated = [...list];
      [updated[index], updated[index + delta]] = [updated[index + delta], updated[index]];
      return updated;
    });
  }
  function drop(e, dest) {
    e.preventDefault(); e.stopPropagation();
    try { const raw = e.dataTransfer.getData('application/x-bloco'); if (!raw) return; const index = Number(raw); if (Number.isInteger(index) && specs[index]) { setTarget(dest); add(specs[index], dest); } } catch { /* Ignore unrelated dragged content. */ }
  }
  function blockName(b) { return b.type === 'move' ? DIRECTIONS[b.direction] : b.type === 'repeat' ? 'repetir' : b.type === 'if' ? 'se/senão' : b.type === 'call' ? 'Meu bloco' : actionLabels[b.type] || 'bloco'; }
  function renderList(blocks, root, path = [], depth = 0) {
    const selected = target.root === root && JSON.stringify(target.path) === JSON.stringify(path);
    return <div className={`block-list ${selected ? 'target-selected' : ''} ${depth ? 'nested-list' : ''}`} onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} onDrop={e => drop(e, { root, path })}>
      {blocks.map((b, index) => {
        const Icon = b.type === 'move' ? directionIcon[b.direction] : b.type === 'repeat' ? Repeat2 : b.type === 'if' ? GitFork : actionIcons[b.type];
        return <div key={b.id} className={`code-block ${b.type} direction-${b.direction || ''} ${activeId === b.id ? 'executing' : ''}`}>
          <div className="block-topline"><span className="block-order">{index + 1}</span>{Icon ? <Icon size={level.grade === 1 ? 30 : 20}/> : <b className="function-symbol">F</b>}
            {b.type === 'move' && <span className={level.grade === 1 ? 'sr-only' : 'block-label'}>{DIRECTIONS[b.direction]}</span>}
            {b.type === 'repeat' && <><span className="block-label">Repetir</span><select aria-label="Quantidade de repetições" value={b.times} disabled={running} onChange={e => onChange({ ...value, [root]: patchBlock(value[root], b.id, { times: Number(e.target.value) }) })}>{Array.from({ length: 15 }, (_, i) => <option key={i + 2}>{i + 2}</option>)}</select><span className="block-label">vezes</span></>}
            {b.type === 'if' && <><span className="block-label">Se livre</span><select aria-label="Direção verificada pelo sensor" value={b.direction} disabled={running} onChange={e => onChange({ ...value, [root]: patchBlock(value[root], b.id, { direction: e.target.value }) })}>{Object.entries(DIRECTIONS).map(([d, label]) => <option value={d} key={d}>{label}</option>)}</select></>}
            {b.type === 'call' && <span className="block-label">Meu bloco</span>}
            {actionIcons[b.type] && <><span className="block-label">{actionLabels[b.type]}</span><select aria-label={`Direção da ação ${actionLabels[b.type]}`} value={b.direction} disabled={running} onChange={e => onChange({ ...value, [root]: patchBlock(value[root], b.id, { direction: e.target.value }) })}>{Object.entries(DIRECTIONS).map(([d, label]) => <option value={d} key={d}>{label}</option>)}</select></>}
            <div className="block-tools"><button disabled={running || index === 0} title="Mover para antes" aria-label={`Mover ${blockName(b)} para antes`} onClick={() => reorder(root, path, index, -1)}><ArrowUp size={14}/></button><button disabled={running || index === blocks.length - 1} title="Mover para depois" aria-label={`Mover ${blockName(b)} para depois`} onClick={() => reorder(root, path, index, 1)}><ArrowDown size={14}/></button><button disabled={running} aria-label={`Remover ${blockName(b)}`} title="Remover bloco" onClick={() => remove(root, path, b.id)}><Trash2 size={15}/></button></div>
          </div>
          {b.body && <div className="block-body">{renderList(b.body, root, [...path, b.id, 'body'], depth + 1)}</div>}
          {b.type === 'if' && <><div className="else-label"><CornerDownRight size={14}/>Senão</div><div className="block-body">{renderList(b.elseBody || [], root, [...path, b.id, 'elseBody'], depth + 1)}</div></>}
        </div>;
      })}
      <button className={`add-target ${blocks.length ? 'compact' : ''}`} disabled={running} onClick={() => setTarget({ root, path })} aria-pressed={selected}><Plus size={blocks.length ? 16 : 23}/><span>{selected ? (blocks.length ? 'Adicionar aqui' : 'Escolha ou arraste um bloco') : 'Adicionar aqui'}</span>{selected && !blocks.length && <small>{depth ? 'Dentro deste bloco' : root === 'definition' ? 'Monte sua sequência especial' : 'Seu plano começa com um pequeno passo'}</small>}</button>
    </div>;
  }
  return <div className={`editor ${level.grade === 1 ? 'visual-editor' : ''}`}>
    <div className="palette-header"><h3><span className="step-dot">1</span>Escolha seus blocos</h3><span>Toque ou arraste</span></div>
    <div className="block-palette">{specs.map((spec, i) => {
      const Icon = spec.type === 'move' ? directionIcon[spec.direction] : spec.type === 'repeat' ? Repeat2 : spec.type === 'if' ? GitFork : actionIcons[spec.type];
      const disabled = running || total >= level.maxBlocks || (target.root === 'definition' && spec.type === 'call') || (target.path.length >= 10 && ['repeat', 'if'].includes(spec.type));
      return <button key={i} className={`palette-block ${spec.type} direction-${spec.direction || ''}`} disabled={disabled} draggable={!disabled} onDragStart={e => { e.dataTransfer.setData('application/x-bloco', String(i)); e.dataTransfer.effectAllowed = 'copy'; }} onClick={() => add(spec)} aria-label={`Adicionar ${blockName(spec)}`} title={`Adicionar ${blockName(spec)}`}>{Icon ? <Icon size={level.grade === 1 ? 32 : 23}/> : <b className="function-symbol">F</b>}<span className={level.grade === 1 && spec.type === 'move' ? 'sr-only' : ''}>{spec.type === 'if' ? 'Se / senão' : blockName(spec)}</span>{spec.type === 'move' && <span className="puzzle-tab"/>}</button>;
    })}</div>
    <div className="program-header"><h3><span className="step-dot">2</span>Seu programa</h3><div><span className="block-count">{total}/{level.maxBlocks}</span><button className="icon-btn" aria-label="Desfazer última alteração" title="Desfazer" disabled={!canUndo || running} onClick={onUndo}><Undo2 size={17}/></button><button className="icon-btn" aria-label="Limpar programa e função" title="Limpar" disabled={running || !total} onClick={() => { onChange({ program: [], definition: [] }); setTarget({ root: 'program', path: [] }); }}><Trash2 size={17}/></button></div></div>
    {level.budget && <p className="budget-note">Meta desta missão: até <strong>{level.budget} blocos</strong>, contando os blocos internos e a função.</p>}<div className="program-workspace"><div className="start-block"><Play size={14} fill="currentColor"/>Quando começar</div>{renderList(value.program, 'program')}</div>
    {level.allowed.includes('call') && <div className="function-workspace"><div className="function-title"><b>F</b><strong>Meu bloco</strong><small>Sua sequência reutilizável</small></div>{renderList(value.definition, 'definition')}</div>}
  </div>;
}
