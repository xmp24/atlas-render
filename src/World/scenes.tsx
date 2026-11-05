// Escenas genéricas guiadas por datos (p.kind). Todo tiempo "t" es local a la escena; "T" es absoluto.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Char} from '../Maduro/chars';
import {CBall} from '../ThumbsCB';
import {Bubble, Big, Caption, Chapter} from '../Maduro/lib';
import {OvalOffice, CIARoom, CallScreen, Letterbox} from '../Maduro/lib2';
import {useV, WMap, CellLayer, ShelterLayer, Hud, GBar, Thermo, Counter, Banner, FatArrow, Icon, fmtVal, kName, cellFrac,
  toS, camKF, kfv, TintLayer, NukeLayer, Particles, Grain, Vig, shakeXY, BigStamp, TText, W, H, rnd, ip, pop, FlagImg, INK, font, YEL, Cam} from './kit';

export type SP = {t: number; T: number; p: any};
const talking = (bubs: any[], t: number, k: number) => (bubs || []).some(([t0, kk, tx]: any) => kk === k && t > t0 && t < t0 + 0.35 + tx.length * 0.045);
const hop = (bubs: any[], t: number, k: number) => talking(bubs, t, k) ? Math.abs(Math.sin(t * 15)) * 9 : 0;
const bubEnd = (bubs: any[], i: number, d: number) => (i + 1 < bubs.length ? Math.min(bubs[i + 1][0] - 0.15, bubs[i][0] + 4.2) : Math.min(d - 0.2, bubs[i][0] + 4.2));
const camOf = (p: any, t: number): Cam => p.cam ? (Array.isArray(p.cam[0]) ? camKF(t, p.cam) : {cx: p.cam[0], cy: p.cam[1], s: p.cam[2]}) : {cx: 3840, cy: 2200, s: 0.262};
const tintItems = (tracks: any[], t: number) => {
  const out: any[] = [];
  for (const tr of tracks || []) (tr.ks as number[]).forEach((k, i) => { const a = kfv(tr.a, t - (tr.stag || 0) * i); if (a > 0.003) out.push({k, col: tr.col, a, crack: tr.crack, stroke: tr.stroke}); });
  return out;
};

