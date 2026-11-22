import React from 'react';
import {INK, YELLOW, RED, font, font2, lerp, popT} from './lib3';
import {COUNTRIES, FlagCanvas} from './HexWorld';
type Cam = {cx: number; cy: number; s: number};
const VW = 1920, VH = 1080;
const toS = (x: number, y: number, c: Cam): [number, number] => [VW / 2 + (x - c.cx) * c.s, VH / 2 + (y - c.cy) * c.s];
const UP = (k: number) => COUNTRIES[k].n.toUpperCase();
const fmtN = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n.toLocaleString('en-US');
const AV = ['#e53935', '#8e24aa', '#3949ab', '#039be5', '#00897b', '#7cb342', '#fb8c00', '#6d4c41'];
const Flag: React.FC<{k: number; w: number}> = ({k, w}) => <FlagCanvas k={k} w={w} h={w * 0.66} style={{borderRadius: 5, border: '2px solid rgba(0,0,0,0.55)', flexShrink: 0}} />;
const glass: React.CSSProperties = {background: 'rgba(12,16,26,0.86)', border: '2px solid rgba(255,255,255,0.12)', borderRadius: 18, boxShadow: '0 10px 30px rgba(0,0,0,0.45)'};
const topAt = (L: any, t: number) => {
  const T = L.top as any[]; let i = 0; while (i + 1 < T.length && T[i + 1][0] <= t) i++;
  const a = T[i], b = T[Math.min(i + 1, T.length - 1)]; const u = b[0] > a[0] ? Math.min(1, (t - a[0]) / (b[0] - a[0])) : 0;
  return (a[1] as number[][]).map((r) => { const rb = (b[1] as number[][]).find((q) => q[0] === r[0]); return rb ? [r[0], r[1] + (rb[1] - r[1]) * u, r[2] + (rb[2] - r[2]) * u] : r; });
};
export const LiveHud: React.FC<{t: number; cam: Cam; L: any}> = ({t, cam, L}) => {
  const [tw, wk, wp] = L.win as [number, number, number]; const reset = L.reset as number; const delay = L.delay as number;
  const inGame = t < tw; const winOn = t >= tw && t < reset + 0.2; const newG = t >= reset;
  const rows = newG ? [] : topAt(L, Math.min(t, tw));
  const chat = (L.chat as any[]).filter((m) => m[0] <= t && (!newG)).slice(-9);
  const pops = (L.chat as any[]).filter((m) => t >= m[0] + delay && t < m[0] + delay + 1.1 && !newG);
  const blink = Math.floor(t * 2) % 2 === 0;
  const elapsed = Math.max(0, Math.min(t, tw)) * L.speed;
  const mm = Math.floor(elapsed / 60), ss = Math.floor(elapsed % 60);
  return <>
    {/* +tropas sobre el mapa */}
    {pops.map((m: any, i: number) => { const c = L.cap[String(m[3])]; if (!c) return null; const [x, y] = toS(c[0], c[1], cam); const d = t - m[0] - delay;
      return <div key={i + '_' + m[0]} style={{position: 'absolute', left: x, top: y - 20 - d * 70, transform: `translate(-50%,-50%) scale(${popT(t, m[0] + delay, 13) * 0.95})`, opacity: lerp(d, 0.75, 1.1, 1, 0), display: 'flex', alignItems: 'center', gap: 6, zIndex: 30}}>
        <Flag k={m[3]} w={34} /><span style={{...font, fontSize: 30, color: '#7dff6a', textShadow: `3px 3px 0 ${INK}, -2px -2px 0 ${INK}, 2px -2px 0 ${INK}, -2px 2px 0 ${INK}`}}>+{m[4]}</span></div>; })}
    {/* cabecera */}
    <div style={{position: 'absolute', left: 28, top: 24, display: 'flex', alignItems: 'center', gap: 14, zIndex: 31}}>
      <div style={{background: '#e00', borderRadius: 10, padding: '4px 14px 2px', ...font, fontSize: 30, color: '#fff', display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 14, height: 14, borderRadius: 7, background: '#fff', opacity: blink ? 1 : 0.35}} />LIVE</div>
      <div style={{...glass, borderRadius: 12, padding: '6px 16px 2px', ...font, fontSize: 30, color: '#fff'}}>👁 12,483</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', justifyContent: 'center', zIndex: 31}}>
      <div style={{...glass, padding: '8px 30px 4px', textAlign: 'center'}}>
        <div style={{...font, fontSize: 40, color: YELLOW, letterSpacing: 1}}>THE CHAT DECIDES THE WAR</div>
        <div style={{...font2, fontSize: 25, color: '#fff'}}>TYPE YOUR COUNTRY IN CHAT → <span style={{color: '#7dff6a'}}>+500 TROOPS</span> · FIRST TO <span style={{color: YELLOW}}>80%</span> WINS</div>
      </div>
    </div>
    {/* TOP 5 */}
    <div style={{position: 'absolute', left: 24, top: 120, width: 430, ...glass, padding: '14px 16px 10px', zIndex: 31, opacity: newG ? 0.35 : 1}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6}}>
        <span style={{...font, fontSize: 32, color: '#fff'}}>🏆 TOP 5</span><span style={{...font2, fontSize: 20, color: '#9fb0c8'}}>GAME #14 · {mm}:{String(ss).padStart(2, '0')}</span></div>
      {rows.map((r, i) => { const k = r[0] as number, p = r[1], tr = r[2]; const lead = i === 0;
        return <div key={k} style={{position: 'relative', height: 82, marginTop: 6, background: lead ? 'rgba(255,210,63,0.13)' : 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '8px 10px 0 10px', border: lead ? `2px solid ${YELLOW}` : '2px solid transparent'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{...font, fontSize: 30, color: lead ? YELLOW : '#cfd8e6', width: 26}}>{i + 1}</span><Flag k={k} w={50} />
            <span style={{...font, fontSize: 28, color: '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{UP(k)}</span>
            <span style={{...font, fontSize: 32, color: lead ? YELLOW : '#fff'}}>{p.toFixed(1)}%</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 5}}>
            <div style={{position: 'relative', flex: 1, height: 12, background: 'rgba(255,255,255,0.12)', borderRadius: 6}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, p / 80 * 100)}%`, background: lead ? `linear-gradient(90deg,#ff9d00,${YELLOW})` : '#4fa3ff', borderRadius: 6}} />
              <div style={{position: 'absolute', right: -1, top: -4, bottom: -4, width: 3, background: '#fff'}} />
            </div>
            <span style={{...font2, fontSize: 19, color: '#9fb0c8', width: 96, textAlign: 'right'}}>🪖 {fmtN(Math.round(tr))}</span></div>
        </div>; })}
      <div style={{...font2, fontSize: 18, color: '#9fb0c8', textAlign: 'right', marginTop: 6}}>GOAL: 80% OF THE WORLD ▸</div>
    </div>
    {/* CHAT */}
    <div style={{position: 'absolute', right: 24, top: 120, width: 420, height: 640, ...glass, padding: '12px 14px', zIndex: 31, overflow: 'hidden'}}>
      <div style={{...font, fontSize: 26, color: '#fff', borderBottom: '2px solid rgba(255,255,255,0.12)', paddingBottom: 6, marginBottom: 6}}>💬 LIVE CHAT</div>
      <div style={{position: 'absolute', left: 14, right: 14, bottom: 12, display: 'flex', flexDirection: 'column', gap: 6}}>
        {chat.map((m: any) => { const ok = t >= m[0] + delay; const wait = Math.max(0, m[0] + delay - t); const ap = popT(t, m[0], 14);
          return <div key={m[0] + m[1]} style={{display: 'flex', alignItems: 'center', gap: 10, transform: `translateY(${(1 - ap) * 30}px)`, opacity: ap, background: ok ? 'rgba(125,255,106,0.1)' : 'transparent', borderRadius: 10, padding: '4px 6px'}}>
            <div style={{width: 38, height: 38, borderRadius: 19, background: AV[m[5]], display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 20, color: '#fff', flexShrink: 0}}>{m[1][0]}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{...font2, fontSize: 17, color: '#9fb0c8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m[1]}</div>
              <div style={{...font2, fontSize: 24, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m[2]}</div></div>
            {ok ? <div style={{display: 'flex', alignItems: 'center', gap: 5, transform: `scale(${popT(t, m[0] + delay, 14)})`}}><Flag k={m[3]} w={30} /><span style={{...font, fontSize: 22, color: '#7dff6a'}}>+{m[4]}</span></div>
              : <span style={{...font2, fontSize: 19, color: '#ffcf5a'}}>⏳ {wait.toFixed(1)}s</span>}
          </div>; })}
      </div>
    </div>
    <div style={{position: 'absolute', right: 24, top: 772, width: 452, ...glass, padding: '8px 14px 4px', zIndex: 31, ...font2, fontSize: 19, color: '#cfd8e6', textAlign: 'center'}}>
      ⏱ Your message counts after {delay}s · 🪖 Every country gets +50-100/s</div>
    {/* aviso demo */}
    <div style={{position: 'absolute', left: 24, bottom: 22, ...glass, borderRadius: 10, padding: '5px 14px 2px', ...font2, fontSize: 18, color: '#ffcf5a', zIndex: 31}}>DEMO · {L.speed}x SPEED</div>
    {/* victoria */}
    {winOn && <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: `rgba(0,0,0,${0.45 * popT(t, tw, 8) * lerp(t, reset - 0.2, reset + 0.2, 1, 0)})`, zIndex: 40, opacity: lerp(t, reset - 0.2, reset + 0.2, 1, 0)}}>
      <div style={{transform: `scale(${popT(t, tw, 10)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{...font, fontSize: 60, color: '#fff', textShadow: `5px 5px 0 ${INK}`}}>🏆 WINNER 🏆</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Flag k={wk} w={170} /><span style={{...font, fontSize: 130, color: YELLOW, textShadow: `7px 7px 0 ${INK}`}}>{UP(wk)}</span></div>
        <div style={{background: RED, borderRadius: 14, padding: '6px 26px 2px', ...font, fontSize: 44, color: '#fff'}}>CONQUERED {wp}% OF THE WORLD</div>
        <div style={{...font2, fontSize: 30, color: '#fff', marginTop: 8}}>MVP: <span style={{color: YELLOW}}>{(L.chat as any[]).filter((m) => m[3] === wk).slice(-1)[0]?.[1] || ''}</span></div>
      </div></div>}
    {/* nueva partida */}
    {newG && <div style={{position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 40}}>
      <div style={{...glass, padding: '16px 46px 10px', textAlign: 'center', transform: `scale(${popT(t, reset, 10)})`}}>
        <div style={{...font, fontSize: 64, color: '#fff'}}>NEW GAME STARTS IN</div>
        <div style={{...font, fontSize: 120, color: YELLOW, lineHeight: 1}}>{Math.max(1, 3 - Math.floor((t - reset - 0.6) / 0.6))}</div>
        <div style={{...font2, fontSize: 28, color: '#7dff6a'}}>TYPE YOUR COUNTRY NOW!</div></div></div>}
  </>;
};
