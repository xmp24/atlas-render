import React from 'react';
import {AbsoluteFill, Audio, interpolate, interpolateColors, random, staticFile, useCurrentFrame, Easing} from 'remotion';

const FPS = 30;
const STAGES = [
  {t: 0, label: 'Mes 1', cap: ['los cilios', 'de tus pulmones', 'se paralizan'], cigs: 600, d: 0.04},
  {t: 2, label: 'Mes 3', cap: ['aparece', 'la tos', 'del fumador'], cigs: 1800, d: 0.14},
  {t: 4, label: 'Mes 6', cap: ['el alquitrán', 'se pega', 'por dentro'], cigs: 3600, d: 0.26},
  {t: 6, label: 'Año 1', cap: ['tus bronquios', 'viven', 'inflamados'], cigs: 7300, d: 0.4},
  {t: 8, label: 'Año 5', cap: ['los alvéolos', 'empiezan', 'a romperse'], cigs: 36500, d: 0.58},
  {t: 10, label: 'Año 10', cap: ['te ahogas', 'subiendo', 'escaleras'], cigs: 73000, d: 0.78},
  {t: 12, label: 'Año 20', cap: ['riesgo', 'de cáncer', 'hasta ×20'], cigs: 146000, d: 0.97},
];
const END_T = 14.3;
const FONT = '"DejaVu Sans", Arial, sans-serif';

const LUNG_L = 'M 340 545 C 300 500, 215 520, 198 625 C 180 725, 172 825, 198 892 C 230 925, 300 908, 336 872 C 346 760, 346 640, 340 545 Z';
const LUNG_R = 'M 380 545 C 420 500, 505 520, 522 625 C 540 725, 548 825, 522 892 C 490 925, 432 908, 402 884 C 422 842, 412 802, 386 782 C 391 700, 389 620, 380 545 Z';

const stageAt = (s: number) => {
  let i = 0;
  STAGES.forEach((st, k) => { if (s >= st.t) i = k; });
  return i;
};

const damageAt = (s: number) =>
  interpolate(s, STAGES.flatMap((st) => [st.t, st.t + 0.6]), STAGES.flatMap((st, k) => [k ? STAGES[k - 1].d : 0, st.d]), {extrapolateRight: 'clamp'});

const Stroke: React.FC<{children: React.ReactNode; size: number; color: string; stroke: string; style?: React.CSSProperties}> = ({children, size, color, stroke, style}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color, WebkitTextStroke: `${size * 0.09}px ${stroke}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.06}px 0 ${stroke}`, letterSpacing: -1, ...style}}>
    {children}
  </div>
);

