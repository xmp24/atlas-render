// v4: countryballs sobre su país, tamaño relativo al país en pantalla, boca con la voz, caminar, armas y muertes.
import React from 'react';
import {COUNTRIES} from './HexWorld';
import {Ball2, Gun} from './BallFace';

type Cam = {cx: number; cy: number; s: number};
const VW = 1920, VH = 1080;
const F: React.CSSProperties = {fontFamily: 'Lilita'};
const CODE: Record<string, number> = {}; COUNTRIES.forEach((c, i) => { CODE[c.c] = i; });
const NMX: Record<string, string> = {'United States of America': 'USA', 'United Arab Emirates': 'UAE', 'Dem. Rep. Congo': 'DR Congo', 'Bosnia and Herz.': 'Bosnia'};
const NM = (code: string) => { const n = COUNTRIES[CODE[code]]?.n || code; return (NMX[n] || n).toUpperCase(); };
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (u: number) => { u = cl(u, 0, 1); return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; };
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
// línea: t0 t1 spk txt expr shout env
type Line = [number, number, string, string, string, number, string?];
// ball: code ax ay tin tdie bw bh
type Ball = [string, number, number, number, number | null, number, number];

const wordAt = (l: Line, t: number) => {
  const words = l[3].split(/\s+/).filter(Boolean);
  const w = words.map((x) => 1.2 + x.length); const tot = w.reduce((a, b) => a + b, 0);
  const u = cl((t - l[0]) / Math.max(0.2, l[1] - l[0]), 0, 0.999) * tot;
  let acc = 0;
  for (let i = 0; i < words.length; i++) { acc += w[i]; if (u < acc) return {i, words}; }
  return {i: words.length - 1, words};
};
const envAt = (l: Line, t: number) => { const e = l[6]; if (!e) return 0.5 + 0.5 * Math.sin(t * 22); const i = Math.floor((t - l[0]) * 20); if (i < 0 || i >= e.length) return 0; return (e.charCodeAt(i) - 48) / 9; };

