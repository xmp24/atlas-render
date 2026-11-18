// HUD de "1 VS 500,000,000": defensor vs ejército mundial, escalera de intentos, reloj de supervivencia, récord, ticker
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {font, font2, INK} from './lib3';
import WJ from './world.json';

// ---------------------------------------------------------------- piezas de países (para pintar el mapa)
const PCS = ((WJ as any).pieces as any[]).filter((p) => p.d && p.bbox).map((p) => ({d: p.d as string, code: p.code as string, cx: (p.bbox[0] + p.bbox[2]) * 2, cy: (p.bbox[1] + p.bbox[3]) * 2}));
const ssm = (a: number, b: number, x: number) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
// mapa que se pinta país a país desde un punto mientras la cámara hace zoom (sin transición)
const MapPaint: React.FC<{P: any[]; t: number; cam: any}> = ({P, t, cam}) => {
  const [t0, t1, px, py] = P; if (t < t0 || t > t1) return null;
  const s = cam.s; const span = t1 - t0 - 0.7;
  const dmax = 4200;
  return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 5, pointerEvents: 'none'}}>
    <rect width={1920} height={1080} fill="#050a14" opacity={0.6 * (1 - ssm(t0, t1 - 0.3, t))} />
    <g transform={`translate(${960 - cam.cx * s},${540 - cam.cy * s}) scale(${s * 4})`}>
      {PCS.map((p, i) => { const d = Math.hypot(p.cx - px, p.cy - py); const tr = t0 + span * Math.pow(Math.min(1, d / dmax), 0.75);
        const o = 1 - ssm(tr, tr + 0.4, t); if (o <= 0.01) return null; const flash = t > tr && t < tr + 0.25 ? 1 : 0;
        return <path key={i} d={p.d} fill={flash ? '#e8eef8' : '#2c3342'} fillOpacity={o} stroke="#0d1119" strokeOpacity={o} strokeWidth={0.6 / s} />; })}
    </g></svg>;
};


// ---------------------------------------------------------------- extras v4
const BallKO: React.FC<{code: string; size: number; t: number; t0: number}> = ({code, size, t, t0}) => {
  const k = pop(t, t0, 0.3); const sh = Math.sin((t - t0) * 30) * Math.max(0, 1 - (t - t0) / 0.6) * 8;
  return <div style={{position: 'relative', width: size, height: size, transform: `scale(${k}) rotate(${sh - 12}deg)`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `5px solid ${INK}`, boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}><Img src={flag(code)} style={{width: '160%', height: '100%', objectFit: 'cover', marginLeft: '-30%', filter: 'saturate(0.7) brightness(0.85)'}} /></div>
    {[0.32, 0.62].map((x, i) => <div key={i} style={{position: 'absolute', left: size * x, top: size * 0.3, ...font, fontSize: size * 0.3, color: '#fff', ...stroke(6)}}>✖</div>)}
  </div>;
};
const Confetti: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const lt = t - t0; if (lt < 0 || lt > 1.6) return null;
  return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 46, pointerEvents: 'none'}}>
    {Array.from({length: 70}, (_, i) => { const r1 = Math.abs(Math.sin(i * 12.9898 + t0) * 43758.5) % 1, r2 = Math.abs(Math.sin(i * 78.233 + t0) * 12345.6) % 1;
      const x = 960 + (r1 - 0.5) * 1700 * Math.min(1, lt * 3), y = 140 - 200 * (1 - r2) + lt * lt * 520 + lt * 160; const c = ['#ffd23f', '#3ddc84', '#ff4d6d', '#3a86ff', '#fff'][i % 5];
      return <rect key={i} x={x} y={y} width={14} height={8} fill={c} opacity={Math.max(0, 1 - lt / 1.6)} transform={`rotate(${lt * 600 * (r2 - 0.5)} ${x} ${y})`} />; })}
  </svg>;
};
const MINI = ((WJ as any).pieces as any[]).filter((p) => p.d && p.area > 2).map((p) => ({d: p.d as string, code: p.code as string}));
const MINIC: Record<string, number[]> = {}; for (const p of ((WJ as any).pieces as any[])) { if (!p.bbox) continue; const c = MINIC[p.code]; const ar = (p.bbox[2] - p.bbox[0]) * (p.bbox[3] - p.bbox[1]); if (!c || ar > c[2]) MINIC[p.code] = [(p.bbox[0] + p.bbox[2]) / 2, (p.bbox[1] + p.bbox[3]) / 2, ar]; }
const MiniMap: React.FC<{code: string}> = ({code}) => (
  <div style={{position: 'absolute', right: 22, bottom: 20, width: 300, height: 150, background: 'rgba(8,12,22,0.85)', border: '3px solid #ffffff55', borderRadius: 14, overflow: 'hidden'}}>
    <svg width={300} height={150} viewBox="0 140 1920 960" preserveAspectRatio="xMidYMid slice">
      {MINI.map((p, i) => <path key={i} d={p.d} fill={p.code === code ? '#ffd23f' : '#3b4558'} stroke={p.code === code ? '#fff' : 'none'} strokeWidth={p.code === code ? 6 : 0} />)}
      {MINIC[code] && <circle cx={MINIC[code][0]} cy={MINIC[code][1]} r={70} fill="none" stroke="#ffd23f" strokeWidth={14} />}
    </svg>
  </div>
);

