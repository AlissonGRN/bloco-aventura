import { useId } from 'react';
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Sprout, Compass, Repeat2, GitFork, Rocket, Grid2X2, Blocks } from 'lucide-react';
import { ROBOT_SKINS } from '../data/classroom.js';

export const directionIcon = { R: ArrowRight, L: ArrowLeft, U: ArrowUp, D: ArrowDown };
export const worldIcon = { sprout: Sprout, compass: Compass, repeat: Repeat2, split: GitFork, rocket: Rocket, grid: Grid2X2, blocks: Blocks };

export function Robot({ className = '', happy = false, color, skin = 0 }) {
  const skinIndex = Math.max(0, Math.min(ROBOT_SKINS.length - 1, Number(skin) || 0));
  const robotColor = color || ROBOT_SKINS[skinIndex].color;
  return <svg viewBox="0 0 120 140" fill="none" className={className} aria-hidden="true">
    <ellipse cx="60" cy="130" rx="30" ry="7" fill="#24473c" opacity=".12" />
    <path d="M43 112v13m34-13v13" stroke="#294e43" strokeWidth="11" strokeLinecap="round" />
    <path d={happy ? 'M26 83 12 66m82 17 14-17' : 'M28 85 17 96m75-11 11 11'} stroke={robotColor} strokeWidth="12" strokeLinecap="round" />
    <rect x="29" y="71" width="62" height="46" rx="16" fill={robotColor} />
    <rect x="41" y="85" width="38" height="22" rx="7" fill="#fffaf0" />
    <path d="m54 96 4 4 8-9" stroke="#50886b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M60 28V14" stroke="#365e4c" strokeWidth="5" strokeLinecap="round" />
    <circle cx="60" cy="10" r="7" fill="#50886b" />
    <rect x="12" y="40" width="12" height="24" rx="6" fill={robotColor} /><rect x="96" y="40" width="12" height="24" rx="6" fill={robotColor} />
    <rect x="20" y="26" width="80" height="53" rx="18" fill={robotColor} />
    {skinIndex === 5 && <path d="m87 27 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff0a7" stroke="#8162be" strokeWidth="2"/>}
    {skinIndex === 6 && <path d="m60 15 5 7-5 7-5-7z" fill="#e7ffff" stroke="#46aab8" strokeWidth="2"/>}
    {skinIndex === 7 && <path d="M60 13c8 8 7 13 0 18-7-5-8-10 0-18Z" fill="#ffcd70" stroke="#d2573c" strokeWidth="2"/>}
    {skinIndex === 8 && <path d="M24 61q36 12 72 0v9q-36 15-72 0z" fill="#344152" opacity=".9"/>}
    {skinIndex === 9 && <path d="M58 18q-15-12-18 1 8 9 18-1Zm4 0q15-12 18 1-8 9-18-1Z" fill="#e3f2c5" stroke="#4e8757" strokeWidth="2"/>}
    {skinIndex === 10 && <path d="m41 29 4-10 9 7 6-12 6 12 9-7 4 10z" fill="#ffe995" stroke="#b58520" strokeWidth="2"/>}
    {skinIndex === 11 && <g stroke="#713c69" strokeWidth="3" fill="none"><circle cx="43" cy="49" r="10"/><circle cx="77" cy="49" r="10"/><path d="M53 49h14m-34-3-6-3m46 6h6"/></g>}
    {skinIndex === 12 && <path d="M43 20q17-10 34 0" stroke="#fff4a8" strokeWidth="4" strokeLinecap="round"/>}
    <rect x="28" y="35" width="64" height="35" rx="12" fill="#fffaf0" />
    {happy ? <g stroke="#284c41" strokeWidth="5" strokeLinecap="round"><path d="m39 50 4-4 4 4m26 0 4-4 4 4" /></g> : <g fill="#284c41"><rect x="39" y="44" width="8" height="12" rx="4" /><rect x="73" y="44" width="8" height="12" rx="4" /></g>}
    <path d="M54 57q6 7 12 0" stroke="#284c41" strokeWidth="3" strokeLinecap="round" />
    <circle cx="35" cy="59" r="3" fill="#e49f7b" opacity=".6" /><circle cx="85" cy="59" r="3" fill="#e49f7b" opacity=".6" />
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
