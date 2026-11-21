import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate} from 'remotion';
import J_pop from './pop.json';
import J_az from './az.json';
import J_esp from './esp.json';
import J_peak from './peak.json';
import J_dbl from './dbl.json';
import J_army from './army.json';
import J_hd from './hd.json';
import J_d365 from './d365.json';
import ICONS from './icons.json';
const HDSET = new Set<string>(J_hd as string[]);

const JM: Record<string, any> = {pop: J_pop, az: J_az, esp: J_esp, peak: J_peak, dbl: J_dbl, army: J_army, d365: J_d365};
export const satFrames = (v: string, fps: number) => Math.round((JM[v] as any).dur * fps);
const WW = 16384, WH = 11123, TS = 1024, NX = 16, NY = 11;
let VW = 1080, VH = 1920;

let fontsOk = false;
const useFonts = () => {
  const [h] = React.useState(() => (fontsOk ? 0 : delayRender('fonts')));
  React.useEffect(() => {
    if (fontsOk) return;
    Promise.all([
      new FontFace('Mont', `url(${staticFile('sat/mont800.woff2')})`, {weight: '800'}).load(),
      new FontFace('Mont', `url(${staticFile('sat/mont900.woff2')})`, {weight: '900'}).load(),
      new FontFace('Spartan', `url(${staticFile('sat/spartan800.woff2')})`, {weight: '800'}).load(),
    ]).then((fs) => { fs.forEach((f) => (document as any).fonts.add(f)); fontsOk = true; continueRender(h); }).catch(() => continueRender(h));
  }, []);
};
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eout = (u: number) => 1 - Math.pow(1 - u, 3);
const cl = (u: number) => Math.max(0, Math.min(1, u));
// cámara: keys [t, x, y, z, ease]  ease: 'io' | 'lin' | 'out'
const camAt = (keys: any[], t: number) => {
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a[0] && t < b[0]) {
      const u0 = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
      const e = b[4] || 'io';
      const u = e === 'lin' ? u0 : e === 'out' ? eout(u0) : eio(u0);
      const lz = Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * u;
      return {x: a[1] + (b[1] - a[1]) * u, y: a[2] + (b[2] - a[2]) * u, z: Math.exp(lz)};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], z: l[3]};
};
const valAt = (keys: any[] | undefined, t: number, def = 0) => {
  if (!keys || !keys.length) return def;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a[0] && t < b[0]) return a[1] + (b[1] - a[1]) * eio((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
  }
  return keys[keys.length - 1][1];
};

const Tiles: React.FC<{cx: number; cy: number; z: number}> = ({cx, cy, z}) => {
  const hw = VW / 2 / z, hh = VH / 2 / z;
  const x0 = cx - hw, y0 = cy - hh, x1 = cx + hw, y1 = cy + hh;
  if (z < 0.33) {
    return <>{[-1, 0, 1].filter((k) => VW / 2 + (k * WW - cx) * z < VW && VW / 2 + ((k + 1) * WW - cx) * z > 0).map((k) => <Img key={k} src={staticFile('sat/low.webp')} style={{position: 'absolute', left: VW / 2 + (k * WW - cx) * z, top: VH / 2 - cy * z, width: WW * z, height: WH * z}} />)}</>;
  }
  const out: any[] = [];
  const tx0 = Math.floor(x0 / TS), tx1 = Math.floor(x1 / TS);
  const ty0 = Math.max(0, Math.floor(y0 / TS)), ty1 = Math.min(NY - 1, Math.floor(y1 / TS));
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const h = ty === NY - 1 ? WH - ty * TS : TS;
    const m = ((tx % NX) + NX) % NX;
    out.push(<Img key={`${tx}_${ty}`} src={staticFile(`sat/t${m}_${ty}.webp`)} style={{position: 'absolute', left: VW / 2 + (tx * TS - cx) * z - 0.5, top: VH / 2 + (ty * TS - cy) * z - 0.5, width: TS * z + 1, height: h * z + 1}} />);
  }
  if (z > 1.1) {
    const HS = 256;
    const hx0 = Math.floor(x0 / HS), hx1 = Math.floor(x1 / HS), hy0 = Math.max(0, Math.floor(y0 / HS)), hy1 = Math.floor(y1 / HS);
    for (let ty = hy0; ty <= hy1; ty++) for (let tx = hx0; tx <= hx1; tx++) {
      const m = ((tx % 64) + 64) % 64; const key = `${m}_${ty}`;
      if (!HDSET.has(key)) continue;
      out.push(<Img key={'h' + key + '_' + tx} src={staticFile(`sat/hd/${key}.webp`)} style={{position: 'absolute', left: VW / 2 + (tx * HS - cx) * z - 0.5, top: VH / 2 + (ty * HS - cy) * z - 0.5, width: HS * z + 1, height: HS * z + 1}} />);
    }
  }
  return <>{out}</>;
};