// explicación de 5 s tras el título: de qué va el vídeo
const Explain: React.FC<{E: any[]; t: number}> = ({E, t}) => {
  const [t0, t1, rows] = E; if (t < t0 || t >= t1) return null; const o = Math.min(1, (t - t0) / 0.25, (t1 - t) / 0.3);
  return <AbsoluteFill style={{zIndex: 43, opacity: o, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, rgba(3,6,14,0) 0%, rgba(3,6,14,0.72) 22%, rgba(3,6,14,0.72) 78%, rgba(3,6,14,0) 100%)'}}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
      {rows.map(([ic, a, b]: string[], i: number) => { const ti = t0 + 0.1 + i * 1.45; if (t < ti) return <div key={i} style={{height: 118}} />; const k = pop(t, ti, 0.32);
        return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28, height: 118, transform: `translateX(${(1 - Math.min(1, k)) * -120}px) scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, (t - ti) / 0.15)}}>
          <div style={{width: 112, height: 112, borderRadius: 30, background: ['#3ddc84', '#ffd23f', '#ff4d6d'][i], border: `6px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>{ic}</div>
          <div><div style={{...font, fontSize: 66, color: '#fff', lineHeight: 1, ...stroke(12)}}>{a}</div>
            <div style={{...font2, fontSize: 34, color: ['#aef5c4', '#ffe9a6', '#ffb3ad'][i], letterSpacing: 2, marginTop: 4, ...stroke(7)}}>{b}</div></div>
        </div>; })}
    </div></AbsoluteFill>;
};
// gráfica de los 7 ejércitos
const BARC = ['#3ddc84', '#18c3b5', '#3a86ff', '#8b5cf6', '#ff9f1c', '#ff4d6d', '#ffd23f'];
const Chart: React.FC<{C: any[]; t: number}> = ({C, t}) => {
  const [t0, t1, title, sub, rows] = C; if (t < t0 || t >= t1) return null; const lt = t - t0; const o = Math.min(1, lt / 0.25, (t1 - t) / 0.3);
  const n = rows.length; const bw = 150, gap = 46, base = 860;
  return <AbsoluteFill style={{zIndex: 41, opacity: o, background: 'radial-gradient(ellipse at 50% 60%, rgba(10,16,32,0.55), rgba(2,4,10,0.9))'}}>
    <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{...font, fontSize: 86, color: '#ffd23f', lineHeight: 1, transform: `scale(${pop(t, t0, 0.3)})`, ...stroke(12), textShadow: '0 0 30px rgba(255,210,63,0.5)'}}>{title}</div>
      <div style={{...font2, fontSize: 34, color: '#fff', letterSpacing: 3, marginTop: 6, opacity: cl((lt - 0.3) / 0.3, 0, 1), ...stroke(7)}}>{sub}</div>
    </div>
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>{BARC.map((c, i) => <linearGradient key={i} id={'bg' + i} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity={0.55} /></linearGradient>)}</defs>
      <rect x={180} y={base} width={1560} height={10} rx={5} fill="#ffffff30" />
      {rows.map(([lab, frac]: [string, number], i: number) => { const g = ease((lt - 0.35 - i * 0.28) / 0.55); const h = Math.max(4, 470 * frac * back(Math.min(1, (lt - 0.35 - i * 0.28) / 0.55)));
        const x = 960 - (n * bw + (n - 1) * gap) / 2 + i * (bw + gap); const y = base - h; const c = BARC[i % BARC.length]; const last = i === n - 1; const glow = last ? 0.5 + 0.5 * Math.sin(lt * 7) : 0;
        if (g <= 0) return null;
        return <g key={i} opacity={Math.min(1, g * 2)}>
          {last && <rect x={x - 14} y={y - 14} width={bw + 46} height={h + 14} rx={18} fill={c} opacity={0.18 + 0.2 * glow} />}
          <polygon points={`${x + bw},${y} ${x + bw + 26},${y - 18} ${x + bw + 26},${base - 18} ${x + bw},${base}`} fill={c} opacity={0.55} />
          <polygon points={`${x},${y} ${x + 26},${y - 18} ${x + bw + 26},${y - 18} ${x + bw},${y}`} fill="#ffffff" opacity={0.45} />
          <rect x={x} y={y} width={bw} height={h} fill={`url(#bg${i})`} stroke={INK} strokeWidth={4} />
          <rect x={x + 10} y={y + 8} width={14} height={Math.max(0, h - 16)} rx={7} fill="#ffffff" opacity={0.28} />
          <text x={x + bw / 2} y={y - 30} textAnchor="middle" fontSize={48} style={{fontFamily: 'Lilita'}} fill="#fff" stroke={INK} strokeWidth={9} paintOrder="stroke">{lab}</text>
          <circle cx={x + bw / 2} cy={base + 62} r={38} fill="#0d1424" stroke={c} strokeWidth={6} />
          <text x={x + bw / 2} y={base + 80} textAnchor="middle" fontSize={50} style={{fontFamily: 'Lilita'}} fill={c}>?</text>
          <text x={x + bw / 2} y={base + 140} textAnchor="middle" fontSize={24} style={{fontFamily: 'Fredoka', fontWeight: 700}} fill="#cfd8ea">ARMY {i + 1}</text>
        </g>; })}
    </svg>
    <div style={{position: 'absolute', right: 70, top: 300, transform: `scale(${pop(t, t0 + 2.4, 0.35)}) rotate(-6deg)`, ...font, fontSize: 46, color: '#fff', background: '#c62828', border: `5px solid ${INK}`, borderRadius: 16, padding: '6px 22px', boxShadow: '0 0 30px #ff3b30'}}>VS 🌍 THE WHOLE WORLD</div>
  </AbsoluteFill>;
};
// tragaperras que elige el país de cada ejército
const Slot: React.FC<{S: any[]; t: number}> = ({S, t}) => {
  const [t0, spin, t1, items, F, head] = S; if (t < t0 || t >= t1) return null; const lt = t - t0; const o = Math.min(1, lt / 0.2, (t1 - t) / 0.25);
  const u = Math.min(1, lt / spin); const pos = F * (1 - Math.pow(1 - u, 3)); const landed = lt >= spin; const IH = 150;
  const win = items[F]; const k = landed ? pop(t, t0 + spin, 0.3) : 0;
  return <AbsoluteFill style={{zIndex: 42, opacity: o, alignItems: 'center', justifyContent: 'center', background: 'rgba(3,6,14,0.55)'}}>
    <div style={{width: 820, background: 'linear-gradient(180deg,#ffcf3a,#e08a00)', border: `7px solid ${INK}`, borderRadius: 36, padding: '18px 26px 26px', boxShadow: '0 16px 0 rgba(0,0,0,0.45), 0 0 50px rgba(255,190,40,0.45)', transform: `scale(${pop(t, t0, 0.3)})`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>{Array.from({length: 11}, (_, i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: (Math.floor(lt * 10) + i) % 2 ? '#fff6b0' : '#c62828', border: `3px solid ${INK}`}} />)}</div>
      <div style={{...font, fontSize: 44, color: '#fff', textAlign: 'center', ...stroke(9), marginBottom: 10}}>{head}</div>
      {lt < 1.4 && <div style={{...font2, fontSize: 26, color: '#fff', textAlign: 'center', marginTop: -6, marginBottom: 8, opacity: Math.min(1, (1.4 - lt) / 0.3), ...stroke(6)}}>WHICH COUNTRY WOULD YOU PICK? 🤔</div>}
      <div style={{position: 'relative', height: IH * 3, overflow: 'hidden', background: '#fdf6e3', border: `6px solid ${INK}`, borderRadius: 20}}>
        {[-1, 0, 1, 2].map((r) => { const idx = Math.floor(pos) + r; if (idx < 0 || idx >= items.length) return null; const it = items[idx]; const y = IH + (idx - pos) * IH;
          const isW = landed && idx === F;
          return <div key={idx} style={{position: 'absolute', left: 0, right: 0, top: y, height: IH, display: 'flex', alignItems: 'center', gap: 26, paddingLeft: 60, filter: landed || u > 0.85 ? undefined : 'blur(1.5px)', background: isW ? 'rgba(255,210,63,0.35)' : undefined}}>
            <Img src={flag(it[0])} style={{width: 150, height: 100, borderRadius: 10, border: `4px solid ${INK}`, objectFit: 'cover'}} />
            <div style={{...font, fontSize: 58, color: INK, transform: isW ? `scale(${1 + 0.12 * k})` : undefined, transformOrigin: 'left center'}}>{it[1]}</div></div>; })}
        <div style={{position: 'absolute', left: 0, right: 0, top: IH - 4, height: IH + 8, border: `6px solid ${landed ? '#c62828' : '#ff9f1c'}`, borderRadius: 12, boxShadow: landed ? '0 0 30px #ff3b30' : undefined}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: IH, background: 'linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0))'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: IH, background: 'linear-gradient(0deg,rgba(0,0,0,0.45),rgba(0,0,0,0))'}} />
      </div>
    </div>
    {landed && <div style={{position: 'absolute', top: 24, ...font, fontSize: 110, color: '#ffd23f', transform: `scale(${0.3 + 0.7 * k}) rotate(${(1 - k) * -8}deg)`, ...stroke(16)}}>{win[1]}!</div>}
  </AbsoluteFill>;
};


