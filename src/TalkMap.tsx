// Conversación estilo countryballs SOBRE el mapa: cada bola está encima de su país (misma cámara que el mapa),
// el que habla rebota, el que grita tiembla, los demás le miran; las víctimas reciben el golpe y caen.
import React from 'react';
import {COUNTRIES} from './HexWorld';
import {CBall} from './ThumbsCB';

type Cam = {cx: number; cy: number; s: number};
const VW = 1920, VH = 1080;
const F: React.CSSProperties = {fontFamily: 'Lilita'};
const CODE: Record<string, number> = {}; COUNTRIES.forEach((c, i) => { CODE[c.c] = i; });
const NMX: Record<string, string> = {'United States of America': 'USA', 'United Arab Emirates': 'UAE', 'Dem. Rep. Congo': 'DR Congo', 'Bosnia and Herz.': 'Bosnia'};
const NM = (code: string) => { const n = COUNTRIES[CODE[code]]?.n || code; return (NMX[n] || n).toUpperCase(); };
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
type Line = [number, number, string, string, string, number];
// ball: [code, ax, ay, tin, tdie|null, sizeMul]
type Ball = [string, number, number, number, number | null, number];

const wordAt = (l: Line, t: number) => {
  const words = l[3].split(/\s+/).filter(Boolean);
  const w = words.map((x) => 1.2 + x.length); const tot = w.reduce((a, b) => a + b, 0);
  const u = cl((t - l[0]) / Math.max(0.2, l[1] - l[0]), 0, 0.999) * tot;
  let acc = 0;
  for (let i = 0; i < words.length; i++) { acc += w[i]; if (u < acc) return {i, words}; }
  return {i: words.length - 1, words};
};

