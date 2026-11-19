// Capa de batalla realista para "1 VS 500,000,000": flechas de ofensiva, líneas de suministro, artillería/fortines/aeródromos,
// cercos con rendición, batallas con nombre y barra de fuerzas, bloqueos navales, rutas de convoyes, plan táctico, resumen y repetición
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {font, font2, INK} from './lib3';
import {MAINCOL} from './HexWorld';

type Cam = {cx: number; cy: number; s: number};
const VW = 1920, VH = 1080;
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (u: number) => 1 - Math.pow(1 - cl(u, 0, 1), 3);
const back = (u: number) => { u = cl(u, 0, 1); const c = 1.7; const v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; };
const win = (t: number, t0: number, t1: number, fi = 0.35, fo = 0.45) => cl(Math.min((t - t0) / fi, (t1 - t) / fo), 0, 1);
export const kv = (K: number[][] | undefined, t: number, def = 0) => {
  if (!K || !K.length) return def; if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const u = (t - K[i - 1][0]) / Math.max(1e-6, K[i][0] - K[i - 1][0]); const e = u * u * (3 - 2 * u); return K[i - 1][1] + (K[i][1] - K[i - 1][1]) * e; }
  return K[K.length - 1][1];
};
const stroke = (w: number) => ({WebkitTextStroke: `${w}px ${INK}`, paintOrder: 'stroke fill'} as const);
const ICON: Record<string, string> = {arty: 'cannon', fort: 'military-fort', air: 'airplane', aa: 'radar-dish', port: 'anchor', hq: 'crown', bunker: 'bunker', depot: 'artillery-shell', bat: 'cannon', ship: 'battleship', recon: 'binoculars'};
const col = (k: number) => MAINCOL[k] || '#888';

// ---- geometría de polilíneas (suavizado y recorte por fracción)
const SM = new Map<string, number[][]>();
const smooth = (key: string, flat: number[]) => {
  let p = SM.get(key); if (p) return p;
  p = []; for (let i = 0; i < flat.length; i += 2) p.push([flat[i], flat[i + 1]]);
  for (let it = 0; it < 3 && p.length > 2; it++) { const q = [p[0]]; for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1]; q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } q.push(p[p.length - 1]); p = q; }
  SM.set(key, p); return p;
};
const cut = (p: number[][], f: number) => {
  const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  const tot = L[L.length - 1]; const d = tot * cl(f, 0, 1); const out: number[][] = [p[0]];
  for (let i = 1; i < p.length; i++) { if (L[i] <= d) out.push(p[i]); else { const u = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); out.push([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u]); break; } }
  return {pts: out, tot};
};
const ptAt = (p: number[][], f: number) => { const c = cut(p, f).pts; return c[c.length - 1]; };