const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (u: number) => 1 - Math.pow(1 - cl(u, 0, 1), 3);
const back = (u: number) => { u = cl(u, 0, 1); const c = 1.7; const v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; };
const pop = (t: number, t0: number, d = 0.3) => back((t - t0) / d);
// claves [t, v, d]: interpola desde el valor anterior durante d segundos
const kv = (K: number[][] | undefined, t: number, def = 0) => {
  if (!K || !K.length) return def; let v = def;
  for (const [a, b, d] of K) { if (t < a) break; const prev = v; v = d > 0 && t < a + d ? prev + (b - prev) * ease((t - a) / d) : b; }
  return v;
};
const step = (K: any[] | undefined, t: number) => { let r: any = null; for (const k of K || []) { if (t >= k[0]) r = k; else break; } return r; };
const big = (v: number) => Math.round(v).toLocaleString('en-US');
const flag = (c: string) => staticFile(`wflags/${c.toLowerCase()}.svg`);
const stroke = (w: number) => ({WebkitTextStroke: `${w}px ${INK}`, paintOrder: 'stroke fill'} as const);
const Panel: React.FC<{style: React.CSSProperties; col?: string; children: React.ReactNode}> = ({style, col = '#ffffff55', children}) => (
  <div style={{position: 'absolute', background: 'rgba(8,12,22,0.88)', border: `3px solid ${col}`, borderRadius: 14, boxShadow: '0 6px 0 rgba(0,0,0,0.35)', ...style}}>{children}</div>
);

