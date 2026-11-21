import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate} from 'remotion';
import J_pop from './pop.json';
import J_az from './az.json';
import J_esp from './esp.json';
import J_peak from './peak.json';
import J_dbl from './dbl.json';

const JM: Record<string, any> = {pop: J_pop, az: J_az, esp: J_esp, peak: J_peak, dbl: J_dbl};
export const satFrames = (v: string, fps: number) => Math.round((JM[v] as any).dur * fps);
const WW = 16384, WH = 11123, TS = 1024, NX = 16, NY = 11;
const VW = 1080, VH = 1920;

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
        {vis.filter((s: any) => s.fill && !s.fill.startsWith('#') && s.fill !== 'hatch').map((s: any) => {
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
          const fill = s.fill === 'hatch' ? 'url(#hatch)' : s.fill.startsWith('#') ? s.fill : `url(#p${s.id})`;
          const clip = fin === 'wipe' || fin === 'radial' ? `url(#c${s.id})` : undefined;
          return (
            <g key={s.id} opacity={op} transform={sc !== 1 ? `translate(${c[0]},${c[1]}) scale(${sc}) translate(${-c[0]},${-c[1]})` : undefined} clipPath={clip}>
              <path d={s.d} fill={fill} filter={s.noshadow ? undefined : 'url(#shd)'} fillRule="evenodd" />
              {s.fill !== 'hatch' && !s.noTex ? <path d={s.d} fill="url(#paper)" fillRule="evenodd" style={{mixBlendMode: 'multiply'}} opacity={0.55} /> : null}
              {s.stroke ? <path d={s.d} fill="none" stroke={s.stroke} strokeWidth={(s.sw || 2) / z} fillRule="evenodd" /> : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
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
    return null;
  })}</>;
};

export const SatShort: React.FC<{v: string; audio?: boolean}> = ({v, audio = true}) => {
  useFonts();
  const f = useCurrentFrame(); const {fps, width} = useVideoConfig();
  const D: any = JM[v];
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
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />
        <Texts D={D} t={t} />
        {D.wm ? <div style={{position: 'absolute', bottom: 70, width: VW, textAlign: 'center', fontFamily: 'Mont', fontWeight: 800, fontSize: 24, color: 'rgba(255,255,255,0.35)'}}>{D.wm}</div> : null}
      </div>
      {audio && D.audio ? <Audio src={staticFile(D.audio)} /> : null}
    </AbsoluteFill>
  );
};
