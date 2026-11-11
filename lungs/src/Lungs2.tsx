import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, interpolateColors, random, staticFile, useCurrentFrame} from 'remotion';

const FPS = 30;
const FONT = '"DejaVu Sans", Arial, sans-serif';
const OL = '#4a1f1a';
const STAGES = [
  {t: 0, label: 'Mes 1', cap: ['el humo', 'paraliza', 'tus cilios'], cigs: 600, d: 0.05,
    cam: [360, 470, 1.35], pills: [{x: 360, y: 300, tx: 250, ty: 250, text: 'TRÁQUEA', c: '#2f6fe0'}]},
  {t: 2, label: 'Mes 3', cap: ['el moco', 'se acumula', 'y llega la tos'], cigs: 1800, d: 0.15,
    cam: [360, 500, 1.75], pills: [{x: 300, y: 470, tx: 215, ty: 380, text: 'MOCO', c: '#3c9a2e'}, {x: 405, y: 420, tx: 480, ty: 370, text: 'BRONQUIOS', c: '#d23a3a'}]},
  {t: 4, label: 'Mes 6', cap: ['el alquitrán', 'se pega', 'a tus pulmones'], cigs: 3600, d: 0.27,
    cam: [360, 520, 1.45], pills: [{x: 455, y: 560, tx: 505, ty: 395, text: 'ALQUITRÁN', c: '#5a3d2b'}]},
  {t: 6, label: 'Año 1', cap: ['bronquitis:', 'tus bronquios', 'siempre inflamados'], cigs: 7300, d: 0.4,
    cam: [360, 470, 1.85], pills: [{x: 320, y: 435, tx: 290, ty: 345, text: 'BRONQUITIS', c: '#d23a3a'}]},
  {t: 8, label: 'Año 5', cap: ['enfisema:', 'los alvéolos', 'se rompen'], cigs: 36500, d: 0.58,
    cam: [360, 520, 1.5], pills: [{x: 460, y: 540, tx: 420, ty: 335, text: 'ALVÉOLOS ROTOS', c: '#7b3fd0'}]},
  {t: 10, label: 'Año 10', cap: ['EPOC:', 'te ahogas', 'subiendo escaleras'], cigs: 73000, d: 0.78,
    cam: [360, 600, 1.2], pills: [{x: 270, y: 560, tx: 230, ty: 420, text: 'EPOC', c: '#e07a1f'}, {x: 392, y: 600, tx: 495, ty: 700, text: 'CORAZÓN', c: '#d23a3a'}]},
  {t: 12, label: 'Año 20', cap: ['cáncer de pulmón:', 'hasta 30 veces', 'más riesgo'], cigs: 146000, d: 0.97,
    cam: [430, 520, 1.95], pills: [{x: 462, y: 478, tx: 455, ty: 365, text: 'TUMOR', c: '#c2185b'}]},
];
const END_T = 14.3;

const LUNG_L = 'M 345 345 C 300 318 232 345 213 420 C 194 500 191 582 200 646 C 240 670 302 662 341 641 C 351 560 353 450 345 345 Z';
const LUNG_R = 'M 375 345 C 420 318 488 345 507 420 C 526 500 529 582 520 646 C 486 670 442 664 421 651 C 441 612 431 576 401 561 C 386 480 381 410 375 345 Z';
const TORSO = 'M 300 290 C 232 298 178 315 163 372 C 152 470 166 560 176 650 C 182 722 168 800 172 880 C 176 960 152 1040 142 1120 L 140 1300 L 580 1300 L 578 1120 C 568 1040 544 960 548 880 C 552 800 538 722 544 650 C 554 560 568 470 557 372 C 542 315 488 298 420 290 Z';
const CAVITY = 'M 310 305 C 250 312 205 328 195 380 C 186 470 198 560 206 650 C 212 722 198 800 202 880 C 206 950 188 1020 180 1090 L 540 1090 C 532 1020 514 950 518 880 C 522 800 508 722 514 650 C 522 560 534 470 525 380 C 515 328 470 312 410 305 Z';

const stageAt = (s: number) => STAGES.reduce((acc, st, k) => (s >= st.t ? k : acc), 0);
const damageAt = (s: number) =>
  interpolate(s, STAGES.flatMap((st) => [st.t, st.t + 0.7]), STAGES.flatMap((st, k) => [k ? STAGES[k - 1].d : 0, st.d]), {extrapolateRight: 'clamp'});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Stroke: React.FC<{children: React.ReactNode; size: number; color: string; stroke: string}> = ({children, size, color, stroke}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color, WebkitTextStroke: `${size * 0.1}px ${stroke}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.07}px 0 ${stroke}, 0 0 20px rgba(0,0,0,0.35)`, letterSpacing: -1, textAlign: 'center', lineHeight: 1.05}}>
    {children}
  </div>
);

// serpentine small intestine path
const smallIntestine = (() => {
  let p = '';
  const rows = 7;
  for (let i = 0; i < rows; i++) {
    const y = 902 + i * 17;
    const ltr = i % 2 === 0;
    for (let k = 0; k <= 15; k++) {
      const x = ltr ? 292 + k * 9.6 : 436 - k * 9.6;
      const yy = y + Math.sin(k * 1.3 + i) * 5;
      p += (p ? ' L ' : 'M ') + x.toFixed(1) + ' ' + yy.toFixed(1);
    }
  }
  return p;
})();

