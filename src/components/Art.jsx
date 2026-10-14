import { useId } from 'react';
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Sprout, Compass, Repeat2, GitFork, Rocket, Grid2X2, Blocks, ListOrdered, Hand } from 'lucide-react';
import { ROBOT_SKINS } from '../data/classroom.js';

export const directionIcon = { R: ArrowRight, L: ArrowLeft, U: ArrowUp, D: ArrowDown };
export const worldIcon = { sprout: Sprout, compass: Compass, repeat: Repeat2, split: GitFork, rocket: Rocket, grid: Grid2X2, blocks: Blocks, sequence: ListOrdered, hand: Hand };

export function Robot({ className = '', happy = false, color, skin = 0 }) {
  const skinIndex = Math.max(0, Math.min(ROBOT_SKINS.length - 1, Number(skin) || 0));
  const skinData = ROBOT_SKINS[skinIndex];
  const robotColor = color || skinData.color;
  const accent = skinData.accent || '#50886b';
  const wood = skinData.material === 'wood';
  const metal = ['cosmos', 'ice', 'lava', 'ninja', 'royal', 'neon', 'rainbow', 'submarine', 'spaceship'].includes(skinData.material);
  const uid = useId().replaceAll(':', '');
  const body = `url(#bip-body-${uid})`;
  return <svg viewBox="0 0 120 140" fill="none" className={`bip-robot ${className} bip-skin-${skinIndex}`} aria-hidden="true">
    <defs>
      <linearGradient id={`bip-body-${uid}`} x1="18" y1="25" x2="101" y2="119" gradientUnits="userSpaceOnUse"><stop stopColor={wood ? '#d0a36c' : robotColor}/><stop offset="1" stopColor={wood ? '#815537' : robotColor} stopOpacity={wood ? '.97' : '.82'}/></linearGradient>
      <linearGradient id={`bip-panel-${uid}`} x1="30" y1="35" x2="90" y2="70" gradientUnits="userSpaceOnUse"><stop stopColor="#fffefa"/><stop offset="1" stopColor={wood ? '#f5dfb8' : '#fffaf0'}/></linearGradient>
      <filter id={`bip-glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <ellipse cx="60" cy="130" rx="30" ry="7" fill="#24473c" opacity=".12" />
    <path d="M43 112v13m34-13v13" stroke={metal ? '#344b68' : '#294e43'} strokeWidth="11" strokeLinecap="round" />
    <path d={happy ? 'M26 83 12 66m82 17 14-17' : 'M28 85 17 96m75-11 11 11'} stroke={robotColor} strokeWidth="12" strokeLinecap="round" />
    <rect x="29" y="71" width="62" height="46" rx="16" fill={body} stroke={wood ? '#68462f' : metal ? accent : 'none'} strokeWidth={wood || metal ? '2' : '0'} />
    {wood && <g stroke="#704b31" strokeWidth="2" opacity=".78"><path d="M40 77q8 3 16 0m-13 9q9 3 17 0m14 22q6-3 11 0M48 113q4-5 8 0"/><circle cx="78" cy="79" r="2" fill="#704b31"/></g>}
    <rect x="41" y="85" width="38" height="22" rx="7" fill={wood ? '#f5dfb8' : '#fffaf0'} />
    <path d="m54 96 4 4 8-9" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M60 28V14" stroke={wood ? '#704b31' : '#365e4c'} strokeWidth="5" strokeLinecap="round" />
    <circle cx="60" cy="10" r="7" fill={accent} />
    <rect x="12" y="40" width="12" height="24" rx="6" fill={body} /><rect x="96" y="40" width="12" height="24" rx="6" fill={body} />
    <rect x="20" y="26" width="80" height="53" rx="18" fill={body} stroke={wood ? '#68462f' : metal ? accent : 'none'} strokeWidth={wood || metal ? '2' : '0'} />
    {wood && <g stroke="#704b31" strokeWidth="2" opacity=".82"><path d="M25 41q8-4 16 0m-13 8q6-4 12 0m53-5q-6 5-12 2M31 67q7-4 14 0"/><circle cx="87" cy="66" r="2" fill="#704b31"/></g>}
    {skinData.material === 'gloss' && <path d="M28 39q9-10 25-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".45"/>}
    {skinData.material === 'royal' && <path d="M25 61q35 12 70 0v8q-35 14-70 0z" fill="#4469a0" stroke="#f3d879" strokeWidth="2"/>}
    {skinData.material === 'ninja' && <g><path d="M24 43q36 12 72 0v10q-36 15-72 0z" fill="#263246"/><path d="m82 48 28-8-3 8 4 8-29-5z" fill="#e65c65"/></g>}
    {skinData.material === 'neon' && <g stroke="#70fff2" strokeWidth="3" fill="none" filter={`url(#bip-glow-${uid})`}><rect x="36" y="42" width="14" height="16" rx="5"/><rect x="70" y="42" width="14" height="16" rx="5"/><path d="M51 50h18"/></g>}
    {skinData.material === 'cosmos' && <g fill="#fff0a7" stroke="#8162be" strokeWidth="2"><path d="m86 37 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/><circle cx="34" cy="61" r="2" fill="#fff" stroke="none"/></g>}
    {skinData.material === 'ice' && <g stroke="#46aab8" strokeWidth="2"><path d="m60 39 7 8-7 8-7-8z" fill="#d9fbff"/><path d="m37 63 3-5 3 5m34 0 3-5 3 5" stroke="#8de8ef"/></g>}
    {skinData.material === 'lava' && <g><path d="M24 61q13-9 25 0t25 0 22 0v8q-14 8-25 0t-25 0-22 0z" fill="#ffb347"/><circle cx="39" cy="65" r="3" fill="#fff09d"/><circle cx="78" cy="65" r="3" fill="#fff09d"/></g>}
    {wood && <g><path d="M24 36q7-17 18-14l10 7-6 10-15-2m45-5q10-18 23-9l6 8-7 8-14-6" fill="#527447" stroke="#3f643d" strokeWidth="2"/><path d="m55 29 5-9 5 9" fill="#9ecb67"/><path d="M25 58q7-5 12 0m49 0q7-5 12 0" stroke="#8a5639" strokeWidth="3" strokeLinecap="round"/></g>}
    {skinData.material === 'rainbow' && <g fill="none" strokeLinecap="round"><path d="M22 27a38 26 0 0 1 76 0" stroke="#f27c72" strokeWidth="5"/><path d="M27 26a33 22 0 0 1 66 0" stroke="#f4c94f" strokeWidth="4"/><path d="M32 25a28 18 0 0 1 56 0" stroke="#68c99c" strokeWidth="4"/></g>}
    <rect x="28" y="35" width="64" height="35" rx="12" fill={`url(#bip-panel-${uid})`} stroke={wood ? '#9d7046' : 'none'} strokeWidth="1.5" />
    {happy ? <g stroke="#284c41" strokeWidth="5" strokeLinecap="round"><path d="m39 50 4-4 4 4m26 0 4-4 4 4" /></g> : <g fill="#284c41"><rect x="39" y="44" width="8" height="12" rx="4" /><rect x="73" y="44" width="8" height="12" rx="4" /></g>}
    <path d="M54 57q6 7 12 0" stroke="#284c41" strokeWidth="3" strokeLinecap="round" />
    <circle cx="35" cy="59" r="3" fill="#e49f7b" opacity=".6" /><circle cx="85" cy="59" r="3" fill="#e49f7b" opacity=".6" />
    {skinData.material === 'cosmos' && <g fill="#fff0a7" stroke="#8162be" strokeWidth="2"><path d="m86 27 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/><circle cx="32" cy="66" r="2" fill="#fff" stroke="none"/></g>}
    {skinData.material === 'ice' && <g stroke="#46aab8" strokeWidth="2"><path d="m60 9 8 10-8 10-8-10z" fill="#d9fbff"/><path d="m34 65 3-6 4 6m42 0 4-6 3 6" stroke="#8de8ef"/></g>}
    {skinData.material === 'lava' && <g><path d="M60 7c10 10 8 16 0 21-8-5-10-11 0-21Z" fill="#ffcd70" stroke="#d2573c" strokeWidth="2"/><path d="M29 64q10-6 18 0m26 0q10-6 18 0" stroke="#ffb347" strokeWidth="4" strokeLinecap="round"/></g>}
    {wood && <g><path d="M22 38q4-18 17-22l14 9-8 12-14-4m47 0q8-20 23-14l8 9-8 10-14-8" fill="#527447" stroke="#3f643d" strokeWidth="2.5"/><path d="m53 29 7-14 7 14" fill="#9ecb67" stroke="#3f643d" strokeWidth="2"/><path d="M22 39q-8-8-12 1 7 8 12-1Zm76 0q8-8 12 1-7 8-12-1Z" fill="#b6d674" stroke="#527447" strokeWidth="2"/></g>}
    {skinData.material === 'royal' && <g><path d="m39 29 5-15 10 10 6-17 7 17 10-10 5 15z" fill="#ffe995" stroke="#b58520" strokeWidth="2.5"/><path d="M39 30h42" stroke="#fff1a0" strokeWidth="4"/><circle cx="60" cy="20" r="3" fill="#dc5b70"/></g>}
    {skinData.material === 'rainbow' && <g fill="none" strokeLinecap="round"><path d="M20 33a40 31 0 0 1 80 0" stroke="#f27c72" strokeWidth="5"/><path d="M26 31a34 25 0 0 1 68 0" stroke="#f4c94f" strokeWidth="4"/><path d="M32 29a28 19 0 0 1 56 0" stroke="#68c99c" strokeWidth="4"/></g>}
    {skinData.material === 'dragon' && <g><path d="M21 47 5 32l5 25 13 4m71-14 16-15-5 25-13 4" fill="#db6557" stroke="#963f43" strokeWidth="3"/><path d="m45 27 8-17 8 17m5 0 10-17 5 19" fill="#ffd36a" stroke="#b8564d" strokeWidth="2.5"/><path d="M31 66q9 6 18 0m22 0q9 6 18 0" stroke="#e9694f" strokeWidth="4" strokeLinecap="round"/><path d="m55 111 5 11 5-11" fill="#f2bd54"/></g>}
    {skinData.material === 'submarine' && <g><path d="M28 62q32 22 64 0v8q-32 19-64 0" fill="#f0bf59" stroke="#287889" strokeWidth="2"/><circle cx="60" cy="51" r="15" fill="#bfeef0" stroke="#367d8d" strokeWidth="4"/><circle cx="60" cy="51" r="8" fill="#efffff" opacity=".8"/><path d="m31 43-12-8v31l12-6m58-17 12-8v31l-12-6" fill="#e8b953" stroke="#367d8d" strokeWidth="2.5"/><path d="M39 83v-8m42 8v-8" stroke="#f5d378" strokeWidth="4" strokeLinecap="round"/><path d="m31 28-6-7m15 5-1-9m42 11 8-8" stroke="#bcecf0" strokeWidth="3" strokeLinecap="round"/></g>}
    {skinData.material === 'spaceship' && <g><path d="M27 58 12 68l11 8 12-4m58-14 15 10-11 8-12-4" fill="#91e1dc" stroke="#48558f" strokeWidth="3"/><path d="M49 78 43 99l17-8 17 8-6-21" fill="#eb7186" stroke="#48558f" strokeWidth="2.5"/><path d="M60 6 65 18 78 21 65 25 60 38 55 25 42 21 55 18z" fill="#f5d56d" stroke="#5964a0" strokeWidth="2"/><path d="M43 113q17 10 34 0v9q-17 8-34 0" fill="#89e4de" opacity=".85"/></g>}
    {skinData.material === 'mushroom' && <g><path d="M20 39q3-28 40-30 37 2 40 30-8 8-40 8t-40-8Z" fill="#d7775f" stroke="#8d4c49" strokeWidth="3"/><circle cx="43" cy="26" r="6" fill="#fff3d4"/><circle cx="72" cy="19" r="7" fill="#fff3d4"/><circle cx="83" cy="34" r="4" fill="#fff3d4"/><path d="M28 78q-17 7-16 20l14 3m66-23q17 7 16 20l-14 3" fill="#83a66e" stroke="#567d59" strokeWidth="3"/><path d="M44 112q16-10 32 0v12q-16 8-32 0" fill="#85a76f" stroke="#567d59" strokeWidth="2"/><path d="M32 66q10 7 20 0m16 0q10 7 20 0" stroke="#a85d54" strokeWidth="3" strokeLinecap="round"/><path d="m56 31 4 5 5-5" stroke="#a85d54" strokeWidth="2.5" strokeLinecap="round"/></g>}
    {skinData.material === 'penguin' && <g><path d="M28 40 9 30l6 25 16 4m61-19 19-10-6 25-16 4" fill="#42586d" stroke="#34485a" strokeWidth="3"/><path d="M35 24q25-15 50 0l8 42q-4 21-33 23-29-2-33-23z" fill="#34485a" stroke="#293c4c" strokeWidth="3"/><ellipse cx="60" cy="58" rx="23" ry="26" fill="#fff7e8"/><path d="m52 57 8 8 8-8z" fill="#f4bd69"/><path d="m47 110-8 10 18-2m24-8 8 10-18-2" fill="#f4bd69" stroke="#ad7541" strokeWidth="2"/><path d="M46 43h4m20 0h4" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></g>}
    {skinData.material === 'crab' && <g><path d="M30 80Q8 80 12 54q2-13 13-18l6 11m58 33q22 0 18-26-2-13-13-18l-6 11" fill="#e78759" stroke="#a64f47" strokeWidth="4"/><path d="m22 52-9-8 12-3m73 11 9-8-12-3" stroke="#a64f47" strokeWidth="4" strokeLinecap="round"/><path d="M42 33V18m36 15V18" stroke="#a64f47" strokeWidth="4"/><circle cx="42" cy="16" r="7" fill="#fff4db" stroke="#a64f47" strokeWidth="3"/><circle cx="78" cy="16" r="7" fill="#fff4db" stroke="#a64f47" strokeWidth="3"/><path d="M31 91h58l-7 20H39z" fill="#e78759" stroke="#a64f47" strokeWidth="3"/><path d="M43 115v8m17-8v8m17-8v8" stroke="#a64f47" strokeWidth="5" strokeLinecap="round"/><path d="M48 65q12 9 24 0" stroke="#914640" strokeWidth="3" strokeLinecap="round"/></g>}
    {skinData.material === 'bee' && <g><path d="M30 39Q6 24 12 56q7 13 24 3m52-20q24-15 18 17-7 13-24 3" fill="#dff7ee" fillOpacity=".85" stroke="#6f998e" strokeWidth="3"/><path d="M40 13 32 3m48 10 8-10" stroke="#614b3e" strokeWidth="4" strokeLinecap="round"/><circle cx="40" cy="12" r="5" fill="#edbd4d"/><circle cx="80" cy="12" r="5" fill="#edbd4d"/><path d="M25 40q35-14 70 0v33q-35 19-70 0z" fill="#edbd4d" stroke="#765340" strokeWidth="3"/><path d="M26 50q34-10 68 0v9q-34 12-68 0zm3 21q31 11 62 0v9q-31 13-62 0z" fill="#493d38"/><path d="M48 115v9m24-9v9" stroke="#493d38" strokeWidth="6" strokeLinecap="round"/><path d="M46 31h5m18 0h5" stroke="#fff9df" strokeWidth="4" strokeLinecap="round"/></g>}
    {skinData.material === 'fairy' && <g><path d="M30 49Q4 17 17 13q19 1 34 34m39 2q26-32 13-36-19 1-34 34" fill="#e9d4f0" fillOpacity=".9" stroke="#9d7bb4" strokeWidth="3"/><path d="m60 1 4 10 11 3-11 4-4 11-4-11-11-4 11-3z" fill="#f2d980" stroke="#a782ad" strokeWidth="2"/><path d="M29 38q31-15 62 0v37q-31 16-62 0z" fill="#aa91c7" stroke="#705e93" strokeWidth="3"/><path d="M41 87 26 111l21-6 13 13 13-13 21 6-15-24" fill="#e6b8db" stroke="#8f73aa" strokeWidth="3"/><path d="M44 56q8 7 16 0m0 0q8 7 16 0" stroke="#65527d" strokeWidth="3" strokeLinecap="round"/><path d="m60 96 4 8-4 8-4-8z" fill="#f4d876"/></g>}
  </svg>;
}

function Tree({ x, y, scale = 1, color = '#5d9466', pine = false }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx="0" cy="5" rx="19" ry="7" fill="#355d46" opacity=".1" />
    <path d="M0 0v-35" stroke="#956e49" strokeWidth="7" strokeLinecap="round" />
    {pine ? <g fill={color}><path d="m0-88 28 54h-56z"/><path d="m0-64 34 48h-68z"/></g> : <><ellipse cx="0" cy="-48" rx="27" ry="35" fill={color}/><path d="m0-23 9-17M0-29l-10-11" stroke="#ffffff" strokeOpacity=".2" strokeWidth="3" strokeLinecap="round"/></>}
  </g>;
}

export function WorldArt({ type = 'garden', className = '', hero = false }) {
  const id = useId().replaceAll(':', '');
  const island = type === 'island', forest = type === 'forest', station = type === 'station', valley = type === 'valley', maze = type.startsWith('maze-'), mazeLoops = type === 'maze-loops';
  const top = maze ? mazeLoops ? '#d1c4e2' : '#b7d8d7' : island ? '#a8d6cc' : forest ? '#b8c6ae' : station ? '#edcdb4' : valley ? '#ead99f' : '#b9d7a0';
  const treeColor = forest ? '#75876a' : valley ? '#b2a064' : '#66966b';
  return <svg viewBox="0 0 440 270" className={className} fill="none" aria-hidden="true">
    <defs><linearGradient id={`${id}land`} x1="190" y1="90" x2="230" y2="250" gradientUnits="userSpaceOnUse"><stop stopColor={top}/><stop offset="1" stopColor={island ? '#8dbcb1' : '#a4bf86'}/></linearGradient></defs>
    <ellipse cx="224" cy="232" rx="165" ry="23" fill="#365d46" opacity=".08"/>
    {island && <><ellipse cx="222" cy="191" rx="194" ry="60" fill="#a5d6e3"/><path d="M32 197q33 17 69 7m233-44q27 3 45 12m-59 44q-14 7-40 9" stroke="#e4f6fa" strokeWidth="4" strokeLinecap="round"/></>}
    <path d="M61 146q-8-21 27-30l92-43q29-15 57-2l131 54q36 17 5 39l-112 73q-25 15-57 1L80 182q-17-8-19-18z" fill={island ? '#d0bd8f' : '#8fac74'}/>
    <path d="M61 146q-8-21 27-30l92-43q29-15 57-2l131 54q36 17 5 39l-112 58q-25 15-57 1L80 164q-17-6-19-18z" fill={`url(#${id}land)`}/>
    <path d="m113 140 82 39 95-49 36 15" stroke={valley ? '#fff4ce' : '#ecedcf'} strokeWidth="30" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="m113 140 82 39 95-49 36 15" stroke="#c3c1a1" strokeWidth="2" strokeDasharray="2 14" opacity=".8"/>
    <Tree x={102} y={123} scale={.8} color={treeColor} pine={forest}/>
    <Tree x={340} y={132} scale={.9} color={treeColor} pine={forest}/>
    <Tree x={278} y={90} scale={.65} color={valley ? '#c6ad5f' : treeColor} pine={forest}/>
    {!station && <Tree x={141} y={187} scale={.48} color={treeColor} pine={forest}/>}
    <g transform="translate(294 101)"><path d="M0 28v-45" stroke="#46634d" strokeWidth="4" strokeLinecap="round"/><path d="M2-16h26l-7 10 7 10H2" fill={forest ? '#ac92c9' : '#ecb552'}/></g>
    {maze ? <g fill={mazeLoops ? '#82739c' : '#668b8d'} opacity=".9"><rect x="160" y="121" width="24" height="18" rx="4"/><rect x="211" y="148" width="24" height="18" rx="4"/><rect x="263" y="121" width="24" height="18" rx="4"/></g> : <g fill="#7aa370"><ellipse cx="213" cy="101" rx="12" ry="5"/><ellipse cx="306" cy="188" rx="14" ry="6"/></g>}
    <g fill="#fbf8dc"><circle cx="167" cy="107" r="4"/><circle cx="174" cy="111" r="3"/><circle cx="294" cy="182" r="4"/></g>
    <g transform="translate(236 155)"><path d="m0-11 8 11-8 11-8-11z" fill="#fff7b5" stroke="#d3a443" strokeWidth="2"/></g>
    {station ? <g transform="translate(193 76)"><path d="M0 32q-15 13-15 26l20-8m17-18q15 13 15 26l-20-8" fill="#c77f68"/><path d="M-1 42V5q0-23 12-35Q23-17 23 5v37" fill="#fef4df"/><circle cx="11" cy="7" r="9" fill="#77a6a6"/><path d="m5 45 6 18 6-18" fill="#edb956"/></g> : <svg x={156} y={78} width={78} height={96}><Robot happy={hero}/></svg>}
    {hero && <><g transform="rotate(-12 63 59)"><rect x="36" y="38" width="51" height="41" rx="12" fill="#fffdf6"/><path d="M51 59h21m-7-7 7 7-7 7" stroke="#4e8a6f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></g><g transform="rotate(12 364 49)"><rect x="341" y="26" width="49" height="43" rx="12" fill="#fffdf6"/><path d="M355 42a10 10 0 1 1-1 14m-1-16v9h9" stroke="#dbad4e" strokeWidth="3" strokeLinecap="round"/></g><path d="m252 24 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#e4b956"/></>}
  </svg>;
}

export function Gem({ className = '' }) {
  return <svg viewBox="0 0 28 32" className={className} aria-hidden="true"><path d="m14 2 12 13-12 15L2 15Z" fill="#f3c666" stroke="#d5a23c" strokeWidth="2"/><path d="M14 3v26M3 15h22" stroke="#ffeda2" strokeWidth="2"/><path d="m5 14 9-10-3 10Z" fill="#fff0b2"/></svg>;
}