// ---------- capas de mapa comunes (usadas por map/title/cuts) ----------
export const MapLayers: React.FC<{p: any; t: number; T: number; cam: Cam}> = ({p, t, T, cam}) => {
  const V = useV();
  return (<AbsoluteFill style={{filter: p.filter}}>
    <WMap T={T} cam={cam} warOn={p.war !== false} />
    {p.tints && <TintLayer cam={cam} items={tintItems(p.tints, t)} />}
    {(p.cells || []).map((c: any, i: number) => <CellLayer key={i} T={T} cam={cam} cfg={c} />)}
    {p.nuke && <NukeLayer T={T} cam={cam} data={V.nuke} {...(p.nuke === true ? {} : p.nuke)} />}
    {p.shelters && <ShelterLayer T={T} cam={cam} list={V.shelters || []} col={p.shelters.col} size={p.shelters.size} />}
    {(p.arrows || []).map((a: any, i: number) => <FatArrow key={i} cam={cam} t={t} t0={a[0]} t1={a[1]} a={[a[2], a[3]]} b={[a[4], a[5]]} col={a[6] || '#ff3b30'} w={a[7] || 24} />)}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {(p.rings || []).map((r: any, i: number) => { const [t0, x, y, col, n] = r; if (t < t0) return null; const [X, Y] = toS(x, y, cam);
        return <g key={i}>{Array.from({length: n || 3}, (_, j) => { const u = ((t - t0) * 0.7 + j / (n || 3)) % 1; return <circle key={j} cx={X} cy={Y} r={10 + u * 120} fill="none" stroke={col} strokeWidth={5} opacity={1 - u} />; })}<circle cx={X} cy={Y} r={9} fill={col} stroke={INK} strokeWidth={3} /></g>; })}
      {(p.pins || []).map((q: any, i: number) => { const [t0, x, y, label, col] = q; if (t < t0) return null; const [X, Y] = toS(x, y, cam); const sc = pop(t, t0, 0.3);
        return <g key={'p' + i} transform={`translate(${X},${Y}) scale(${sc})`}><circle r={11} fill={col || '#ff3b30'} stroke={INK} strokeWidth={4} />{label && <text y={-22} textAnchor="middle" style={{...font, fontSize: 28}} fill="#fff" stroke={INK} strokeWidth={7} paintOrder="stroke">{label}</text>}</g>; })}
    </svg>
    {(p.icons || []).map((q: any, i: number) => { const [t0, x, y, name, col, w] = q; if (t < t0) return null; const [X, Y] = toS(x, y, cam); return <div key={'i' + i} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pop(t, t0, 0.3)})`, transformOrigin: `${X}px ${Y}px`}}><Icon name={name} x={X} y={Y} w={w || 46} c={col || '#fff'} /></div>; })}
    {(p.mballs || []).map((b: any, i: number) => { const [t0, t1, k, x, y, s, eyes] = b; if (t < t0 || t > t1) return null; const [X, Y] = toS(x, y, cam);
      return <div key={'b' + i} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pop(t, t0, 0.35) * ip(t, [t1 - 0.25, t1], [1, 0])})`, transformOrigin: `${X}px ${Y}px`}}><CBall k={k} size={s || 110} x={X} y={Y} eyes={eyes || 'normal'} /></div>; })}
    {p.parts && <Particles t={t} kind={p.parts[0]} n={p.parts[1] || 70} a={kfv(p.parts[2] || [[0, 1]], t)} />}
    {p.polar && (() => { const f = kfv(p.polar, T); if (f <= 0) return null; const sh = Math.max(0, (cam.s - 0.262) * 0); const top = toS(0, 600, cam)[1], bot = toS(0, 3700, cam)[1]; const hh = (bot - top) * f * 0.5;
      return <><div style={{position: 'absolute', left: 0, right: 0, top: top - 400 + sh, height: 400 + hh, background: 'linear-gradient(180deg, rgba(240,248,255,0.95) 70%, rgba(220,238,255,0))'}} /><div style={{position: 'absolute', left: 0, right: 0, top: bot - hh, height: hh + 400, background: 'linear-gradient(0deg, rgba(240,248,255,0.95) 70%, rgba(220,238,255,0))'}} /></>; })()}
    {p.stars && <AbsoluteFill style={{opacity: kfv(p.stars, T), pointerEvents: 'none'}}>{Array.from({length: 120}, (_, i) => <div key={i} style={{position: 'absolute', left: rnd(i) * W, top: rnd(i + 99) * H, width: 2 + rnd(i + 5) * 2, height: 2 + rnd(i + 5) * 2, borderRadius: '50%', background: '#fff', opacity: 0.4 + rnd(i + 7) * 0.6}} />)}</AbsoluteFill>}
    {p.night && <AbsoluteFill style={{background: `rgba(4,8,24,${kfv(p.night, t)})`, pointerEvents: 'none'}} />}
    {p.tint2 && <AbsoluteFill style={{background: p.tint2, mixBlendMode: 'overlay', pointerEvents: 'none'}} />}
  </AbsoluteFill>);
};

// ---------- overlays genéricos de HUD (cualquier escena) ----------
export const Overlays: React.FC<{t: number; T: number; p: any; id: string}> = ({t, T, p}) => {
  const V = useV(); const g = V.hud || {};
  const hud = p.hud === false ? null : (p.hud || (p.kind === 'map' ? g.top : null));
  return (<>
    {hud && <Hud label={hud.label} val={fmtVal(kfv(hud.kf, hud.abs === false ? t : T), hud.fmt || 'int')} col={hud.col} />}
    {p.kind === 'map' && p.hud !== false && g.top2 && <div style={{position: 'absolute', right: 44, top: 36, width: 290, height: 120}}><div style={{position: 'relative'}}><Hud label={g.top2.label} val={fmtVal(kfv(g.top2.kf, T), g.top2.fmt || 'int')} col={g.top2.col || '#7ad0ff'} x={0} y={0} /></div></div>}
    {p.gbar !== false && (p.gbar || (p.useBar && g.bar)) && (() => { const b = p.gbar || g.bar; const v = kfv(b.kf, T); return <GBar label={b.label} pct={v} sub={b.sub ? fmtVal(v / 100 * (b.total || 1), b.sub) + ' ' + (b.unit || '') : undefined} t={t} t0={p.barIn ?? -1} col={b.col} />; })()}
    {(p.thermo || (p.useThermo && g.thermo)) && (() => { const th = p.thermo || g.thermo; return <Thermo v={kfv(th.kf, T)} min={th.min} max={th.max} t={t} label={th.label} />; })()}
    {(p.counters || []).map((c: any, i: number) => { const [t0, label, kf, fmt, col, anchor] = c; if (t < t0) return null; return <Counter key={i} label={label} val={fmtVal(kfv(kf, t), fmt || 'int')} col={col} t={t} t0={t0} anchor={anchor || 'bl'} />; })}
    {(p.cellCount || []).map((c: any, i: number) => { const [t0, label, ci, scale, fmt] = c; if (t < t0) return null; const f = cellFrac(p.cells[ci], V, T) * (scale ?? 100); return <Counter key={'cc' + i} label={label} val={fmtVal(f, fmt || 'pct')} t={t} t0={t0} />; })}
    {(p.banners || []).map((b: any, i: number) => <Banner key={i} t={t} t0={b[0]} t1={b[1]} text={b[2]} col={b[3]} y={b[4] ?? 160} />)}
    {(p.stamps || []).map((s: any, i: number) => <BigStamp key={i} t={t} t0={s[0]} text={s[1]} x={s[2] ?? W / 2} y={s[3] ?? 480} col={s[4] || '#ff3b30'} size={s[5] || 110} rot={s[6] ?? -10} />)}
    {(p.caps || []).map((c: any, i: number) => <Caption key={i} t={t} t0={c[0]} t1={c[1]} text={c[2]} hl={c[3] || undefined} y={930} size={48} />)}
    {p.chap && <Chapter t={t} t0={p.chap[0]} t1={p.chap[1]} top={p.chap[2]} main={p.chap[3]} />}
  </>);
};