const Pill: React.FC<{x: number; y: number; tx: number; ty: number; text: string; c: string; k: number}> = ({x, y, tx, ty, text, c, k}) => {
  if (k <= 0) return null;
  const w = text.length * 11.5 + 26;
  const lk = Math.min(1, k * 1.6);
  return (
    <g>
      <line x1={x} y1={y} x2={x + (tx - x) * lk} y2={y + (ty - y) * lk} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + (tx - x) * lk} y2={y + (ty - y) * lk} stroke={c} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={x} cy={y} r={6} fill={c} stroke="#fff" strokeWidth={2.5} />
      <g transform={`translate(${tx} ${ty}) scale(${interpolate(k, [0.4, 1], [0, 1], clamp)})`}>
        <rect x={-w / 2} y={-17} width={w} height={34} rx={9} fill={c} stroke="#fff" strokeWidth={2.5} />
        <rect x={-w / 2 + 4} y={-14} width={w - 8} height={11} rx={5} fill="#fff" opacity={0.22} />
        <text x={0} y={7} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={19} fill="#fff" stroke="rgba(0,0,0,0.35)" strokeWidth={0.6}>{text}</text>
      </g>
    </g>
  );
};

const Background: React.FC<{s: number; d: number; cx: number; cy: number; cs: number}> = ({s, d, cx, cy, cs}) => {
  const wallTop = interpolateColors(d, [0, 0.5, 1], ['#bfe8f7', '#9fbfcc', '#5b5a58']);
  const wallBot = interpolateColors(d, [0, 0.5, 1], ['#4aa6d6', '#3e7896', '#2a2624']);
  const floor = interpolateColors(d, [0, 1], ['#2f6f99', '#1d1a19']);
  const px = (360 - cx) * 0.18, py = (640 - cy) * 0.12, ps = 1 + (cs - 1) * 0.15;
  const hr = 1.1 + d * 0.9;
  const ecg = (() => {
    let p = 'M 0 0';
    for (let x = 0; x <= 760; x += 4) {
      const ph = ((x / 760) * 4 - s * hr) % 1;
      const q = ph < 0 ? ph + 1 : ph;
      let y = 0;
      if (q > 0.4 && q < 0.44) y = -10; else if (q > 0.47 && q < 0.5) y = -60; else if (q > 0.5 && q < 0.53) y = 30; else if (q > 0.6 && q < 0.7) y = -12 * Math.sin((q - 0.6) * Math.PI * 10);
      p += ` L ${x} ${y.toFixed(1)}`;
    }
    return p;
  })();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${wallTop} 0%, ${wallBot} 78%, ${floor} 78.2%, ${floor} 100%)`}} />
      <AbsoluteFill style={{transform: `translate(${px}px, ${py}px) scale(${ps})`}}>
        <svg width={720} height={1280}>
          <defs>
            <pattern id="hex" width={40} height={69.3} patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
              <path d="M 20 0 L 40 11.5 L 40 34.6 L 20 46.2 L 0 34.6 L 0 11.5 Z M 20 46.2 L 20 69.3" fill="none" stroke="#fff" strokeWidth={1} />
            </pattern>
            <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={0.55} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient>
            <filter id="bk"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="bk2"><feGaussianBlur stdDeviation="30" /></filter>
          </defs>
          <rect width={720} height={1000} fill="url(#hex)" opacity={0.09} />
          {/* window */}
          <g opacity={interpolate(d, [0, 1], [0.9, 0.35])}>
            <rect x={-60} y={120} width={250} height={380} rx={14} fill="#eaf8ff" opacity={0.55} />
            <rect x={-60} y={120} width={250} height={380} rx={14} fill="none" stroke="#fff" strokeWidth={10} opacity={0.7} />
            <line x1={65} y1={120} x2={65} y2={500} stroke="#fff" strokeWidth={8} opacity={0.7} />
            <line x1={-60} y1={310} x2={190} y2={310} stroke="#fff" strokeWidth={8} opacity={0.7} />
            <path d="M 190 120 L 720 640 L 720 900 L 190 500 Z" fill="url(#beam)" opacity={0.35} />
          </g>
          {/* monitor */}
          <g transform="translate(520 120)">
            <rect x={0} y={0} width={190} height={130} rx={14} fill="#0e1b24" stroke="#cfd8dc" strokeWidth={6} />
            <g transform="translate(10 75) scale(0.225 0.6)"><path d={ecg} fill="none" stroke={interpolateColors(d, [0, 1], ['#4cff7a', '#ff4c4c'])} strokeWidth={9} /></g>
            <text x={170} y={30} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={22} fill={interpolateColors(d, [0, 1], ['#4cff7a', '#ff4c4c'])}>{Math.round(68 + d * 40)}</text>
            <text x={14} y={30} fontFamily={FONT} fontWeight={700} fontSize={14} fill="#7fa">SpO2 {Math.round(98 - d * 9)}%</text>
            <rect x={80} y={130} width={30} height={160} fill="#90a4ae" />
          </g>
          {/* bokeh */}
          {new Array(14).fill(0).map((_, i) => (
            <circle key={i} cx={(random(`bx${i}`) * 820 + s * (8 + i)) % 820 - 50} cy={80 + random(`by${i}`) * 820} r={18 + random(`br${i}`) * 46}
              fill={i % 3 ? '#ffffff' : '#ffe9a8'} opacity={(0.1 + random(`bo${i}`) * 0.14) * (1 - d * 0.5)} filter="url(#bk)" />
          ))}
          {/* plant + sofa */}
          <g transform="translate(40 860)">
            <rect x={10} y={100} width={70} height={90} rx={10} fill="#e9e1d6" stroke={OL} strokeWidth={3} />
            {[-40, -15, 10, 35, 60].map((a, i) => <ellipse key={i} cx={45 + Math.sin((a * Math.PI) / 180) * 50} cy={60 - Math.cos((a * Math.PI) / 180) * 45} rx={14} ry={42}
              transform={`rotate(${a} ${45 + Math.sin((a * Math.PI) / 180) * 50} ${60 - Math.cos((a * Math.PI) / 180) * 45})`} fill={interpolateColors(d, [0, 1], ['#3fae5a', '#6b6a3a'])} stroke={OL} strokeWidth={2.5} />)}
          </g>
          <rect x={90} y={930} width={540} height={170} rx={50} fill={interpolateColors(d, [0, 1], ['#e8eef2', '#7c7672'])} stroke={OL} strokeWidth={4} />
          <rect x={60} y={1010} width={600} height={130} rx={40} fill={interpolateColors(d, [0, 1], ['#f5f8fa', '#8a8480'])} stroke={OL} strokeWidth={4} />
          <ellipse cx={360} cy={1215} rx={300} ry={30} fill="#000" opacity={0.25} filter="url(#bk)" />
          {/* smoke haze */}
          {new Array(8).fill(0).map((_, i) => (
            <circle key={i} cx={(random(`hx${i}`) * 900 + s * 25 * (i % 2 ? 1 : -1)) % 900 - 90} cy={150 + random(`hy${i}`) * 800} r={120 + random(`hr${i}`) * 120}
              fill="#c8c2bc" opacity={d * 0.28} filter="url(#bk2)" />
          ))}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Lungs2: React.FC = () => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const si = stageAt(s);
  const st = STAGES[si];
  const ls = s - st.t;
  const d = damageAt(s);
  const ending = s >= END_T;
  const coughing = si === 1 && ls > 0.5 && ls < 1.7;

  // camera
  const from = si ? STAGES[si - 1].cam : [360, 640, 1.0];
  const k = interpolate(ls, [0, 0.55], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  let [cx, cy, cs] = [0, 1, 2].map((i) => interpolate(k, [0, 1], [from[i], st.cam[i]]));
  cs *= 1 + ls * 0.02;
  if (ending) { const e = interpolate(s, [END_T, END_T + 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}); cx = interpolate(e, [0, 1], [cx, 360]); cy = interpolate(e, [0, 1], [cy, 640]); cs = interpolate(e, [0, 1], [cs, 1]); }
  let sx = 0, sy = 0;
  if (coughing) { const a = Math.abs(Math.sin(ls * 13)); sx = (random(f) - 0.5) * 26 * a; sy = (random(f + 7) - 0.5) * 20 * a; }
  const beatHz = 1.1 + d * 0.9;
  const beat = Math.max(0, Math.sin(s * Math.PI * 2 * beatHz)) ** 10;
  if (si === 6) { sx += (random(f) - 0.5) * 12 * beat; }

  // breathing
  const breath = Math.sin(s * Math.PI * 2 * 0.7) * 0.05 * (1 - d * 0.75);
  const lungScale = 1 + breath + (coughing ? -0.06 * Math.abs(Math.sin(ls * 13)) : 0);

  // colours
  const c1 = interpolateColors(d, [0, 0.3, 0.6, 1], ['#ffadbb', '#e0959a', '#806a64', '#241c1a']);
  const c2 = interpolateColors(d, [0, 0.3, 0.6, 1], ['#e25d7a', '#ad5d60', '#4e403c', '#0e0a09']);
  const skin = interpolateColors(d, [0, 1], ['#f4c7a1', '#bfa48a']);
  const skinSh = interpolateColors(d, [0, 1], ['#dc9e7a', '#8f7a66']);
  const bone = interpolateColors(d, [0, 1], ['#f7e7c0', '#cdbb94']);

  const spots = new Array(150).fill(0).map((_, i) => {
    const left = random(`s${i}`) < 0.5;
    const x = left ? 210 + random(`x${i}`) * 135 : 385 + random(`x${i}`) * 135;
    const y = 345 + random(`y${i}`) * 305;
    const th = i / 150;
    const vis = interpolate(d, [th * 0.85 + 0.14, th * 0.85 + 0.22], [0, 1], clamp);
    return {x, y, r: (3 + random(`r${i}`) * 12) * vis, o: 0.45 + random(`o${i}`) * 0.45};
  });
  const holes = new Array(18).fill(0).map((_, i) => {
    const left = i % 2 === 0;
    const vis = interpolate(s, [8.15 + i * 0.2, 8.5 + i * 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
    return {x: left ? 228 + random(`hx${i}`) * 100 : 412 + random(`hx${i}`) * 92, y: 400 + random(`hy${i}`) * 220, r: (6 + random(`hr${i}`) * 13) * vis};
  });
  const mucus = new Array(12).fill(0).map((_, i) => {
    const vis = interpolate(s, [2.2 + i * 0.1, 2.5 + i * 0.1], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
    const pts = [[300, 470], [420, 440], [275, 520], [455, 500], [318, 560], [405, 520], [255, 590], [475, 575], [340, 440], [385, 470], [290, 610], [440, 610]];
    return {x: pts[i][0], y: pts[i][1], r: (5 + (i % 3) * 3.5) * vis * (1 + 0.12 * Math.sin(s * 5 + i))};
  });
  const smoke = new Array(28).fill(0).map((_, i) => {
    const p = (s * 0.5 + i / 28) % 1;
    const side = i % 2 ? 1 : -1;
    let x = 360, y = 0;
    if (p < 0.4) { y = interpolate(p, [0, 0.4], [215, 400]); x = 360 + Math.sin(p * 20 + i) * 5; }
    else { const q = (p - 0.4) / 0.6; x = 360 + side * (18 + q * (55 + random(`sm${i}`) * 75)); y = 400 + q * (40 + random(`sn${i}`) * 210); }
    return {x, y, r: 7 + p * 18, o: 0.55 * Math.sin(p * Math.PI)};
  });
  const tumV = interpolate(s, [12.2, 12.9], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const inflame = interpolate(s, [6.1, 6.6, 7.8, 8.3], [0, 1, 1, 0.35], clamp);
  const heartS = 1.25 * (1 + 0.07 * beat);

  const sclera = interpolateColors(d, [0, 0.5, 1], ['#ffffff', '#f7d0c8', '#eb9a92']);
  const mouthOpen = coughing ? 18 + 12 * Math.abs(Math.sin(ls * 13)) : 6;
  const ribsY = new Array(8).fill(0).map((_, i) => 355 + i * 36);

  // overlays
  const segLen = (si === 6 ? END_T - 12 : 2) / st.cap.length;
  const ci = Math.min(st.cap.length - 1, Math.floor(ls / segLen));
  const capPop = interpolate(ls % segLen, [0, 0.14], [0.7, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  const labelPop = interpolate(ls, [0, 0.2], [0.3, 1], {...clamp, easing: Easing.out(Easing.back(3))});
  const cigs = Math.round(interpolate(ls, [0, 0.6], [si ? STAGES[si - 1].cigs : 0, st.cigs], clamp));
  const flash = interpolate(ls, [0, 0.12], [0.5, 0], clamp);
  const pillK = interpolate(ls, [0.5, 0.95], [0, 1], clamp) * (ending ? 0 : 1);

  const lungLayer = (
    <>
      {[0, 1].map((side) => (
        <g key={side} transform={`translate(${side ? 455 : 270} 520) scale(${lungScale}) translate(${side ? -455 : -270} -520)`}>
          <path d={side ? LUNG_R : LUNG_L} fill={c2} stroke={OL} strokeWidth={4.5} transform="translate(3 5)" opacity={0.5} />
          <path d={side ? LUNG_R : LUNG_L} fill={`url(#lg${side})`} stroke={OL} strokeWidth={4} />
        </g>
      ))}
      <g clipPath="url(#lc)" transform={`translate(360 520) scale(${lungScale}) translate(-360 -520)`}>
        {/* alveoli texture */}
        {new Array(90).fill(0).map((_, i) => (
          <circle key={i} cx={205 + random(`ax${i}`) * 320} cy={345 + random(`ay${i}`) * 305} r={7 + random(`ar${i}`) * 6} fill="none" stroke={c2} strokeWidth={1.4} opacity={0.35} />
        ))}
        {/* veins */}
        {new Array(10).fill(0).map((_, i) => {
          const side = i % 2 ? 1 : -1;
          const x0 = 360 + side * 30, y0 = 420 + i * 18;
          return <path key={i} d={`M ${x0} ${y0} q ${side * 40} ${-10 + (i % 3) * 12} ${side * (80 + (i % 4) * 15)} ${20 + (i % 3) * 10}`} stroke={interpolateColors(d, [0, 1], ['#7a4fd6', '#2a1f33'])} strokeWidth={1.6} fill="none" opacity={0.55} />;
        })}
        {/* fissures (3 lobes right, 2 left) */}
        <path d="M 205 505 Q 270 492 345 470 M 342 405 Q 282 520 222 645 M 386 420 Q 452 520 512 610" stroke={OL} strokeWidth={2.5} fill="none" opacity={0.55} />
        {/* bronchial tree */}
        {[-1, 1].map((dir) => (
          <g key={dir} stroke={interpolateColors(inflame, [0, 1], [interpolateColors(d, [0, 1], ['#f6dfe2', '#7a6a66']), '#ff2a2a'])} fill="none" strokeLinecap="round" filter={inflame > 0.05 ? 'url(#glow)' : undefined}>
            <path d={`M 360 400 Q ${360 + dir * 35} 420 ${360 + dir * 65} 450 T ${360 + dir * 105} 600`} strokeWidth={9} />
            <path d={`M ${360 + dir * 55} 440 Q ${360 + dir * 110} 440 ${360 + dir * 135} 480`} strokeWidth={6} />
            <path d={`M ${360 + dir * 80} 500 Q ${360 + dir * 60} 560 ${360 + dir * 52} 630`} strokeWidth={5} />
            <path d={`M ${360 + dir * 90} 540 Q ${360 + dir * 130} 560 ${360 + dir * 140} 610`} strokeWidth={4.5} />
            <path d={`M ${360 + dir * 120} 480 Q ${360 + dir * 125} 420 ${360 + dir * 110} 380`} strokeWidth={4} />
          </g>
        ))}
        {mucus.map((m, i) => m.r > 0.2 && (
          <g key={i}><circle cx={m.x} cy={m.y} r={m.r} fill="#c6d63e" stroke="#5f7012" strokeWidth={2} /><circle cx={m.x - m.r * 0.3} cy={m.y - m.r * 0.35} r={m.r * 0.3} fill="#fff" opacity={0.6} /></g>
        ))}
        {spots.map((p, i) => p.r > 0.3 && <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#1a120d" opacity={p.o} filter="url(#b2)" />)}
        {holes.map((h, i) => h.r > 0.3 && (
          <g key={i}><circle cx={h.x} cy={h.y} r={h.r + 3} fill={c1} opacity={0.8} /><circle cx={h.x} cy={h.y} r={h.r} fill="#0b0605" stroke={OL} strokeWidth={1.5} /><circle cx={h.x + h.r * 0.3} cy={h.y + h.r * 0.3} r={h.r * 0.45} fill="#2a1512" /></g>
        ))}
        {tumV > 0 && (
          <g transform={`translate(462 478) scale(${tumV * (1 + 0.12 * beat) * 1.25})`}>
            <circle r={48} fill="#ff2a5e" opacity={0.4} filter="url(#b6)" />
            <path d="M -34 -8 C -38 -34 -6 -44 12 -34 C 36 -30 42 -2 32 18 C 24 40 -10 44 -24 30 C -40 20 -32 6 -34 -8 Z" fill="#8e2448" stroke={OL} strokeWidth={3} />
            <circle cx={-10} cy={-12} r={9} fill="#b13a62" stroke={OL} strokeWidth={1.5} /><circle cx={14} cy={10} r={7} fill="#b13a62" stroke={OL} strokeWidth={1.5} /><circle cx={-14} cy={14} r={5} fill="#b13a62" />
            <ellipse cx={-14} cy={-20} rx={8} ry={4} fill="#fff" opacity={0.4} />
          </g>
        )}
        {/* lung highlights */}
        <ellipse cx={262} cy={400} rx={26} ry={40} fill="#fff" opacity={0.22 * (1 - d * 0.7)} transform="rotate(20 262 400)" />
        <ellipse cx={455} cy={400} rx={24} ry={38} fill="#fff" opacity={0.22 * (1 - d * 0.7)} transform="rotate(-20 455 400)" />
      </g>
    </>
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <Audio src={staticFile('audio.wav')} />
      <Background s={s} d={d} cx={cx} cy={cy} cs={cs} />
      <AbsoluteFill style={{transform: `translate(${360 - cx * cs + sx}px, ${640 - cy * cs + sy}px) scale(${cs})`, transformOrigin: '0 0'}}>
        <svg width={720} height={1280} viewBox="0 0 720 1280" style={{overflow: 'visible'}}>
          <defs>
            <radialGradient id="lg0" cx="40%" cy="35%" r="75%"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></radialGradient>
            <radialGradient id="lg1" cx="60%" cy="35%" r="75%"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></radialGradient>
            <linearGradient id="skin" x1="0" x2="1"><stop offset="0%" stopColor={skinSh} /><stop offset="22%" stopColor={skin} /><stop offset="78%" stopColor={skin} /><stop offset="100%" stopColor={skinSh} /></linearGradient>
            <linearGradient id="musc" x1="0" x2="1"><stop offset="0%" stopColor="#8c2a22" /><stop offset="25%" stopColor="#c8513f" /><stop offset="75%" stopColor="#c8513f" /><stop offset="100%" stopColor="#8c2a22" /></linearGradient>
            <radialGradient id="liver" cx="40%" cy="30%"><stop offset="0%" stopColor="#c0573f" /><stop offset="100%" stopColor="#7a2a1e" /></radialGradient>
            <radialGradient id="stom" cx="45%" cy="35%"><stop offset="0%" stopColor="#f6b59a" /><stop offset="100%" stopColor="#d97a5e" /></radialGradient>
            <radialGradient id="heart" cx="40%" cy="35%"><stop offset="0%" stopColor="#ff9a5a" /><stop offset="55%" stopColor="#e2463a" /><stop offset="100%" stopColor="#9e1f22" /></radialGradient>
            <radialGradient id="kid" cx="40%" cy="35%"><stop offset="0%" stopColor="#b85a78" /><stop offset="100%" stopColor="#6e2a44" /></radialGradient>
            <radialGradient id="blad" cx="40%" cy="35%"><stop offset="0%" stopColor="#ffd08a" /><stop offset="100%" stopColor="#e88a3a" /></radialGradient>
            <clipPath id="lc"><path d={LUNG_L} /><path d={LUNG_R} /></clipPath>
            <clipPath id="cav"><path d={CAVITY} /></clipPath>
            <filter id="b2"><feGaussianBlur stdDeviation="1.6" /></filter>
            <filter id="b6"><feGaussianBlur stdDeviation="6" /></filter>
            <filter id="glow"><feGaussianBlur stdDeviation="7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="ds"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.3" /></filter>
          </defs>

          {/* hair bun + arms */}
          <circle cx={360} cy={62} r={50} fill="#6b3d22" stroke={OL} strokeWidth={4} />
          <path d="M 330 50 Q 360 30 392 52 M 335 75 Q 362 58 388 78" stroke="#8a5530" strokeWidth={4} fill="none" />
          {[-1, 1].map((sd) => (
            <path key={sd} d={sd < 0 ? 'M 170 340 C 125 360 108 420 103 520 C 98 640 93 760 92 880 C 92 905 128 908 134 884 C 142 770 152 650 163 540 C 168 470 175 420 185 390 Z' : 'M 550 340 C 595 360 612 420 617 520 C 622 640 627 760 628 880 C 628 905 592 908 586 884 C 578 770 568 650 557 540 C 552 470 545 420 535 390 Z'}
              fill="url(#skin)" stroke={OL} strokeWidth={4} />
          ))}
          {/* torso skin + muscle cavity */}
          <g filter="url(#ds)"><path d={TORSO} fill="url(#skin)" stroke={OL} strokeWidth={4.5} /></g>
          <path d={CAVITY} fill="url(#musc)" stroke={OL} strokeWidth={3} />
          <g clipPath="url(#cav)">
            {new Array(30).fill(0).map((_, i) => (
              <path key={i} d={`M ${i < 15 ? 195 + i * 3 : 525 - (i - 15) * 3} ${320 + (i % 15) * 52} q ${i < 15 ? 30 : -30} 40 ${i < 15 ? 22 : -22} 90`} stroke="#e47a62" strokeWidth={2} fill="none" opacity={0.5} />
            ))}
            {/* spine */}
            {new Array(22).fill(0).map((_, i) => (
              <g key={i}><rect x={343} y={300 + i * 35} width={34} height={28} rx={8} fill={bone} stroke={OL} strokeWidth={2} /><line x1={348} y1={300 + i * 35 + 9} x2={372} y2={300 + i * 35 + 9} stroke="#c9b48a" strokeWidth={2} /></g>
            ))}
            {/* great vessels */}
            <path d="M 334 330 L 334 1000" stroke="#2f5fd0" strokeWidth={13} strokeLinecap="round" />
            <path d="M 334 330 L 334 1000" stroke="#6f95ff" strokeWidth={4} opacity={0.5} />
            <path d="M 388 560 C 392 505 360 495 382 470 M 386 470 L 386 1000" stroke="#d3302c" strokeWidth={13} fill="none" strokeLinecap="round" />
            {/* kidneys + ureters */}
            {[[262, 885, -1], [462, 875, 1]].map(([x, y, sd], i) => (
              <g key={i}>
                <path d={`M ${x} ${y + 40} Q ${x + (sd as number) * -40} 990 345 1055 M ${x} ${y + 40}`} stroke="#e8b04a" strokeWidth={4} fill="none" />
                <path d={`M ${x - 26} ${y - 40} C ${x + 20} ${y - 55} ${x + 32} ${y - 10} ${x + (sd as number) * 6} ${y} C ${x + 30} ${y + 15} ${x + 18} ${y + 52} ${x - 18} ${y + 45} C ${x - 40} ${y + 30} ${x - 45} ${y - 25} ${x - 26} ${y - 40} Z`}
                  fill="url(#kid)" stroke={OL} strokeWidth={3} transform={(sd as number) < 0 ? `scale(-1 1) translate(${-2 * x} 0)` : undefined} />
              </g>
            ))}
            {/* esophagus */}
            <path d="M 364 240 C 368 400 372 560 398 700" stroke={OL} strokeWidth={17} fill="none" />
            <path d="M 364 240 C 368 400 372 560 398 700" stroke="#e9a59a" strokeWidth={12} fill="none" />
            {/* trachea */}
            <rect x={349} y={220} width={22} height={185} rx={9} fill="#f2d6d0" stroke={OL} strokeWidth={3} />
            {new Array(9).fill(0).map((_, i) => <line key={i} x1={351} x2={369} y1={234 + i * 19} y2={234 + i * 19} stroke="#c9a49b" strokeWidth={3} />)}
            {lungLayer}
            {/* heart */}
            <g transform={`translate(392 592) scale(${heartS}) translate(-392 -592)`}>
              <path d="M 368 548 C 340 542 326 580 340 612 C 354 646 392 666 410 672 C 430 650 452 612 446 576 C 440 546 410 538 396 553 C 386 541 376 542 368 548 Z" fill="url(#heart)" stroke={OL} strokeWidth={3.5} />
              <path d="M 395 553 C 398 590 405 630 410 670" stroke="#7a1414" strokeWidth={2.5} fill="none" />
              <path d="M 372 560 C 385 580 395 600 400 640" stroke="#3a5fd0" strokeWidth={2.5} fill="none" />
              <path d="M 420 560 C 425 590 422 620 415 650" stroke="#f0c040" strokeWidth={2.5} fill="none" />
              <ellipse cx={360} cy={575} rx={9} ry={15} fill="#fff" opacity={0.35} transform="rotate(25 360 575)" />
            </g>
            {/* diaphragm */}
            <g transform={`translate(0 ${-breath * 120})`}>
              <path d="M 196 662 Q 275 606 360 656 Q 445 606 524 662 L 524 684 Q 445 628 360 680 Q 275 628 196 684 Z" fill="#b84a3a" stroke={OL} strokeWidth={3} />
              <path d="M 210 668 Q 275 622 350 660 M 370 660 Q 445 622 512 668" stroke="#e07a62" strokeWidth={2} fill="none" />
            </g>
            {/* liver */}
            <path d="M 196 692 C 232 672 334 668 402 690 C 422 700 414 722 388 738 C 332 772 270 800 226 802 C 196 792 186 742 196 692 Z" fill="url(#liver)" stroke={OL} strokeWidth={3.5} />
            <path d="M 300 690 Q 310 740 290 790" stroke="#5a1d14" strokeWidth={2} fill="none" />
            <ellipse cx={248} cy={712} rx={30} ry={10} fill="#fff" opacity={0.18} />
            {/* gallbladder */}
            <ellipse cx={305} cy={790} rx={13} ry={22} fill="#5cb83a" stroke={OL} strokeWidth={3} transform="rotate(25 305 790)" />
            {/* spleen */}
            <ellipse cx={515} cy={765} rx={17} ry={40} fill="#8a3a7a" stroke={OL} strokeWidth={3} transform="rotate(18 515 765)" />
            {/* stomach */}
            <path d="M 392 700 C 418 678 476 680 502 706 C 530 738 520 792 484 816 C 448 840 398 836 376 814 C 392 798 420 798 440 788 C 462 774 462 744 442 732 C 422 724 402 724 392 700 Z" fill="url(#stom)" stroke={OL} strokeWidth={3.5} />
            <path d="M 410 704 Q 470 700 494 740 M 420 716 Q 466 718 484 760" stroke="#c96a50" strokeWidth={2} fill="none" />
            <ellipse cx={448} cy={705} rx={18} ry={7} fill="#fff" opacity={0.35} />
            {/* pancreas */}
            <path d="M 322 832 C 362 816 432 822 498 808 C 510 816 506 832 494 836 C 440 846 382 852 332 852 C 316 848 312 838 322 832 Z" fill="#f2b648" stroke={OL} strokeWidth={3} />
            {new Array(12).fill(0).map((_, i) => <circle key={i} cx={335 + i * 14} cy={838 - i * 1.2} r={3} fill="#d99a2a" />)}
            {/* large intestine */}
            <path d="M 255 1015 L 250 905 Q 250 866 292 866 L 434 866 Q 476 866 478 905 L 482 1015" stroke={OL} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 255 1015 L 250 905 Q 250 866 292 866 L 434 866 Q 476 866 478 905 L 482 1015" stroke="#e48a6a" strokeWidth={33} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 255 1015 L 250 905 Q 250 866 292 866 L 434 866 Q 476 866 478 905 L 482 1015" stroke="#b9583f" strokeWidth={33} fill="none" strokeDasharray="3 15" />
            <path d="M 248 1010 L 243 905 Q 243 860 292 858 L 434 858" stroke="#fff" strokeWidth={4} fill="none" opacity={0.3} />
            {/* small intestine */}
            <path d={smallIntestine} stroke={OL} strokeWidth={19} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <path d={smallIntestine} stroke="#f0a58a" strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <path d={smallIntestine} stroke="#fff" strokeWidth={3} fill="none" opacity={0.3} transform="translate(-2 -3)" />
            {/* pelvis */}
            {[-1, 1].map((sd) => (
              <g key={sd} transform={sd > 0 ? 'scale(-1 1) translate(-720 0)' : undefined}>
                <path d="M 352 1035 C 300 995 228 985 194 1015 C 178 1058 196 1110 238 1132 C 268 1146 288 1168 298 1200 L 336 1192 C 334 1140 344 1095 352 1035 Z" fill={bone} stroke={OL} strokeWidth={3.5} />
                <ellipse cx={300} cy={1150} rx={14} ry={22} fill="#b8483a" stroke={OL} strokeWidth={2.5} />
                <path d="M 215 1030 Q 260 1010 330 1040" stroke="#d8c49a" strokeWidth={3} fill="none" />
              </g>
            ))}
            <path d="M 338 1030 L 382 1030 L 372 1110 L 348 1110 Z" fill={bone} stroke={OL} strokeWidth={3} />
            {/* bladder */}
            <circle cx={360} cy={1075} r={36} fill="url(#blad)" stroke={OL} strokeWidth={3.5} />
            <ellipse cx={348} cy={1060} rx={12} ry={7} fill="#fff" opacity={0.45} />
            {/* ribs */}
            {ribsY.map((y, i) => (
              <g key={i} fill="none" strokeLinecap="round" opacity={0.62}>
                {[-1, 1].map((sd) => {
                  const pth = `M ${360 + sd * 14} ${y} C ${360 + sd * 70} ${y - 30} ${360 + sd * 165} ${y - 12} ${360 + sd * (172 - i * 1.5)} ${y + 42} C ${360 + sd * (168 - i)} ${y + 70} ${360 + sd * (150 - i * 3)} ${y + 80} ${360 + sd * (128 - i * 4)} ${y + 82}`;
                  return (
                    <g key={sd}>
                      <path d={pth} stroke={OL} strokeWidth={12 - i * 0.5} />
                      <path d={pth} stroke={bone} strokeWidth={8 - i * 0.4} />
                    </g>
                  );
                })}
              </g>
            ))}
            <path d="M 352 345 L 368 345 L 366 600 L 354 600 Z" fill={bone} stroke={OL} strokeWidth={2.5} opacity={0.9} />
          </g>
          {/* clavicles + neck */}
          <path d="M 320 236 L 320 300 L 400 300 L 400 236 Z" fill="url(#skin)" stroke={OL} strokeWidth={4} />
          <path d="M 330 285 L 330 305 M 390 285 L 390 305" stroke={skinSh} strokeWidth={3} />
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <path d={`M ${360 + sd * 20} 318 Q ${360 + sd * 90} 300 ${360 + sd * 170} 330`} stroke={OL} strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d={`M ${360 + sd * 20} 318 Q ${360 + sd * 90} 300 ${360 + sd * 170} 330`} stroke={bone} strokeWidth={9} fill="none" strokeLinecap="round" />
            </g>
          ))}
          {smoke.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#d6d6d6" opacity={p.o * (ending ? 0 : 1)} filter="url(#b6)" />)}

          {/* head */}
          <ellipse cx={360} cy={152} rx={80} ry={94} fill="url(#skin)" stroke={OL} strokeWidth={4.5} />
          <ellipse cx={282} cy={160} rx={10} ry={18} fill={skinSh} stroke={OL} strokeWidth={3} />
          <ellipse cx={438} cy={160} rx={10} ry={18} fill={skinSh} stroke={OL} strokeWidth={3} />
          <path d="M 280 150 C 270 80 320 50 362 52 C 410 52 452 82 440 152 C 430 118 410 100 380 98 C 350 104 320 92 300 110 C 290 122 284 136 280 150 Z" fill="#7a4526" stroke={OL} strokeWidth={4} />
          <path d="M 300 110 Q 330 92 360 100 M 380 98 Q 410 96 430 120" stroke="#9c6038" strokeWidth={3} fill="none" />
          <path d="M 282 140 Q 276 180 290 200" stroke="#7a4526" strokeWidth={6} fill="none" strokeLinecap="round" />
          {[-1, 1].map((e) => (
            <g key={e}>
              <ellipse cx={360 + e * 30} cy={158} rx={21} ry={19} fill="#5a3a3a" opacity={0.1 + d * 0.55} />
              <ellipse cx={360 + e * 30} cy={152} rx={16} ry={16} fill={sclera} stroke={OL} strokeWidth={2.5} />
              <circle cx={360 + e * 29} cy={153} r={9} fill="#3a7bb0" /><circle cx={360 + e * 29} cy={153} r={4.5} fill="#111" />
              <circle cx={360 + e * 26} cy={149} r={2.6} fill="#fff" />
              <path d={`M ${360 + e * 14} ${132 - d * 2} Q ${360 + e * 30} ${126 + (e > 0 ? 0 : 0)} ${360 + e * 46} ${130 + d * 8}`} stroke="#5a3218" strokeWidth={4.5} fill="none" strokeLinecap="round" />
              {d > 0.35 && <path d={`M ${360 + e * 18} 155 l ${e * 6} -3 M ${360 + e * 42} 156 l ${-e * 6} -2`} stroke="#d4384a" strokeWidth={1.4} opacity={d} />}
              <ellipse cx={360 + e * 45} cy={182} rx={10} ry={5} fill="#ff8a8a" opacity={0.35 * (1 - d)} />
            </g>
          ))}
          <path d="M 356 165 Q 362 182 352 186 Q 360 190 368 186" stroke={skinSh} strokeWidth={3} fill="none" strokeLinecap="round" />
          <ellipse cx={360} cy={210} rx={coughing ? 22 : 16} ry={mouthOpen / 2 + 2} fill="#5a1a1a" stroke={OL} strokeWidth={2.5} />
          {/* cigarette */}
          {!ending && !coughing && (
            <g transform="rotate(10 372 210)">
              <rect x={368} y={205} width={84} height={11} rx={3} fill="#f7f4ee" stroke={OL} strokeWidth={2} />
              <rect x={368} y={205} width={24} height={11} rx={3} fill="#e0a052" stroke={OL} strokeWidth={2} />
              <rect x={446} y={205} width={7} height={11} fill="#ff5a1f" filter="url(#glow)" opacity={0.8 + 0.2 * Math.sin(s * 9)} />
              {[0, 1, 2].map((w) => { const p = (s * 0.6 + w / 3) % 1; return <circle key={w} cx={455 + Math.sin(p * 9 + w) * 10} cy={203 - p * 130} r={5 + p * 16} fill="#e6e6e6" opacity={0.5 * (1 - p)} filter="url(#b6)" />; })}
            </g>
          )}
          {/* labels */}
          {st.pills.map((p, i) => <Pill key={i} {...p} k={interpolate(pillK, [i * 0.2, Math.min(1, i * 0.2 + 0.8)], [0, 1], clamp)} />)}
        </svg>
      </AbsoluteFill>

      {/* cilia inset */}
      {si === 0 && ls > 0.35 && (
        <div style={{position: 'absolute', right: 22, top: 340, width: 210, height: 210, borderRadius: 105, overflow: 'hidden', border: '6px solid white', boxShadow: '0 12px 30px rgba(0,0,0,0.35)', transform: `scale(${interpolate(ls, [0.35, 0.6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))})})`}}>
          <svg width={210} height={210}>
            <rect width={210} height={210} fill="#f7b8c4" />
            <rect y={140} width={210} height={70} fill="#d9506e" />
            {new Array(8).fill(0).map((_, i) => <ellipse key={i} cx={13 + i * 26} cy={172} rx={11} ry={20} fill="#e8758f" stroke="#a83a55" strokeWidth={2} />)}
            {new Array(15).fill(0).map((_, i) => {
              const stop = interpolate(ls, [0.9, 1.5], [1, 0], clamp);
              const sw = Math.sin(s * 14 + i * 0.6) * 22 * stop + (1 - stop) * 28 * (random(`c${i}`) - 0.3);
              return <path key={i} d={`M ${12 + i * 13} 142 Q ${12 + i * 13 + sw / 2} 104 ${12 + i * 13 + sw} 66`} stroke={interpolateColors(1 - stop, [0, 1], ['#fff0f3', '#8b7a74'])} strokeWidth={5} strokeLinecap="round" fill="none" />;
            })}
            {ls > 1.0 && new Array(9).fill(0).map((_, i) => <circle key={i} cx={18 + i * 22} cy={50 + (i % 3) * 18} r={7} fill="#3a2a20" opacity={interpolate(ls, [1, 1.4], [0, 0.85], clamp)} />)}
          </svg>
          <div style={{position: 'absolute', bottom: 8, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 20, color: 'white', WebkitTextStroke: '1px #000'}}>CILIOS</div>
        </div>
      )}

      {/* counter */}
      {!ending && (
        <div style={{position: 'absolute', top: 60, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <div style={{background: 'rgba(10,14,20,0.7)', border: '2px solid rgba(255,255,255,0.25)', borderRadius: 40, padding: '12px 26px', display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={60} height={16}><rect width={60} height={16} rx={3} fill="#f7f4ee" /><rect width={18} height={16} rx={3} fill="#e0a052" /><rect x={54} width={6} height={16} fill="#ff5a1f" /></svg>
            <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: 'white'}}>{cigs.toLocaleString('es-ES')}</span>
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#ddd'}}>cigarrillos</span>
          </div>
        </div>
      )}

      {!ending && (
        <>
          <div style={{position: 'absolute', top: 860, width: '100%', transform: `scale(${labelPop})`}}>
            <Stroke size={100} color="#5ef07a" stroke="#0d3b17">{st.label}</Stroke>
          </div>
          <div style={{position: 'absolute', top: 990, width: '100%', transform: `scale(${capPop})`}}>
            <Stroke size={52} color="#ffffff" stroke="#000000">{st.cap[ci]}</Stroke>
          </div>
        </>
      )}

      {ending && (
        <AbsoluteFill style={{background: `rgba(0,0,0,${interpolate(s, [END_T, END_T + 0.3], [0, 0.55], clamp)})`, justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `scale(${interpolate(s, [END_T, END_T + 0.22], [0.4, 1], {...clamp, easing: Easing.out(Easing.back(3))})})`}}>
            <Stroke size={88} color="#5ef07a" stroke="#0d3b17">¿Y si<br />lo dejas?</Stroke>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
      <AbsoluteFill style={{background: `radial-gradient(circle, transparent 55%, rgba(0,0,0,${0.3 + d * 0.25}))`}} />
    </AbsoluteFill>
  );
};