export const TalkMap: React.FC<{sc: any; lines: Line[]; t: number; cam: Cam}> = ({sc, lines, t, cam}) => {
  const {t0, t1, balls, faces = [], moves = [], guns = [], lunges = []} = sc as any;
  const fout = cl((t1 + 0.25 - t) / 0.3, 0, 1);
  const mine = lines.filter((l) => l[0] >= t0 - 0.05 && l[0] <= t1 + 0.05);
  const cur = mine.filter((l) => t >= l[0] - 0.05 && t < l[1] + 0.12).slice(-1)[0];
  const exprOf = (c: string, small: boolean) => {
    let best: [number, string] = [-1, small ? 'scared' : 'normal'];
    for (const l of mine) if (l[2] === c && l[0] <= t + 0.05 && l[0] > best[0]) best = [l[0], l[4]];
    for (const f of faces as [number, string, string][]) if (f[1] === c && f[0] <= t && f[0] >= best[0]) best = [f[0], f[2]];
    return best[1];
  };
  type P = {b: Ball; x: number; y: number; r: number; size: number; hop: number; dir: number; small: boolean};
  const ps: P[] = [];
  for (const b of balls as Ball[]) {
    const [code, ax, ay, tin, tdie, bw, bh] = b;
    if (t < tin - 0.02 || (tdie !== null && t > tdie + 1.1)) continue;
    // posición en el mundo: ancla o caminando
    let wx = ax, wy = ay, hop = 0, dir = 0;
    for (const m of moves as [number, number, string, number, number, number, number][]) {
      if (m[2] !== code || t < m[0]) continue;
      const u = cl((t - m[0]) / (m[1] - m[0]), 0, 1);
      wx = m[3] + (m[5] - m[3]) * ease(u); wy = m[4] + (m[6] - m[4]) * ease(u);
      if (u > 0 && u < 1) { hop = Math.abs(Math.sin((t - m[0]) * Math.PI * 5)); dir = Math.sign(m[5] - m[3]); }
    }
    const [sx, sy] = toS(wx, wy, cam);
    const d = Math.sqrt(Math.max(1, bw * bh)) * cam.s;
    const ratio = d <= 120 ? 0.7 : d >= 520 ? 0.3 : 0.7 - 0.4 * (d - 120) / 400;
    const small = bw * bh < 9000;
    const size = cl(ratio * d, small ? 84 : 64, 230);
    if (sx < -size || sx > VW + size || sy < -size * 0.5 || sy > VH + size * 0.3) continue;
    ps.push({b, x: sx, y: sy - size * 0.38, r: size / 2, size, hop, dir, small});
  }
  for (let it = 0; it < 16; it++) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], c = ps[j]; const dx = c.x - a.x, dy = c.y - a.y; const d = Math.hypot(dx, dy) || 0.01; const need = (a.r + c.r) * 0.9;
      if (d < need) { const m = (need - d) / 2; const ux = dx / d || 1, uy = dy / d; a.x -= ux * m; a.y -= uy * m * 0.5; c.x += ux * m; c.y += uy * m * 0.5; }
    }
    for (const p of ps) { p.y = cl(p.y, p.r + 50, 850 - p.r); }
  }
  const pos: Record<string, P> = {}; ps.forEach((p) => { pos[p.b[0]] = p; });
  const spk = cur ? pos[cur[2]] : undefined;
  const out: React.ReactNode[] = [];
  out.push(<div key="vig" style={{position: 'absolute', inset: 0, zIndex: 25, opacity: fout * cl((t - t0) / 0.3, 0, 1), background: 'radial-gradient(ellipse at 50% 45%, rgba(5,10,25,0) 60%, rgba(5,10,25,0.4) 100%)', pointerEvents: 'none'}} />);
  ps.forEach((p, i) => {
    const [code, , , tin, tdie] = p.b; const k = CODE[code]; if (k === undefined) return;
    const size = p.size;
    const talking = !!cur && cur[2] === code && t >= cur[0] && t < cur[1];
    const shout = talking && cur[5] > 0;
    let expr: any = exprOf(code, p.small);
    if (tdie !== null && t >= tdie) expr = 'dead';
    const open = talking ? envAt(cur, t) : 0;
    const look = spk && spk !== p ? cl((spk.x - p.x) / 250, -0.9, 0.9) : p.dir * 0.6;
    // embestida (estilo puñetazo)
    let lx = 0, ly = 0;
    for (const [tl, att, vic] of lunges as [number, string, string][]) {
      if (att !== code) continue; const dd = t - tl; if (dd < 0 || dd > 0.6) continue;
      const v = pos[vic]; if (!v) continue;
      const u = dd < 0.22 ? dd / 0.22 : 1 - (dd - 0.22) / 0.38; const e = Math.sin(u * Math.PI / 2);
      lx += (v.x - p.x) * 0.6 * e; ly += (v.y - p.y) * 0.6 * e;
    }
    // arma
    const g = (guns as [number, number, string, [number, string][]][]).find((G) => G[2] === code && t >= G[0] && t < G[1]);
    let recoil = 0, fire = false, gflip = false, gang = 0; const tracers: React.ReactNode[] = [];
    if (g) {
      const tv = g[3].map(([, v]) => pos[v]).filter(Boolean) as P[];
      const tx = tv.length ? tv.reduce((a, b) => a + b.x, 0) / tv.length : p.x + 100;
      const ty = tv.length ? tv.reduce((a, b) => a + b.y, 0) / tv.length : p.y;
      gflip = tx < p.x; gang = Math.atan2(ty - (p.y + size * 0.12), Math.abs(tx - p.x)) * 180 / Math.PI; gang = cl(gang, -60, 60);
      for (const [ts, v] of g[3]) for (let q = 0; q < 3; q++) {
        const st = ts + q * 0.09; const dd = t - st;
        if (dd >= 0 && dd < 0.08) { recoil = Math.max(recoil, 1 - dd / 0.08); fire = fire || dd < 0.05; }
        const vp = pos[v];
        if (vp && dd >= 0 && dd < 0.07) {
          const mx = p.x + (gflip ? -1 : 1) * size * 0.85, my = p.y + size * 0.12;
          tracers.push(<line key={'tr' + v + q} x1={mx} y1={my} x2={vp.x + (q - 1) * 6} y2={vp.y + (q - 1) * 5} stroke="#ffe680" strokeWidth={4} strokeLinecap="round" opacity={0.95} />);
        }
      }
    }
    const enter = cl((t - tin) / 0.35, 0, 1);
    const sc0 = enter < 1 ? 1 - Math.pow(1 - enter, 3) + Math.sin(enter * Math.PI) * 0.18 : 1;
    const bob = talking ? Math.abs(Math.sin((t - cur[0]) * 8)) * size * 0.05 : Math.sin(t * 2.4 + i * 1.7) * size * 0.012;
    const shx = shout ? Math.sin(t * 61) * size * 0.03 : 0, shy = shout ? Math.cos(t * 53) * size * 0.025 : 0;
    const die = tdie === null ? 0 : cl((t - tdie) / 1.0, 0, 1);
    const hitFlash = tdie !== null && t >= tdie && t < tdie + 0.12 ? 0.9 : 0;
    const knock = die > 0 ? Math.min(1, die * 4) * size * 0.25 * (pos[code] && g ? 0 : 1) : 0;
    const fall = die > 0.25 ? Math.pow((die - 0.25) / 0.75, 2) * 220 : 0; const spin = die * 160;
    const squash = 1 + open * 0.07 + (p.hop > 0.9 ? -0.06 : 0);
    const rot = (talking ? Math.sin((t - cur[0]) * 6) * 4 : 0) + p.dir * 8 + spin * (p.x > VW / 2 ? 1 : -1);
    const op = fout * (1 - Math.max(0, die - 0.65) / 0.35);
    const hopY = p.hop * size * 0.28;
    const X0 = p.x + shx + lx + (die > 0 ? knock * (p.x > VW / 2 ? 1 : -1) : 0), Y0 = p.y - bob - hopY + shy + ly + fall;
    out.push(<div key={'sh' + code} style={{position: 'absolute', left: p.x + lx - size * 0.32, top: p.y + size * 0.44 + ly, width: size * 0.64, height: size * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', zIndex: 26, opacity: op * (1 - die) * (1 - p.hop * 0.5), filter: 'blur(3px)'}} />);
    out.push(
      <div key={'b' + code} style={{position: 'absolute', left: X0, top: Y0, zIndex: 27 + (talking ? 3 : 0) + (g ? 2 : 0), opacity: op, transform: `scale(${sc0 * (talking ? 1.05 : 1) * (1 - die * 0.25)})`}}>
        <Ball2 k={k} size={size} expr={expr} open={open} look={look} rot={rot} t={t} seed={k} flash={hitFlash} sx={1 / Math.sqrt(squash)} sy={squash} />
        {g && <div style={{position: 'absolute', left: (gflip ? -1 : 1) * size * 0.66, top: size * 0.16}}><div style={{transform: `rotate(${gflip ? -gang : gang}deg)`}}><Gun w={size * 0.95} flip={gflip} recoil={recoil} fire={fire} /></div></div>}
        {talking && <div style={{position: 'absolute', left: 0, top: -size / 2 - 40, transform: 'translateX(-50%)', background: 'rgba(14,16,26,0.88)', color: '#fff', borderRadius: 10, padding: '4px 12px 0', ...F, fontSize: 26, whiteSpace: 'nowrap', border: `3px solid ${shout ? '#ffd23f' : '#fff'}`}}>{NM(code)}</div>}
      </div>);
    if (tracers.length) out.push(<svg key={'trs' + code} width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, zIndex: 31}}>{tracers}</svg>);
    if (tdie !== null && t >= tdie && t < tdie + 0.18) {
      const u = (t - tdie) / 0.18;
      out.push(<div key={'hit' + code} style={{position: 'absolute', left: p.x - size * 0.7, top: p.y - size * 0.7, width: size * 1.4, height: size * 1.4, zIndex: 32, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #ffd84a 30%, rgba(255,90,0,0.6) 55%, rgba(255,0,0,0) 70%)', transform: `scale(${0.5 + u})`, opacity: 1 - u}} />);
    }
  });
  if (cur && t >= cur[0] - 0.02) {
    const {i, words} = wordAt(cur, t);
    const chunk = words.slice(Math.max(0, i - 2), i + 1).join(' ');
    const shout = cur[5] > 0; const nar = cur[2] === 'N';
    const pw = cl((t - cur[0]) * 8, 0, 1);
    out.push(<div key="cap" style={{position: 'absolute', left: 0, right: 0, top: 890, zIndex: 34, textAlign: 'center', opacity: fout,
      transform: `scale(${0.92 + 0.08 * pw + (shout ? Math.sin(t * 30) * 0.02 : 0)})`}}>
      <span style={{...F, fontSize: shout ? 88 : 74, color: nar ? '#dfe7ff' : shout ? '#ffd23f' : '#fff', fontStyle: nar ? 'italic' : 'normal',
        WebkitTextStroke: '10px #0e101a', paintOrder: 'stroke fill', textShadow: '0 7px 0 rgba(0,0,0,0.45)', letterSpacing: 1}}>{shout ? chunk.toUpperCase() : chunk}</span>
    </div>);
  }
  return <>{out}</>;
};
