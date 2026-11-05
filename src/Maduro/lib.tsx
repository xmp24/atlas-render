// Piezas comunes del vídeo "How the US Captured Maduro"
import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile} from 'remotion';
import {COUNTRIES} from '../HexWorld';
import {PolyCanvas, CEv, proj} from '../PolyWorld';
import {INK, font} from '../lib3';
import JI from '../hw/indo2d.json';

export const W = 1920, H = 1080;
export const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const EZ = Easing.bezier(0.45, 0, 0.25, 1);
// interpolación suave con recorte
export const ip = (t: number, a: number[], b: number[], ease = true) => interpolate(t, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease ? EZ : undefined});
export const pop = (t: number, t0: number, d = 0.35) => { const u = Math.max(0, Math.min(1, (t - t0) / d)); return u <= 0 ? 0 : 1 + Math.sin(u * Math.PI) * 0.18 * (1 - u) - (1 - u) * (1 - u) * (u < 1 ? 1 : 0); };
export const fade = (t: number, t0: number, t1: number, d = 0.4) => Math.min(ip(t, [t0, t0 + d], [0, 1], false), ip(t, [t1 - d, t1], [1, 0], false));
export const LL = (lon: number, lat: number) => proj([lon, lat]) as [number, number];

// ---------- iconos (máscara de game-icons) ----------
export const Ico: React.FC<{name: string; x: number; y: number; w: number; c: string; rot?: number; flip?: boolean; glow?: string; op?: number; outline?: boolean}> = ({name, x, y, w, c, rot = 0, flip, glow, op = 1, outline = true}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, opacity: op, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: `${outline ? `drop-shadow(0 0 2px ${INK}) drop-shadow(0 0 2px ${INK})` : ''}${glow ? ` drop-shadow(0 0 ${w * 0.15}px ${glow})` : ''}`}}>
    <div style={{width: '100%', height: '100%', background: c, WebkitMaskImage: `url(${staticFile('hw/icons/' + name + '.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
  </div>
);

// ---------- textos ----------
export const Big: React.FC<{text: string; x?: number; y: number; size: number; col?: string; rot?: number; op?: number; sc?: number}> = ({text, x = W / 2, y, size, col = '#fff', rot = 0, op = 1, sc = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: op, transform: `translate(-50%,0) rotate(${rot}deg) scale(${sc})`, ...font, fontSize: size, color: col, WebkitTextStroke: `${size * 0.16}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.07}px 0 ${INK}, 0 0 ${size * 0.4}px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap', lineHeight: 1}}>{text}</div>
);
// subtítulo inferior con escritura progresiva
export const Caption: React.FC<{t: number; t0: number; t1: number; text: string; y?: number; size?: number; hl?: string}> = ({t, t0, t1, text, y = 900, size = 50, hl}) => {
  if (t < t0 - 0.1 || t > t1 + 0.1) return null;
  const n = Math.floor(ip(t, [t0, t0 + Math.min(1.2, text.length * 0.035)], [0, text.length], false));
  const a = fade(t, t0, t1, 0.3);
  const shown = text.slice(0, n);
  const parts = hl ? shown.split(hl) : [shown];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{padding: '14px 34px', borderRadius: 18, background: 'rgba(8,12,24,0.78)', border: '3px solid rgba(255,255,255,0.18)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', ...font, fontSize: size, color: '#fff', whiteSpace: 'nowrap', transform: `translateY(${(1 - a) * 20}px)`}}>
        {parts.map((p, i) => <React.Fragment key={i}>{p}{i < parts.length - 1 && <span style={{color: '#ffd23f'}}>{hl}</span>}</React.Fragment>)}
        <span style={{opacity: n < text.length ? 1 : 0}}>▌</span>
      </div>
    </div>
  );
};
// sello de fecha/hora tipo "operación"
export const Stamp: React.FC<{t: number; t0: number; t1: number; date: string; time?: string; place?: string}> = ({t, t0, t1, date, time, place}) => {
  if (t < t0 || t > t1) return null; const a = fade(t, t0, t1, 0.3);
  const tx = (s: string, d: number) => s.slice(0, Math.floor(ip(t, [t0 + d, t0 + d + s.length * 0.04], [0, s.length], false)));
  return (
    <div style={{position: 'absolute', left: 60, top: 54, opacity: a, ...font, color: '#fff', textShadow: '0 3px 0 rgba(0,0,0,0.7)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, color: '#ff4a3a'}}><div style={{width: 16, height: 16, borderRadius: 8, background: '#ff3b30', opacity: Math.floor(t * 2) % 2 ? 1 : 0.25, boxShadow: '0 0 12px #ff3b30'}} />{place ? tx(place, 0) : 'REC'}</div>
      <div style={{fontSize: 58, lineHeight: 1.1}}>{tx(date, 0.2)}</div>
      {time && <div style={{fontSize: 46, color: '#ffd23f'}}>{tx(time, 0.5)}</div>}
    </div>
  );
};
// bocadillo de diálogo
export const Bubble: React.FC<{t: number; t0: number; t1: number; x: number; y: number; text: string; size?: number; tail?: 'l' | 'r' | 'c'}> = ({t, t0, t1, x, y, text, size = 40, tail = 'c'}) => {
  if (t < t0 || t > t1) return null; const s = pop(t, t0, 0.3) * ip(t, [t1 - 0.25, t1], [1, 0], false);
  const n = Math.floor(ip(t, [t0 + 0.1, t0 + 0.1 + text.length * 0.03], [0, text.length], false));
  const tx = tail === 'l' ? '22%' : tail === 'r' ? '78%' : '50%';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: `${tx} 100%`}}>
      <div style={{position: 'relative', padding: '16px 26px', borderRadius: 26, background: '#fff', border: `5px solid ${INK}`, ...font, fontSize: size, color: INK, whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>
        {text.slice(0, n)}<span style={{opacity: 0}}>{text.slice(n)}</span>
        <div style={{position: 'absolute', left: tx, bottom: -26, width: 34, height: 30, transform: 'translateX(-50%)', background: '#fff', clipPath: 'polygon(0 0,100% 0,50% 100%)'}} />
      </div>
    </div>
  );
};
// tarjeta de título de capítulo
export const Chapter: React.FC<{t: number; t0: number; t1: number; top: string; main: string}> = ({t, t0, t1, top, main}) => {
  if (t < t0 || t > t1) return null; const a = fade(t, t0, t1, 0.35); const sl = ip(t, [t0, t0 + 0.5], [-60, 0]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: a, background: `rgba(0,0,0,${0.45 * a})`}}>
      <div style={{transform: `translateX(${sl}px)`, textAlign: 'center'}}>
        <div style={{...font, fontSize: 44, color: '#ffd23f', letterSpacing: 6, textShadow: '0 4px 0 #000'}}>{top}</div>
        <div style={{...font, fontSize: 120, color: '#fff', WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 9px 0 #000', lineHeight: 1}}>{main}</div>
        <div style={{height: 8, width: ip(t, [t0 + 0.2, t0 + 0.9], [0, 700]), margin: '18px auto 0', background: '#ff3b30', borderRadius: 4, boxShadow: '0 0 20px #ff3b30'}} />
      </div>
    </AbsoluteFill>
  );
};
// contador animado
export const Counter: React.FC<{t: number; t0: number; to: number; x: number; y: number; label: string; icon?: string; suffix?: string; d?: number; col?: string}> = ({t, t0, to, x, y, label, icon, suffix = '', d = 1.2, col = '#ffd23f'}) => {
  if (t < t0) return null; const v = Math.round(ip(t, [t0, t0 + d], [0, to])); const s = pop(t, t0, 0.3);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 16, padding: '10px 22px 10px 14px', borderRadius: 16, background: 'rgba(8,12,24,0.8)', border: '3px solid rgba(255,255,255,0.2)'}}>
      {icon && <div style={{position: 'relative', width: 60, height: 60}}><Ico name={icon} x={30} y={30} w={56} c="#e8eef8" /></div>}
      <div><div style={{...font, fontSize: 56, color: col, lineHeight: 1}}>{v.toLocaleString('en-US')}{suffix}</div><div style={{...font, fontSize: 24, color: '#cfd8e8'}}>{label}</div></div>
    </div>
  );
};