export const VsHud: React.FC<{D: any; t: number; cam: any; hide?: boolean}> = ({D, t, cam, hide = false}) => {
  if (hide) return null;
  const V = D.vs; if (!V) return null; const out: React.ReactNode[] = [];
  // ---- título sobre el globo
  if (V.title && t >= V.title[0] && t < V.title[1]) {
    const [t0, t1, l1, l2, sub] = V.title; const a = Math.min(1, (t1 - t) / 0.35);
    out.push(<div key="ti" style={{position: 'absolute', top: 46, left: 0, right: 0, textAlign: 'center', zIndex: 45, opacity: a}}>
      <div style={{...font, fontSize: 92, color: '#fff', lineHeight: 1, transform: `scale(${pop(t, t0, 0.3)})`, textShadow: `6px 6px 0 ${INK}`}}>{l1}</div>
      <div style={{...font, fontSize: 150, color: '#ff3b30', lineHeight: 1.0, transform: `scale(${pop(t, t0 + 0.18, 0.3)})`, textShadow: `8px 8px 0 ${INK}`}}>{l2}</div>
      {sub && <div style={{...font2, fontSize: 40, color: '#ffd23f', letterSpacing: 2, opacity: cl((t - t0 - 0.5) / 0.3, 0, 1), ...stroke(8)}}>{sub}</div>}
    </div>);
  }
  // ---- rótulos de la intro (número que golpea cada país)
  for (const [i, L] of ((V.labels || []) as any[]).entries()) {
    const [t0, t1, txt, sub, col, flg] = L; if (t < t0 || t >= t1) continue; const a = Math.min(1, (t1 - t) / 0.15);
    const k = pop(t, t0, 0.22);
    out.push(<div key={'lb' + i} style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', zIndex: 44, opacity: a}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, transform: `scale(${0.4 + 0.6 * k}) rotate(${(1 - k) * -6}deg)`}}>
        {flg && <Img src={flag(flg)} style={{width: 120, height: 80, borderRadius: 10, border: `5px solid ${INK}`, boxShadow: '0 6px 0 rgba(0,0,0,0.4)'}} />}
        <div style={{textAlign: 'left'}}>
          <div style={{...font, fontSize: 124, color: col || '#ffd23f', lineHeight: 0.95, ...stroke(16)}}>{txt}</div>
          {sub && <div style={{...font2, fontSize: 36, color: '#fff', letterSpacing: 3, ...stroke(8)}}>{sub}</div>}
        </div></div></div>);
  }
  // ---- HUD principal
  const hv = ((V.hud || []) as number[][]).find(([a, b]) => t >= a && t < b);
  if (hv) {
    const o = Math.min(1, (t - hv[0]) / 0.35, (hv[1] - t) / 0.35);
    const lbw = ((D.letterbox || []) as number[][]).find(([a, b]) => t >= a - 0.4 && t < b + 0.4); const lbf = lbw ? Math.min(1, (t - lbw[0] + 0.4) / 0.4, (lbw[1] + 0.4 - t) / 0.4) : 0;
    const oo = o * (1 - lbf);
    const dk = step(V.def, t); const code = dk ? dk[1] : 'MC'; const name = dk ? dk[2] : '';
    const sold = kv(V.sold, t); const world = kv(V.world, t); const hp = cl(kv(V.hp, t, 1), 0, 1);
    const dy = kv(V.days, t); const unit = (step(V.unit, t) || [0, 'DAYS'])[1];
    const lvl = (step(V.lvl, t) || [0, 0])[1];
    const rec = step(V.rec, t);
    const hpCol = hp > 0.5 ? '#5dff8a' : hp > 0.25 ? '#ffd23f' : '#ff3b30';
    const flash = (K: number[][] | undefined) => { const k = step(K, t); return k && t - k[0] < 0.5 ? 1 + 0.15 * (1 - (t - k[0]) / 0.5) : 1; };
    out.push(<AbsoluteFill key="hud" style={{opacity: oo, zIndex: 30}}>
      <Panel col="#5dff8a" style={{left: 22, top: 20, padding: '8px 18px 12px', minWidth: 360}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Img src={flag(code)} style={{width: 54, height: 36, borderRadius: 5, border: `2px solid ${INK}`}} /><div style={{...font, fontSize: 34, color: '#fff', lineHeight: 1}}>{name}</div></div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4}}><div style={{...font, fontSize: 50, color: '#5dff8a', lineHeight: 1, transform: `scale(${flash(V.sold)})`, transformOrigin: 'left center'}}>{big(sold)}</div><div style={{...font2, fontSize: 20, color: '#aef5c4'}}>{Math.round(sold) === 1 ? 'SOLDIER' : 'SOLDIERS'}</div></div>
        <div style={{height: 16, background: '#ffffff1c', borderRadius: 8, marginTop: 8, overflow: 'hidden', border: '2px solid #ffffff44'}}><div style={{width: `${hp * 100}%`, height: '100%', background: hpCol, borderRadius: 6, boxShadow: `0 0 12px ${hpCol}`}} /></div>
      </Panel>
      <div style={{position: 'absolute', left: 0, right: 0, top: 16, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
        <div style={{textAlign: 'center', background: 'rgba(8,12,22,0.82)', border: '3px solid #ffd23f', borderRadius: 16, padding: '4px 26px 8px'}}>
          <div style={{...font2, fontSize: 20, color: '#ffe9a6', letterSpacing: 3}}>⏱ HELD FOR</div>
          <div style={{...font, fontSize: 58, color: '#ffd23f', lineHeight: 1, ...stroke(10)}}>{unit === 'SEC' ? `${dy.toFixed(1)} SEC` : `${Math.floor(dy)} ${Math.floor(dy) === 1 ? unit.replace(/S$/, '') : unit}`}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 122, display: 'flex', justifyContent: 'center', gap: 10, pointerEvents: 'none'}}>
        {V.kills && <div style={{...font, fontSize: 24, color: '#fff', background: 'rgba(120,10,10,0.85)', border: '2px solid #ff8a80', borderRadius: 12, padding: '1px 14px'}}>💀 ENEMIES DOWN: {big(kv(V.kills, t))}</div>}
        {(() => { const pr = ((V.pred || []) as any[]).find((p) => t >= p[0] && t < p[1]); if (!pr) return null; const done = t >= pr[3]; const ok = pr[4];
          return <div style={{...font, fontSize: 24, color: done ? (ok ? '#0b2b14' : '#fff') : '#fff', background: done ? (ok ? '#3ddc84' : '#c62828') : 'rgba(8,12,22,0.85)', border: '2px solid #ffffff66', borderRadius: 12, padding: '1px 14px', transform: done && t - pr[3] < 0.4 ? `scale(${1 + 0.3 * (1 - (t - pr[3]) / 0.4)})` : undefined}}>{done ? (ok ? '✔ PREDICTION BEATEN' : '✘ PREDICTION MISSED') : `🔮 PREDICTION: ${pr[2]}`}</div>; })()}
        {(() => { const ex = ((V.states || []) as any[]).find((p) => t >= p[0] && t < p[1]); if (!ex) return null;
          return <div style={{...font, fontSize: 24, color: '#fff', background: 'rgba(10,30,90,0.88)', border: '2px solid #8fb4ff', borderRadius: 12, padding: '1px 14px'}}>🇺🇸 STATES LEFT: {Math.round(kv(ex[2], t))}</div>; })()}
      </div>
      <div style={{position: 'absolute', right: 22, top: 20, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end'}}>
        {(V.lv as string[]).map((l, i) => { const cur = i === lvl; const r = step((V.lres || {})[i], t);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8}}>
            {r ? <div style={{...font, fontSize: 17, color: r[2] || '#ff8a80', ...stroke(5)}}>{r[1]}</div> : null}
            <div style={{...font, fontSize: cur ? 30 : 21, color: cur ? INK : '#fff', background: cur ? '#ffd23f' : i < lvl ? 'rgba(60,60,70,0.88)' : 'rgba(8,12,22,0.88)', border: `3px solid ${cur ? '#fff' : '#ffffff40'}`, borderRadius: 10, padding: '0 12px', minWidth: 120, textAlign: 'center', boxShadow: cur ? '0 0 18px #ffd23f' : undefined}}>{l}</div></div>; })}
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 8, display: 'flex', gap: 4, padding: '0 4px'}}>{Array.from({length: 7}, (_, i) => <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: i < lvl ? '#ffd23f' : i === lvl ? '#3ddc84' : '#ffffff30', boxShadow: i === lvl ? '0 0 10px #3ddc84' : undefined}} />)}</div>
      {(() => { const BT = V.bt; if (!BT) return null; const mw = ((BT.mw || []) as number[][]).find(([a, b]) => t >= a && t < b); if (!mw) return null;
        const o2 = Math.min(1, (t - mw[0]) / 0.4, (mw[1] - t) / 0.4); const mor = cl(kv(BT.mo, t, 0.8), 0, 1); const air = cl(kv(BT.air, t, 0.5), 0, 1);
        const ph = step(BT.ph, t); const fr = step(BT.fr, t);
        const mc = mor > 0.6 ? '#3ddc84' : mor > 0.3 ? '#ffd23f' : '#ff3b30';
        const Bar = ({lab, v, c, c2, txt}: {lab: string; v: number; c: string; c2: string; txt: string}) => <div style={{marginTop: 6}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{...font2, fontSize: 17, color: '#cfd8e6', letterSpacing: 1}}>{lab}</span><span style={{...font, fontSize: 17, color: c}}>{txt}</span></div>
          <div style={{height: 11, background: c2, borderRadius: 6, overflow: 'hidden', border: '2px solid #ffffff33', marginTop: 2}}><div style={{width: `${v * 100}%`, height: '100%', background: c, borderRadius: 4}} /></div></div>;
        return <div style={{position: 'absolute', left: 22, top: 192, width: 360, opacity: o2}}>
          <div style={{background: 'rgba(8,12,22,0.82)', border: '3px solid #ffffff44', borderRadius: 14, padding: '4px 14px 10px'}}>
            <Bar lab="MORALE" v={mor} c={mc} c2="#ffffff18" txt={mor > 0.75 ? 'HIGH' : mor > 0.5 ? 'STEADY' : mor > 0.25 ? 'SHAKEN' : 'BROKEN'} />
            <Bar lab="AIR CONTROL" v={air} c="#4aa3ff" c2="#c62828" txt={air > 0.6 ? 'OURS' : air > 0.4 ? 'CONTESTED' : 'ENEMY'} />
          </div>
          {(() => { const eq = ((BT.eq || []) as any[]).find((e) => t >= e[0] && t < e[1]); if (!eq) return null; return <div style={{marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 5}}>{(eq[2] as string[]).map((g, j) => <span key={j} style={{...font2, fontSize: 14, color: '#fff', background: 'rgba(8,12,22,0.82)', border: '2px solid #5dff8a66', borderRadius: 7, padding: '0 7px'}}>{g}</span>)}</div>; })()}
          {ph && ph[1] && <div style={{marginTop: 8, display: 'flex'}}><div style={{...font, fontSize: 20, color: INK, background: '#ffd23f', border: `3px solid ${INK}`, borderRadius: 10, padding: '0 10px', transform: `scale(${t - ph[0] < 0.4 ? 1 + 0.2 * (1 - (t - ph[0]) / 0.4) : 1})`, transformOrigin: 'left center'}}>{ph[1]} · <span style={{...font2, fontSize: 18}}>{ph[2]}</span></div></div>}
          {fr && fr[1] && fr[1].length > 1 && <div style={{marginTop: 8, background: 'rgba(8,12,22,0.78)', border: '2px solid #ffffff33', borderRadius: 12, padding: '4px 12px 8px'}}>
            <div style={{...font2, fontSize: 15, color: '#cfd8e6', letterSpacing: 2}}>TROOPS PER FRONT</div>
            {(fr[1] as any[]).slice(0, 3).map(([c, v]: [string, number], j: number) => <div key={j} style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 4}}>
              <Img src={flag(c)} style={{width: 27, height: 18, borderRadius: 3, border: `1.5px solid ${INK}`}} />
              <div style={{flex: 1, height: 10, background: '#ffffff14', borderRadius: 5, overflow: 'hidden'}}><div style={{width: `${v * 100}%`, height: '100%', background: '#5dff8a'}} /></div>
              <span style={{...font, fontSize: 16, color: '#fff', width: 44, textAlign: 'right'}}>{Math.round(v * 100)}%</span></div>)}
          </div>}
        </div>; })()}
      <MiniMap code={code} />
      {rec && rec[1] && <div style={{position: 'absolute', left: 22, bottom: 20, display: 'flex', justifyContent: 'flex-start'}}>
        <div style={{...font, fontSize: 26, color: '#fff', background: 'rgba(8,12,22,0.85)', border: '3px solid #ffd23f', borderRadius: 20, padding: '2px 20px', transform: `scale(${t - rec[0] < 0.5 ? 1 + 0.25 * (1 - (t - rec[0]) / 0.5) : 1})`}}>🏆 RECORD: {rec[1]}</div></div>}
    </AbsoluteFill>);
  }
  if (V.paint) out.push(<MapPaint key="pt" P={V.paint} t={t} cam={cam} />);
  if (V.explain) out.push(<Explain key="ex" E={V.explain} t={t} />);
  for (const [i, C] of ((V.charts || []) as any[]).entries()) out.push(<Chart key={'ch' + i} C={C} t={t} />);
  for (const [i, S] of ((V.slots || []) as any[]).entries()) out.push(<Slot key={'sl' + i} S={S} t={t} />);
  // aviso rojo: la defensa está a punto de romperse
  if (hv) { const hp2 = cl(kv(V.hp, t, 1), 0, 1); if (hp2 > 0.001 && hp2 < 0.25) { const pu = 0.5 + 0.5 * Math.sin(t * 7); out.push(<AbsoluteFill key="dg" style={{zIndex: 28, pointerEvents: 'none', boxShadow: `inset 0 0 ${160 + 60 * pu}px rgba(220,20,20,${0.35 + 0.25 * pu})`}} />); } }
  // KO: la ball del país caído con ojos en X
  for (const [i, ko] of ((V.kos || []) as any[]).entries()) { const [k0, code] = ko; if (t < k0 || t > k0 + 1.8) continue; const a = Math.min(1, (k0 + 1.8 - t) / 0.3);
    out.push(<div key={'ko' + i} style={{position: 'absolute', left: 140, top: 330, zIndex: 44, opacity: a}}><BallKO code={code} size={170} t={t} t0={k0} /></div>); }
  for (const [i, c0] of ((V.confetti || []) as number[]).entries()) out.push(<Confetti key={'cf' + i} t={t} t0={c0} />);
  // resumen: banderas de los países que atacaron
  for (const [i, at] of ((V.atk || []) as any[]).entries()) { const [a0, a1, cs] = at; if (t < a0 || t >= a1) continue; const o2 = Math.min(1, (t - a0) / 0.25, (a1 - t) / 0.25);
    out.push(<div key={'at' + i} style={{position: 'absolute', left: 0, right: 0, top: 735, zIndex: 47, opacity: o2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
      <div style={{...font2, fontSize: 24, color: '#ffb3ad', letterSpacing: 2, ...stroke(6)}}>ATTACKED BY</div>
      {(cs as string[]).map((c, j) => <Img key={j} src={flag(c)} style={{width: 66, height: 44, borderRadius: 6, border: `3px solid ${INK}`, transform: `scale(${pop(t, a0 + 0.08 * j, 0.25)})`}} />)}</div>); }
  // ---- ticker de países que se unen
  const feed = ((V.feed || []) as any[]).filter((f) => t >= f[0] && t < f[0] + 2.6).slice(-4);
  feed.forEach((f, j) => { const k = pop(t, f[0], 0.25); const a = Math.min(1, (f[0] + 2.6 - t) / 0.3);
    out.push(<div key={'fd' + f[0] + j} style={{position: 'absolute', right: 22, top: 430 + j * 62, zIndex: 34, opacity: a, transform: `translateX(${(1 - k) * 300}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(120,10,10,0.9)', border: '3px solid #ff8a80', borderRadius: 12, padding: '4px 14px'}}>
        <Img src={flag(f[1])} style={{width: 42, height: 28, borderRadius: 4}} /><div style={{...font, fontSize: 26, color: '#fff'}}>{f[2]}</div></div></div>); });
  return <>{out}</>;
};