// ---------- formas ----------
const Shapes: React.FC<{D: any; t: number; cx: number; cy: number; z: number}> = ({D, t, cx, cy, z}) => {
  const vis = (D.shapes || []).filter((s: any) => t >= s.t0 && t <= s.t1 + (s.fo || 0));
  const hist = D.hist || {};
  return (
    <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <filter id="shd" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx={0} dy={6 / z} stdDeviation={7 / z} floodColor="#000" floodOpacity={0.55} /></filter>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width={16 / z} height={16 / z} patternTransform="rotate(45)">
          <rect width={16 / z} height={16 / z} fill="rgba(20,20,20,0.85)" /><rect width={7 / z} height={16 / z} fill="rgba(255,255,255,0.92)" />
        </pattern>
        <pattern id="paper" patternUnits="userSpaceOnUse" width={512 / z} height={512 / z}><image href={staticFile('sat/paper.png')} width={512 / z} height={512 / z} /></pattern>
        {vis.filter((s: any) => s.fill && !s.fill.startsWith('#') && s.fill !== 'hatch' && s.fill !== 'none').map((s: any) => {
          const bb = s.fbb || s.bb; const w = bb[2] - bb[0], h = bb[3] - bb[1];
          const href = s.fill.startsWith('flag:') ? staticFile(`wflags/${s.fill.slice(5)}.svg`) : 'data:image/svg+xml;utf8,' + encodeURIComponent(hist[s.fill.slice(4)] || '');
          return <pattern key={'p' + s.id} id={'p' + s.id} patternUnits="userSpaceOnUse" x={bb[0]} y={bb[1]} width={w} height={h}><image href={href} width={w} height={h} preserveAspectRatio={s.fit || 'xMidYMid slice'} /></pattern>;
        })}
        {vis.filter((s: any) => s.fin === 'wipe' || s.fin === 'radial').map((s: any) => {
          const u = cl((t - s.t0) / (s.fd || 0.6));
          const bb = s.bb; const r = Math.hypot(bb[2] - bb[0], bb[3] - bb[1]) * (s.fin === 'radial' ? 0.75 : 1);
          const ox = s.org ? s.org[0] : (bb[0] + bb[2]) / 2, oy = s.org ? s.org[1] : (bb[1] + bb[3]) / 2;
          return <clipPath key={'c' + s.id} id={'c' + s.id}><circle cx={ox} cy={oy} r={Math.max(0.01, r * eout(u))} /></clipPath>;
        })}
      </defs>
      <g transform={`translate(${VW / 2},${VH / 2}) scale(${z}) translate(${-cx},${-cy})`}>
        {vis.sort((a: any, b: any) => (a.zi || 0) - (b.zi || 0)).map((s: any) => {
          const fin = s.fin || 'pop'; const fd = s.fd || 0.3;
          let op = 1, sc = 1;
          const u = cl((t - s.t0) / fd);
          if (fin === 'pop') { op = cl(u * 2.2); sc = 0.82 + 0.18 * eout(u) + Math.sin(Math.PI * u) * 0.04; }
          else if (fin === 'fade') op = u;
          if (s.fo && t > s.t1) op *= 1 - cl((t - s.t1) / s.fo);
          if (s.fo === 0 && t > s.t1) op = 0;
          if (s.op !== undefined) op *= s.op;
          const c = s.org || [(s.bb[0] + s.bb[2]) / 2, (s.bb[1] + s.bb[3]) / 2];
          if (s.arrow) { const u2 = eout(cl((t - s.t0) / (s.fd || 0.8))); return <g key={s.id} opacity={op}><path d={s.d} fill="none" stroke={s.arrow} strokeWidth={9 / z} strokeLinecap="round" strokeDasharray={100000} strokeDashoffset={100000 - s.len * u2} style={{filter: `drop-shadow(0 ${3 / z}px ${4 / z}px rgba(0,0,0,0.7))`}} />{u2 > 0.98 ? <polygon points={`0,${-16 / z} ${30 / z},0 0,${16 / z}`} fill={s.arrow} transform={`translate(${s.end[0]},${s.end[1]}) rotate(${s.ang})`} /> : null}</g>; }
          const fill = s.fill === 'none' ? 'none' : s.fill === 'hatch' ? 'url(#hatch)' : s.fill.startsWith('#') ? s.fill : `url(#p${s.id})`;
          const clip = fin === 'wipe' || fin === 'radial' ? `url(#c${s.id})` : undefined;
          return (
            <g key={s.id} opacity={op} transform={sc !== 1 ? `translate(${c[0]},${c[1]}) scale(${sc}) translate(${-c[0]},${-c[1]})` : undefined} clipPath={clip}>
              <path d={s.d} fill={fill} filter={s.noshadow ? undefined : 'url(#shd)'} fillRule="evenodd" />
              {s.fill !== 'hatch' && s.fill !== 'none' && !s.noTex ? <path d={s.d} fill="url(#paper)" fillRule="evenodd" style={{mixBlendMode: 'multiply'}} opacity={0.55} /> : null}
              {s.stroke ? <path d={s.d} fill="none" stroke={s.stroke} strokeWidth={(s.sw || 2) / z} fillRule="evenodd" style={s.glow ? {filter: `drop-shadow(0 0 ${6 / z}px ${s.stroke}) drop-shadow(0 0 ${14 / z}px ${s.stroke})`} : undefined} strokeDasharray={s.draw ? 100000 : undefined} strokeDashoffset={s.draw ? 100000 * (1 - eout(cl((t - s.t0) / s.draw))) : undefined} /> : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ---------- unidades, disparos y explosiones (pantalla, tamaño fijo) ----------
const posAt = (p: number[][], t: number) => {
  if (t <= p[0][0]) return [p[0][1], p[0][2], 0];
  for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1];
    if (t >= a[0] && t <= b[0]) { const u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]); const e = u * u * (3 - 2 * u); return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e, Math.atan2(b[2] - a[2], b[1] - a[1])]; } }
  const l = p[p.length - 1], q = p[Math.max(0, p.length - 2)]; return [l[1], l[2], Math.atan2(l[2] - q[2], l[1] - q[1])];
};
const Units: React.FC<{D: any; t: number; cx: number; cy: number; z: number}> = ({D, t, cx, cy, z}) => {
  const U = (D.units || []) as any[]; if (!U.length && !(D.booms || []).length) return null;
  const sx = (x: number) => VW / 2 + (x - cx) * z, sy = (y: number) => VH / 2 + (y - cy) * z;
  const els: any[] = [];
  for (const sh of (D.shots || []) as any[]) { const [t0, x0, y0, x1, y1, col] = sh; const u = (t - t0) / 0.22; if (u < 0 || u > 1) continue;
    const a = Math.max(0, u - 0.35), b = Math.min(1, u + 0.05);
    els.push(<line key={'s' + t0 + x0} x1={sx(x0 + (x1 - x0) * a)} y1={sy(y0 + (y1 - y0) * a)} x2={sx(x0 + (x1 - x0) * b)} y2={sy(y0 + (y1 - y0) * b)} stroke={col || '#ffe08a'} strokeWidth={3} strokeLinecap="round" opacity={0.95} />); }
  for (const u of U) {
    if (t < u.p[0][0] || t > u.p[u.p.length - 1][0] + (u.die !== undefined ? 0.6 : 0)) continue;
    const [x, y, ang] = posAt(u.p, t); const X = sx(x), Y = sy(y);
    if (X < -80 || X > VW + 80 || Y < -80 || Y > VH + 80) continue;
    const dead = u.die !== undefined && t >= u.die; const op = dead ? Math.max(0, 1 - (t - u.die) / 0.5) : Math.min(1, (t - u.p[0][0]) / 0.25);
    const S = u.k === 'jet' ? 54 : u.k === 'ship' ? 58 : u.k === 'tank' ? 46 : u.k === 'heli' ? 50 : 38;
    const icon = (ICONS as any)[u.k] as string[];
    if (u.k === 'jet' || u.k === 'heli') {
      const dg = ang * 180 / Math.PI + 45;
      if (u.k === 'jet') { const [x2, y2] = posAt(u.p, t - 0.6); els.push(<line key={u.id + 'c'} x1={sx(x2)} y1={sy(y2)} x2={X} y2={Y} stroke="rgba(255,255,255,0.55)" strokeWidth={5} strokeLinecap="round" opacity={op} />); }
      els.push(<g key={u.id} opacity={op} transform={`translate(${X},${Y}) rotate(${dg}) translate(${-S / 2},${-S / 2})`}><g transform={`scale(${S / 512})`}>{icon.map((d, i) => <path key={i} d={d} fill={u.col} stroke="#000" strokeWidth={22} paintOrder="stroke" />)}</g></g>);
    } else {
      const flip = Math.cos(ang) < 0 ? -1 : 1;
      els.push(<g key={u.id} opacity={op} transform={`translate(${X},${Y})`}>
        <circle r={S * 0.62} fill={u.col} stroke="#111" strokeWidth={3} />
        <circle r={S * 0.62 - 4} fill="none" stroke={u.col2 || '#fff'} strokeWidth={3} />
        <g transform={`scale(${flip},1) translate(${-S * 0.4},${-S * 0.4}) scale(${S * 0.8 / 512})`}>{icon.map((d, i) => <path key={i} d={d} fill="#fff" />)}</g>
        {dead ? <path d={`M${-S * 0.45},${-S * 0.45} L${S * 0.45},${S * 0.45} M${S * 0.45},${-S * 0.45} L${-S * 0.45},${S * 0.45}`} stroke="#ff2a2a" strokeWidth={7} strokeLinecap="round" /> : null}
      </g>);
    }
  }
  for (const b of (D.booms || []) as any[]) { const [t0, x, y, r] = b; const u = (t - t0) / 0.7; if (u < 0 || u > 1) continue;
    const R = (r || 30) * (0.4 + 0.9 * Math.sqrt(u)); const X = sx(x), Y = sy(y);
    els.push(<g key={'b' + t0 + x}><circle cx={X} cy={Y} r={R * 1.25} fill="#ffb02e" opacity={0.35 * (1 - u)} /><circle cx={X} cy={Y} r={R} fill="#ff6a00" opacity={0.85 * (1 - u)} /><circle cx={X} cy={Y} r={R * 0.55} fill="#fff3b0" opacity={1 - u} /></g>); }
  return <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0}}>{els}</svg>;
};
// ---------- HUD de guerra (diseño militar) ----------
const Mil: React.FC<{x: number; w: number; col: string; children: any; sm?: boolean}> = ({x, w, col, children}) => (
  <div style={{position: 'absolute', left: x, top: 26, width: w, height: 122, clipPath: 'polygon(22px 0, calc(100% - 22px) 0, 100% 22px, 100% calc(100% - 22px), calc(100% - 22px) 100%, 22px 100%, 0 calc(100% - 22px), 0 22px)', background: col, padding: 4, boxSizing: 'border-box', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))'}}>
    <div style={{width: '100%', height: '100%', clipPath: 'polygon(19px 0, calc(100% - 19px) 0, 100% 19px, 100% calc(100% - 19px), calc(100% - 19px) 100%, 19px 100%, 0 calc(100% - 19px), 0 19px)', background: 'linear-gradient(180deg,#232823,#141714)', display: 'flex', alignItems: 'center'}}>{children}</div>
  </div>);
