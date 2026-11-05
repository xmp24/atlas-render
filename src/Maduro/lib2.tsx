// V2: piezas con el estilo del motor de guerra del canal
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {MAINCOL, DARKCOL} from '../HexWorld';
import {PolyCanvas, CEv} from '../PolyWorld';
import {soldier, banner} from '../WarLayer';
import {INK, font} from '../lib3';
import JI from '../hw/indo2d.json';
import {Char} from './chars';
import {W, H, K, rnd, ip, pop, Ico} from './lib';

export const US = K('US'), VE = K('VE');
// ---------- pelotón para la capa de guerra ----------
export const sq = (a: number, pts: [number, number][], t0: number, t1: number, n = 5, extra: any = {}) => {
  const p: number[] = []; const cl: number[] = [0];
  pts.forEach(([x, y], i) => { p.push(x, y); if (i) cl.push(cl[i - 1] + Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1])); });
  return {a, p, cl, pk: [[t0, 0], [t1, cl[cl.length - 1]]], r: 30, n, t0: t0 - 0.3, t1: (extra.t_end ?? t1 + 2), ...extra};
};
const EMPTY = {occ: [], sq: [], df: [], fx: [], cities: [], ext: {crater: [], seas: [], smoke: [], arty: [], bombs: [], caphp: [], flags: [], missiles: [], para: [], flak: [], jets: []}};
export const war = (w: any) => ({...EMPTY, ...w, ext: {...EMPTY.ext, ...(w.ext || {})}});

// ---------- mapa con capa de guerra + fichas de barcos y helicópteros ----------
export type Token = {x: number; y: number; k: number; icon: string; size?: number; label?: string; trail?: [number, number]};
export const WarMap: React.FC<{t: number; cam: {cx: number; cy: number; s: number}; w?: any; night?: number; tokens?: Token[]; tint?: string}> = ({t, cam, w, night = 0.25, tokens = [], tint}) => {
  const sx = (x: number) => (x - cam.cx) * cam.s + W / 2, sy = (y: number) => (y - cam.cy) * cam.s + H / 2;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#123a6a'}}>
      <PolyCanvas cev={(JI as any).cev as CEv[]} t={t} tm={0} byTm={false} cam={cam} W={W} H={H} opts={{squads: false, capitalsOff: true, war: w ? war(w) : null, empire: null, waves: true} as any} />
      <AbsoluteFill style={{background: `rgba(4,10,30,${night})`}} />
      {tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'soft-light'}} />}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {tokens.map((o, i) => { const X = sx(o.x), Y = sy(o.y), r = (o.size || 26); return (
          <g key={i}>
            {o.trail && <line x1={sx(o.trail[0])} y1={sy(o.trail[1])} x2={X} y2={Y} stroke="rgba(255,255,255,0.55)" strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" />}
            <ellipse cx={X} cy={Y + r * 0.6} rx={r * 1.4} ry={r * 0.42} fill="rgba(255,255,255,0.3)" />
            <circle cx={X} cy={Y} r={r} fill={MAINCOL[o.k]} stroke={INK} strokeWidth={4} />
            <image href={staticFile('hw/icons/' + o.icon + '.svg')} x={X - r * 0.7} y={Y - r * 0.7} width={r * 1.4} height={r * 1.4} />
            {o.label && <text x={X} y={Y - r - 10} textAnchor="middle" style={{...font, fontSize: 26}} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{o.label}</text>}
          </g>); })}
      </svg>
    </AbsoluteFill>
  );
};
// interpolación de cámara por fotogramas clave [[t, cx, cy, s], ...]
export const camAt = (t: number, kf: number[][]) => {
  if (t <= kf[0][0]) return {cx: kf[0][1], cy: kf[0][2], s: kf[0][3]};
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) {
    const a = kf[i - 1], b = kf[i]; const u = (t - a[0]) / (b[0] - a[0]); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const s = Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * e);
    return {cx: a[1] + (b[1] - a[1]) * e, cy: a[2] + (b[2] - a[2]) * e, s};
  }
  const l = kf[kf.length - 1]; return {cx: l[1], cy: l[2], s: l[3]};
};