// ======================= ESCENAS =======================
export const MapScene: React.FC<SP> = ({t, T, p}) => {
  const cam = camOf(p, t);
  return (<AbsoluteFill style={{transform: shakeXY(t, kfv(p.shake || [[0, 0]], t))}}>
    <MapLayers p={p} t={t} T={T} cam={cam} />
    <Vig a={p.vig ?? 0.5} />
    {(p.bubs || []).map(([t0, k, tx, x, y]: any, i: number) => <React.Fragment key={i}>
      {t > t0 - 0.3 && t < t0 + 3.6 && <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pop(t, t0 - 0.3, 0.3) * ip(t, [t0 + 3.3, t0 + 3.6], [1, 0])})`, transformOrigin: `${x}px ${y}px`}}><Char k={k} t={t} s={160} x={x} y={y} eyes={p.eyes?.[i] || 'normal'} /></div>}
      <Bubble t={t} t0={t0} t1={t0 + 3.4} x={x} y={y - 120} text={tx} size={36} />
    </React.Fragment>)}
  </AbsoluteFill>);
};
// tráiler: fondo (mapa o negro), textos que entran, destellos y tarjeta de título
export const TitleScene: React.FC<SP> = ({t, T, p}) => {
  const cam = camOf(p, t);
  return (<AbsoluteFill style={{background: '#000', transform: shakeXY(t, kfv(p.shake || [[0, 0]], t))}}>
    {p.bg !== 'black' && <AbsoluteFill style={{opacity: kfv(p.bga || [[0, 1]], t), filter: p.blur ? `blur(${p.blur}px)` : undefined}}><MapLayers p={p} t={t} T={p.Tmap ?? T} cam={cam} /></AbsoluteFill>}
    {p.grad && <AbsoluteFill style={{background: p.grad}} />}
    <Vig a={p.vig ?? 0.75} />
    {(p.texts || []).map((x: any, i: number) => <TText key={i} t={t} t0={x[0]} t1={x[1]} text={x[2]} size={x[3] || 110} y={x[4] ?? H / 2} col={x[5] || '#fff'} glow={x[6] || 'rgba(255,255,255,0.35)'} spacing={x[7] ?? 14} />)}
    {(p.big || []).map((x: any, i: number) => t > x[0] ? <Big key={'b' + i} text={x[1]} y={x[2]} size={x[3] || 140} col={x[4] || '#fff'} sc={pop(t, x[0], 0.35)} /> : null)}
    {p.sub && t > p.sub[0] && <div style={{position: 'absolute', left: 0, right: 0, top: p.sub[2] ?? 690, textAlign: 'center', ...font, fontSize: 34, color: 'rgba(255,255,255,0.8)', letterSpacing: 8, opacity: ip(t, [p.sub[0], p.sub[0] + 0.5], [0, 1])}}>{p.sub[1]}</div>}
    {(p.flash || []).map((f: number, i: number) => t > f && t < f + 0.45 ? <AbsoluteFill key={'f' + i} style={{background: '#fff', opacity: ip(t, [f, f + 0.06, f + 0.45], [0, 0.95, 0])}} /> : null)}
    {(p.black || []).map((f: number[], i: number) => t > f[0] && t < f[1] ? <AbsoluteFill key={'k' + i} style={{background: '#000'}} /> : null)}
    {p.lb !== false && <Letterbox a={ip(t, [0, 0.3, (p.dur || 99) - 0.6, p.dur || 99], [1.2, 1.2, 1.2, 0])} />}
  </AbsoluteFill>);
};
// cortes rápidos de mapa (0.4–0.7 s) con texto encima
export const CutsScene: React.FC<SP> = ({t, T, p}) => {
  const cuts = p.cuts as any[]; let ci = -1; for (let i = 0; i < cuts.length; i++) if (t >= cuts[i].t0) ci = i;
  const c = ci >= 0 ? cuts[ci] : null; const lt = c ? t - c.t0 : 0;
  return (<AbsoluteFill style={{background: '#000', transform: shakeXY(t, c && lt < 0.15 ? 14 : 0)}}>
    {c && t < c.t1 && <AbsoluteFill>
      <MapLayers p={c} t={lt} T={c.T ?? T} cam={{cx: c.cam[0], cy: c.cam[1], s: c.cam[2] * (1 + lt * 0.15)}} />
      <AbsoluteFill style={{background: c.grade || 'rgba(255,40,20,0.15)', mixBlendMode: 'overlay'}} />
      {lt < 0.06 && <AbsoluteFill style={{background: '#fff', opacity: 0.6}} />}
    </AbsoluteFill>}
    <Vig a={0.75} />
    {(p.texts || []).map((x: any, i: number) => <TText key={i} t={t} t0={x[0]} t1={x[1]} text={x[2]} size={x[3] || 140} y={x[4] ?? H / 2} col={x[5] || '#fff'} glow={x[6] || 'rgba(255,60,40,0.7)'} spacing={x[7] ?? 20} />)}
    <Letterbox a={1.2} />
  </AbsoluteFill>);
};
// informativo
const Paper: React.FC<{name: string; head: string}> = ({name, head}) => (
  <div style={{position: 'absolute', inset: 0, background: '#f2eee4', border: `8px solid ${INK}`}}>
    <div style={{textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 40, fontWeight: 900, color: INK, borderBottom: `5px double ${INK}`, padding: '10px 0'}}>{name}</div>
    <div style={{textAlign: 'center', ...font, fontSize: 70, color: '#b0100a', margin: '20px 20px', lineHeight: 1.05}}>{head}</div>
    {[0, 1, 2, 3, 4, 5].map((r) => <div key={r} style={{margin: '0 30px', position: 'absolute', top: 330 + r * 34, height: 14, width: `${55 + rnd(r) * 35}%`, background: '#bdb6a6'}} />)}
  </div>
);
export const NewsScene: React.FC<SP> = ({t, T, p}) => {
  const bubs = p.bubs || []; const h = hop(bubs, t, 0); const tv = camOf(p, t);
  const al = p.alert as any[] | undefined; const alertOn = al && t > al[0] && t < al[1];
  return (<AbsoluteFill style={{background: '#06142e', overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #1e4fa8 0%, #0a2558 50%, #04102a 100%)'}} />
    {Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: ((rnd(i) * 2400 + t * (120 + rnd(i + 3) * 200)) % 2600) - 400, top: 80 + i * 60, width: 300 + rnd(i + 7) * 400, height: 3 + (i % 3), borderRadius: 3, background: 'linear-gradient(90deg, rgba(120,190,255,0), rgba(160,210,255,0.7), rgba(120,190,255,0))'}} />)}
    <div style={{position: 'absolute', left: 1010, top: 110, width: 820, height: 470, border: `12px solid ${INK}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 60px rgba(80,160,255,0.5)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.427)', transformOrigin: '0 0'}}><MapLayers p={p.tvp || {}} t={t} T={T} cam={tv} /></div>
      <div style={{position: 'absolute', left: 16, top: 12, padding: '4px 14px', background: '#c3100a', ...font, fontSize: 26, color: '#fff'}}>● LIVE</div>
    </div>
    <div style={{position: 'absolute', left: 80, top: 700, width: 900, height: 220, background: 'linear-gradient(180deg, #2a4a8a, #12285a)', border: `8px solid ${INK}`, borderRadius: '24px 24px 0 0'}}><div style={{position: 'absolute', left: 30, top: 30, ...font, fontSize: 44, color: YEL}}>{p.channel || 'WORLD NEWS 24'}</div></div>
    <div style={{position: 'absolute', left: 0, top: -h, width: W, height: H}}>
      <Char k={p.anchor ?? 0} acc="tie" eyes={kfv(p.fear || [[0, 0]], t) > 0.5 ? 'scared' : 'normal'} sweat={kfv(p.fear || [[0, 0]], t) > 0.5} t={t} s={300} x={520} y={540} />
      <div style={{position: 'absolute', left: 640, top: 600, width: 150, height: 110, background: '#fbfbf6', border: `5px solid ${INK}`, transform: `rotate(${-12 + (talking(bubs, t, 0) ? Math.sin(t * 6) * 3 : 0)}deg)`}}>{[0, 1, 2, 3].map((r) => <div key={r} style={{margin: '12px 14px 0', height: 8, background: '#bcbcbc'}} />)}</div>
    </div>
    {bubs.map(([t0, _k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={bubEnd(bubs, i, p.dur || 20)} x={560} y={330} text={tx} size={40} />)}
    {(p.papers || []).map(([t0, n, hd]: any, i: number) => { if (t < t0 || t > t0 + 4.2) return null; const k = ip(t, [t0, t0 + 0.6], [0, 1]); const o = ip(t, [t0 + 3.7, t0 + 4.2], [1, 0]);
      return <div key={'pp' + i} style={{position: 'absolute', left: 1080 + (i % 3 - 1) * 40, top: 150 + (i % 2) * 30, width: 640, height: 600, opacity: o, transform: `rotate(${(1 - k) * 540 + (i % 3 - 1) * 5}deg) scale(${0.1 + k * 0.9})`, boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}><Paper name={n} head={hd} /></div>; })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 930, height: 100, background: '#c3100a', borderTop: `8px solid ${INK}`, display: 'flex', alignItems: 'center'}}>
      <div style={{flex: '0 0 auto', padding: '0 30px', height: '100%', display: 'flex', alignItems: 'center', background: '#fff', ...font, fontSize: 42, color: '#c3100a'}}>BREAKING</div>
      <div style={{overflow: 'hidden', whiteSpace: 'nowrap', flex: 1}}><div style={{display: 'inline-block', transform: `translateX(${-(t * 300) % 3600}px)`, ...font, fontSize: 44, color: '#fff'}}>{(p.ticker || '') + (p.ticker || '')}</div></div>
    </div>
    {alertOn && <AbsoluteFill style={{background: `rgba(0,0,0,${ip(t, [al![0], al![0] + 0.3], [0, 0.72])})`}}>
      <AbsoluteFill style={{background: `rgba(255,0,0,${0.12 + 0.12 * Math.abs(Math.sin(t * 6))})`}} />
      <div style={{position: 'absolute', left: W / 2 - 280, top: ip(t, [al![0], al![0] + 0.45], [H, 90]), width: 560, height: 900, borderRadius: 70, background: '#111', border: '14px solid #2a2a2a'}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 70, bottom: 60, borderRadius: 30, background: 'linear-gradient(180deg, #2a3550, #10141f)'}}>
          <div style={{position: 'absolute', left: 30, right: 30, top: 140, borderRadius: 26, background: 'rgba(240,240,245,0.96)', padding: '24px 26px', transform: `scale(${pop(t, al![0] + 0.5, 0.35)})`}}>
            <div style={{...font, fontSize: 30, color: '#c3100a'}}>⚠ {al![2] || 'EMERGENCY ALERT'}</div>
            <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 31, color: '#111', marginTop: 10, lineHeight: 1.25}}>{al![3]}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>}
    <div style={{position: 'absolute', right: 30, bottom: 108, ...font, fontSize: 20, color: 'rgba(255,255,255,0.5)'}}>News channel and newspapers are fictional</div>
  </AbsoluteFill>);
};
// llamada: 2–4 paneles con líderes (countryballs) y bocadillos
const PANEL_BG: Record<string, string> = {red: 'radial-gradient(ellipse at 50% 40%, #6a1010, #1a0404)', blue: 'radial-gradient(ellipse at 50% 40%, #1f3a7a, #060c1e)', dark: 'radial-gradient(ellipse at 50% 40%, #2a3448, #0a0e18)', gold: 'radial-gradient(ellipse at 50% 40%, #6a4a10, #1a1004)', green: 'radial-gradient(ellipse at 50% 40%, #1a5a2a, #041008)'};
export const CallScene: React.FC<SP> = ({t, p}) => {
  const ks = p.ks as number[]; const n = ks.length; const pw = W / n; const bubs = p.bubs || [];
  return (<AbsoluteFill style={{background: '#000', transform: shakeXY(t, p.shakeAt && t > p.shakeAt && t < p.shakeAt + 0.4 ? 18 : 0)}}>
    {ks.map((k, i) => <div key={i} style={{position: 'absolute', left: i * pw + 6, top: p.banner ? 150 : 60, width: pw - 12, height: p.banner ? 760 : 860, overflow: 'hidden', borderRadius: 20, border: `6px solid ${talking(bubs, t, i) ? YEL : '#333'}`, background: PANEL_BG[p.bg?.[i] || 'dark']}}>
      <div style={{position: 'absolute', left: 0, top: -hop(bubs, t, i), width: pw, height: 860}}><Char k={k} acc={p.acc?.[i] || 'tie'} eyes={p.eyes?.[i] || 'normal'} sweat={p.sweat?.[i]} t={t} s={n > 3 ? 210 : 260} x={pw / 2 - 6} y={430} label={p.labels?.[i] ?? kName(k)} /></div>
      <div style={{position: 'absolute', left: 14, top: 12, ...font, fontSize: 22, color: '#ff3b30'}}>● LIVE</div>
    </div>)}
    {p.banner && <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 96, background: Math.floor(t * 3) % 2 === 0 ? (p.bcol || '#c3100a') : '#7a0805', borderTop: `6px solid ${INK}`, borderBottom: `6px solid ${INK}`, ...font, fontSize: 58, color: '#fff', textAlign: 'center', lineHeight: '84px', letterSpacing: 8}}>{p.banner}</div>}
    {bubs.map(([t0, k, tx]: any, i: number) => <Bubble key={i} t={t} t0={t0} t1={bubEnd(bubs, i, p.dur || 12)} x={pw * k + pw / 2} y={p.banner ? 400 : 330} text={tx} size={n > 3 ? 26 : n > 2 ? 32 : 38} />)}
    <Vig a={0.4} />
  </AbsoluteFill>);
};
// escena de personajes sobre un fondo estilizado
const BG: Record<string, string> = {
  sky: 'linear-gradient(180deg, #6ab8ff, #cfeaff 60%, #6ab04a 61%, #4a8a3a)', night: 'radial-gradient(ellipse at 50% 100%, #1b2a5a 0%, #0b1230 45%, #04060f 100%)',
  dark: 'radial-gradient(ellipse at 50% 40%, #2a2e38, #08090c 75%)', red: 'radial-gradient(ellipse at 50% 60%, #5a0a06, #120304 75%)', ice: 'linear-gradient(180deg, #a8c8e8, #e8f2fa 60%, #f4f8fc 61%, #cfdde8)',
  desert: 'linear-gradient(180deg, #ffb060, #ffe0a0 55%, #e8a860 56%, #b8703a)', bunker: 'radial-gradient(ellipse at 50% 30%, #4a4238, #14110e 80%)', office: 'linear-gradient(180deg, #efe8d6, #e4dcc6 62%, #8a5a2a 63%, #5e3a18)',
  water: 'linear-gradient(180deg, #4a7ab8, #9ac8f0 50%, #2a6aa8 51%, #0e3a6a)', street: 'linear-gradient(180deg, #2a1a3a, #6a3a3a 60%, #2a2a2e 61%, #1a1a1e)', lab: 'radial-gradient(ellipse at 50% 40%, #e8f4ff, #9ab4cc 80%)',
};
export const BallsScene: React.FC<SP> = ({t, p}) => {
  const bubs = p.bubs || [];
  return (<AbsoluteFill style={{background: BG[p.bg] || p.bg || BG.dark, overflow: 'hidden', transform: shakeXY(t, kfv(p.shake || [[0, 0]], t))}}>
    {p.bg === 'office' ? <OvalOffice t={t} /> : null}
    {p.bg === 'street' && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{Array.from({length: 12}, (_, i) => <rect key={i} x={i * 170 - 20} y={300 + rnd(i) * 160} width={150} height={600} fill="#1e1626" stroke={INK} strokeWidth={4} />)}</svg>}
    {p.parts && <Particles t={t} kind={p.parts[0]} n={p.parts[1] || 70} />}
    {(p.props || []).map((q: any, i: number) => <Icon key={'pr' + i} name={q[0]} x={q[1]} y={q[2]} w={q[3] || 90} c={q[4] || '#fff'} />)}
    {(p.balls || []).map((b: any, i: number) => { const [k, x, y, s, eyes, acc, t0, label, extra] = b; if (t0 != null && t < t0) return null; const ex = extra || {};
      return <div key={i} style={{position: 'absolute', left: 0, top: -hop(bubs, t, i) + (ex.fall ? ip(t, [ex.fall, ex.fall + 0.6], [0, 300]) : 0), width: W, height: H, transform: t0 != null ? `scale(${pop(t, t0, 0.35)})` : undefined, transformOrigin: `${x}px ${y}px`, opacity: ex.out ? ip(t, [ex.out, ex.out + 0.4], [1, 0]) : 1}}>
        <Char k={k} t={t} s={s || 220} x={x + (ex.walk ? (t - (t0 || 0)) * ex.walk : 0)} y={y} eyes={(ex.e2 && t > ex.e2[0] ? ex.e2[1] : eyes) || 'normal'} acc={acc || 'none'} label={label} sweat={ex.sweat} tears={ex.tears} rot={ex.rot && t > ex.rot[0] ? ex.rot[1] : 0} /></div>; })}
    {bubs.map(([t0, k, tx]: any, i: number) => { const b = p.balls[k]; return <Bubble key={'bb' + i} t={t} t0={t0} t1={bubEnd(bubs, i, p.dur || 10)} x={b[1]} y={b[2] - (b[3] || 220) * 0.75} text={tx} size={38} />; })}
    {(p.fx || []).map((f: any, i: number) => t > f[0] && t < f[0] + 0.4 && Math.floor(t * 10) % 2 === 0 ? <div key={'fx' + i} style={{position: 'absolute', left: f[1] - 50, top: f[2] - 50, ...font, fontSize: 100}}>💥</div> : null)}
    <Vig a={0.45} />
  </AbsoluteFill>);
};
// ranking animado (barras)
export const RankScene: React.FC<SP> = ({t, T, p}) => {
  const rows = (p.rows as any[]).map((r) => ({k: r[0], v: kfv(r[1], t), lab: r[2]})).sort((a, b) => b.v - a.v).slice(0, p.n || 8); const mx = Math.max(...rows.map((r) => r.v), 1e-9);
  return (<AbsoluteFill style={{background: p.bgc || 'radial-gradient(ellipse at 50% 30%, #1c2a48, #070b16 75%)'}}>
    {p.mapbg && <AbsoluteFill style={{filter: 'blur(6px) brightness(0.35)'}}><MapLayers p={p.mapbg} t={t} T={T} cam={camOf(p.mapbg, t)} /></AbsoluteFill>}
    <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', ...font, fontSize: 64, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>{p.title}</div>
    {rows.map((r, i) => { const y = 180 + i * 92; return <div key={r.k} style={{position: 'absolute', left: 160, top: y, width: 1600, height: 80, transform: `translateX(${ip(t, [0.2 + i * 0.1, 0.6 + i * 0.1], [-1800, 0])}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 6, ...font, fontSize: 52, color: YEL, width: 70}}>{i + 1}</div>
      <FlagImg k={r.k} w={96} h={64} style={{position: 'absolute', left: 80, top: 6}} />
      <div style={{position: 'absolute', left: 200, top: 10, height: 60, width: (r.v / mx) * 1100, borderRadius: 12, background: p.col || 'linear-gradient(90deg, #3a8bff, #6ad0ff)', border: `5px solid ${INK}`}} />
      <div style={{position: 'absolute', left: 220, top: 12, ...font, fontSize: 40, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{r.lab || kName(r.k)} · {fmtVal(r.v, p.fmt || 'int')}{p.unit || ''}</div>
    </div>; })}
  </AbsoluteFill>);
};
export const PodiumScene: React.FC<SP> = ({t, p}) => {
  const ks = p.ks as number[]; const pos = [[W / 2, 330], [W / 2 - 400, 230], [W / 2 + 400, 170]];
  return (<AbsoluteFill style={{background: p.bgc || 'radial-gradient(ellipse at 50% 30%, #3a2a0a, #0a0806 75%)', overflow: 'hidden'}}>
    {pos.map(([x], i) => <div key={i} style={{position: 'absolute', left: x - 260, top: -100, width: 520, height: 1000, background: 'linear-gradient(180deg, rgba(255,230,160,0.35), rgba(255,230,160,0))', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)', opacity: ip(t, [0.2 + i * 0.3, 0.8 + i * 0.3], [0, 1])}} />)}
    {Array.from({length: 60}, (_, i) => { const x = rnd(i) * W, y = ((t * (120 + rnd(i + 3) * 160) + rnd(i + 5) * 900) % 1100) - 80; return t > 1.0 ? <div key={i} style={{position: 'absolute', left: x + Math.sin(t * 3 + i) * 20, top: y, width: 12, height: 18, background: ['#ffd23f', '#3bd16f', '#4ab0ff', '#ff6a5a'][i % 4], transform: `rotate(${t * 200 + i * 30}deg)`}} /> : null; })}
    {ks.slice(0, 3).map((k, i) => { const [x, h] = pos[i]; const t0 = 0.6 + (2 - i) * 0.6; return <div key={i}>
      <div style={{position: 'absolute', left: x - 170, top: 1000 - h * ip(t, [t0 - 0.4, t0], [0, 1]), width: 340, height: h, background: 'linear-gradient(180deg, #f2e6c8, #c9b48a)', border: `8px solid ${INK}`, borderRadius: '14px 14px 0 0', ...font, fontSize: 110, color: INK, textAlign: 'center', lineHeight: '140px'}}>{i + 1}</div>
      {t > t0 && <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${pop(t, t0, 0.4)})`, transformOrigin: `${x}px ${1000 - h - 110}px`}}><CBall k={k} size={210} x={x} y={1000 - h - 110} eyes={p.eyes || 'shades'} crown={i === 0} rim="#ffd86a" /></div>}
    </div>; })}
    {p.title && <div style={{position: 'absolute', left: 0, right: 0, top: 50}}><Big text={p.title} y={0} size={90} col={YEL} sc={pop(t, 0.2, 0.35)} /></div>}
  </AbsoluteFill>);
};
// número gigante sobre negro (dato impactante)
export const BigNumScene: React.FC<SP> = ({t, p}) => (
  <AbsoluteFill style={{background: p.bgc || 'radial-gradient(ellipse, #2a0606, #000 70%)', alignItems: 'center', justifyContent: 'center', transform: shakeXY(t, t < 0.3 ? 14 : 0)}}>
    <div style={{fontFamily: 'monospace', fontWeight: 900, fontSize: p.size || 190, color: p.col || '#fff', textShadow: `0 0 50px ${p.glow || 'rgba(255,60,40,0.8)'}`}}>{fmtVal(kfv(p.kf, t), p.fmt || 'int')}{p.unit || ''}</div>
    {p.label && <TText t={t} t0={p.label[0]} t1={99} text={p.label[1]} size={64} y={790} col={p.label[2] || '#ff3b30'} spacing={10} />}
    {p.top && <TText t={t} t0={0} t1={99} text={p.top} size={52} y={300} col="#cfd8e8" spacing={10} />}
  </AbsoluteFill>
);
export const EndScene: React.FC<SP> = ({t, T, p}) => {
  const cam = camOf(p, t);
  return (<AbsoluteFill>
    <MapLayers p={p} t={t} T={T} cam={cam} />
    <AbsoluteFill style={{background: 'rgba(0,0,0,0.5)', opacity: ip(t, [0.4, 1.2], [0, 1])}} />
    {(p.lines || []).map((l: any, i: number) => t > l[0] && t < (l[4] ?? 99) ? <Big key={i} text={l[1]} y={l[2]} size={l[3] || 110} col={l[5] || '#fff'} sc={pop(t, l[0], 0.35)} /> : null)}
    {p.ask && t > p.ask[0] && <div style={{position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', ...font, fontSize: 54, color: '#fff', opacity: ip(t, [p.ask[0], p.ask[0] + 0.5], [0, 1])}}>{p.ask[1]}</div>}
    {t > (p.sub ?? 7) && <div style={{position: 'absolute', left: W / 2 - 230, top: 740, width: 460, padding: '16px 0', borderRadius: 18, background: '#e5322d', border: `6px solid ${INK}`, textAlign: 'center', ...font, fontSize: 56, color: '#fff', transform: `scale(${pop(t, p.sub ?? 7, 0.3)})`}}>SUBSCRIBE</div>}
    <div style={{position: 'absolute', right: 40, bottom: 30, ...font, fontSize: 22, color: 'rgba(255,255,255,0.6)'}}>Hypothetical simulation · figures are estimates</div>
    <AbsoluteFill style={{background: '#000', opacity: ip(t, [(p.dur || 12) - 1.2, p.dur || 12], [0, 1])}} />
  </AbsoluteFill>);
};
export const GENERIC: Record<string, React.FC<SP>> = {map: MapScene, title: TitleScene, cuts: CutsScene, news: NewsScene, call: CallScene, balls: BallsScene, rank: RankScene, podium: PodiumScene, bignum: BigNumScene, end: EndScene};