// ---- flecha de ofensiva gruesa, con cola fina, cuello y punta
const arrowPath = (S: number[][], w: number) => {
  if (S.length < 2) return '';
  const n = S.length; const Lc = [0]; for (let i = 1; i < n; i++) Lc.push(Lc[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const tot = Lc[n - 1]; if (tot < 8) return '';
  const hl = Math.min(w * 1.9, tot * 0.45), hw = w * 1.15;
  // tramo del cuerpo hasta la base de la punta
  const body: number[][] = []; for (let i = 0; i < n; i++) { if (Lc[i] < tot - hl) body.push([...S[i], Lc[i]]); else { const u = (tot - hl - Lc[i - 1]) / Math.max(1e-6, Lc[i] - Lc[i - 1]); body.push([S[i - 1][0] + (S[i][0] - S[i - 1][0]) * u, S[i - 1][1] + (S[i][1] - S[i - 1][1]) * u, tot - hl]); break; } }
  if (body.length < 2) body.unshift([...S[0], 0]);
  const L: string[] = [], R: string[] = [];
  for (let i = 0; i < body.length; i++) {
    const a = body[Math.max(0, i - 1)], b = body[Math.min(body.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const u = body[i][2] / Math.max(1, tot - hl); const ww = w * 0.5 * (0.42 + 0.4 * u);
    L.push(`${(body[i][0] - dy * ww).toFixed(1)},${(body[i][1] + dx * ww).toFixed(1)}`); R.push(`${(body[i][0] + dy * ww).toFixed(1)},${(body[i][1] - dx * ww).toFixed(1)}`);
  }
  const B = body[body.length - 1], T = S[n - 1]; let dx = T[0] - B[0], dy = T[1] - B[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  const h1 = `${(B[0] - dy * hw).toFixed(1)},${(B[1] + dx * hw).toFixed(1)}`, h2 = `${(B[0] + dy * hw).toFixed(1)},${(B[1] - dx * hw).toFixed(1)}`;
  return `M${L.join(' L')} L${h1} L${T[0].toFixed(1)},${T[1].toFixed(1)} L${h2} L${R.reverse().join(' L')} Z`;
};

const Badge: React.FC<{x: number; y: number; sz: number; bg: string; icon?: string; dead?: number; o: number; ring?: string; children?: React.ReactNode}> = ({x, y, sz, bg, icon, dead = 0, o, ring, children}) => (
  <div style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, opacity: o, filter: dead > 0 ? `grayscale(${dead})` : undefined}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: bg, border: `${Math.max(2, sz * 0.09)}px solid ${ring || INK}`, boxShadow: '0 3px 6px rgba(0,0,0,0.45)'}} />
    {icon && <Img src={staticFile(`hw/icons/${icon}.svg`)} style={{position: 'absolute', left: sz * 0.18, top: sz * 0.18, width: sz * 0.64, height: sz * 0.64}} />}
    {children}
    {dead > 0 && <div style={{position: 'absolute', inset: -sz * 0.1, ...font, fontSize: sz * 1.05, lineHeight: `${sz * 1.15}px`, textAlign: 'center', color: '#ff3b30', opacity: dead, ...stroke(4)}}>✖</div>}
  </div>
);
const WFlag: React.FC<{x: number; y: number; h: number; t: number; ph: number; o: number}> = ({x, y, h, t, ph, o}) => {
  const w1 = Math.sin(t * 6 + ph) * h * 0.06;
  return <svg width={h} height={h} style={{position: 'absolute', left: x - h * 0.1, top: y - h, opacity: o, overflow: 'visible'}}>
    <line x1={h * 0.1} y1={h} x2={h * 0.1} y2={0} stroke={INK} strokeWidth={h * 0.09} strokeLinecap="round" />
    <path d={`M${h * 0.1},${h * 0.04} Q${h * 0.35},${h * 0.04 + w1} ${h * 0.62},${h * 0.08} L${h * 0.62},${h * 0.42} Q${h * 0.35},${h * 0.42 + w1} ${h * 0.1},${h * 0.38} Z`} fill="#fff" stroke={INK} strokeWidth={h * 0.05} strokeLinejoin="round" />
  </svg>;
};

export const VsBattle: React.FC<{D: any; t: number; tR: number; cam: Cam; tilted: boolean; part: 'map' | 'top'}> = ({D, t, tR, cam, tilted, part}) => {
  const B = D.vs && D.vs.bt; if (!B) return null;
  const MAP = part === 'map';
  const s = cam.s; const svg: React.ReactNode[] = []; const html: React.ReactNode[] = []; const top: React.ReactNode[] = [];
  const WC: string | undefined = B.wc; const DEFS: number[] = B.defs || [];
  const ac = (k: number) => (WC && !DEFS.includes(k) ? WC : col(k)); // atacantes: color único "THE WORLD"
  const usz = D.war && D.war.usz ? kv(D.war.usz, t, 1) : 1; const fsc = cl(usz * 1.7, 0.62, 1); // escala de iconos/etiquetas por país
  // registro de etiquetas: si una pisa a otra, baja; si no cabe, no se dibuja
  const BOX: number[][] = [];
  const place = (x: number, y: number, w: number, h: number) => { for (let k = 0; k < 4; k++) { const yy = y + k * (h + 6); if (!BOX.some((b) => x < b[0] + b[2] && x + w > b[0] && yy < b[1] + b[3] && yy + h > b[1])) { BOX.push([x, yy, w, h]); return yy; } } return null; };
  const mo = tilted ? 0 : 1;
  const icoSz = cl(30 * Math.pow(s / 3, 0.25), 24, 38) * fsc;
  const onScr = (x: number, y: number, m = 80) => x > -m && x < VW + m && y > -m && y < VH + m;
  if (MAP && mo > 0) {
    // ---- rutas de convoyes marítimos (suministro por mar / refuerzos)
    (B.sl || []).forEach((L: any[], i: number) => {
      const [t0, t1, flat, k, lab, icn] = L; if (t < t0 || t > t1) return; const o = win(t, t0, t1, 0.5, 0.6);
      const P = smooth('sl' + i, flat).map(([x, y]) => toS(x, y, cam)); const c = ac(k);
      const d = 'M' + P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L');
      svg.push(<path key={'sla' + i} d={d} fill="none" stroke="rgba(10,14,24,0.55)" strokeWidth={6} strokeLinecap="round" opacity={o} />);
      if (icn === 'none') { const len = P.reduce((a, p, j) => a + (j ? Math.hypot(p[0] - P[j - 1][0], p[1] - P[j - 1][1]) : 0), 0); const u = ease((t - t0) / 0.7); svg.push(<path key={'slw' + i} d={d} fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${len * u} ${len}`} opacity={o} />); const [ex, ey] = P[P.length - 1]; if (u > 0.95) svg.push(<circle key={'slx' + i} cx={ex} cy={ey} r={10} fill="none" stroke={c} strokeWidth={3} opacity={o * (1 - (t - t0 - 0.7) / 0.9)} />); return; }
      svg.push(<path key={'slb' + i} d={d} fill="none" stroke={c} strokeWidth={3} strokeDasharray="10 12" strokeDashoffset={-t * 60} strokeLinecap="round" opacity={o * 0.95} />);
      const Pw = smooth('sl' + i, flat);
      if (icn !== 'none') for (let j = 0; j < 3; j++) { const f = ((t - t0) * 0.16 + j / 3) % 1; const [wx, wy] = ptAt(Pw, f); const [x, y] = toS(wx, wy, cam); if (onScr(x, y)) html.push(<Badge key={`slc${i}_${j}`} x={x} y={y} sz={icoSz * 0.8} bg={c} icon={icn || 'battleship'} o={o * cl(Math.min(f / 0.08, (1 - f) / 0.08), 0, 1)} />); }
      if (lab) { const [x, y] = P[Math.floor(P.length * 0.5)]; html.push(<div key={'sll' + i} style={{position: 'absolute', left: x - 200, top: y - 44, width: 400, textAlign: 'center', opacity: o * win(t, t0, t0 + 3.2, 0.4, 0.6)}}><span style={{...font2, fontSize: 19, color: '#fff', background: 'rgba(8,12,22,0.82)', border: `2px solid ${c}`, borderRadius: 9, padding: '1px 10px', whiteSpace: 'nowrap'}}>{lab}</span></div>); }
    });
    // ---- bloqueos navales: anillo de barcos patrullando
    (B.bl || []).forEach((L: any[], i: number) => {
      const [t0, t1, flat, k, lab] = L; if (t < t0 || t > t1) return; const o = win(t, t0, t1, 0.6, 0.6); const c = ac(k);
      const pts: number[][] = []; for (let j = 0; j < flat.length; j += 2) pts.push(toS(flat[j], flat[j + 1], cam));
      pts.forEach(([x, y], j) => { if (!onScr(x, y)) return; svg.push(<circle key={`bld${i}_${j}`} cx={x} cy={y} r={2.6} fill={c} stroke={INK} strokeWidth={1} opacity={o * 0.9} />); });
      for (let j = 0; j < pts.length; j += 4) { const [x, y] = pts[j]; if (!onScr(x, y)) continue; const bob = Math.sin(t * 2 + j) * 2; html.push(<Badge key={`bls${i}_${j}`} x={x} y={y + bob} sz={icoSz * 0.78} bg={c} icon="battleship" o={o * back((t - t0 - j * 0.02) / 0.4)} />); }
      if (lab && pts.length) { const [x, y] = pts.reduce((a, b) => (b[1] < a[1] ? b : a), pts[0]); html.push(<div key={'bll' + i} style={{position: 'absolute', left: cl(x, 640, VW - 240) - 200, top: cl(y, 240, VH - 200) - 50, width: 400, textAlign: 'center', opacity: o * win(t, t0, t0 + 3.4, 0.4, 0.6)}}><span style={{...font, fontSize: 24, color: '#fff', background: '#123a7a', border: `3px solid ${INK}`, borderRadius: 10, padding: '1px 12px'}}>⚓ {lab}</span></div>); }
    });
    // ---- líneas de suministro (camiones que fluyen; si se cortan, se vuelven rojas)
    (B.sup || []).forEach((L: any[], i: number) => {
      const [t0, t1, flat, k, tc, lab] = L; if (t < t0 || t > t1) return; const o = win(t, t0, t1, 0.4, 0.5); const c = ac(k);
      const Pw = smooth('sp' + i, flat); const P = Pw.map(([x, y]) => toS(x, y, cam)); const isCut = tc > 0 && t >= tc;
      const d = 'M' + P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L');
      svg.push(<path key={'spa' + i} d={d} fill="none" stroke="rgba(10,14,24,0.6)" strokeWidth={7} strokeLinecap="round" opacity={o * (isCut ? 0.5 : 0.8)} />);
      svg.push(<path key={'spb' + i} d={d} fill="none" stroke={isCut ? '#ff3b30' : c} strokeWidth={3.2} strokeDasharray={isCut ? '4 10' : '14 9'} strokeDashoffset={isCut ? 0 : -t * 55} strokeLinecap="round" opacity={o * (isCut ? 0.75 : 0.95)} />);
      if (!isCut) for (let j = 0; j < 4; j++) { const f = ((t - t0) * 0.22 + j / 4) % 1; const [wx, wy] = ptAt(Pw, f); const [x, y] = toS(wx, wy, cam); svg.push(<rect key={`spt${i}_${j}`} x={x - 5} y={y - 3.5} width={10} height={7} rx={2} fill="#f4e3b0" stroke={INK} strokeWidth={1.6} opacity={o} />); }
      const [x0, y0] = P[0]; if (onScr(x0, y0)) html.push(<Badge key={'spd' + i} x={x0} y={y0} sz={icoSz * 0.85} bg={c} icon="artillery-shell" o={o} dead={isCut ? cl((t - tc) / 0.4, 0, 1) : 0} />);
      if (isCut) { const [mx, my] = P[Math.floor(P.length * 0.55)]; const u = t - tc; html.push(<div key={'spx' + i} style={{position: 'absolute', left: mx - 160, top: my - 36, width: 320, textAlign: 'center', opacity: o * cl(1 - (u - 2.4) / 0.5, 0, 1), transform: `scale(${back(u / 0.35)})`}}><span style={{...font, fontSize: 26, color: '#fff', background: '#c62828', border: `3px solid ${INK}`, borderRadius: 10, padding: '0 12px', whiteSpace: 'nowrap'}}>✂ {lab || 'SUPPLY LINE CUT'}</span></div>); }
    });
    // ---- relieve: montañas que frenan el avance
    (B.rl || []).forEach((Rl: any[], i: number) => {
      const [t0, t1, wx, wy, rx, ry] = Rl; if (t < t0 || t > t1) return; const o = win(t, t0, t1, 0.6, 0.6) * 0.55;
      const [cx, cy] = toS(wx, wy, cam); const Rx = rx * s, Ry = ry * s; const st = 46;
      if (cx + Rx < -50 || cx - Rx > VW + 50 || cy + Ry < -50 || cy - Ry > VH + 50) return;
      const x0 = Math.max(-20, cx - Rx), x1 = Math.min(VW + 20, cx + Rx), y0 = Math.max(-20, cy - Ry), y1 = Math.min(VH + 20, cy + Ry);
      let pth = '', snow = '';
      const gx0 = Math.floor((x0 - cx) / st), gy0 = Math.floor((y0 - cy) / st);
      for (let gy = gy0; cy + gy * st < y1; gy++) for (let gx = gx0; cx + gx * st < x1; gx++) {
        const jx = ((gx * 73 + gy * 37) % 17) - 8, jy = ((gx * 41 + gy * 29) % 13) - 6;
        const px = cx + gx * st + (gy % 2 ? st / 2 : 0) + jx, py = cy + gy * st + jy;
        if (((px - cx) / Rx) ** 2 + ((py - cy) / Ry) ** 2 > 1) continue;
        const hh = 11 + ((gx * 7 + gy * 3) % 5) * 1.6;
        pth += `M${(px - hh).toFixed(1)},${(py + hh * 0.45).toFixed(1)} L${px.toFixed(1)},${(py - hh * 0.75).toFixed(1)} L${(px + hh).toFixed(1)},${(py + hh * 0.45).toFixed(1)} `;
        snow += `M${(px - hh * 0.33).toFixed(1)},${(py - hh * 0.32).toFixed(1)} L${px.toFixed(1)},${(py - hh * 0.75).toFixed(1)} L${(px + hh * 0.33).toFixed(1)},${(py - hh * 0.32).toFixed(1)} Z `;
      }
      svg.push(<path key={'rlm' + i} d={pth} fill="rgba(90,72,52,0.55)" stroke="rgba(30,22,14,0.7)" strokeWidth={1.4} strokeLinejoin="round" opacity={o} />);
      svg.push(<path key={'rls' + i} d={snow} fill="rgba(255,255,255,0.85)" opacity={o} />);
    });
    // ---- ciudades clave: barra de vida que baja cuando llega el frente y bandera invasora al caer
    (B.ct || []).forEach((Ct: any[], i: number) => {
      const [t0, t1, wx, wy, name, k, thp, tf] = Ct; if (t < t0 || t > t1) return; const [x, y] = toS(wx, wy, cam); if (!onScr(x, y)) return;
      const o = win(t, t0, t1, 0.4, 0.5); const hp = t < thp ? 1 : t > tf ? 0 : 1 - (t - thp) / Math.max(0.1, tf - thp);
      const bw = 50 * fsc, bh = 7 * fsc; const by = y + 40 * fsc;
      if (t < tf) {
        const hc = hp > 0.6 ? '#3ddc84' : hp > 0.3 ? '#ffd23f' : '#ff3b30';
        html.push(<div key={'ct' + i} style={{position: 'absolute', left: x - bw / 2, top: by, width: bw, height: bh, borderRadius: bh, border: `2px solid ${INK}`, background: 'rgba(0,0,0,0.55)', opacity: o, overflow: 'hidden'}}><div style={{width: `${hp * 100}%`, height: '100%', background: hc}} /></div>);
      } else {
        const u = t - tf; const fh = 26 * fsc;
        html.push(<svg key={'ctf' + i} width={fh} height={fh} style={{position: 'absolute', left: x - fh * 0.1, top: y - fh - 4, opacity: o * cl(u / 0.3, 0, 1), overflow: 'visible', transform: `scale(${back(u / 0.35)})`, transformOrigin: '10% 100%'}}>
          <line x1={fh * 0.1} y1={fh} x2={fh * 0.1} y2={0} stroke={INK} strokeWidth={fh * 0.09} strokeLinecap="round" />
          <path d={`M${fh * 0.1},${fh * 0.04} L${fh * 0.7},${fh * 0.12 + Math.sin(t * 6 + i) * fh * 0.04} L${fh * 0.1},${fh * 0.42} Z`} fill={WC || '#c62828'} stroke={INK} strokeWidth={fh * 0.05} strokeLinejoin="round" /></svg>);
      }
    });
    // ---- flechas de ofensiva (plan = discontinuas; ataque = macizas; contraataque = azul con borde blanco)
    (B.ar || []).forEach((A: any[], i: number) => {
      const [t0, t1, flat, k, wW, lab, kind, pk] = A; if (t < t0 - 0.05 || t > t1 + 0.5) return;
      const o = win(t, t0, t1 + 0.5, 0.4, 0.5) * (kind === 'sum' ? 1 : 0.92);
      const Pw = smooth('ar' + i, flat);
      const f = kind === 'plan' ? ease((t - t0) / 1.1) : kind === 'sum' ? ease((t - t0) / 0.9) : kv(pk, t, 0);
      if (f <= 0.02) return;
      const C = cut(Pw, f); const S = C.pts.map(([x, y]) => toS(x, y, cam));
      let len = 0; for (let j = 1; j < S.length; j++) len += Math.hypot(S[j][0] - S[j - 1][0], S[j][1] - S[j - 1][1]);
      if (len < 40) return;
      const w = cl(wW * s, 7, 30) * (kind === 'plan' ? 0.85 : 1);
      const big = len > VW * 1.5 ? 0.45 : 1; // flecha enorme en primer plano: más transparente para no tapar la batalla
      const d = arrowPath(S, w); if (!d) return; const c = kind === 'counter' ? col(k) : ac(k);
      if (kind === 'plan') {
        svg.push(<path key={'arp' + i} d={d} fill="rgba(255,255,255,0.13)" stroke="#fff" strokeWidth={3} strokeDasharray="12 8" strokeLinejoin="round" opacity={o} />);
      } else {
        svg.push(<path key={'ars' + i} d={d} transform="translate(3,5)" fill="rgba(0,0,0,0.33)" opacity={o * big} />);
        svg.push(<path key={'arf' + i} d={d} fill={c} fillOpacity={kind === 'sum' ? 0.85 : 0.7} stroke={kind === 'counter' ? '#fff' : '#10131a'} strokeWidth={kind === 'counter' ? 4 : 3.5} strokeLinejoin="round" opacity={o * big} />);
      }
      if (lab) { const [x, y] = S[0]; if (onScr(x, y, 0)) html.push(<div key={'arl' + i} style={{position: 'absolute', left: cl(x, 100, VW - 100) - 150, top: cl(y, 210, VH - 120) - 22, width: 300, textAlign: 'center', opacity: o * (kind === 'plan' || kind === 'sum' ? 1 : win(t, t0, t0 + 3.5, 0.4, 0.6))}}><span style={{...font, fontSize: kind === 'plan' ? 21 : 19, color: '#fff', background: kind === 'plan' ? 'rgba(8,12,22,0.85)' : c, border: `2px solid ${INK}`, borderRadius: 8, padding: '0 9px', whiteSpace: 'nowrap', ...stroke(kind === 'plan' ? 0 : 3)}}>{lab}</span></div>); }
    });
    // ---- cercos: el anillo se cierra y aparecen banderas blancas
    (B.pk || []).forEach((Pk: any[], i: number) => {
      const [t0, t1, wx, wy, wr, k, lab, sur, fls] = Pk; if (t < t0 || t > t1) return; const o = win(t, t0, t1, 0.3, 0.5);
      const [x, y] = toS(wx, wy, cam); const r = Math.max(wr * s, 75 * fsc); const u = ease((t - t0) / 1.4); const c = ac(k);
      const a0 = -Math.PI / 2; const arc = (from: number, to: number) => { const p0 = [x + Math.cos(from) * r, y + Math.sin(from) * r], p1 = [x + Math.cos(to) * r, y + Math.sin(to) * r]; const lg = Math.abs(to - from) > Math.PI ? 1 : 0; const sw = to > from ? 1 : 0; return `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 ${lg} ${sw} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`; };
      const sp = Math.PI * u * 0.999;
      for (const dd of [arc(a0, a0 + sp), arc(a0, a0 - sp)]) { svg.push(<path key={`pka${i}${dd.length}`} d={dd} fill="none" stroke="#10131a" strokeWidth={11} strokeLinecap="round" opacity={o} />); svg.push(<path key={`pkb${i}${dd.length}`} d={dd} fill="none" stroke={c} strokeWidth={6} strokeDasharray="16 7" strokeDashoffset={-t * 30} strokeLinecap="round" opacity={o} />); }
      if (u > 0.98) svg.push(<circle key={'pkg' + i} cx={x} cy={y} r={r} fill="rgba(200,20,20,0.10)" stroke="none" opacity={o * (0.6 + 0.4 * Math.sin(t * 6))} />);
      const ly = cl(y - r - 46, 200, VH - 140);
      html.push(<div key={'pkl' + i} style={{position: 'absolute', left: cl(x, 220, VW - 220) - 220, top: ly, width: 440, textAlign: 'center', opacity: o, transform: `scale(${back((t - t0 - 1.2) / 0.35)})`}}><span style={{...font, fontSize: 30, color: '#fff', background: '#c62828', border: `3px solid ${INK}`, borderRadius: 12, padding: '1px 14px'}}>⭕ {lab || 'ENCIRCLED'}</span></div>);
      if (t > t0 + 1.9) {
        for (let j = 0; j < (fls || []).length; j++) { const [fx, fy] = toS(fls[j][0], fls[j][1], cam); html.push(<WFlag key={`pkf${i}_${j}`} x={fx} y={fy} h={cl(26 * Math.pow(s / 3, 0.2), 22, 34)} t={t} ph={j} o={o * back((t - t0 - 1.9 - j * 0.12) / 0.3)} />); }
        if (sur) html.push(<div key={'pks' + i} style={{position: 'absolute', left: cl(x, 220, VW - 220) - 220, top: ly + 52, width: 440, textAlign: 'center', opacity: o * cl((t - t0 - 2.2) / 0.3, 0, 1)}}><span style={{...font2, fontSize: 22, color: INK, background: '#fff', border: `2px solid ${INK}`, borderRadius: 9, padding: '1px 12px'}}>🏳 {sur}</span></div>);
      }
    });
    // ---- iconos: artillería, fortines, aeródromos, AA, puertos, depósitos, héroes, banderas blancas
    (B.ic || []).forEach((I: any[], i: number) => {
      const [t0, t1, wx, wy, ty, k, td, lab, tf, kf2] = I; if (t < t0 || t > t1) return;
      const [x, y] = toS(wx, wy, cam); if (!onScr(x, y)) return;
      const o = win(t, t0, t1, 0.3, 0.5) * back((t - t0) / 0.35);
      if (ty === 'wf') { html.push(<WFlag key={'icw' + i} x={x} y={y} h={cl(28 * Math.pow(s / 3, 0.2), 22, 36)} t={t} ph={i} o={o} />); return; }
      const dead = td > 0 && t >= td ? cl((t - td) / 0.35, 0, 1) : 0;
      const flipped = tf > 0 && t >= tf; const kk = flipped ? kf2 : k;
      const sz = ty === 'hero' ? icoSz * 1.05 : ty === 'fort' || ty === 'hq' ? icoSz * 1.12 : icoSz;
      const fire = ty === 'arty' || ty === 'bat' ? Math.max(0, Math.sin(t * 5.5 + i * 1.7)) ** 12 : 0;
      if (ty === 'hero') {
        html.push(<div key={'ich' + i} style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, opacity: o * (1 - dead * 0.6)}}>
          <div style={{position: 'absolute', inset: -sz * 0.25, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,215,60,${0.5 + 0.3 * Math.sin(t * 5)}) 0%, rgba(255,215,60,0) 70%)`}} />
          <div style={{position: 'absolute', inset: 0, ...font, fontSize: sz * 1.05, lineHeight: `${sz}px`, textAlign: 'center', color: '#ffd23f', ...stroke(5)}}>★</div></div>);
      } else html.push(<Badge key={'icb' + i} x={x} y={y} sz={sz * (flipped && t - tf < 0.4 ? 1 + 0.3 * (1 - (t - tf) / 0.4) : 1)} bg={ac(kk)} icon={ICON[ty] || 'military-fort'} o={o * (1 - dead * 0.45)} dead={dead} ring={ty === 'fort' || ty === 'hq' ? '#ffd23f' : undefined}>
        {fire > 0.05 && <div style={{position: 'absolute', left: sz * 0.72, top: -sz * 0.18, width: sz * 0.55, height: sz * 0.55, borderRadius: '50%', background: 'radial-gradient(circle,#fff6b0 0%,#ff9a2a 45%,rgba(255,80,20,0) 72%)', opacity: fire}} />}
      </Badge>);
      const lt0 = tf > 0 ? tf : t0; const lyy = lab && t >= lt0 && t - lt0 < (tf > 0 ? 2.8 : 4.2) ? place(x - 120, y + sz * 0.62, 240, 26) : null; if (lyy !== null) html.push(<div key={'icl' + i} style={{position: 'absolute', left: x - 170, top: y + sz * 0.62, width: 340, textAlign: 'center', whiteSpace: 'nowrap', opacity: o * cl(((tf > 0 ? 2.8 : 4.2) - (t - lt0)) / 0.5, 0, 1)}}><span style={{...font2, fontSize: 18, color: ty === 'hero' ? INK : '#fff', background: ty === 'hero' ? '#ffd23f' : 'rgba(8,12,22,0.85)', border: `2px solid ${INK}`, borderRadius: 8, padding: '0 8px'}}>{lab}</span></div>);
    });
    // ---- batallas con nombre: barra de fuerzas atacante/defensor y resultado
    (B.nb || []).forEach((N: any[], i: number) => {
      const [t0, t1, wx, wy, name, ak, dk, pk, res] = N; if (t < t0 || t > t1) return;
      const [x0, y0] = toS(wx, wy, cam); const x = cl(x0, 420, VW - 420); const y1p = place(x - 170, cl(y0 - 96, 262, VH - 210) - 30, 340, 64); if (y1p === null) return; const y = y1p + 30;
      const o = win(t, t0, t1, 0.3, 0.4); const sh = cl(kv(pk, t, 0.5), 0.04, 0.96); const done = res && t > t1 - 1.1;
      html.push(<div key={'nb' + i} style={{position: 'absolute', left: x - 170, top: y - 30, width: 340, opacity: o, transform: `scale(${back((t - t0) / 0.35)})`, transformOrigin: '50% 100%'}}>
        <div style={{textAlign: 'center'}}><span style={{...font, fontSize: 24, color: '#fff', background: 'rgba(8,12,22,0.9)', border: '2px solid #ffd23f', borderRadius: 10, padding: '0 12px', whiteSpace: 'nowrap'}}>⚔ {name}</span></div>
        <div style={{margin: '6px auto 0', width: 250, height: 18, borderRadius: 9, border: `3px solid ${INK}`, overflow: 'hidden', display: 'flex', boxShadow: '0 3px 8px rgba(0,0,0,0.5)'}}>
          <div style={{width: `${sh * 100}%`, background: ac(ak)}} /><div style={{flex: 1, background: col(dk)}} /></div>
        {done && <div style={{position: 'absolute', left: 0, right: 0, top: 56, textAlign: 'center', transform: `scale(${back((t - (t1 - 1.1)) / 0.3)}) rotate(-4deg)`}}><span style={{...font, fontSize: 26, color: '#fff', background: res === 'REPELLED' || res === 'HELD' || res === 'AMBUSH!' ? '#2e9e4f' : '#c62828', border: `3px solid ${INK}`, borderRadius: 9, padding: '0 12px'}}>{res}</span></div>}
      </div>);
    });
  }
  // ---- cabeceras de pantalla: plan táctico / resumen / giro decisivo
  if (!MAP) for (const H of (B.hd || []) as any[]) {
    const [t0, t1, kind, ttl, sub, tags] = H; if (t < t0 || t > t1) continue; const o = win(t, t0, t1, 0.25, 0.35);
    const bg = kind === 'plan' ? '#1b3a6b' : kind === 'sum' ? '#3a1b1b' : '#7a5a00';
    top.push(<div key={'hd' + t0} style={{position: 'absolute', left: 0, right: 0, top: 196, textAlign: 'center', opacity: o, zIndex: 36}}>
      <div style={{display: 'inline-block', transform: `scale(${back((t - t0) / 0.3)})`}}>
        <span style={{...font, fontSize: 46, color: '#fff', background: bg, border: `4px solid ${INK}`, borderRadius: 14, padding: '2px 22px 0', boxShadow: '0 6px 0 rgba(0,0,0,0.35)', ...stroke(6)}}>{ttl}</span>
        {sub && <div style={{...font2, fontSize: 26, color: '#fff', marginTop: 10, letterSpacing: 2, ...stroke(6)}}>{sub}</div>}
        {tags && <div style={{display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10}}>{(tags as string[]).map((g, j) => <span key={j} style={{...font2, fontSize: 20, color: INK, background: '#ffd23f', border: `2px solid ${INK}`, borderRadius: 8, padding: '0 10px', opacity: cl((t - t0 - 0.3 - j * 0.15) / 0.2, 0, 1)}}>{g}</span>)}</div>}
      </div></div>);
  }
  // ---- repetición: franjas de cine, grano, "REPLAY x0.5"
  const rp = ((B.rp || []) as any[]).find((r) => tR >= r[0] && tR < r[1]);
  if (rp && !MAP) {
    const o = win(tR, rp[0], rp[1], 0.2, 0.25); const bh = 96 * o;
    top.push(<AbsoluteFill key="rp" style={{zIndex: 60, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)', opacity: o}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bh, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bh, background: '#000'}} />
      <div style={{position: 'absolute', left: 60, top: bh + 26, display: 'flex', alignItems: 'center', gap: 14, opacity: o}}>
        <div style={{width: 26, height: 26, borderRadius: '50%', background: '#ff2d2d', opacity: Math.sin(tR * 8) > 0 ? 1 : 0.25, boxShadow: '0 0 12px #ff2d2d'}} />
        <span style={{...font, fontSize: 52, color: '#fff', ...stroke(8)}}>REPLAY</span><span style={{...font2, fontSize: 30, color: '#ffd23f', ...stroke(6)}}>×{rp[2]}</span></div>
      {rp[3] && <div style={{position: 'absolute', left: 0, right: 0, bottom: bh + 30, textAlign: 'center', opacity: o}}><span style={{...font, fontSize: 40, color: '#fff', background: 'rgba(8,12,22,0.8)', border: '3px solid #ffd23f', borderRadius: 12, padding: '2px 18px 0'}}>{rp[3]}</span></div>}
    </AbsoluteFill>);
  }
  if (!MAP) return <>{top}</>;
  return <AbsoluteFill style={{pointerEvents: 'none', zIndex: 6}}>
      <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{svg}</svg>
      {html}
    </AbsoluteFill>;
};
export const inReplay = (D: any, tR: number) => !!(D.vs && D.vs.bt && ((D.vs.bt.rp || []) as any[]).some((r) => tR >= r[0] && tR < r[1]));
