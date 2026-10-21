import { useId } from 'react';
import { Calculator, ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Sprout, Compass, Repeat2, GitFork, Rocket, Grid2X2, Blocks, ListOrdered, Hand } from 'lucide-react';
import { ROBOT_SKINS } from '../data/classroom.js';

export const directionIcon = { R: ArrowRight, L: ArrowLeft, U: ArrowUp, D: ArrowDown };
export const worldIcon = { calculator: Calculator, sprout: Sprout, compass: Compass, repeat: Repeat2, split: GitFork, rocket: Rocket, grid: Grid2X2, blocks: Blocks, sequence: ListOrdered, hand: Hand };

export function Robot({ className = '', happy = false, color, skin = 0 }) {
  const skinIndex = Math.max(0, Math.min(ROBOT_SKINS.length - 1, Number(skin) || 0));
  const skinData = ROBOT_SKINS[skinIndex] || ROBOT_SKINS[0];
  const material = skinData.material || 'gloss';
  const robotColor = color || skinData.color;
  const accent = skinData.accent || '#50886b';
  const wood = material === 'wood';
  const metal = ['cosmos', 'ice', 'lava', 'ninja', 'royal', 'neon', 'rainbow', 'submarine', 'spaceship'].includes(material);
  const uid = useId().replace(/:/g, '');
  const body = 'url(#robot-body-' + uid + ')';
  const face = 'url(#robot-face-' + uid + ')';
  const hasAntenna = !['cat', 'axolotl', 'capybara', 'unicorn', 'bee', 'fairy', 'dragon', 'mushroom', 'penguin', 'lion', 'ghost', 'alien'].includes(material);
  return <svg viewBox="0 0 120 140" fill="none" className={['bip-robot', className, 'bip-skin-' + skinIndex].filter(Boolean).join(' ')} aria-hidden="true">
    <defs>
      <linearGradient id={'robot-body-' + uid} x1="17" y1="17" x2="101" y2="122" gradientUnits="userSpaceOnUse">
        <stop stopColor={wood ? '#e4bd82' : robotColor}/>
        <stop offset=".56" stopColor={robotColor}/>
        <stop offset="1" stopColor={wood ? '#805337' : robotColor} stopOpacity={wood ? '.98' : '.78'}/>
      </linearGradient>
      <linearGradient id={'robot-face-' + uid} x1="30" y1="36" x2="92" y2="70" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fffefa"/><stop offset="1" stopColor={wood ? '#f4dfbc' : '#f6f7f1'}/>
      </linearGradient>
      <linearGradient id={'robot-metal-' + uid} x1="30" y1="25" x2="90" y2="75" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity=".36"/><stop offset="1" stopColor="#273c52" stopOpacity=".06"/>
      </linearGradient>
      <filter id={'robot-glow-' + uid} x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2.1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <ellipse cx="60" cy="131" rx="31" ry="6.5" fill="#24473c" opacity=".13"/>
    <path d="M43 112v12m34-12v12" stroke={metal ? '#34465d' : '#294e43'} strokeWidth="12" strokeLinecap="round"/>
    <path d="M40 121h7m26 0h7" stroke="#ffffff" strokeOpacity=".35" strokeWidth="2.5" strokeLinecap="round"/>
    <path d={happy ? 'M27 83 13 68m80 15 14-15' : 'M28 84 17 96m75-12 11 12'} stroke={body} strokeWidth="13" strokeLinecap="round"/>
    <circle cx="16" cy="68" r="4" fill={accent} opacity=".9"/><circle cx="104" cy="68" r="4" fill={accent} opacity=".9"/>
    <rect x="28" y="70" width="64" height="48" rx="17" fill={body} stroke={wood ? '#68462f' : metal ? accent : '#ffffff'} strokeOpacity={wood || metal ? 1 : .22} strokeWidth={wood || metal ? 2 : 1}/>
    <path d="M38 77q22 8 44 0" stroke="#ffffff" strokeOpacity=".3" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="42" y="86" width="36" height="25" rx="8" fill={wood ? '#f5dfbe' : '#fffaf0'} stroke={accent} strokeOpacity=".45" strokeWidth="1.5"/>
    {['cat', 'unicorn'].includes(material)
      ? <g><path d="M60 91c-5-6-12 1-7 6l7 6 7-6c5-5-2-12-7-6Z" fill={accent}/><path d="M54 100l6 3 6-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></g>
      : material === 'fairy'
        ? <g><path d="m60 87 3 4 5-1 1 5 4 3-4 3-1 5-5-1-3 4-3-4-5 1-1-5-4-3 4-3 1-5 5 1z" fill="#e9b8d8" stroke="#a782ad" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="60" cy="99" r="4" fill="#f4d876"/><path d="M57 99h6m-3-3v6" stroke="#fff7de" strokeWidth="1.5" strokeLinecap="round"/></g>
        : ['cosmos', 'spaceship', 'royal'].includes(material)
          ? <path d="m60 89 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={accent} stroke="#fff7d1" strokeWidth="1"/>
          : ['bee', 'axolotl'].includes(material)
            ? <g><circle cx="51" cy="98" r="3" fill={accent}/><circle cx="60" cy="98" r="3" fill={robotColor}/><circle cx="69" cy="98" r="3" fill={accent}/></g>
            : ['capybara', 'mushroom'].includes(material)
              ? <g><circle cx="60" cy="99" r="5" fill={accent}/><circle cx="60" cy="99" r="2" fill="#fff7dc"/></g>
              : material === 'submarine'
                ? <g><circle cx="60" cy="99" r="7" stroke={accent} strokeWidth="2.5"/><circle cx="60" cy="99" r="2.5" fill={accent}/></g>
                : <path d="m53 97 5 5 9-10" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>}
    <path d="M44 112h32" stroke="#ffffff" strokeOpacity=".32" strokeWidth="2" strokeLinecap="round"/>
    {hasAntenna && <g><path d="M60 27V14" stroke={wood ? '#704b31' : '#365e4c'} strokeWidth="4.5" strokeLinecap="round"/><circle cx="60" cy="10" r="7" fill={accent} stroke="#fff" strokeOpacity=".65" strokeWidth="2"/><circle cx="58" cy="8" r="2" fill="#fff" opacity=".8"/></g>}
    {material === 'cat' && <g stroke="#805e92" strokeWidth="2.5" strokeLinejoin="round"><path d="M25 39 27 11 49 29 53 40Z" fill={body}/><path d="M67 40 71 29 93 11 95 39Z" fill={body}/></g>}
    {material === 'axolotl' && <g fill={accent} stroke="#a85e9b" strokeWidth="1.5"><ellipse cx="21" cy="34" rx="7" ry="13" transform="rotate(-25 21 34)"/><ellipse cx="15" cy="48" rx="6" ry="11" transform="rotate(-10 15 48)"/><ellipse cx="21" cy="61" rx="6" ry="10" transform="rotate(18 21 61)"/><ellipse cx="99" cy="34" rx="7" ry="13" transform="rotate(25 99 34)"/><ellipse cx="105" cy="48" rx="6" ry="11" transform="rotate(10 105 48)"/><ellipse cx="99" cy="61" rx="6" ry="10" transform="rotate(-18 99 61)"/></g>}
    {material === 'capybara' && <g><ellipse cx="36" cy="29" rx="8" ry="7" fill={body} stroke="#91613f" strokeWidth="2"/><ellipse cx="84" cy="29" rx="8" ry="7" fill={body} stroke="#91613f" strokeWidth="2"/></g>}
    {material === 'unicorn' && <g><path d="M52 31 60 3 68 31Z" fill="#ffe9a7" stroke="#b47eb1" strokeWidth="2"/><path d="m57 17 6-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/><path d="M23 45q-9-18 5-25 8 14 17 19m52 6q9-18-5-25-8 14-17 19" fill="#dc79bd" stroke="#a65b9c" strokeWidth="2.5"/></g>}
    {material === 'dragon' && <g stroke="#99464a" strokeWidth="2.5" strokeLinejoin="round">
      <path d="M31 48Q17 33 5 17l17 8L15 7l29 26 6 14Z" fill="#cf625f"/>
      <path d="m20 25 10 14m-15-32 17 26" stroke="#f6a08a" strokeWidth="2"/>
      <path d="M89 48q14-15 26-31l-17 8 7-18-29 26-6 14Z" fill="#cf625f"/>
      <path d="M100 25 90 39m15-32L88 33" stroke="#f6a08a" strokeWidth="2"/>
      <path d="m42 28 10-18 10 18m6 0 10-18 10 18" fill="#ffd36a" stroke="#ad5b4f" strokeWidth="2.5"/>
    </g>}
    {material === 'submarine' && <g><path d="M22 44 7 35v31l17-6m57-16 15-9v31l-17-6" fill="#f3c568" stroke="#377f90" strokeWidth="2.5" strokeLinejoin="round"/><circle cx="14" cy="70" r="3" fill="#8bdbe6"/><circle cx="106" cy="70" r="3" fill="#8bdbe6"/></g>}
    {material === 'spaceship' && <g><path d="M29 60 12 69l14 13 12-7m45-15 17 9-14 13-12-7" fill="#91e1dc" stroke="#48558f" strokeWidth="3" strokeLinejoin="round"/><path d="M45 113q15 9 30 0v8q-15 8-30 0" fill="#ed7186"/></g>}
    {material === 'mushroom' && <g>
      <path d="M17 38C19 19 37 7 60 7s41 12 43 31q-8 8-20 8H37q-12 0-20-8Z" fill="#d97877" stroke="#96515f" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M28 31Q36 13 57 12" stroke="#ffd9d1" strokeWidth="4" strokeLinecap="round" opacity=".78"/>
      <circle cx="42" cy="24" r="6" fill="#fff5df"/><circle cx="70" cy="17" r="7" fill="#fff5df"/><circle cx="84" cy="33" r="4.5" fill="#fff5df"/><circle cx="27" cy="35" r="3.5" fill="#fff5df"/>
      <path d="M35 43q25 8 50 0" stroke="#f3c9a8" strokeWidth="3" strokeLinecap="round"/>
      <path d="M58 9q-4-8-13-5 3 7 13 5m2 0q6-10 15-5-5 8-15 5" fill="#89bb7a" stroke="#548a65" strokeWidth="1.8" strokeLinejoin="round"/>
    </g>}
    {material === 'penguin' && <g><path d="M27 47 8 33l8 28 14 5m57-19 19-14-8 28-14 5" fill="#42586d" stroke="#34485a" strokeWidth="3" strokeLinejoin="round"/></g>}
    {material === 'lion' && <g stroke="#a65e2b" strokeWidth="2.5" strokeLinejoin="round">
      <path d="M29 39 18 25 35 28 37 12 51 24 61 9 71 24 87 13 85 29 102 27 95 43 109 53 94 63 99 77 82 73 74 88 60 79 47 88 39 73 22 77 26 61 11 53Z" fill="#e89a38"/>
      <path d="M29 42 22 30m68 12 8-11M24 64l8-4m56 4 8-4M40 76l7-3m20 7 7-6" stroke="#f7c56a" strokeWidth="2"/>
      <ellipse cx="30" cy="35" rx="8" ry="8" fill="#f1bb5d"/><ellipse cx="90" cy="35" rx="8" ry="8" fill="#f1bb5d"/>
    </g>}
    {material === 'bee' && <g><ellipse cx="30" cy="43" rx="15" ry="10" transform="rotate(-32 30 43)" fill="#dff7ee" fillOpacity=".9" stroke="#79a99a" strokeWidth="2.5"/><ellipse cx="90" cy="43" rx="15" ry="10" transform="rotate(32 90 43)" fill="#dff7ee" fillOpacity=".9" stroke="#79a99a" strokeWidth="2.5"/><path d="M42 27 34 12m44 15 8-15" stroke="#614b3e" strokeWidth="3.5" strokeLinecap="round"/><circle cx="34" cy="12" r="4.5" fill="#edbd4d"/><circle cx="86" cy="12" r="4.5" fill="#edbd4d"/></g>}
    {material === 'fairy' && <g><path d="M30 49Q4 17 17 13q19 1 34 34m39 2q26-32 13-36-19 1-34 34" fill="#e9d4f0" fillOpacity=".9" stroke="#9d7bb4" strokeWidth="3"/><path d="m60 1 4 10 11 3-11 4-4 11-4-11-11-4 11-3z" fill="#f2d980" stroke="#a782ad" strokeWidth="2"/></g>}
    {material === 'alien' && <g stroke="#4b9f70" strokeWidth="3" strokeLinecap="round"><path d="M43 29 38 13m39 16 5-16"/><circle cx="37.5" cy="11" r="5" fill="#f4d66b"/><circle cx="82.5" cy="11" r="5" fill="#f4d66b"/></g>}
    {material === 'ghost' && <g fill="#dfe6ff" fillOpacity=".45" stroke="#b5b9ed" strokeWidth="1.5"><path d="M20 74q-9-9-6-21 4 10 10 11m72 1q9-8 10-19 7 15-2 27"/><circle cx="18" cy="31" r="3"/><circle cx="102" cy="39" r="2.5"/></g>}
    {material === 'lion' && <path d="M31 34q-8-8-1-16 12 1 14 12m31 0q2-11 14-12 7 8-1 16" fill="#f3c46c" stroke="#a65e2b" strokeWidth="2.5" strokeLinejoin="round"/>}
    {material === 'ghost'
      ? <path d="M19 78V51C19 34 31 24 47 24h26c16 0 28 11 28 27v27l-9-6-8 8-8-8-8 8-8-8-8 8-8-8-8 8-8-8Z" fill={body} stroke="#b5b9ed" strokeWidth="1.5"/>
      : <rect x="18" y="24" width="84" height="56" rx={material === 'capybara' ? 23 : material === 'alien' ? 30 : 20} fill={body} stroke={wood ? '#68462f' : metal ? accent : '#ffffff'} strokeWidth={wood || metal ? 2 : 1.2} strokeOpacity={wood || metal ? 1 : .24}/>}
    <path d="M27 35q7-9 22-7" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={material === 'gloss' || wood || material === 'capybara' ? .5 : .27}/>
    <path d="M27 35q7-9 22-7" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={material === 'gloss' || wood || material === 'capybara' ? .5 : .27}/>
    <path d="M27 74q33 8 66 0" stroke="#263e42" strokeOpacity=".09" strokeWidth="2"/>
    {wood && <g><path d="M22 39q4-18 17-22l14 9-8 12-14-4m47 0q8-20 23-14l8 9-8 10-14-8" fill="#527447" stroke="#3f643d" strokeWidth="2"/><path d="m53 29 7-14 7 14" fill="#9ecb67" stroke="#3f643d" strokeWidth="1.5"/></g>}
    {material === 'cat' && <g>
      <path d="M82 101C103 111 116 94 109 81 104 72 94 79 100 86" stroke="#805e92" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M82 101C103 111 116 94 109 81 104 72 94 79 100 86" stroke={robotColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M31 31 31 17 44 30m32 0 13-13v14" fill={body} stroke="#805e92" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="m34 28 1-5 5 5m36 0 5-5 1 5" fill="none" stroke="#ffc9e5" strokeWidth="2" strokeLinecap="round"/>
    </g>}
    {material === 'axolotl' && <g fill="#fff" opacity=".78"><circle cx="22" cy="38" r="2"/><circle cx="18" cy="50" r="2"/><circle cx="22" cy="60" r="2"/><circle cx="98" cy="38" r="2"/><circle cx="102" cy="50" r="2"/><circle cx="98" cy="60" r="2"/></g>}
    {material === 'unicorn' && <g><path d="M22 43q-4 12 6 22m70-22q4 12-6 22" stroke="#9b75ca" strokeWidth="5" strokeLinecap="round"/><circle cx="45" cy="33" r="3" fill="#fff0b5"/><circle cx="75" cy="33" r="3" fill="#fff0b5"/></g>}
    {material === 'royal' && <g><path d="m37 28 6-15 11 10 6-17 7 17 10-10 6 15z" fill="#ffe995" stroke="#b58520" strokeWidth="2.2"/><path d="M39 29h42" stroke="#fff1a0" strokeWidth="3.5"/><circle cx="60" cy="20" r="3" fill="#dc5b70"/></g>}
    {material === 'rainbow' && <g fill="none" strokeLinecap="round"><path d="M22 29a38 24 0 0 1 76 0" stroke="#f27c72" strokeWidth="4.5"/><path d="M28 28a32 19 0 0 1 64 0" stroke="#f4c94f" strokeWidth="4"/><path d="M34 27a26 14 0 0 1 52 0" stroke="#68c99c" strokeWidth="3.5"/></g>}
    {material === 'ninja'
      ? <g><rect x="28" y="38" width="64" height="24" rx="9" fill="#263246" stroke="#182236" strokeWidth="2"/><path d="M82 42 111 35l-7 11 6 9-29-5" fill="#e65c65" stroke="#ad414e" strokeWidth="2" strokeLinejoin="round"/><path d="M39 49h8m26 0h8" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><path d="M48 56h24" stroke="#8390a8" strokeWidth="2" strokeLinecap="round"/></g>
      : material === 'neon'
        ? <g><rect x="28" y="36" width="64" height="35" rx="11" fill="#202543" stroke={accent} strokeWidth="2"/><g filter={'url(#robot-glow-' + uid + ')'} stroke={accent} strokeWidth="2.4" fill="none"><rect x="38" y="43" width="13" height="12" rx="4"/><rect x="69" y="43" width="13" height="12" rx="4"/><path d="M48 62q12 6 24 0" strokeLinecap="round"/></g></g>
        : material === 'submarine'
          ? <g><circle cx="60" cy="52" r="19" fill="#d5f9f7" stroke="#367d8d" strokeWidth="4"/><circle cx="60" cy="52" r="14.5" fill="#a7e6e7" stroke="#fff" strokeOpacity=".75" strokeWidth="1.5"/><ellipse cx="53" cy="45" rx="5" ry="3" fill="#fff" opacity=".7"/><circle cx="54" cy="51" r="2.4" fill="#2d5965"/><circle cx="66" cy="51" r="2.4" fill="#2d5965"/><path d="M53 58q7 6 14 0" stroke="#2d5965" strokeWidth="2.4" strokeLinecap="round"/></g>
          : material === 'penguin'
            ? <g><ellipse cx="60" cy="52" rx="22" ry="23" fill="#fff7e8" stroke="#c7d4d7" strokeWidth="1.5"/><circle cx="51" cy="46" r="3.2" fill="#293747"/><circle cx="69" cy="46" r="3.2" fill="#293747"/><path d="m52 53 8 8 8-8Z" fill="#f4bd69" stroke="#ad7541" strokeWidth="1.5" strokeLinejoin="round"/></g>
            : material === 'ghost'
              ? <g><rect x="28" y="35" width="64" height="36" rx="15" fill="#f8f9ff" fillOpacity=".92" stroke="#aeb5e9" strokeWidth="1.7"/><ellipse cx="45" cy="49" rx="4.5" ry="6.5" fill="#515b7e"/><ellipse cx="75" cy="49" rx="4.5" ry="6.5" fill="#515b7e"/><path d={happy ? "M50 57q10 13 20 0" : "M52 60q8-4 16 0"} stroke="#515b7e" strokeWidth="3" strokeLinecap="round"/><circle cx="36" cy="60" r="3.5" fill="#f2a7c3"/><circle cx="84" cy="60" r="3.5" fill="#f2a7c3"/></g>
              : material === 'alien'
                ? <g><rect x="28" y="35" width="64" height="36" rx="15" fill="#edffdF" stroke="#74bd82" strokeWidth="1.7"/><ellipse cx="44" cy="49" rx="7" ry="9" transform="rotate(-12 44 49)" fill="#34564b"/><ellipse cx="76" cy="49" rx="7" ry="9" transform="rotate(12 76 49)" fill="#34564b"/><circle cx="46" cy="46" r="2" fill="#ffffff"/><circle cx="78" cy="46" r="2" fill="#ffffff"/><path d="M51 60q9 7 18 0" stroke="#34564b" strokeWidth="2.7" strokeLinecap="round"/><circle cx="35" cy="61" r="3" fill="#ed9ec2"/><circle cx="85" cy="61" r="3" fill="#ed9ec2"/></g>
                : material === 'lion'
                  ? <g><rect x="28" y="35" width="64" height="36" rx="14" fill="#ffe5ae" stroke="#b97632" strokeWidth="1.7"/><path d="m35 46 8-4 8 4m26 0 8-4 2 4" stroke="#75462d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="44" cy="50" r="3" fill="#533b32"/><circle cx="76" cy="50" r="3" fill="#533b32"/><path d="m54 55 6 5 6-5q-1 8-6 8t-6-8Z" fill="#75462d"/><path d="M60 63v2m0 0q-6 5-10 0m10 0q6 5 10 0" stroke="#75462d" strokeWidth="2" strokeLinecap="round"/><circle cx="35" cy="61" r="3" fill="#ef9f88"/><circle cx="85" cy="61" r="3" fill="#ef9f88"/></g>
                  : <g><rect x="28" y="35" width="64" height="36" rx="12" fill={face} stroke={wood ? '#9d7046' : metal ? accent : '#ffffff'} strokeOpacity={wood || metal ? .8 : .52} strokeWidth="1.5"/>{happy ? <g stroke="#284c41" strokeWidth="4.5" strokeLinecap="round"><path d="m39 49 4-4 4 4m26 0 4-4 4 4"/></g> : <g fill="#284c41"><rect x="39" y="43" width="8" height="12" rx="4"/><rect x="73" y="43" width="8" height="12" rx="4"/></g>}<path d="M54 58q6 7 12 0" stroke="#284c41" strokeWidth="2.8" strokeLinecap="round"/><circle cx="35" cy="59" r="3.3" fill="#ef9fa1" opacity=".63"/><circle cx="85" cy="59" r="3.3" fill="#ef9fa1" opacity=".63"/></g>}
    {['cat', 'capybara'].includes(material) && <g stroke="#714f66" strokeWidth="1.8" strokeLinecap="round"><path d="M30 56 18 53m12 8-12 2m72-7 12-3m-12 8 12 2"/><path d="m57 56 3 3 3-3" fill="#f3a4bb" strokeLinejoin="round"/></g>}
    {material === 'capybara' && <g><ellipse cx="60" cy="59" rx="12" ry="7" fill="#e1b487"/><ellipse cx="60" cy="56" rx="5" ry="3.5" fill="#62463c"/><circle cx="58" cy="55" r="1.2" fill="#fff" opacity=".75"/><path d="M56 63q4 3 8 0" stroke="#62463c" strokeWidth="1.8" strokeLinecap="round"/></g>}
    {material === 'cat' && <path d="M56 62q4 4 8 0" stroke="#714f66" strokeWidth="2.4" strokeLinecap="round"/>}
    {material === 'axolotl' && <g fill="#fff" opacity=".82"><circle cx="43" cy="60" r="1.7"/><circle cx="77" cy="60" r="1.7"/><circle cx="47" cy="64" r="1.2"/><circle cx="73" cy="64" r="1.2"/></g>}
    {material === 'dragon' && <g><path d="M54 59q6 5 12 0" stroke="#99464a" strokeWidth="2.5" strokeLinecap="round"/><circle cx="52" cy="61" r="1.6" fill="#99464a"/><circle cx="68" cy="61" r="1.6" fill="#99464a"/><path d="M32 70h5m46 0h5" stroke="#ffd36a" strokeWidth="2.5" strokeLinecap="round"/></g>}
    {material === 'mushroom' && <g><path d="M24 37q-4-10-1-14m73 14q4-10 1-14" stroke="#9cc47c" strokeWidth="2.3" strokeLinecap="round"/><circle cx="40" cy="63" r="2" fill="#c77b72"/><circle cx="80" cy="63" r="2" fill="#c77b72"/></g>}
    {material === 'crab' && <g><path d="M46 61q14 10 28 0" stroke="#914640" strokeWidth="2.8" strokeLinecap="round"/><circle cx="39" cy="60" r="3" fill="#ffb3a0" opacity=".8"/><circle cx="81" cy="60" r="3" fill="#ffb3a0" opacity=".8"/></g>}
    {material === 'bee' && <g><path d="M34 77q26 11 52 0" stroke="#765340" strokeWidth="5" strokeLinecap="round"/><circle cx="50" cy="62" r="2" fill="#765340"/><circle cx="70" cy="62" r="2" fill="#765340"/><path d="M47 68q13 6 26 0" stroke="#765340" strokeWidth="2.3" strokeLinecap="round"/></g>}
    {material === 'fairy' && <g><path d="M41 87 26 111l21-6 13 13 13-13 21 6-15-24Q60 98 41 87Z" fill="#e6b8db" stroke="#8f73aa" strokeWidth="2.5" strokeLinejoin="round"/><path d="m60 96 4 8-4 8-4-8z" fill="#f4d876"/><path d="m60 33 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffe99a" stroke="#a782ad" strokeWidth="1.5"/><circle cx="34" cy="63" r="2.5" fill="#efb4d8"/><circle cx="86" cy="63" r="2.5" fill="#efb4d8"/></g>}
    {material === 'cosmos' && <g fill="#fff0a7" stroke="#8162be" strokeWidth="1.4"><path d="m86 29 2 5 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z"/><circle cx="34" cy="66" r="2" fill="#fff" stroke="none"/></g>}
    {material === 'ice' && <g stroke="#46aab8" strokeWidth="1.8"><path d="m60 7 7 9-7 9-7-9z" fill="#d9fbff"/><path d="m36 65 3-5 3 5m35 0 3-5 3 5" stroke="#8de8ef"/></g>}
    {material === 'lava' && <g><path d="M60 4c10 11 8 17 0 23-8-6-10-12 0-23Z" fill="#ffcd70" stroke="#d2573c" strokeWidth="1.8"/><path d="M29 65q10-6 18 0m26 0q10-6 18 0" stroke="#ffb347" strokeWidth="3.4" strokeLinecap="round"/></g>}
    {material === 'royal' && <path d="M30 66q30 12 60 0" stroke="#f3d879" strokeWidth="5" strokeLinecap="round"/>}
    {material === 'neon' && <g stroke={accent} strokeWidth="2" filter={'url(#robot-glow-' + uid + ')'}><path d="M32 76h10m36 0h10" strokeLinecap="round"/><circle cx="60" cy="76" r="2.5" fill={accent}/></g>}
    {material === 'rainbow' && <g><circle cx="35" cy="59" r="2.8" fill="#f27c72"/><circle cx="85" cy="59" r="2.8" fill="#68c99c"/><path d="M48 64q12 8 24 0" stroke="#795fa7" strokeWidth="2.5" strokeLinecap="round"/></g>}
    {material === 'spaceship' && <g><circle cx="60" cy="62" r="2.5" fill="#8debe4"/><path d="M48 66h24m-15 4h6" stroke="#52649c" strokeWidth="2" strokeLinecap="round"/></g>}
    {material === 'unicorn' && <g><path d="m34 49 2 5 5 1-4 4 1 5-4-2-4 2 1-5-4-4 5-1zM84 49l2 5 5 1-4 4 1 5-4-2-4 2 1-5-4-4 5-1z" fill="#fff0b5"/><path d="M27 72q33 10 66 0" stroke="#bb74bd" strokeWidth="3" strokeLinecap="round"/></g>}
    {material === 'cat' && <g fill="#fff1ad"><path d="m60 29 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1z"/><circle cx="81" cy="31" r="1.8"/></g>}
    {material === 'submarine' && <g fill="#8edee6"><circle cx="38" cy="30" r="3"/><circle cx="88" cy="72" r="2.4"/><circle cx="28" cy="77" r="2"/></g>}
    {material === 'axolotl' && <path d="M38 31q6-5 12 0m20 0q6-5 12 0" stroke="#a85e9b" strokeWidth="2" strokeLinecap="round"/>}
    {material === 'bee' && <path d="M46 31h5m18 0h5" stroke="#765340" strokeWidth="3" strokeLinecap="round"/>}
    {material === 'fairy' && <path d="M60 79v5m-3-2 3-3 3 3" stroke="#e5b75e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
    <path d="M33 36q6-6 13-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".35"/>
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