const WarHud: React.FC<{D: any; t: number}> = ({D, t}) => {
  const H = ((D.hud2 || []) as any[]).find((h) => t >= h.t0 && t <= h.t1); if (!H) return null;
  const o = Math.min(1, (t - H.t0) / 0.4, (H.t1 - t) / 0.4);
  const side = (S: any, keys: any[], x: number) => { const v = Math.max(0, Math.round(valAt(keys, t, keys[0][1]))); const dead = v <= 0;
    return <Mil x={x} w={470} col="#7a8a3a">
      <div style={{width: 128, height: '100%', position: 'relative', background: `linear-gradient(135deg, ${S.c1} 0 50%, ${S.c2} 50% 100%)`, clipPath: 'polygon(0 0, 100% 0, 78% 100%, 0 100%)'}}>
        <svg viewBox="0 0 512 512" style={{position: 'absolute', left: 16, top: 14, width: 86, height: 86, opacity: 0.85}}>{(ICONS as any).inf.map((d: string, i: number) => <path key={i} d={d} fill="#0d0f0d" />)}</svg></div>
      <div style={{flex: 1, textAlign: 'center', paddingRight: 14}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}><div style={{width: 34, height: 5, background: '#8fa63a'}} /><span style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 24, color: '#9fbd3c', letterSpacing: 2}}>{S.name}</span><div style={{width: 34, height: 5, background: '#8fa63a'}} /></div>
        <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 60, color: dead ? '#ff3b30' : '#fff', lineHeight: 1.05, letterSpacing: 2, textShadow: '0 3px 0 #000'}}>{fmtN(v)}</div>
        <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 16, color: '#9aa58a', letterSpacing: 4}}>SOLDIERS</div>
      </div></Mil>; };
  const dv = Math.max(0, Math.floor(valAt(H.day, t, 0)));
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>
    {side(H.a, H.sA, 30)}{side(H.b, H.sB, VW - 500)}
    <Mil x={VW / 2 - 190} w={380} col="#d8c49a">
      <div style={{width: 120, height: '100%', background: '#3f8a2a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span style={{fontSize: 64}}>{H.unit === 'HOURS' ? '⏱️' : '🗺️'}</span></div>
      <div style={{flex: 1, textAlign: 'center'}}>
        <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 28, color: '#6fc23a', letterSpacing: 3}}>— {H.unit} —</div>
        <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 64, color: '#fff', lineHeight: 1, textShadow: '0 3px 0 #000'}}>{String(dv).padStart(2, '0')}</div>
      </div></Mil>
  </div>;
};

