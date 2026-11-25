import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {EMB, Flag, FL} from './flags';
import D1 from './data/gg_id.json';
import D2 from './data/gg_in.json';
import D3 from './data/gg_as.json';
import D4 from './data/grew.json';
import D5 from './data/then_a.json';
import D6 from './data/then_b.json';
import D7 from './data/ctl_in.json';
import D8 from './data/ctl_id.json';
import D9 from './data/ctl_us.json';

export const SH: Record<string, any> = {gg_id: D1, gg_in: D2, gg_as: D3, grew: D4, then_a: D5, then_b: D6, ctl_in: D7, ctl_id: D8, ctl_us: D9};
export const shFrames = (v: string) => Math.round(SH[v].dur * 60);

const W = 1080, H = 1920;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eIn = (x: number) => Math.pow(clamp(x), 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---- fuente ----
let fontReady = false;
const useFont = () => {
  const [h] = useState(() => (fontReady ? null : delayRender('font')));
  useEffect(() => {
    if (fontReady || h === null) return;
    const ff = new FontFace('ShortsFont', `url(${staticFile('sh/font.otf')})`);
    ff.load().then((f) => { (document as any).fonts.add(f); fontReady = true; continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

// ---- cámara de una escena ----
const camAt = (keys: number[][], t: number) => {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, ...a] = keys[i], [t1, ...b] = keys[i + 1];
    if (t <= t1) { const k = ease(clamp((t - t0) / (t1 - t0))); return a.map((v, j) => lerp(v, b[j], j === 2 ? k : k)); }
  }
  return keys[keys.length - 1].slice(1);
};

// desplazamiento de barrido en los cortes (whip pan)
const whipOff = (sc: any, t: number) => {
  let ox = 0, oy = 0, blur = 0;
  if (sc.wo && t > sc.t1 - 0.14) { const k = eIn((t - (sc.t1 - 0.14)) / 0.14); ox += sc.wo[0] * 650 * k; oy += sc.wo[1] * 650 * k; blur = 34 * k; }
  if (sc.wi && t < sc.t0 + 0.2) { const k = 1 - eOut((t - sc.t0) / 0.2); ox -= sc.wi[0] * 650 * k; oy -= sc.wi[1] * 650 * k; blur = Math.max(blur, 34 * k); }
  return {ox, oy, blur, dir: sc.wo && t > sc.t1 - 0.14 ? sc.wo : sc.wi || [1, 0]};
};

// ---- una capa de región ----
const Layer: React.FC<{L: any; t: number; id: string; sc: any}> = ({L, t, id, sc}) => {
  if (t < L.t0 || (L.t1 !== undefined && t > L.t1 + 0.12)) return null;
  const k = clamp((t - L.t0) / (L.ad || 0.35));
  const out = L.t1 !== undefined ? clamp(1 - (t - L.t1) / 0.12) : 1;
  const [bx, by, bw, bh] = L.bb;
  let op = out * (L.op ?? 1), mask: React.ReactNode = null, scl = 1;
  if (L.a === 'pop') { op *= clamp(k * 2.2); scl = 1 + 0.06 * (1 - eOut(k)); }
  if (L.a === 'fade') op *= eOut(k);
  if (L.a === 'reveal' || L.a === 'reveal2') {
    const R = (L.R || Math.hypot(bw, bh)) * (L.a === 'reveal2' ? eOut(k) : ease(k)) * 1.05;
    mask = (
      <mask id={id + 'm'} maskUnits="userSpaceOnUse" x={bx - 50} y={by - 50} width={bw + 100} height={bh + 100}>
        <radialGradient id={id + 'g'} gradientUnits="userSpaceOnUse" cx={L.o[0]} cy={L.o[1]} r={Math.max(R, 1)}>
          <stop offset="0.86" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <rect x={bx - 50} y={by - 50} width={bw + 100} height={bh + 100} fill={`url(#${id}g)`} />
      </mask>
    );
  }
  if (L.a === 'wipe') {
    const yy = by + bh * (1 - ease(k));
    mask = (<mask id={id + 'm'} maskUnits="userSpaceOnUse"><rect x={bx - 50} y={yy} width={bw + 100} height={bh + 100} fill="#fff" /></mask>);
  }
  const white = L.wt != null ? clamp((t - L.wt) / 0.25) : 0;
  const cx = bx + bw / 2, cy = by + bh / 2;
  const fs = typeof L.f === 'string' ? (FL[L.f] || {img: L.f}) : L.f;
  return (
    <g opacity={op} mask={mask ? `url(#${id}m)` : undefined} transform={scl !== 1 ? `translate(${cx} ${cy}) scale(${scl}) translate(${-cx} ${-cy})` : undefined}>
      {mask}
      <clipPath id={id + 'c'}><path d={L.d} /></clipPath>
      {L.sh !== 0 && <path d={L.d} fill="#000" opacity={0.45} transform={`translate(${sc.z0 * 0 + 3} 5)`} filter={`url(#${sc.id}sh)`} />}
      <g clipPath={`url(#${id}c)`}>
        {L.fill ? <rect x={bx} y={by} width={bw} height={bh} fill={L.fill} /> : (
          <g transform={`translate(${bx} ${by})`}><Flag f={fs} w={bw} h={bh} /></g>
        )}
        {white > 0 && <rect x={bx} y={by} width={bw} height={bh} fill="#f4f4f2" opacity={white} />}
        <image href={staticFile(sc.bg)} x={0} y={0} width={sc.bw} height={sc.bh} opacity={0.22} style={{mixBlendMode: 'multiply'}} />
        <rect x={bx} y={by} width={bw} height={bh} fill={`url(#${sc.id}crack)`} opacity={0.55} />
        <rect x={bx} y={by} width={bw} height={bh} fill={`url(#${sc.id}shade)`} />
      </g>
      {L.stroke && <path d={L.d} fill="none" stroke={L.stroke} strokeWidth={(L.sw || 2.5) / sc.zz} strokeLinejoin="round" />}
    </g>
  );
};

const Outline: React.FC<{L: any; t: number; sc: any}> = ({L, t, sc}) => {
  if (t < L.t0 || (L.t1 !== undefined && t > L.t1)) return null;
  const op = clamp((t - L.t0) / 0.25);
  return <path d={L.d} fill="none" stroke={L.stroke || '#fff'} strokeWidth={(L.sw || 3) / sc.zz} strokeOpacity={op * (L.op ?? 0.9)} strokeLinejoin="round" />;
};

const Emblem: React.FC<{E: any; t: number}> = ({E, t}) => {
  if (t < E.t0 || t > E.t1) return null;
  const k = (t - E.t0) / (E.t1 - E.t0);
  const s = E.s * (E.grow ? lerp(E.grow[0], E.grow[1], ease(k)) : 1) * (0.7 + 0.3 * eOut(clamp((t - E.t0) / 0.2)));
  const rot = lerp(E.r0 || 0, E.r1 || 0, ease(k));
  const op = clamp((t - E.t0) / 0.12) * clamp((E.t1 - t) / 0.12);
  return (
    <g opacity={op} transform={`translate(${E.x} ${E.y}) rotate(${rot}) scale(${s / 100}) translate(-50 -50)`} filter="url(#embsh)">
      {E.bg && <ellipse cx={50} cy={50} rx={78} ry={50} fill={E.bg} stroke={E.bs || '#fff'} strokeWidth={6} />}
      {E.bg ? <g transform="translate(50 50) scale(0.82) translate(-50 -50)">{EMB[E.k](E.c || '#f2d24b', E.c2)}</g> : EMB[E.k](E.c || '#f2d24b', E.c2)}
    </g>
  );
};

// ---- textos ----
const TXT: React.CSSProperties = {fontFamily: 'ShortsFont', fontWeight: 700, textAlign: 'center', lineHeight: 1.02, letterSpacing: -3, whiteSpace: 'pre'};
const Grad: React.FC<{children: React.ReactNode; size: number; col?: string; blur?: number}> = ({children, size, col, blur = 0}) => (
  <div style={{position: 'relative', fontSize: size, filter: blur ? `blur(${blur}px)` : undefined}}>
    <div style={{...TXT, position: 'absolute', inset: 0, color: 'rgba(0,0,0,0.75)', transform: 'translate(4px, 7px)', filter: 'blur(7px)'}}>{children}</div>
    <div style={{...TXT, position: 'relative', backgroundImage: col ? `linear-gradient(${col}, ${col})` : 'linear-gradient(180deg,#ffffff 0%,#f4f4f4 45%,#b9b9b9 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</div>
  </div>
);

const scramble = (s: string, t: number, t0: number, dur: number) => {
  const k = (t - t0) / dur; if (k >= 1) return s;
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let o = '';
  const seed = Math.floor(t * 20);
  for (let i = 0; i < s.length; i++) o += s[i] === ' ' ? ' ' : A[(seed * 7 + i * 13 + seed * i) % 26];
  return o.slice(0, Math.max(1, Math.round(s.length * (0.5 + 0.5 * Math.sin(seed)))));
};

const Text: React.FC<{T: any; t: number}> = ({T, t}) => {
  if (t < T.t0 || t > T.t1) return null;
  const kin = clamp((t - T.t0) / 0.14), kout = clamp((T.t1 - t) / 0.12);
  let txt: string = T.text;
  if (T.k === 'scramble') txt = scramble(T.text, t, T.t0, T.sd || 0.45);
  if (T.cnt) { const k = clamp((t - T.cnt[2]) / T.cnt[3]); const v = lerp(T.cnt[0], T.cnt[1], eOut(k)); txt = (T.dec === 0 ? Math.round(v).toString() : v.toFixed(T.dec ?? 2)) + (T.suf || ''); }
  if (T.yr) { const k = clamp((t - T.t0) / (T.yr[2] || 0.5)); txt = String(Math.round(lerp(T.yr[0], T.yr[1], eOut(k)))); }
  const size = T.size || 150;
  const longest = Math.max(...txt.split('\n').map((l) => l.length));
  const fit = Math.min(1, 1000 / (longest * size * (T.k === 'pct' || T.col ? 0.55 : T.k === 'bubble' ? 0.56 : 0.62)));
  let sc = (T.k === 'card' ? lerp(2.6, 1, eOut(clamp((t - T.t0) / 0.28))) : lerp(1.18, 1, eOut(kin))) * fit;
  let blur = T.k === 'card' ? 14 * (1 - eOut(clamp((t - T.t0) / 0.28))) : 6 * (1 - kin);
  blur += 16 * (1 - kout); const op = Math.min(kin * 1.5, 1) * kout;
  if (T.k === 'bubble') sc *= 1 + 0.04 * Math.sin(t * 40) * (1 - clamp((t - T.t0) / 0.4));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: T.y, display: 'flex', justifyContent: 'center', opacity: op, transform: `scale(${sc})`, transformOrigin: `50% ${size / 2}px`}}>
      <Grad size={size} col={T.col} blur={blur}>{T.k === 'bubble' ? `"${txt}"` : txt}</Grad>
    </div>
  );
};

export const Short: React.FC<{v: string; audio?: boolean; notext?: boolean}> = ({v, audio = true, notext = false}) => {
  useFont();
  const D = SH[v];
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  const sc = D.scenes.find((s: any) => t >= s.t0 && t < s.t1) || D.scenes[D.scenes.length - 1];
  const [cx, cy, z] = camAt(sc.cam, t);
  // desenfoque por velocidad de cámara
  const [cx2, cy2, z2] = camAt(sc.cam, t + 1 / 60);
  const vx = (cx2 - cx) * z * 60 / 60, vy = (cy2 - cy) * z * 60 / 60;
  const w = whipOff(sc, t);
  const bx = Math.min(40, Math.abs(vx) * 0.5) + Math.abs(w.dir[0]) * w.blur, by = Math.min(40, Math.abs(vy) * 0.5) + Math.abs(w.dir[1]) * w.blur;
  const zb = Math.abs(z2 - z) / z * 60 > 0.9 ? 3 : 0;
  sc.zz = z; sc.id = 's' + D.scenes.indexOf(sc);
  return (
    <AbsoluteFill style={{background: '#06101a', overflow: 'hidden'}}>
      {/* precarga: el render espera a que el fondo de esta escena (y la siguiente) esté cargado */}
      <Img src={staticFile(sc.bg)} style={{display: 'none'}} />
      {D.scenes[D.scenes.indexOf(sc) + 1] && <Img src={staticFile(D.scenes[D.scenes.indexOf(sc) + 1].bg)} style={{display: 'none'}} />}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <filter id="mb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`${bx + zb} ${by + zb}`} /></filter>
          <filter id={sc.id + 'sh'} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={6 / z} /></filter>
          <filter id="embsh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx={0} dy={4} stdDeviation={6} floodOpacity={0.5} /></filter>
          <pattern id={sc.id + 'crack'} patternUnits="userSpaceOnUse" width={700 / z} height={700 / z}><image href={staticFile('sh/crack.png')} width={700 / z} height={700 / z} /></pattern>
          <radialGradient id={sc.id + 'shade'} cx="0.45" cy="0.35" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity={0.08} /><stop offset="1" stopColor="#000" stopOpacity={0.22} /></radialGradient>
        </defs>
        <g filter={bx + by + zb > 0.6 ? 'url(#mb)' : undefined}>
          <g transform={`translate(${W / 2 + w.ox} ${H / 2 + w.oy}) scale(${z}) translate(${-cx} ${-cy})`}>
            <image href={staticFile(sc.bg)} x={0} y={0} width={sc.bw} height={sc.bh} />
            {(sc.O || []).filter((L: any) => L.under).map((L: any, i: number) => <Outline key={'u' + i} L={L} t={t} sc={sc} />)}
            {sc.L.map((L: any, i: number) => <Layer key={i} L={L} t={t} id={`${sc.id}l${i}`} sc={sc} />)}
            {(sc.O || []).filter((L: any) => !L.under).map((L: any, i: number) => <Outline key={'o' + i} L={L} t={t} sc={sc} />)}
            {(sc.E || []).map((E: any, i: number) => <Emblem key={'e' + i} E={E} t={t} />)}
          </g>
        </g>
      </svg>
      {/* viñeta y oscurecido superior como las referencias */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 62% at 50% 52%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3) 100%)'}} />
      {(D.dark || []).map((d: number[], i: number) => t >= d[0] && t <= d[1] ? <AbsoluteFill key={i} style={{background: 'rgba(0,0,0,0.55)', opacity: clamp((t - d[0]) / 0.15) * clamp((d[1] - t) / 0.15)}} /> : null)}
      {!notext && D.T.map((T: any, i: number) => <Text key={i} T={T} t={t} />)}
      {audio && D.music && <Audio src={staticFile(D.music)} />}
    </AbsoluteFill>
  );
};