// ---------- escenario ----------
export const NightSky: React.FC<{glow?: string}> = ({glow = '#1b2a5a'}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 100%, ${glow} 0%, #0b1230 45%, #04060f 100%)`}}>
    {Array.from({length: 90}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * W, top: rnd(i + 99) * H * 0.7, width: 2 + rnd(i + 5) * 2, height: 2 + rnd(i + 5) * 2, borderRadius: 2, background: '#fff', opacity: 0.25 + rnd(i + 7) * 0.6}} />)}
  </AbsoluteFill>
);
export const Moon: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #fffbe8, #e8e0c0 70%)', boxShadow: `0 0 ${r}px rgba(255,250,220,0.5)`}} />;
// mar animado (vista lateral)
export const Sea: React.FC<{t: number; y: number; speed?: number; col?: string}> = ({t, y, speed = 300, col = '#0d2a52'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: `linear-gradient(180deg, ${col} 0%, #061630 100%)`, overflow: 'hidden'}}>
    {Array.from({length: 7}, (_, r) => (
      <div key={r} style={{position: 'absolute', left: -200, top: 14 + r * r * 9, width: W + 400, height: 6, opacity: 0.18 + r * 0.05, transform: `translateX(${-((t * speed * (0.5 + r * 0.25)) % 200)}px)`, background: `repeating-linear-gradient(90deg, rgba(160,210,255,0.7) 0 ${40 + r * 10}px, transparent ${40 + r * 10}px 200px)`}} />
    ))}
  </div>
);
// silueta nocturna de Caracas con el Ávila detrás
export const Caracas: React.FC<{y?: number; lights?: number; scale?: number}> = ({y = 640, lights = 1, scale = 1}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '50% 100%'}}>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M0,${y} L180,${y - 170} L330,${y - 120} L520,${y - 260} L700,${y - 180} L900,${y - 300} L1120,${y - 200} L1300,${y - 280} L1500,${y - 160} L1700,${y - 230} L1920,${y - 110} L1920,${H} L0,${H} Z`} fill="#0e1a2e" />
      <path d={`M0,${y + 40} L260,${y - 40} L480,${y + 10} L760,${y - 70} L1000,${y} L1260,${y - 60} L1560,${y + 10} L1920,${y - 30} L1920,${H} L0,${H} Z`} fill="#13223a" />
    </svg>
    {Array.from({length: 46}, (_, i) => { const bw = 40 + rnd(i) * 70, bh = 60 + rnd(i + 3) * 240, bx = i * 42 - 20; return (
      <div key={i} style={{position: 'absolute', left: bx, top: y + 160 - bh, width: bw, height: bh + 400, background: i % 3 ? '#0a1424' : '#0d182b', borderTop: '2px solid #1e2c46'}}>
        {Array.from({length: Math.floor(bh / 26)}, (_, r) => Array.from({length: Math.floor(bw / 18)}, (_, c) => rnd(i * 50 + r * 7 + c) < 0.33 * lights ? <div key={r + '-' + c} style={{position: 'absolute', left: 6 + c * 18, top: 10 + r * 26, width: 8, height: 12, background: rnd(i + r + c) < 0.5 ? '#ffd98a' : '#fff1c4', opacity: 0.8, boxShadow: '0 0 8px #ffcf6a'}} /> : null))}
      </div>); })}
  </div>
);
// helicóptero lateral (estilo Black Hawk), rotor animado y luces
export const Heli: React.FC<{x: number; y: number; w: number; t: number; flip?: boolean; tilt?: number; dark?: boolean; hit?: number}> = ({x, y, w, t, flip, tilt = 6, dark, hit = 0}) => {
  const s = w / 220; const blade = Math.abs(Math.sin(t * 40));
  const body = dark ? '#121820' : '#2b3424';
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.2, width: w, height: w * 0.4, transform: `scaleX(${flip ? -1 : 1}) rotate(${tilt}deg)`}}>
      <svg viewBox="0 0 220 88" width={w} height={w * 0.4} style={{overflow: 'visible', filter: `drop-shadow(0 ${4 * s}px ${4 * s}px rgba(0,0,0,0.6))`}}>
        <ellipse cx={100} cy={14} rx={98 * (0.35 + blade * 0.65)} ry={3.5} fill="rgba(200,210,220,0.55)" />
        <ellipse cx={100} cy={14} rx={98} ry={6} fill="rgba(200,210,220,0.12)" />
        <rect x={96} y={14} width={8} height={10} fill={INK} />
        <path d="M30,44 Q34,24 66,22 L118,22 Q138,22 150,34 L198,38 L204,26 L214,26 L212,46 L150,48 Q140,62 110,62 L54,62 Q32,60 30,44 Z" fill={body} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d="M38,40 Q42,28 62,27 L64,42 Z" fill="#9fd4ff" stroke={INK} strokeWidth={2} opacity={0.9} />
        <rect x={74} y={30} width={22} height={16} rx={3} fill="#0a0e14" stroke={INK} strokeWidth={2} />
        <path d="M56,62 L52,72 M120,62 L124,72 M40,74 L140,74" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <circle cx={209} cy={30} r={10 * (0.4 + blade * 0.6)} fill="rgba(200,210,220,0.45)" />
        <circle cx={150} cy={34} r={2.5} fill={Math.floor(t * 3) % 2 ? '#ff3b30' : '#5a1010'} />
        <circle cx={212} cy={44} r={2.5} fill={Math.floor(t * 3 + 1) % 2 ? '#3aff6a' : '#103a1a'} />
        {hit > 0 && <g opacity={hit}><circle cx={170} cy={40} r={18} fill="#ffb030" opacity={0.6} /><circle cx={170} cy={40} r={8} fill="#fff6c0" /></g>}
      </svg>
    </div>
  );
};
// helicóptero visto desde arriba (para el asalto)
export const HeliTop: React.FC<{x: number; y: number; w: number; t: number; rot?: number}> = ({x, y, w, t, rot = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${rot}deg)`}}>
    <svg viewBox="0 0 100 100" width={w} height={w} style={{overflow: 'visible', filter: 'drop-shadow(4px 8px 6px rgba(0,0,0,0.6))'}}>
      <rect x={47} y={50} width={6} height={42} fill="#232b1e" stroke={INK} strokeWidth={1.5} />
      <ellipse cx={50} cy={42} rx={13} ry={22} fill="#2b3424" stroke={INK} strokeWidth={2} />
      <ellipse cx={50} cy={28} rx={8} ry={6} fill="#9fd4ff" opacity={0.8} />
      <circle cx={50} cy={40} r={46} fill="rgba(200,210,220,0.18)" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={50} y1={40} x2={50 + 46 * Math.cos(t * 30 + (i * Math.PI) / 2)} y2={40 + 46 * Math.sin(t * 30 + (i * Math.PI) / 2)} stroke="rgba(30,30,30,0.5)" strokeWidth={3} />)}
    </svg>
  </div>
);
// mapa del mundo (banderas) con cámara y oscurecido de noche
export const MapCam: React.FC<{cx: number; cy: number; s: number; night?: number; blur?: number}> = ({cx, cy, s, night = 0.35, blur = 0}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#123a6a'}}>
    <div style={{position: 'absolute', inset: 0, filter: blur ? `blur(${blur}px)` : undefined}}>
      <PolyCanvas cev={(JI as any).cev as CEv[]} t={0} tm={0} byTm={false} cam={{cx, cy, s}} W={W} H={H} opts={{squads: false, capitalsOff: true, war: null, empire: null, waves: true} as any} />
    </div>
    <AbsoluteFill style={{background: `rgba(4,10,30,${night})`}} />
  </AbsoluteFill>
);
// punto pulsante en el mapa
export const Pin: React.FC<{x: number; y: number; t: number; col?: string; label?: string; size?: number}> = ({x, y, t, col = '#ff3b30', label, size = 22}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    <div style={{position: 'absolute', left: -size * 2, top: -size * 2, width: size * 4, height: size * 4, borderRadius: '50%', border: `4px solid ${col}`, opacity: 1 - ((t * 1.2) % 1), transform: `scale(${0.3 + ((t * 1.2) % 1) * 0.9})`}} />
    <div style={{position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size, borderRadius: '50%', background: col, border: `4px solid ${INK}`, boxShadow: `0 0 18px ${col}`}} />
    {label && <div style={{position: 'absolute', left: size, top: -size * 1.6, ...font, fontSize: 34, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{label}</div>}
  </div>
);
// línea animada entre dos puntos (ruta / señal), con punto de cabeza
export const Route: React.FC<{a: [number, number]; b: [number, number]; p: number; col?: string; bend?: number; w?: number; head?: boolean}> = ({a, b, p, col = '#ffd23f', bend = 0.25, w = 6, head = true}) => {
  if (p <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * bend;
  const d = `M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`; const q = Math.min(1, p);
  const hx = (1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * mx + q * q * b[0], hy = (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * my + q * q * b[1];
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={d} pathLength={1} fill="none" stroke={col} strokeWidth={w * 3.5} opacity={0.22} strokeDasharray={`${q} 1`} strokeLinecap="round" />
      <path d={d} pathLength={1} fill="none" stroke={INK} strokeWidth={w + 4} strokeDasharray={`${q} 1`} strokeLinecap="round" />
      <path d={d} pathLength={1} fill="none" stroke={col} strokeWidth={w} strokeDasharray={`${q} 1`} strokeLinecap="round" />
      {head && q < 1 && <circle cx={hx} cy={hy} r={w * 1.6} fill="#fff" stroke={col} strokeWidth={w * 0.8} />}
    </svg>
  );
};
export const Vignette: React.FC<{a?: number}> = ({a = 0.55}) => <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${a}) 100%)`, pointerEvents: 'none'}} />;
export const Flash: React.FC<{t: number; t0: number; d?: number; col?: string}> = ({t, t0, d = 0.35, col = '#fff'}) => { const a = t >= t0 && t < t0 + d ? 1 - (t - t0) / d : 0; return a > 0 ? <AbsoluteFill style={{background: col, opacity: a * 0.85}} /> : null; };
export const Boom: React.FC<{x: number; y: number; r: number; t: number; t0: number; d?: number}> = ({x, y, r, t, t0, d = 1.1}) => {
  if (t < t0 || t > t0 + d) return null; const u = (t - t0) / d; const rr = r * (0.3 + Math.sqrt(u) * 0.9);
  return (<>
    <div style={{position: 'absolute', left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', opacity: 1 - u, background: 'radial-gradient(circle, #fffbe0 0%, #ffe14a 20%, #ff8a1a 45%, #ff3d1f 62%, rgba(120,20,10,0) 72%)'}} />
    <div style={{position: 'absolute', left: x - rr * 1.4, top: y - rr * 1.6 - u * 40, width: rr * 2.8, height: rr * 2.8, borderRadius: '50%', opacity: u * (1 - u) * 1.6, background: 'radial-gradient(circle, rgba(60,50,50,0.7) 0%, rgba(60,50,50,0) 70%)'}} />
  </>);
};
