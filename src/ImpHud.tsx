// HUD de "IMPOSTOR COUNTRY": plantilla, pistas, misión, avisos y la reunión de emergencia con votación
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES, FlagCanvas} from './HexWorld';
import {INK, Face} from './lib3';

const VW = 1920, VH = 1080;
const F: React.CSSProperties = {fontFamily: 'Lilita'};
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const eo = (u: number) => 1 - Math.pow(1 - cl(u, 0, 1), 3);
const popIn = (t: number, t0: number, d = 0.35) => { const u = cl((t - t0) / d, 0, 1); return u < 1 ? 1.12 * eo(u) - 0.12 * u * u : 1; };
const fadeW = (t: number, t0: number, t1: number, f = 0.3) => cl(Math.min((t - t0) / f, (t1 - t) / f), 0, 1);
const KI = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const NAME: Record<string, string> = {KR: 'S. KOREA', SA: 'SAUDI ARABIA', PH: 'PHILIPPINES'};
const nm = (c: string) => NAME[c] || COUNTRIES[KI(c)].n.toUpperCase();
const RED = '#e8352b', DARK = 'rgba(16,14,24,0.88)', GOLD = '#ffd23f', BLUE = '#2fa8ff';

// estado de cada país en el instante t
export const impStatus = (I: any, t: number, c: string): string => { let s = 'alive'; for (const [tt, cc, st] of I.status as any[]) if (cc === c && t >= tt) s = st; return s; };