export const TalkMap: React.FC<{sc: any; lines: Line[]; t: number; cam: Cam}> = ({sc, lines, t, cam}) => {
  const {t0, t1, balls, lunges, base} = sc as {t0: number; t1: number; balls: Ball[]; lunges: [number, string, string][]; base: number};
  const fout = cl((t1 + 0.25 - t) / 0.3, 0, 1);
  const mine = lines.filter((l) => l[0] >= t0 - 0.05 && l[0] <= t1 + 0.05);
  const cur = mine.filter((l) => t >= l[0] - 0.05 && t < l[1] + 0.12).slice(-1)[0];
  const lastOf = (c: string) => mine.filter((l) => l[2] === c && l[0] <= t + 0.05).slice(-1)[0];
  // posiciones en pantalla: ancla del país, ball "sentada" encima
  type P = {b: Ball; x: number; y: number; r: number; ax: number; ay: number; die: number; enter: number};
  const ps: P[] = [];
  for (const b of balls) {
    const [code, ax, ay, tin, tdie, sm] = b;
    if (t < tin - 0.02 || (tdie !== null && t > tdie + 1.0)) continue;
    const [sx, sy] = toS(ax, ay, cam);
    const size = base * sm;
    const enter = cl((t - tin) / 0.35, 0, 1);
    const die = tdie === null ? 0 : cl((t - tdie) / 0.9, 0, 1);
    ps.push({b, x: sx, y: sy - size * 0.32, r: size / 2, ax: sx, ay: sy, die, enter});
  }
  // separar bolas que se pisan (pocas iteraciones, determinista)
  for (let it = 0; it < 24; it++) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], c = ps[j]; const dx = c.x - a.x, dy = c.y - a.y; const d = Math.hypot(dx, dy) || 0.01; const need = (a.r + c.r) * 0.94;
      if (d < need) { const m = (need - d) / 2; const ux = dx / d || 1, uy = dy / d; a.x -= ux * m; a.y -= uy * m * 0.6; c.x += ux * m; c.y += uy * m * 0.6; }
    }
    for (const p of ps) { p.x = cl(p.x, p.r + 24, VW - p.r - 24); p.y = cl(p.y, p.r + 70, 835 - p.r); }
  }
  const pos: Record<string, P> = {}; ps.forEach((p) => { pos[p.b[0]] = p; });
  const spk = cur ? pos[cur[2]] : undefined;
  const out: React.ReactNode[] = [];
  // viñeta suave: el mapa se ve, solo baja un poco los bordes
  out.push(<div key="vig" style={{position: 'absolute', inset: 0, zIndex: 25, opacity: fout * cl((t - t0) / 0.3, 0, 1), background: 'radial-gradient(ellipse at 50% 45%, rgba(5,10,25,0) 55%, rgba(5,10,25,0.45) 100%)', pointerEvents: 'none'}} />);
  ps.forEach((p, i) => {
    const [code, , , tin, tdie] = p.b; const k = CODE[code]; if (k === undefined) return;
    const size = p.r * 2;
    const talking = !!cur && cur[2] === code && t >= cur[0];
    const shout = talking && cur[5] > 0;
    const last = lastOf(code);
    let eyes: any = last ? last[4] : (p.b[5] < 0.8 ? 'scared' : 'normal');
    if (tdie !== null && t >= tdie) eyes = 'dead';
    // mirar al que habla
    const look = spk && spk !== p ? cl((spk.x - p.x) / 300, -0.8, 0.8) : 0;
    // atacante: embestida hacia la víctima
    let lx = 0, ly = 0;
    for (const [tl, att, vic] of lunges || []) {
      if (att !== code) continue; const d = t - tl; if (d < 0 || d > 0.6) continue;
      const v = pos[vic]; if (!v) continue;
      const u = d < 0.22 ? d / 0.22 : 1 - (d - 0.22) / 0.38; const e = Math.sin(u * Math.PI / 2);
      lx += (v.x - p.x) * 0.55 * e; ly += (v.y - p.y) * 0.55 * e;
    }
    const sc0 = p.enter < 1 ? 1 - Math.pow(1 - p.enter, 3) + Math.sin(p.enter * Math.PI) * 0.15 : 1;
    const bounce = talking ? Math.abs(Math.sin((t - cur[0]) * 9)) * size * 0.04 : Math.sin(t * 2.2 + i * 1.7) * size * 0.01;
    const shx = shout ? Math.sin(t * 61) * 8 : 0, shy = shout ? Math.cos(t * 53) * 6 : 0;
    // muerte: sacudida, giro y caída
    const dd = p.die; const hit = tdie !== null && t >= tdie && t < tdie + 0.15;
    const fall = dd > 0 ? Math.pow(dd, 2) * 260 : 0; const spin = dd * 200;
    const s2 = (talking ? 1.06 : 1) * sc0 * (1 - dd * 0.3);
    const rot = (talking ? Math.sin((t - cur[0]) * 6) * 4 : 0) + spin;
    const op = fout * (1 - Math.max(0, dd - 0.6) / 0.4);
    // sombra en el suelo (sobre el país)
    out.push(<div key={'sh' + code} style={{position: 'absolute', left: p.x - size * 0.32, top: p.y + size * 0.44, width: size * 0.64, height: size * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', zIndex: 26, opacity: op * (1 - dd), filter: 'blur(3px)'}} />);
    out.push(
      <div key={'b' + code} style={{position: 'absolute', left: 0, top: 0, width: VW, height: VH, zIndex: 27 + (talking ? 3 : 0), opacity: op,
        transform: `translate(${p.x - 960 + shx + lx}px, ${p.y - 540 - bounce + shy + ly + fall}px) scale(${s2})`, transformOrigin: '960px 540px', filter: hit ? 'brightness(2.2)' : undefined}}>
        <CBall k={k} size={size} x={960} y={540} eyes={eyes} look={look} rot={rot} sweat={eyes === 'scared'} />
        {(talking || (p.b[5] < 0.8 && dd === 0)) && <div style={{position: 'absolute', left: 960, top: 540 - size / 2 - (talking ? 52 : 34), transform: 'translateX(-50%)', background: 'rgba(14,16,26,0.88)', color: '#fff', borderRadius: 12, padding: talking ? '5px 14px 1px' : '3px 10px 0', ...F, fontSize: talking ? 30 : 20, whiteSpace: 'nowrap', border: `3px solid ${shout ? '#ffd23f' : '#fff'}`}}>{NM(code)}</div>}
      </div>);
    if (tdie !== null && t >= tdie && t < tdie + 0.9) {
      const u = (t - tdie) / 0.9;
      out.push(<div key={'x' + code} style={{position: 'absolute', left: p.x, top: p.y, zIndex: 33, transform: `translate(-50%,-50%) scale(${0.6 + Math.min(1, u * 5) * 0.7}) rotate(-12deg)`, opacity: 1 - Math.max(0, u - 0.7) / 0.3,
        ...F, fontSize: Math.max(60, size * 0.6), color: '#ff3b30', WebkitTextStroke: '8px #0e101a', paintOrder: 'stroke fill'}}>✖</div>);
    }
  });
  // subtítulo palabra a palabra
  if (cur && t >= cur[0] - 0.02) {
    const {i, words} = wordAt(cur, t);
    const chunk = words.slice(Math.max(0, i - 1), i + 1).join(' ');
    const shout = cur[5] > 0; const nar = cur[2] === 'N';
    const pw = cl((t - cur[0]) * 8, 0, 1);
    out.push(<div key="cap" style={{position: 'absolute', left: 0, right: 0, top: 880, zIndex: 34, textAlign: 'center', opacity: fout,
      transform: `scale(${0.9 + 0.1 * pw + (shout ? Math.sin(t * 30) * 0.02 : 0)})`}}>
      <span style={{...F, fontSize: shout ? 96 : 80, color: nar ? '#dfe7ff' : shout ? '#ffd23f' : '#fff', fontStyle: nar ? 'italic' : 'normal',
        WebkitTextStroke: '10px #0e101a', paintOrder: 'stroke fill', textShadow: '0 7px 0 rgba(0,0,0,0.45)', letterSpacing: 1}}>{shout ? chunk.toUpperCase() : chunk}</span>
    </div>);
  }
  return <>{out}</>;
};