// ---------- textos ----------
const glow = (c: string, k = 1) => `0 0 ${10 * k}px ${c}, 0 0 ${22 * k}px ${c}, 0 3px 6px rgba(0,0,0,0.6)`;
const fmtN = (v: number, sep = ',') => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
const Texts: React.FC<{D: any; t: number}> = ({D, t}) => {
  const items = (D.texts || []).filter((x: any) => t >= x.t0 && t < x.t1);
  return <>{items.map((x: any, i: number) => {
    const u = cl((t - x.t0) / 0.22);
    const out = x.fo ? cl((x.t1 - t) / x.fo) : 1;
    const pop = 0.7 + 0.3 * eout(u) + Math.sin(Math.PI * u) * 0.08;
    const cnt = x.counter ? (() => { const c = x.counter; const uu = cl((t - c.t0) / Math.max(0.01, c.t1 - c.t0)); return c.v0 + (c.v1 - c.v0) * (c.ease === 'lin' ? uu : eout(uu)); })() : null;
    if (x.kind === 'dbl') {
      const v = cnt ?? 0; const col = v < 0 || x.neg ? '#ff2a45' : '#39ff2a';
      const sign = v < 0 ? '–' : '+';
      return <div key={i} style={{position: 'absolute', top: x.y ?? 230, width: VW, textAlign: 'center', opacity: cl(u * 3) * out}}>
        <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: x.fs || 104, color: '#fff', textShadow: glow('rgba(255,255,255,0.75)'), letterSpacing: -2, lineHeight: 1}}>{x.name}</div>
        {x.counter ? <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 52, color: col, textShadow: glow(col, 0.9), marginTop: 8, letterSpacing: -2}}>{x.raw ? x.raw : `${sign}${fmtN(Math.abs(v))}% ${x.unit || 'LAND'}`}</div> : null}
        {x.sub ? <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 50, color: x.subcol || '#ffd84a', textShadow: glow(x.subcol || '#ffd84a', 0.8), marginTop: 8, letterSpacing: -1}}>{x.sub}</div> : null}
      </div>;
    }
    if (x.kind === 'kr') {
      return <div key={i} style={{position: 'absolute', top: x.y ?? 200, width: VW, textAlign: 'center', opacity: cl(u * 3) * out}}>
        <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: x.fs || 86, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.8)', lineHeight: 1.05}}>{x.name}</div>
        <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 52, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.8)', marginTop: 6}}>{x.year}{x.bc ? <span style={{color: '#ffd23f'}}> BC</span> : null}</div>
        {x.size ? <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 50, color: x.sizecol || '#39ff2a', textShadow: glow(x.sizecol || '#39ff2a', 0.8), marginTop: 10}}>{x.counter ? `${x.pre || ''}${fmtN(cnt ?? 0)}${x.post || ''}` : x.size}</div> : null}
      </div>;
    }
    if (x.kind === 'pop') {
      return <div key={i} style={{position: 'absolute', top: x.y ?? 150, width: VW, textAlign: 'center'}}>
        <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 50, color: x.col, textShadow: '0 3px 8px rgba(0,0,0,0.9)', lineHeight: 1}}>{x.label}</div>
        <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 50, color: '#fff', textShadow: '0 3px 8px rgba(0,0,0,0.9)', marginTop: 4}}>{fmtN(cnt ?? 0, '.')}</div>
      </div>;
    }
    if (x.kind === 'az') {
      return <div key={i} style={{position: 'absolute', top: x.y ?? 120, width: VW, textAlign: 'center', fontFamily: 'Spartan', fontWeight: 800, fontSize: x.fs || 230, color: '#fff', textShadow: '0 6px 18px rgba(0,0,0,0.6)', transform: `scale(${pop})`, lineHeight: 1}}>{x.text}</div>;
    }
    if (x.kind === 'big') {
      return <div key={i} style={{position: 'absolute', top: x.y ?? 800, width: VW, textAlign: 'center', fontFamily: x.font || 'Mont', fontWeight: 800, fontSize: x.fs || 92, color: x.col || '#fff', textShadow: x.glow === false ? '0 6px 18px rgba(0,0,0,0.7)' : glow(x.gcol || 'rgba(255,255,255,0.7)'), lineHeight: 1.05, opacity: cl(u * 3) * out, transform: `scale(${pop})`, whiteSpace: 'pre-line', letterSpacing: x.ls ?? -2}}>{x.text}</div>;
    }
    if (x.kind === 'date') {
      const yv = valAt(D.year, t, 0); const yr = Math.floor(yv); const mo = Math.min(11, Math.floor((yv - yr) * 12));
      const MS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return <div key={i} style={{position: 'absolute', top: x.y ?? 170, width: VW, textAlign: 'center'}}>
        <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 132, color: '#fff', textShadow: '0 0 18px rgba(0,0,0,0.95), 0 0 6px #000, 0 4px 10px #000', lineHeight: 1, letterSpacing: -3}}>{yr}</div>
        <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 52, color: '#ffd23f', textShadow: '0 0 14px rgba(0,0,0,0.95), 0 0 4px #000', marginTop: 6, letterSpacing: 4}}>{MS[mo]}</div>
      </div>;
    }
    if (x.kind === 'tag') {
      return <div key={i} style={{position: 'absolute', top: x.y ?? 1640, width: VW, textAlign: 'center', opacity: cl(u * 3) * out}}>
        <span style={{fontFamily: 'Mont', fontWeight: 800, fontSize: x.fs || 46, color: '#fff', background: x.bg || 'rgba(0,0,0,0.55)', padding: '12px 28px', borderRadius: 18, border: `3px solid ${x.col || '#ffd23f'}`, textShadow: '0 2px 6px #000'}}>{x.text}</span>
      </div>;
    }
    if (x.kind === 'bars4') {
      const L = [['1 DAY', 0.06, '#7dd3fc'], ['1 WEEK', 0.22, '#5dff8a'], ['1 MONTH', 0.5, '#ffd23f'], ['1 YEAR', 1.0, '#ff4a3c']];
      return <div key={i} style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `rgba(4,8,18,${0.62 * cl(u * 3) * out})`, opacity: out}}>
        <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: 2, textShadow: glow('rgba(255,255,255,0.5)', 0.6), opacity: cl(u * 3)}}>{x.title}</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 60, height: 520, marginTop: 40}}>
          {L.map((b: any, j: number) => { const k = eout(cl((t - x.t0 - 0.3 - j * 0.32) / 0.55)); const pop = cl((t - x.t0 - 0.3 - j * 0.32) / 0.2);
            return <div key={j} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 230, opacity: pop}}>
              <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 40, color: b[2], marginBottom: 12, textShadow: glow(b[2], 0.5)}}>{j === 3 && k > 0.95 ? '???' : ''}</div>
              <div style={{width: 170, height: Math.max(14, 430 * b[1] * k), background: `linear-gradient(180deg, ${b[2]}, ${b[2]}88)`, borderRadius: '18px 18px 6px 6px', border: '4px solid rgba(255,255,255,0.85)', boxShadow: `0 0 26px ${b[2]}88`}} />
              <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 42, color: '#fff', marginTop: 16, letterSpacing: 1}}>{b[0]}</div></div>; })}
        </div></div>;
    }
    if (x.kind === 'warintro') {
      const k = eout(u);
      return <div key={i} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(3,8,20,${0.5 * cl(u * 3) * out})`}}>
        <div style={{textAlign: 'center', transform: `scale(${0.6 + 0.4 * k})`, opacity: cl(u * 3) * out}}>
          <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 52, color: '#ffd23f', letterSpacing: 8, textShadow: glow('#ffd23f', 0.6)}}>{x.pre}</div>
          <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 190, color: '#fff', lineHeight: 1, textShadow: glow('rgba(255,255,255,0.55)'), letterSpacing: -4}}>{x.big}</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 18}}>
            <img src={staticFile(`wflags/${x.a}.svg`)} style={{height: 80, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.6)'}} />
            <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 56, color: '#fff'}}>{x.na} <span style={{color: '#ff4a3c'}}>VS</span> {x.nb}</div>
            <img src={staticFile(`wflags/${x.b}.svg`)} style={{height: 80, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.6)'}} />
          </div></div></div>;
    }
    if (x.kind === 'rank') {
      const k = eout(u);
      return <div key={i} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(3,8,20,${0.55 * cl(u * 3) * out})`}}>
        <div style={{textAlign: 'center', transform: `scale(${0.6 + 0.4 * k})`, opacity: cl(u * 3) * out}}>
          <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 64, color: x.col, letterSpacing: 6, textShadow: glow(x.col, 0.8)}}>{x.pre}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 34, justifyContent: 'center', marginTop: 12}}>
            <img src={staticFile(`wflags/${x.iso}.svg`)} style={{height: 120, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.6)'}} />
            <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 132, color: '#fff', textShadow: glow('rgba(255,255,255,0.6)'), letterSpacing: -3}}>{x.name}</div>
          </div>
          <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 40, color: '#cfd8e6', marginTop: 10, letterSpacing: 4}}>{x.sub}</div>
        </div></div>;
    }
    if (x.kind === 'stats') {
      return <div key={i} style={{position: 'absolute', left: x.right ? undefined : 70, right: x.right ? 70 : undefined, top: 230, width: 620, opacity: cl(u * 3) * out, transform: `translateX(${(1 - eout(u)) * (x.right ? 80 : -80)}px)`}}>
        <div style={{background: 'rgba(6,12,26,0.82)', border: `3px solid ${x.col}`, borderRadius: 26, padding: '22px 30px 26px', boxShadow: `0 0 30px ${x.col}55`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><img src={staticFile(`wflags/${x.iso}.svg`)} style={{height: 44, borderRadius: 6}} /><div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 44, color: '#fff'}}>{x.name}</div><div style={{marginLeft: 'auto', fontFamily: 'Mont', fontWeight: 900, fontSize: 40, color: x.col}}>#{x.rank}</div></div>
          {(x.rows as any[]).map((r: any, j: number) => { const uu = eout(cl((t - x.t0 - 0.4 - j * 0.35) / 0.9)); const v = r[2] * uu;
            return <div key={j} style={{marginTop: 18, opacity: cl((t - x.t0 - 0.3 - j * 0.35) / 0.2)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'Mont', fontWeight: 800, fontSize: 30, color: '#dfe6f2'}}><span>{r[0]}</span><span style={{color: '#fff'}}>{r[1].replace('{v}', fmtN(v))}</span></div>
              <div style={{height: 16, background: 'rgba(255,255,255,0.12)', borderRadius: 8, marginTop: 6, overflow: 'hidden'}}><div style={{width: `${Math.max(1.5, r[4] * uu * 100)}%`, height: '100%', background: x.col, borderRadius: 8, boxShadow: `0 0 12px ${x.col}`}} /></div></div>; })}
        </div></div>;
    }
    if (x.kind === 'counters') {
      return <div key={i} style={{position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', justifyContent: 'center', gap: 46, opacity: out}}>
        {(x.items as any[]).map((it: any, j: number) => { const uu = cl((t - x.t0 - j * 0.45) / 0.25); const cc = eout(cl((t - x.t0 - j * 0.45) / 1.4)); const v = it[1] + (it[2] - it[1]) * cc;
          return <div key={j} style={{width: 380, textAlign: 'center', background: 'rgba(6,12,26,0.85)', border: '3px solid rgba(255,255,255,0.35)', borderRadius: 24, padding: '14px 10px 18px', opacity: uu, transform: `scale(${0.7 + 0.3 * eout(uu)})`}}>
            <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 84, color: it[4] || '#ffd23f', lineHeight: 1, textShadow: glow(it[4] || '#ffd23f', 0.6)}}>{it[5] || ''}{it[6] ? Math.round(v) : fmtN(v)}{it[7] || ''}</div>
            <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 26, color: '#dfe6f2', marginTop: 8, letterSpacing: 2}}>{it[0]}</div></div>; })}
      </div>;
    }
    if (x.kind === 'warcard') {
      return <div key={i} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(3,8,20,${0.6 * cl(u * 3) * out})`}}>
        <div style={{textAlign: 'center', opacity: cl(u * 3) * out}}>
          <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 52, color: '#fff', letterSpacing: 2, textShadow: glow('rgba(255,255,255,0.5)', 0.6)}}>AND THIS WAS THEIR MOST IMPORTANT WAR…</div>
          <div style={{fontFamily: 'Mont', fontWeight: 900, fontSize: 104, color: '#ffd23f', marginTop: 16, textShadow: glow('#ffd23f', 0.7), transform: `scale(${0.8 + 0.2 * eout(cl((t - x.t0 - 0.6) / 0.3))})`, opacity: cl((t - x.t0 - 0.6) / 0.2)}}>{x.war}</div>
          <div style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 48, color: '#cfd8e6', marginTop: 6, opacity: cl((t - x.t0 - 0.9) / 0.2)}}>{x.years}</div>
        </div></div>;
    }
    if (x.kind === 'stamp') {
      const k = eout(cl((t - x.t0) / 0.18));
      return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: x.y ?? 420, textAlign: 'center', opacity: out}}>
        <span style={{display: 'inline-block', fontFamily: 'Mont', fontWeight: 900, fontSize: x.fs || 78, color: x.col || '#ff3b30', border: `8px solid ${x.col || '#ff3b30'}`, borderRadius: 18, padding: '6px 34px', transform: `rotate(-6deg) scale(${2.2 - 1.2 * k})`, background: 'rgba(0,0,0,0.45)', textShadow: '0 4px 10px #000'}}>{x.text}</span></div>;
    }
    if (x.kind === 'legend') {
      return <div key={i} style={{position: 'absolute', right: 60, bottom: 70, background: 'rgba(6,12,26,0.82)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 18, padding: '12px 22px', opacity: cl(u * 3) * out}}>
        {(x.items as any[]).map((it: any, j: number) => <div key={j} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: j ? 8 : 0}}><div style={{width: 34, height: 24, borderRadius: 5, background: it[1], border: '2px solid rgba(255,255,255,0.6)'}} /><span style={{fontFamily: 'Mont', fontWeight: 800, fontSize: 30, color: '#fff'}}>{it[0]}</span></div>)}
      </div>;
    }
    return null;
  })}</>;
};

export const SatShort: React.FC<{v: string; audio?: boolean}> = ({v, audio = true}) => {
  useFonts();
  const f = useCurrentFrame(); const {fps, width} = useVideoConfig();
  const D: any = JM[v];
  VW = D.vw || 1080; VH = D.vh || 1920;
  const t = f / fps;
  const clampC = (q: any) => { const z = Math.max(q.z, VH / WH * 1.01); const hh = VH / 2 / z; return {x: q.x, y: Math.min(WH - hh, Math.max(hh, q.y)), z}; };
  const c = clampC(camAt(D.cam, t));
  const dt = 1 / 30;
  const c2 = clampC(camAt(D.cam, t - dt));
  const sp = Math.hypot((c.x - c2.x) * c.z, (c.y - c2.y) * c.z) / VW * 30 + Math.abs(Math.log(c.z / c2.z)) * 30 * 0.6;
  const blur = Math.min(D.maxBlur ?? 12, Math.max(0, (sp - 0.35) * (D.blurK ?? 5)));
  const gray = valAt(D.gray, t, 0), dark = valAt(D.dark, t, 0);
  const S = width / VW;
  return (
    <AbsoluteFill style={{background: '#04122a'}}>
      <div style={{position: 'absolute', width: VW, height: VH, transform: `scale(${S})`, transformOrigin: '0 0', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, filter: `blur(${blur.toFixed(2)}px)`}}>
          <div style={{position: 'absolute', inset: 0, filter: `saturate(${(1 - gray) * (D.sat ?? 1.05)}) brightness(${1 - dark * 0.55})`}}><Tiles cx={c.x} cy={c.y} z={c.z} /></div>
          <div style={{position: 'absolute', inset: 0, background: `rgba(2,10,30,${D.oceanDim ?? 0.08})`}} />
          <Shapes D={D} t={t} cx={c.x} cy={c.y} z={c.z} />
          <Units D={D} t={t} cx={c.x} cy={c.y} z={c.z} />
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />
        <WarHud D={D} t={t} />
        <Texts D={D} t={t} />
        {D.wm ? <div style={{position: 'absolute', bottom: 70, width: VW, textAlign: 'center', fontFamily: 'Mont', fontWeight: 800, fontSize: 24, color: 'rgba(255,255,255,0.35)'}}>{D.wm}</div> : null}
      </div>
      {audio && D.audio ? <Audio src={staticFile(D.audio)} /> : null}
    </AbsoluteFill>
  );
};