// bola de país con cara
export const IBall: React.FC<{c: string; size: number; t: number; mood?: any; gray?: boolean; seed?: number}> = ({c, size, t, mood = 'calm', gray, seed = 1}) => (
  <div style={{position: 'relative', width: size, height: size, filter: gray ? 'grayscale(1) brightness(0.55)' : undefined}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(3, size * 0.04)}px solid ${INK}`, boxShadow: `0 ${size * 0.05}px 0 ${INK}`}}>
      <FlagCanvas k={KI(c)} w={size} h={size} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 38%), radial-gradient(circle at 60% 78%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 100%)'}} />
    </div>
    <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}><Face x={size / 2} y={size * 0.47} r={size * 0.22} mood={mood} t={t} seed={seed} /></svg>
  </div>
);

// barra superior: ronda, vivos, misión
const Top: React.FC<{I: any; t: number}> = ({I, t}) => {
  const rd = [...(I.rounds as any[])].reverse().find((r) => t >= r[0]); const alive = (I.roster as string[]).filter((c) => impStatus(I, t, c) === 'alive' || impStatus(I, t, c) === 'imp').length;
  const sh = kfl(I.shield, t);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 14, display: 'flex', justifyContent: 'center', gap: 14}}>
      {[[rd ? rd[1] : 'START', '#fff', 'ROUND'], [String(alive), '#4fe07a', 'ALIVE'], ['1', RED, 'IMPOSTOR']].map(([v, col, lab], i) => (
        <div key={i} style={{background: DARK, border: `5px solid ${col}`, borderRadius: 16, padding: '2px 18px 0', textAlign: 'center', boxShadow: `0 5px 0 ${INK}`, minWidth: 110}}>
          <div style={{...F, fontSize: 16, color: col as string, letterSpacing: 1}}>{lab}</div><div style={{...F, fontSize: 38, color: '#fff', lineHeight: 1}}>{v}</div>
        </div>))}
      <div style={{background: DARK, border: `5px solid ${BLUE}`, borderRadius: 16, padding: '6px 16px 8px', boxShadow: `0 5px 0 ${INK}`, width: 380}}>
        <div style={{...F, fontSize: 16, color: BLUE, letterSpacing: 1, textAlign: 'center'}}>🛡️ MISSION · BUILD THE GREAT SHIELD</div>
        <div style={{height: 22, borderRadius: 11, background: '#2a2733', border: `3px solid ${INK}`, overflow: 'hidden', position: 'relative'}}>
          <div style={{width: `${sh}%`, height: '100%', background: 'linear-gradient(180deg,#9fe8ff,#2fa8ff)'}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...F, fontSize: 18, color: '#fff', textShadow: `2px 2px 0 ${INK}`}}>{Math.floor(sh)}%</div>
        </div>
      </div>
    </div>
  );
};
const kfl = (k: number[][], t: number) => { if (!k || !k.length) return 0; if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * cl((t - a[0]) / Math.max(1e-6, b[0] - a[0]), 0, 1); } return k[k.length - 1][1]; };

// plantilla de países a la izquierda
const Roster: React.FC<{I: any; t: number}> = ({I, t}) => (
  <div style={{position: 'absolute', left: 18, top: 120, width: 250, background: DARK, border: `5px solid ${GOLD}`, borderRadius: 18, padding: '8px 10px', boxShadow: `0 6px 0 ${INK}`}}>
    <div style={{...F, fontSize: 19, color: GOLD, textAlign: 'center', letterSpacing: 1, marginBottom: 4}}>THE 10 COUNTRIES</div>
    {(I.roster as string[]).map((c, i) => { const st = impStatus(I, t, c); const out = st === 'killed' || st === 'ejected'; const ch = [...(I.status as any[])].find((s) => s[1] === c && s[2] === st); const flash = ch && t - ch[0] < 1.2 ? 0.5 + 0.5 * Math.sin(t * 20) : 0;
      return <div key={c} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '3px 4px', borderRadius: 8, background: flash ? `rgba(232,53,43,${flash * 0.6})` : st === 'imp' ? 'rgba(232,53,43,0.45)' : 'transparent'}}>
        <div style={{width: 40, height: 27, borderRadius: 4, overflow: 'hidden', border: `3px solid ${INK}`, filter: out ? 'grayscale(1) brightness(0.6)' : undefined, flexShrink: 0}}><FlagCanvas k={KI(c)} w={40} h={27} /></div>
        <div style={{...F, fontSize: 18, color: out ? '#7a7488' : '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textDecoration: out ? 'line-through' : 'none'}}>{nm(c)}</div>
        <div style={{fontSize: 18}}>{st === 'killed' ? '💀' : st === 'ejected' ? '❌' : st === 'imp' ? '🔪' : ''}</div>
      </div>; })}
  </div>
);
// panel de pistas a la derecha
const Clues: React.FC<{I: any; t: number}> = ({I, t}) => {
  const cs = (I.clues as any[]).filter((c) => t >= c[0]); if (!cs.length) return null;
  return (
    <div style={{position: 'absolute', right: 18, top: 120, width: 330, background: DARK, border: `5px solid ${BLUE}`, borderRadius: 18, padding: '8px 12px', boxShadow: `0 6px 0 ${INK}`}}>
      <div style={{...F, fontSize: 19, color: BLUE, textAlign: 'center', letterSpacing: 1}}>🔎 CLUES</div>
      {cs.map((c, i) => { const nw = t - c[0] < 2.5; return <div key={i} style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, padding: '4px 6px', borderRadius: 10, background: nw ? `rgba(47,168,255,${0.25 + 0.2 * Math.sin(t * 10)})` : 'rgba(255,255,255,0.06)', transform: `scale(${popIn(t, c[0])})`}}>
        <div style={{fontSize: 26}}>{c[2]}</div><div style={{...F, fontSize: 18, color: '#fff', lineHeight: 1.1}}>{c[1]}</div></div>; })}
    </div>
  );
};
// avisos grandes: SABOTAGE / ELIMINADO
const Banner: React.FC<{I: any; t: number}> = ({I, t}) => {
  const b = (I.banners as any[]).find((x) => t >= x[0] && t < x[1]); if (!b) return null;
  const [t0, t1, kind, title, sub, c] = b; const a = fadeW(t, t0, t1, 0.2); const col = kind === 'kill' ? '#8a8496' : RED;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: a, zIndex: 46}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: kind === 'kill' ? 'rgba(20,18,26,0.92)' : 'rgba(60,8,8,0.92)', border: `7px solid ${kind === 'kill' ? '#cfc8da' : RED}`, borderRadius: 24, padding: '14px 34px 10px 18px', boxShadow: `0 9px 0 ${INK}, 0 0 ${30 + 20 * Math.sin(t * 12)}px ${col}`, transform: `scale(${popIn(t, t0)}) rotate(-2deg)`}}>
        {c && <IBall c={c} size={110} t={t} mood={kind === 'kill' ? 'sad' : 'shocked'} gray={kind === 'kill'} />}
        <div>
          <div style={{...F, fontSize: 70, color: '#fff', WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1}}>{title}</div>
          {sub && <div style={{...F, fontSize: 32, color: kind === 'kill' ? '#cfc8da' : '#ffb0a8', marginTop: 6}}>{sub}</div>}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- reunión de emergencia
const Meeting: React.FC<{I: any; t: number}> = ({I, t}) => {
  const m = (I.meetings as any[]).find((x) => t >= x.t0 && t < x.t1); if (!m) return null;
  const a = fadeW(t, m.t0, m.t1, 0.35); const alive: string[] = m.alive; const n = alive.length;
  const cx = VW / 2, cy = 590, RX = 560, RY = 230; const bs = n > 7 ? 130 : n > 4 ? 155 : 190;
  const pos = (i: number) => { const ang = Math.PI + (i + 0.5) * (Math.PI / n) * (n > 5 ? 2 : 1) - (n > 5 ? Math.PI / 2 + Math.PI / n / 2 : 0); return [cx + Math.cos(ang) * RX, cy + Math.sin(ang) * RY * (n > 5 ? 1 : -1)]; };
  const P2 = (i: number) => { const ang = -Math.PI / 2 + ((i + 0.5) / n) * Math.PI * 2 - Math.PI / n; return [cx + Math.cos(ang) * (RX + 40), cy + 30 + Math.sin(ang) * (RY + 40)]; };
  const voting = t >= m.voteT; const ejected = t >= m.ejT;
  const voters = (m.votes as [string, string][]).filter((_, i) => t >= m.voteT + 0.3 + i * 0.32);
  const count = (c: string) => voters.filter((v) => v[1] === c).length;
  const accNow = (m.acc as any[]).filter((x) => t >= x[0] && t < x[0] + 2.6);
  return (
    <AbsoluteFill style={{zIndex: 48, opacity: a}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(40,30,60,0.92) 0%, rgba(8,6,14,0.97) 75%)'}} />
      {/* luz roja de alarma */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 0%, rgba(255,40,30,${0.25 + 0.15 * Math.sin(t * 6)}) 0%, rgba(255,40,30,0) 55%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', transform: `scale(${popIn(t, m.t0)})`}}>
        <div style={{...F, fontSize: 92, color: RED, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`}}>{voting ? (m.final ? 'FINAL VOTE' : 'VOTE!') : '🚨 EMERGENCY MEETING'}</div>
        <div style={{...F, fontSize: 32, color: '#fff', opacity: 0.85}}>{voting ? 'WHO IS THE IMPOSTOR?' : m.reason}</div>
      </div>
      {/* mesa */}
      <div style={{position: 'absolute', left: cx - 420, top: cy - 120, width: 840, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 40%, #4a4060 0%, #2a2238 70%)', border: `8px solid ${INK}`, boxShadow: `0 16px 0 ${INK}, 0 0 60px rgba(120,90,200,0.35)`}}>
        <div style={{position: 'absolute', inset: 40, borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.12)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 112, textAlign: 'center', ...F, fontSize: 30, color: 'rgba(255,255,255,0.35)'}}>ASIA COUNCIL</div>
      </div>
      {alive.map((c, i) => {
        const [x, y] = P2(i); const v = count(c); const isEj = m.ej === c; const ejU = isEj && ejected ? eo((t - m.ejT) / 1.4) : 0;
        const speaking = accNow.some((q) => q[1] === c); const target = accNow.some((q) => q[2] === c);
        const mood = isEj && ejected ? 'shocked' : speaking ? 'angry' : target ? 'scared' : voting ? 'calm' : 'calm';
        return <div key={c} style={{position: 'absolute', left: x - bs / 2 + ejU * (x > cx ? 900 : -900), top: y - bs / 2 - ejU * 300, transform: `rotate(${ejU * 720}deg) scale(${popIn(t, m.t0 + 0.15 + i * 0.07) * (speaking ? 1.08 : 1)})`, opacity: 1 - ejU * 0.4}}>
          <IBall c={c} size={bs} t={t} mood={mood} seed={i + 3} />
          <div style={{position: 'absolute', left: -20, right: -20, top: bs + 6, textAlign: 'center', ...F, fontSize: bs > 150 ? 26 : 21, color: '#fff', WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{nm(c)}</div>
          {/* votos recibidos */}
          {voting && v > 0 && <div style={{position: 'absolute', left: bs * 0.5 - 22 * v / 2, top: -46, display: 'flex', gap: 4}}>{voters.filter((q) => q[1] === c).map((q, j) => <div key={j} style={{width: 34, height: 24, borderRadius: 4, overflow: 'hidden', border: `3px solid ${INK}`, transform: `scale(${popIn(t, m.voteT + 0.3 + (m.votes as any[]).findIndex((z: any) => z === q) * 0.32)})`}}><FlagCanvas k={KI(q[0])} w={34} h={24} /></div>)}</div>}
          {voting && <div style={{position: 'absolute', right: -14, top: -14, width: 46, height: 46, borderRadius: '50%', background: v ? RED : '#3a3448', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...F, fontSize: 28, color: '#fff'}}>{v}</div>}
        </div>;
      })}
      {/* bocadillos de acusación */}
      {accNow.map((q, i) => { const idx = alive.indexOf(q[1]); if (idx < 0) return null; const [x, y] = P2(idx); const up = y < cy + 30;
        return <div key={i} style={{position: 'absolute', left: cl(x - 210, 20, VW - 440), top: up ? y - bs / 2 - 120 : y + bs / 2 + 40, width: 420, transform: `scale(${popIn(t, q[0])})`, zIndex: 50}}>
          <div style={{background: '#fffbe8', border: `5px solid ${INK}`, borderRadius: 20, padding: '10px 16px 6px', ...F, fontSize: 30, color: INK, textAlign: 'center', boxShadow: `0 6px 0 ${INK}`}}>{q[3]}</div>
        </div>; })}
      {/* SKIP */}
      {voting && <div style={{position: 'absolute', left: cx - 70, top: cy + 230, ...F, fontSize: 26, color: '#cfc8da', textAlign: 'center', width: 140}}>SKIP: {count('SKIP')}</div>}
      {/* resultado */}
      {ejected && t >= m.ejT + 1.0 && <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', transform: `scale(${popIn(t, m.ejT + 1.0)})`}}>
        <div style={{display: 'inline-block', background: m.imp ? RED : 'rgba(16,14,24,0.95)', border: `7px solid ${m.imp ? '#fff' : '#cfc8da'}`, borderRadius: 24, padding: '16px 40px 10px', boxShadow: `0 10px 0 ${INK}`}}>
          <div style={{...F, fontSize: 64, color: '#fff', WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{`${nm(m.ej)} ${m.imp ? 'WAS THE IMPOSTOR!' : 'WAS NOT THE IMPOSTOR'}`.slice(0, Math.max(0, Math.floor((t - m.ejT - 1.0) * 34)))}</div>
          {!m.imp && t >= m.ejT + 2.2 && <div style={{...F, fontSize: 32, color: '#ffb0a8', marginTop: 4}}>1 IMPOSTOR REMAINS…</div>}
        </div>
      </div>}
    </AbsoluteFill>
  );
};

export const ImpHud: React.FC<{I: any; t: number; full: boolean}> = ({I, t, full}) => (<>
  {!full && <><Top I={I} t={t} /><Roster I={I} t={t} /><Clues I={I} t={t} /><Banner I={I} t={t} /></>}
  <Meeting I={I} t={t} />
</>);