export const Lungs: React.FC = () => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const si = stageAt(s);
  const st = STAGES[si];
  const ls = s - st.t; // local time in stage
  const d = damageAt(s);
  const ending = s >= END_T;

  // camera: alternate wide / chest close-up per stage, with a punch-in at each cut
  const camKeys = [1.0, 1.45, 1.25, 1.55, 1.3, 1.6, 1.15];
  const camY = [0, -120, -80, -140, -90, -150, -40];
  const prev = si ? si - 1 : 0;
  const k = interpolate(ls, [0, 0.45], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  let scale = interpolate(k, [0, 1], [camKeys[prev], camKeys[si]]) * (1 + 0.04 * Math.max(0, 1 - ls * 3)) + ls * 0.015;
  let ty = interpolate(k, [0, 1], [camY[prev], camY[si]]);
  // cough shake (mes 3) + heartbeat shake (año 20)
  let sx = 0, sy = 0;
  if (si === 1 && ls > 0.3 && ls < 1.6) { sx = (random(f) - 0.5) * 22; sy = (random(f + 9) - 0.5) * 18; }
  if (si === 6) { const b = Math.max(0, Math.sin(ls * Math.PI * 2 * 1.33)) ** 8; sx += (random(f) - 0.5) * 10 * b; scale *= 1 + 0.02 * b; }
  if (ending) { scale = 1.0; ty = 0; }

  // breathing
  const breath = Math.sin(s * Math.PI * 2 * 0.75) * 0.045 * (1 - d * 0.75);
  const coughSqueeze = si === 1 && ls > 0.3 && ls < 1.6 ? -0.05 * Math.abs(Math.sin(ls * 14)) : 0;
  const lungScale = 1 + breath + coughSqueeze;

  const c1 = interpolateColors(d, [0, 0.3, 0.6, 1], ['#ff9fb0', '#d98c8c', '#7d6862', '#231c1a']);
  const c2 = interpolateColors(d, [0, 0.3, 0.6, 1], ['#d9506e', '#a85a5c', '#4e403c', '#0f0b0a']);
  const skin = interpolateColors(d, [0, 1], ['rgba(250,214,130,0.42)', 'rgba(150,125,70,0.6)']);
  const skinEdge = interpolateColors(d, [0, 1], ['#f3cf7a', '#8a7444']);
  const bone = interpolateColors(d, [0, 1], ['#f6e3a8', '#b8a477']);
  const bg1 = interpolateColors(d, [0, 1], ['#8fd3f5', '#6aa9c9']);
  const bg2 = interpolateColors(d, [0, 1], ['#4fb3e8', '#2f6f91']);

  // tar spots
  const spots = new Array(140).fill(0).map((_, i) => {
    const left = random(`s${i}`) < 0.5;
    const x = left ? 205 + random(`x${i}`) * 130 : 392 + random(`x${i}`) * 128;
    const y = 560 + random(`y${i}`) * 335;
    const th = i / 140;
    const vis = interpolate(d, [th * 0.9 + 0.12, th * 0.9 + 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return {x, y, r: (4 + random(`r${i}`) * 13) * vis, o: 0.45 + random(`o${i}`) * 0.4};
  });
  // emphysema holes (from año 5)
  const holes = new Array(16).fill(0).map((_, i) => {
    const left = i % 2 === 0;
    const x = left ? 225 + random(`hx${i}`) * 95 : 412 + random(`hx${i}`) * 95;
    const y = 600 + random(`hy${i}`) * 260;
    const vis = interpolate(s, [8.2 + i * 0.22, 8.6 + i * 0.22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return {x, y, r: (7 + random(`hr${i}`) * 14) * vis};
  });
  // mucus blobs (mes 3 onward)
  const mucus = new Array(10).fill(0).map((_, i) => {
    const vis = interpolate(s, [2.3 + i * 0.12, 2.6 + i * 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return {x: [300, 420, 270, 455, 320, 400, 250, 480, 345, 375][i], y: 600 + ((i * 53) % 240), r: (6 + (i % 3) * 4) * vis * (1 + 0.1 * Math.sin(s * 5 + i))};
  });
  // smoke particles: mouth -> trachea -> lungs
  const smoke = new Array(26).fill(0).map((_, i) => {
    const p = ((s * 0.55 + i / 26) % 1);
    const side = i % 2 ? 1 : -1;
    let x = 360, y = 0;
    if (p < 0.45) { y = interpolate(p, [0, 0.45], [318, 535]); x = 360 + Math.sin(p * 20 + i) * 6; }
    else { const q = (p - 0.45) / 0.55; x = 360 + side * (20 + q * (60 + random(`sm${i}`) * 70)); y = 535 + q * (110 + random(`sn${i}`) * 230); }
    return {x, y, r: 10 + p * 22, o: 0.5 * Math.sin(p * Math.PI)};
  });
  // tumour
  const tumV = interpolate(s, [12.2, 12.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
  const tumPulse = 1 + 0.12 * Math.max(0, Math.sin(s * Math.PI * 2 * 1.33)) ** 6;
  // bronchi inflammation glow (año 1)
  const inflame = interpolate(s, [6.1, 6.6, 7.8, 8.3], [0, 1, 1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // eyes
  const sclera = interpolateColors(d, [0, 0.5, 1], ['#ffffff', '#f6c9c0', '#e88d86']);
  const eyeBag = d * 0.8;
  const mouthOpen = si === 1 && ls > 0.3 && ls < 1.6 ? 26 + 14 * Math.abs(Math.sin(ls * 14)) : 14 + breath * 120;

  // caption chunk
  const ci = Math.min(st.cap.length - 1, Math.floor(ls / ((si === 6 ? END_T - 12 : 2) / st.cap.length)));
  const capPop = interpolate((ls % ((si === 6 ? END_T - 12 : 2) / st.cap.length)), [0, 0.12], [0.75, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(3))});
  const labelPop = interpolate(ls, [0, 0.18], [0.4, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(3))});
  const cigPrev = si ? STAGES[si - 1].cigs : 0;
  const cigs = Math.round(interpolate(ls, [0, 0.6], [cigPrev, st.cigs], {extrapolateRight: 'clamp'}));
  const flash = interpolate(ls, [0, 0.12], [0.55, 0], {extrapolateRight: 'clamp'});

  const ribs = new Array(8).fill(0).map((_, i) => 545 + i * 46);

  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${bg1}, ${bg2})`, overflow: 'hidden'}}>
      <Audio src={staticFile('audio.wav')} />
      <AbsoluteFill style={{transform: `translate(${sx}px, ${ty + sy}px) scale(${scale})`, transformOrigin: '50% 55%'}}>
        <svg width={720} height={1280} viewBox="0 0 720 1280">
          <defs>
            <radialGradient id="lg" cx="45%" cy="40%" r="70%"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></radialGradient>
            <linearGradient id="sk" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={skinEdge} stopOpacity={0.9} /><stop offset="25%" stopColor={skin} /><stop offset="75%" stopColor={skin} /><stop offset="100%" stopColor={skinEdge} stopOpacity={0.9} /></linearGradient>
            <clipPath id="lc"><path d={LUNG_L} /><path d={LUNG_R} /></clipPath>
            <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
            <filter id="blur2"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="glow"><feGaussianBlur stdDeviation="10" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {/* sofa */}
          <rect x={40} y={980} width={640} height={320} rx={60} fill="#5aa9df" opacity={0.7} />
          {/* body */}
          <path d="M 110 1300 L 122 610 C 128 525, 200 482, 300 470 L 420 470 C 520 482, 592 525, 598 610 L 610 1300 Z" fill="url(#sk)" stroke={skinEdge} strokeWidth={3} />
          <rect x={322} y={350} width={76} height={130} rx={20} fill="url(#sk)" />
          {/* spine */}
          {new Array(16).fill(0).map((_, i) => <rect key={i} x={346} y={360 + i * 42} width={28} height={34} rx={8} fill={bone} opacity={0.9} />)}
          {/* trachea + lungs */}
          <rect x={348} y={330} width={24} height={215} rx={10} fill={c2} opacity={0.75} />
          {[0, 1].map((side) => (
            <g key={side} transform={`translate(${side ? 450 : 270} 720) scale(${lungScale}) translate(${side ? -450 : -270} -720)`}>
              <path d={side ? LUNG_R : LUNG_L} fill="url(#lg)" stroke={c2} strokeWidth={4} />
            </g>
          ))}
          <g clipPath="url(#lc)" transform={`translate(360 720) scale(${lungScale}) translate(-360 -720)`}>
            {/* bronchial tree */}
            {[[-1, 0], [1, 0]].map(([dir]) => (
              <g key={dir} stroke={interpolateColors(inflame, [0, 1], [c2, '#ff2a2a'])} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} filter={inflame > 0.05 ? 'url(#glow)' : undefined}>
                <path d={`M 360 545 Q ${360 + dir * 40} 600 ${360 + dir * 85} 640 T ${360 + dir * 120} 820`} />
                <path d={`M ${360 + dir * 60} 620 Q ${360 + dir * 120} 640 ${360 + dir * 140} 700`} strokeWidth={5} />
                <path d={`M ${360 + dir * 90} 700 Q ${360 + dir * 70} 780 ${360 + dir * 60} 860`} strokeWidth={4} />
                <path d={`M ${360 + dir * 100} 760 Q ${360 + dir * 140} 790 ${360 + dir * 150} 860`} strokeWidth={4} />
              </g>
            ))}
            {mucus.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="#b8c93a" opacity={0.85 * (1 - d * 0.4)} stroke="#7d8f1d" strokeWidth={2} />)}
            {spots.map((p, i) => p.r > 0.3 && <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#1a120d" opacity={p.o} filter="url(#blur2)" />)}
            {holes.map((h, i) => h.r > 0.3 && (
              <g key={i}><circle cx={h.x} cy={h.y} r={h.r} fill="#0b0605" /><circle cx={h.x} cy={h.y} r={h.r} fill="none" stroke={c1} strokeWidth={2} opacity={0.7} /></g>
            ))}
            {tumV > 0 && (
              <g transform={`translate(455 715) scale(${tumV * tumPulse * 1.5})`}>
                <circle r={46} fill="#ff2050" opacity={0.35} filter="url(#blur6)" />
                <path d="M -34 -8 C -38 -34, -6 -44, 12 -34 C 36 -30, 42 -2, 32 18 C 24 40, -10 44, -24 30 C -40 20, -32 6, -34 -8 Z" fill="#7a1f3d" stroke="#d6466b" strokeWidth={3} />
                <circle cx={-8} cy={-10} r={8} fill="#a8355a" /><circle cx={14} cy={10} r={6} fill="#a8355a" />
              </g>
            )}
          </g>
          {smoke.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#d8d8d8" opacity={p.o * (si === 6 ? 0.6 : 1)} filter="url(#blur6)" />)}
          {/* ribs + sternum */}
          {ribs.map((y, i) => (
            <g key={i} stroke={bone} strokeWidth={13 - i * 0.6} fill="none" strokeLinecap="round" opacity={0.8}>
              <path d={`M 352 ${y} C 300 ${y - 30}, 205 ${y - 18}, ${190 - i * 2} ${y + 40}`} />
              <path d={`M 368 ${y} C 420 ${y - 30}, 515 ${y - 18}, ${530 + i * 2} ${y + 40}`} />
            </g>
          ))}
          <rect x={346} y={520} width={28} height={260} rx={12} fill={bone} opacity={0.85} />
          <path d="M 200 505 Q 280 480 345 500 M 520 505 Q 440 480 375 500" stroke={bone} strokeWidth={16} strokeLinecap="round" fill="none" />
          {/* head */}
          <ellipse cx={360} cy={240} rx={112} ry={138} fill="url(#sk)" stroke={skinEdge} strokeWidth={3} />
          <ellipse cx={360} cy={232} rx={88} ry={108} fill={bone} opacity={0.55} />
          {[-1, 1].map((e) => (
            <g key={e}>
              <ellipse cx={360 + e * 40} cy={232} rx={30} ry={28} fill="#3a2a1a" opacity={0.25 + eyeBag * 0.5} />
              <ellipse cx={360 + e * 40} cy={226} rx={22} ry={20} fill={sclera} />
              <circle cx={360 + e * 38} cy={227} r={10} fill="#2b6f9e" /><circle cx={360 + e * 38} cy={227} r={5} fill="#111" />
              <circle cx={360 + e * 35} cy={222} r={3} fill="#fff" />
              {d > 0.35 && <path d={`M ${360 + e * 22} 228 l ${e * 8} -4 M ${360 + e * 58} 230 l ${-e * 8} -3`} stroke="#d4384a" strokeWidth={1.5} opacity={d} />}
            </g>
          ))}
          <path d="M 352 262 L 360 280 L 368 262 Z" fill="#7a6040" opacity={0.6} />
          <ellipse cx={360} cy={316} rx={34} ry={mouthOpen / 2 + 2} fill="#3b1714" />
          <rect x={330} y={306 - mouthOpen / 2} width={60} height={6} rx={2} fill="#fff6dc" opacity={0.9} />
          {/* cigarette */}
          {!ending && si !== 1 && (
            <g transform="rotate(12 380 318)">
              <rect x={378} y={312} width={92} height={13} rx={3} fill="#f7f4ee" />
              <rect x={378} y={312} width={26} height={13} rx={3} fill="#e0a052" />
              <rect x={466} y={312} width={8} height={13} fill="#ff5a1f" filter="url(#glow)" opacity={0.8 + 0.2 * Math.sin(s * 9)} />
              {[0, 1, 2].map((w) => { const p = (s * 0.6 + w / 3) % 1; return <circle key={w} cx={474 + Math.sin(p * 9 + w) * 10} cy={310 - p * 140} r={6 + p * 18} fill="#e6e6e6" opacity={0.5 * (1 - p)} filter="url(#blur6)" />; })}
            </g>
          )}
        </svg>
      </AbsoluteFill>

      {/* cilia inset (mes 1) */}
      {si === 0 && ls > 0.3 && (
        <div style={{position: 'absolute', right: 26, top: 330, width: 220, height: 220, borderRadius: 110, overflow: 'hidden', border: '6px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transform: `scale(${interpolate(ls, [0.3, 0.55], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))})})`}}>
          <svg width={220} height={220}>
            <rect width={220} height={220} fill="#f2a3b2" />
            <rect y={150} width={220} height={70} fill="#d9506e" />
            {new Array(16).fill(0).map((_, i) => {
              const stop = interpolate(ls, [0.9, 1.5], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              const sw = Math.sin(s * 14 + i * 0.6) * 22 * stop + (1 - stop) * 30 * (random(`c${i}`) - 0.2);
              return <path key={i} d={`M ${12 + i * 13} 152 Q ${12 + i * 13 + sw / 2} 110 ${12 + i * 13 + sw} 72`} stroke={interpolateColors(1 - stop, [0, 1], ['#ffe2e8', '#8b7a74'])} strokeWidth={5} strokeLinecap="round" fill="none" />;
            })}
            {ls > 1.0 && new Array(8).fill(0).map((_, i) => <circle key={i} cx={20 + i * 26} cy={60 + (i % 3) * 18} r={7} fill="#3a2a20" opacity={interpolate(ls, [1, 1.4], [0, 0.8], {extrapolateRight: 'clamp'})} />)}
          </svg>
          <div style={{position: 'absolute', bottom: 8, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 20, color: 'white', WebkitTextStroke: '1px #000'}}>CILIOS</div>
        </div>
      )}

      {/* cigarette counter */}
      {!ending && (
        <div style={{position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <div style={{background: 'rgba(0,0,0,0.55)', borderRadius: 40, padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={60} height={16}><rect width={60} height={16} rx={3} fill="#f7f4ee" /><rect width={18} height={16} rx={3} fill="#e0a052" /><rect x={54} width={6} height={16} fill="#ff5a1f" /></svg>
            <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: 'white'}}>{cigs.toLocaleString('es-ES')}</span>
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#ddd'}}>cigarrillos</span>
          </div>
        </div>
      )}

      {/* stage label + captions */}
      {!ending && (
        <>
          <div style={{position: 'absolute', top: 840, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${labelPop})`}}>
            <Stroke size={96} color="#5ef07a" stroke="#0d3b17">{st.label}</Stroke>
          </div>
          <div style={{position: 'absolute', top: 975, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${capPop})`}}>
            <Stroke size={54} color="#ffffff" stroke="#000000">{st.cap[ci]}</Stroke>
          </div>
        </>
      )}

      {/* ending hook */}
      {ending && (
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `scale(${interpolate(s, [END_T, END_T + 0.2], [0.5, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(3))})})`, textAlign: 'center'}}>
            <Stroke size={84} color="#5ef07a" stroke="#0d3b17">¿Y si</Stroke>
            <Stroke size={84} color="#5ef07a" stroke="#0d3b17">lo dejas?</Stroke>
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{background: 'white', opacity: flash, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.35))', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
