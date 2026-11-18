// HUD de "1 VS 500,000,000": defensor vs ejército mundial, escalera de intentos, reloj de supervivencia, récord, ticker
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {font, font2, INK} from './lib3';

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

export const VsHud: React.FC<{D: any; t: number; cam: any}> = ({D, t}) => {
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
    const dk = step(V.def, t); const code = dk ? dk[1] : 'MC'; const name = dk ? dk[2] : '';
    const sold = kv(V.sold, t); const world = kv(V.world, t); const hp = cl(kv(V.hp, t, 1), 0, 1);
    const dy = kv(V.days, t); const unit = (step(V.unit, t) || [0, 'DAYS'])[1];
    const lvl = (step(V.lvl, t) || [0, 0])[1];
    const rec = step(V.rec, t);
    const hpCol = hp > 0.5 ? '#5dff8a' : hp > 0.25 ? '#ffd23f' : '#ff3b30';
    const flash = (K: number[][] | undefined) => { const k = step(K, t); return k && t - k[0] < 0.5 ? 1 + 0.15 * (1 - (t - k[0]) / 0.5) : 1; };
    out.push(<AbsoluteFill key="hud" style={{opacity: o, zIndex: 30}}>
      <Panel col="#5dff8a" style={{left: 22, top: 20, padding: '8px 18px 12px', minWidth: 360}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Img src={flag(code)} style={{width: 54, height: 36, borderRadius: 5, border: `2px solid ${INK}`}} /><div style={{...font, fontSize: 34, color: '#fff', lineHeight: 1}}>{name}</div></div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4}}><div style={{...font, fontSize: 50, color: '#5dff8a', lineHeight: 1, transform: `scale(${flash(V.sold)})`, transformOrigin: 'left center'}}>{big(sold)}</div><div style={{...font2, fontSize: 20, color: '#aef5c4'}}>{Math.round(sold) === 1 ? 'SOLDIER' : 'SOLDIERS'}</div></div>
        <div style={{height: 16, background: '#ffffff1c', borderRadius: 8, marginTop: 8, overflow: 'hidden', border: '2px solid #ffffff44'}}><div style={{width: `${hp * 100}%`, height: '100%', background: hpCol, borderRadius: 6, boxShadow: `0 0 12px ${hpCol}`}} /></div>
      </Panel>
      <div style={{position: 'absolute', left: 0, right: 0, top: 18, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{...font2, fontSize: 22, color: '#ffb3ad', letterSpacing: 3, ...stroke(6)}}>🌍 WORLD ARMY</div>
          <div style={{...font, fontSize: 64, color: '#ff4a3d', lineHeight: 1, transform: `scale(${flash(V.world)})`, ...stroke(12)}}>{big(world)}</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 22, top: 20, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end'}}>
        {(V.lv as string[]).map((l, i) => { const cur = i === lvl; const r = step((V.lres || {})[i], t);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8}}>
            {r ? <div style={{...font, fontSize: 17, color: r[2] || '#ff8a80', ...stroke(5)}}>{r[1]}</div> : null}
            <div style={{...font, fontSize: cur ? 30 : 21, color: cur ? INK : '#fff', background: cur ? '#ffd23f' : i < lvl ? 'rgba(60,60,70,0.88)' : 'rgba(8,12,22,0.88)', border: `3px solid ${cur ? '#fff' : '#ffffff40'}`, borderRadius: 10, padding: '0 12px', minWidth: 120, textAlign: 'center', boxShadow: cur ? '0 0 18px #ffd23f' : undefined}}>{l}</div></div>; })}
      </div>
      <Panel col="#ffd23f" style={{left: 22, bottom: 20, padding: '6px 18px 8px'}}>
        <div style={{...font2, fontSize: 18, color: '#ffe9a6', letterSpacing: 2}}>⏱ HELD FOR</div>
        <div style={{...font, fontSize: 46, color: '#ffd23f', lineHeight: 1}}>{unit === 'SEC' ? `${dy.toFixed(1)} SEC` : `${Math.floor(dy)} ${Math.floor(dy) === 1 ? unit.replace(/S$/, '') : unit}`}</div>
      </Panel>
      {rec && rec[1] && <div style={{position: 'absolute', left: 0, right: 0, bottom: 18, display: 'flex', justifyContent: 'center'}}>
        <div style={{...font, fontSize: 26, color: '#fff', background: 'rgba(8,12,22,0.85)', border: '3px solid #ffd23f', borderRadius: 20, padding: '2px 20px', transform: `scale(${t - rec[0] < 0.5 ? 1 + 0.25 * (1 - (t - rec[0]) / 0.5) : 1})`}}>🏆 RECORD: {rec[1]}</div></div>}
    </AbsoluteFill>);
  }
  // ---- ticker de países que se unen
  const feed = ((V.feed || []) as any[]).filter((f) => t >= f[0] && t < f[0] + 2.6).slice(-4);
  feed.forEach((f, j) => { const k = pop(t, f[0], 0.25); const a = Math.min(1, (f[0] + 2.6 - t) / 0.3);
    out.push(<div key={'fd' + f[0] + j} style={{position: 'absolute', right: 22, top: 350 + j * 62, zIndex: 34, opacity: a, transform: `translateX(${(1 - k) * 300}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(120,10,10,0.9)', border: '3px solid #ff8a80', borderRadius: 12, padding: '4px 14px'}}>
        <Img src={flag(f[1])} style={{width: 42, height: 28, borderRadius: 4}} /><div style={{...font, fontSize: 26, color: '#fff'}}>{f[2]}</div></div></div>); });
  return <>{out}</>;
};