// ---------- soldados del canal en escenas cerradas (coordenadas de pantalla) ----------
export type Sol = {x: number; y: number; k: number; dir: number; pose?: number; fall?: number; phase?: number; sz?: number; flash?: boolean; flag?: boolean};
export const Soldiers: React.FC<{list: Sol[]; t: number}> = ({list, t}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; ctx.clearRect(0, 0, W, H);
    for (const s of list) {
      const sz = s.sz || 60;
      soldier(ctx, s.x, s.y, sz, MAINCOL[s.k], DARKCOL[s.k] || '#333', s.phase ?? t * 13, s.dir, s.pose ?? 0, s.fall || 0);
      if (s.flash) { ctx.fillStyle = '#ffe36b'; ctx.beginPath(); ctx.arc(s.x + s.dir * sz * 0.62, s.y - sz * 0.02, sz * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x + s.dir * sz * 0.62, s.y - sz * 0.02, sz * 0.08, 0, Math.PI * 2); ctx.fill(); }
      if (s.flag) banner(ctx, s.x + sz * 0.2, s.y - sz * 0.95, sz, s.k, t);
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} />;
};

// ---------- gradación de color por escena ----------
export const Grade: React.FC<{g: 'cold' | 'warm' | 'red' | 'teal' | 'gold' | 'night'}> = ({g}) => {
  const c = {cold: 'rgba(60,120,255,0.18)', warm: 'rgba(255,150,60,0.18)', red: 'rgba(255,40,30,0.2)', teal: 'rgba(0,200,180,0.15)', gold: 'rgba(255,200,80,0.2)', night: 'rgba(20,30,90,0.25)'}[g];
  return <AbsoluteFill style={{background: c, mixBlendMode: 'overlay', pointerEvents: 'none'}} />;
};
// barras de cine
export const Letterbox: React.FC<{a?: number}> = ({a = 1}) => (<>
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70 * a, background: '#000'}} />
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 * a, background: '#000'}} />
</>);
// ---------- cuenta atrás de días (esquina) ----------
export const DaysHUD: React.FC<{t: number; d: number; t0?: number}> = ({t, d, t0 = -1}) => {
  const sc = t0 >= 0 ? pop(t, t0, 0.3) : 1;
  return (
    <div style={{position: 'absolute', right: 50, top: 50, width: 230, transform: `scale(${sc})`, transformOrigin: '100% 0', borderRadius: 22, overflow: 'hidden', border: `6px solid ${INK}`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
      <div style={{background: '#c3100a', ...font, fontSize: 28, color: '#fff', textAlign: 'center', padding: '6px 0'}}>OPERATION IN</div>
      <div style={{background: '#f4f4f4', ...font, fontSize: 104, color: d <= 3 ? '#c3100a' : INK, textAlign: 'center', lineHeight: '120px'}}>{d}</div>
      <div style={{background: '#f4f4f4', ...font, fontSize: 30, color: INK, textAlign: 'center', paddingBottom: 6}}>{d === 1 ? 'DAY' : 'DAYS'}</div>
    </div>
  );
};

// ---------- Despacho Oval ----------
export const OvalOffice: React.FC<{t: number; children?: React.ReactNode; zoom?: number}> = ({t, children, zoom = 1}) => (
  <AbsoluteFill style={{background: '#f1ebdc', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
      {/* pared con molduras */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #efe8d6 0%, #e4dcc6 62%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, height: 120, background: '#f7f3ea', borderTop: '6px solid #d8cfb8', borderBottom: '6px solid #d8cfb8'}} />
      {/* ventanas con cortinas doradas */}
      {[560, 860, 1160].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 120, width: 200, height: 430, background: 'linear-gradient(180deg, #8ac4f0 0%, #cfe8ff 55%, #5aa04a 56%, #2f7a2a 100%)', border: '10px solid #f7f3ea', overflow: 'hidden'}}>
        {[0, 1, 2].map((tr) => <div key={'tr' + tr} style={{position: 'absolute', left: tr * 70 - 20, top: 190 + (tr % 2) * 20, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #5fae4a, #2a6a24)'}} />)}
        {[0, 1, 2].map((r) => <div key={r} style={{position: 'absolute', left: 0, right: 0, top: r * 140 + 135, height: 8, background: '#f7f3ea'}} />)}
        <div style={{position: 'absolute', left: 92, top: 0, bottom: 0, width: 8, background: '#f7f3ea'}} />
      </div>)}
      {[500, 760, 1060, 1360].map((x, i) => <div key={i} style={{position: 'absolute', left: x - 50, top: 70, width: 110, height: 510, background: 'linear-gradient(90deg, #c9a64a, #f0d77a 45%, #b8913a)', borderRadius: '0 0 30px 30px', boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.15)'}} />)}
      <div style={{position: 'absolute', left: 440, top: 50, width: 1040, height: 90, background: 'repeating-linear-gradient(90deg, #e3c766 0 130px, #f3dc86 130px 260px)', borderRadius: '0 0 60px 60px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)'}} />
      {/* banderas */}
      <div style={{position: 'absolute', left: 780, top: 230, width: 6, height: 380, background: '#c9a64a'}} />
      <div style={{position: 'absolute', left: 786, top: 240, width: 90, height: 220, background: 'repeating-linear-gradient(180deg, #c3100a 0 17px, #fff 17px 34px)', transform: `skewY(${Math.sin(t * 2) * 3}deg)`}}><div style={{width: 40, height: 100, background: '#1f3a8a'}} /></div>
      <div style={{position: 'absolute', left: 1130, top: 230, width: 6, height: 380, background: '#c9a64a'}} />
      <div style={{position: 'absolute', left: 1040, top: 240, width: 90, height: 220, background: '#1f2f6e', transform: `skewY(${-Math.sin(t * 2 + 1) * 3}deg)`}} />
      {/* cuadro */}
      <div style={{position: 'absolute', left: 140, top: 200, width: 200, height: 260, background: 'linear-gradient(135deg, #6a7aa8, #2a3a6a)', border: '14px solid #c9a64a'}} />
      {/* alfombra azul */}
      <div style={{position: 'absolute', left: -300, right: -300, top: 760, height: 700, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 30%, #1d3aa0 0%, #142a7a 60%)', border: '22px solid #efe0b0'}}>
        <div style={{position: 'absolute', left: '50%', top: 120, width: 300, height: 120, marginLeft: -150, borderRadius: '50%', border: '10px solid #e8c45a', background: '#1a3290'}} />
      </div>
      <div style={{position: 'absolute', left: W / 2 - 230, top: 870, width: 460, height: 150, borderRadius: '50%', border: '8px solid #e8c45a', background: 'radial-gradient(ellipse, #2140a8, #1a3290)'}}>
        {Array.from({length: 18}, (_, i) => { const a = (i / 18) * Math.PI * 2; return <div key={i} style={{position: 'absolute', left: 230 + Math.cos(a) * 200 - 7, top: 75 + Math.sin(a) * 60 - 7, width: 14, height: 14, background: '#fff', clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'}} />; })}
        <div style={{position: 'absolute', left: 200, top: 45, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, #ffe08a, #c9a64a)', border: '4px solid #8a6a2a'}} />
      </div>
      {[[60, 1], [1560, -1]].map(([x, d], i) => <div key={'so' + i} style={{position: 'absolute', left: x as number, top: 820, width: 300, height: 180}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, bottom: 0, borderRadius: 40, background: 'linear-gradient(180deg, #f3ead2, #d9cba8)', border: `6px solid ${INK}`}} />
        <div style={{position: 'absolute', left: 20, right: 20, top: 0, height: 80, borderRadius: 30, background: 'linear-gradient(180deg, #f8f0dc, #e3d6b6)', border: `6px solid ${INK}`}} />
      </div>)}
      {[[250, 520], [1580, 520]].map(([x, y], i) => <div key={'bu' + i} style={{position: 'absolute', left: x, top: y}}>
        <div style={{position: 'absolute', left: -10, top: 70, width: 110, height: 90, background: '#7a4a24', border: `5px solid ${INK}`, borderRadius: 8}} />
        <div style={{position: 'absolute', left: 20, top: 0, width: 50, height: 60, borderRadius: '45% 45% 30% 30%', background: 'radial-gradient(circle at 40% 30%, #8a7a62, #3a3226)', border: `4px solid ${INK}`}} />
        <div style={{position: 'absolute', left: 8, top: 52, width: 74, height: 22, borderRadius: 8, background: '#4a4032', border: `4px solid ${INK}`}} />
      </div>)}
      {[[470, 470], [1420, 470]].map(([x, y], i) => <div key={'la' + i} style={{position: 'absolute', left: x, top: y}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 80, height: 60, background: 'linear-gradient(180deg, #fff8e0, #e8d8a8)', border: `4px solid ${INK}`, clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)', boxShadow: '0 0 40px rgba(255,230,150,0.8)'}} />
        <div style={{position: 'absolute', left: 36, top: 60, width: 8, height: 120, background: '#c9a64a'}} />
        <div style={{position: 'absolute', left: -60, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,230,150,0.35), rgba(255,230,150,0))'}} />
      </div>)}
      {/* escritorio */}
      <div style={{position: 'absolute', left: 640, top: 640, width: 640, height: 220, background: 'linear-gradient(180deg, #8a5a2a, #5e3a18)', border: `8px solid ${INK}`, borderRadius: 10}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 40, bottom: 20, border: '6px solid rgba(0,0,0,0.25)'}} />
        <div style={{position: 'absolute', left: 270, top: 70, width: 100, height: 100, borderRadius: '50%', border: '6px solid rgba(255,220,140,0.6)'}} />
      </div>
      {children}
    </div>
  </AbsoluteFill>
);
// Trump en bola al teléfono: habla con saltitos
export const President: React.FC<{t: number; talk?: [number, number][]; x?: number; y?: number; s?: number; mood?: any}> = ({t, talk = [], x = 960, y = 560, s = 300, mood = 'normal'}) => {
  const talking = talk.some(([a, b]) => t > a && t < b);
  const hop = talking ? Math.abs(Math.sin(t * 16)) * 10 : 0;
  return (<>
    <div style={{position: 'absolute', left: 0, top: -hop, width: W, height: H}}><Char k={US} acc="tie" eyes={mood} t={t} s={s} x={x} y={y} label="PRESIDENT TRUMP" /></div>
    <div style={{position: 'absolute', left: x + s * 0.32, top: y - s * 0.1 - hop, width: 1, height: 1, transform: `rotate(${-20 + (talking ? Math.sin(t * 12) * 4 : 0)}deg)`}}><Ico name="phone" x={0} y={0} w={s * 0.42} c="#1d1d1d" outline /></div>
  </>);
};
// pantalla de videollamada (esquina)
export const CIARoom: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0b1630, #050a18)', overflow: 'hidden'}}>
    {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 14 + (i % 2) * 140, top: 10 + Math.floor(i / 2) * 76, width: 128, height: 68, border: '4px solid #000', borderRadius: 6, background: i === 1 ? '#0e2a1a' : '#0a1a3a', overflow: 'hidden'}}>
      {Array.from({length: 4}, (_, r) => <div key={r} style={{margin: '8px 8px 0', height: 6, width: `${30 + rnd(r + i * 5) * 60}%`, background: i === 1 ? '#3ad16a' : '#3a8aff', opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + r + i))}} />)}
    </div>)}
    <div style={{position: 'absolute', right: 20, top: 16, width: 110, height: 110, borderRadius: '50%', border: '6px solid #c9a64a', background: 'radial-gradient(circle, #1f3a8a, #0a1a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: 46, height: 46, background: '#c9a64a', clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'}} /></div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: 'linear-gradient(180deg, #3a2a1a, #1a120a)', borderTop: '5px solid #000'}} />
    <div style={{position: 'absolute', left: 280, top: 170, width: 60, height: 50, background: 'linear-gradient(180deg, #2a5a2a, #1a3a1a)', clipPath: 'polygon(25% 0, 75% 0, 100% 100%, 0 100%)', boxShadow: '0 0 30px rgba(120,255,120,0.5)'}} />
  </div>
);
export const CallScreen: React.FC<{t: number; t0: number; t1: number; children: React.ReactNode; label: string; x?: number; y?: number}> = ({t, t0, t1, children, label, x = 1420, y = 130}) => {
  if (t < t0 || t > t1) return null; const k = pop(t, t0, 0.3) * ip(t, [t1 - 0.25, t1], [1, 0], false);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 420, height: 300, transform: `scale(${k})`, transformOrigin: '50% 0', borderRadius: 18, overflow: 'hidden', border: `8px solid ${INK}`, background: '#0c1426', boxShadow: '0 16px 40px rgba(0,0,0,0.5)'}}>
      {children}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '6px 14px', background: 'rgba(0,0,0,0.6)', ...font, fontSize: 26, color: '#fff'}}>📞 {label}</div>
      <div style={{position: 'absolute', right: 12, top: 10, ...font, fontSize: 22, color: '#3ad16a'}}>● SECURE LINE</div>
    </div>
  );
};
// transición de corte a negro rápida
export const Black: React.FC<{t: number; t0: number; d?: number}> = ({t, t0, d = 0.35}) => {
  if (t < t0 - d / 2 || t > t0 + d / 2) return null; const a = 1 - Math.abs(t - t0) / (d / 2);
  return <AbsoluteFill style={{background: '#000', opacity: Math.min(1, a * 1.6)}} />;
};
// líneas de velocidad para zooms
export const SpeedLines: React.FC<{t: number; a: number}> = ({t, a}) => a <= 0 ? null : (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: a}}>
    {Array.from({length: 40}, (_, i) => { const an = (i / 40) * Math.PI * 2 + rnd(i) * 0.1; const r0 = 300 + ((t * 2000 + rnd(i + 3) * 600) % 700); return <line key={i} x1={W / 2 + Math.cos(an) * r0} y1={H / 2 + Math.sin(an) * r0} x2={W / 2 + Math.cos(an) * (r0 + 160)} y2={H / 2 + Math.sin(an) * (r0 + 160)} stroke="rgba(255,255,255,0.7)" strokeWidth={4} strokeLinecap="round" />; })}
  </svg>
);
