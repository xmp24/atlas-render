import React from 'react';
import {AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame} from 'remotion';
import {INK, RED, YELLOW, lerp, font, popT} from './lib3';
import {RAW, get, frameState, Ball, histAt, isDead, moodOf, MapLayer, Faces, BubblesL, Chip, Stamp, Twist, Ocean} from './MiniWarG';

export const MWF_IDS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];
export const mwfFrames = (id: string) => Math.round(RAW[id].duration * 30);
const W = 1080;

// ---------- elección con temporizador frenético ----------
const Card: React.FC<{d: any; k: number; t: number; out: number; size: number; h: number; nameSize: number; dir: number[]}> = ({d, k, t, out, size, h, nameSize, dir}) => {
  const bob = Math.sin(t * 7 + k * 1.7) * 5;
  const e = d.T.flags[k].e;
  return (
    <div style={{position: 'relative', height: h, transform: `translate(${dir[0] * out * 760}px, ${dir[1] * out * 900 + bob}px) rotate(${(k % 2 ? 2 : -2) + Math.sin(t * 5 + k) * 2}deg)`, background: d.COLS[k], border: `${h > 200 ? 9 : 6}px solid ${INK}`, borderRadius: h > 200 ? 36 : 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${h > 200 ? 14 : 8}px 0 rgba(0,0,0,0.45), inset 0 0 0 ${h > 200 ? 8 : 5}px rgba(255,255,255,0.35)`}}>
      <div style={{position: 'relative'}}>
        <Ball d={d} k={k} size={size} mood={k % 2 ? 'smug' : 'angry'} t={t} id={`fc${k}`} look={[Math.sin(t * 3 + k), 0]} />
        {e && <div style={{position: 'absolute', right: -size * 0.28, bottom: -size * 0.08, fontSize: size * 0.5, filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.45))'}}>{e}</div>}
      </div>
      <div style={{...font, fontSize: nameSize, color: '#fff', textShadow: `4px 4px 0 ${INK}, -2px -2px 0 ${INK}, 2px -2px 0 ${INK}, -2px 2px 0 ${INK}`, marginTop: 4, lineHeight: 1, whiteSpace: 'nowrap'}}>{d.NAMES[k]}</div>
      {d.NK <= 12 && <div style={{position: 'absolute', top: -16, left: -12, width: h > 200 ? 84 : 52, height: h > 200 ? 84 : 52, borderRadius: 42, background: '#fff', border: `${h > 200 ? 7 : 5}px solid ${INK}`, ...font, fontSize: h > 200 ? 58 : 34, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 4, boxSizing: 'border-box'}}>{k + 1}</div>}
    </div>
  );
};
const FastChoose: React.FC<{d: any; t: number}> = ({d, t}) => {
  const T = d.T;
  const ws = T.warStart;
  if (t > ws + 0.35) return null;
  const out = lerp(t, ws - 0.15, ws + 0.3, 0, 1, Easing.in(Easing.cubic));
  const nk = d.NK;
  const rem = Math.max(0, ws - 0.25 - t);
  const tot = ws - 0.25;
  const sec = Math.ceil(rem / (tot / 3));
  const ph = (rem / (tot / 3)) % 1;
  const pulse = 1 + 0.12 * Math.pow(ph, 6);
  const shake = Math.sin(t * 60) * 3 * (1 - rem / tot);
  const col = rem > tot * 0.66 ? '#2ec36a' : rem > tot * 0.33 ? YELLOW : RED;
  const R = 104, C = 2 * Math.PI * R;
  const h1 = T.extra?.h1 || 'PICK ONE!', h2 = T.extra?.h2 || 'ONLY 1 SURVIVES';
  let grid: React.ReactNode, timerTop = 1360;
  if (nk === 2) {
    grid = <div style={{position: 'absolute', top: 400, left: 30, right: 30, display: 'flex', gap: 26, alignItems: 'center'}}>
      <div style={{flex: 1}}><Card d={d} k={0} t={t} out={out} size={300} h={640} nameSize={84} dir={[-1, -1]} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', zIndex: 3}}><div style={{...font, fontSize: 150, color: RED, textShadow: `7px 7px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`, transform: `scale(${1 + 0.08 * Math.sin(t * 12)}) rotate(-8deg)`, opacity: 1 - out}}>VS</div></div>
      <div style={{flex: 1}}><Card d={d} k={1} t={t} out={out} size={300} h={640} nameSize={84} dir={[1, 1]} /></div>
    </div>;
    timerTop = 1150;
  } else if (nk > 20) {
    grid = <div style={{position: 'absolute', top: 380, left: 30, right: 30, display: 'flex', gap: 20, alignItems: 'center'}}>
      <div style={{width: 470}}><Card d={d} k={0} t={t} out={out} size={300} h={700} nameSize={66} dir={[-1, -1]} /></div>
      <div style={{flex: 1, height: 700, transform: `translate(${out * 760}px,${out * 900}px)`, background: 'rgba(255,255,255,0.12)', border: `9px solid ${INK}`, borderRadius: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, boxSizing: 'border-box'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4}}>{Array.from({length: 81}).map((_, i) => <div key={i} style={{width: 46, height: 46, borderRadius: 23, background: d.COLS[1 + (i % (nk - 1))], border: `3px solid ${INK}`, transform: `scale(${0.9 + 0.1 * Math.sin(t * 9 + i)})`}} />)}</div>
        <div style={{...font, fontSize: 60, color: '#fff', textShadow: `4px 4px 0 ${INK}`, marginTop: 14, textAlign: 'center', lineHeight: 1}}>{nk - 1} TINY<br />KINGDOMS</div>
      </div>
    </div>;
    timerTop = 1200;
  } else if (nk > 6) {
    const cols = 3;
    const rows = Math.ceil(nk / cols);
    const ch = rows > 3 ? 230 : 290;
    grid = <div style={{position: 'absolute', top: 330, left: 24, right: 24, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16}}>
      {Array.from({length: nk}).map((_, k) => <Card key={k} d={d} k={k} t={t} out={out} size={rows > 3 ? 120 : 150} h={ch} nameSize={rows > 3 ? 34 : 40} dir={[k % cols === 0 ? -1 : k % cols === cols - 1 ? 1 : 0, k < nk / 2 ? -1 : 1]} />)}
    </div>;
    timerTop = 330 + rows * (ch + 16) + 30;
  } else {
    const six = nk > 4;
    grid = <div style={{position: 'absolute', top: six ? 360 : 400, left: 34, right: 34, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: six ? 22 : 30}}>
      {Array.from({length: nk}).map((_, k) => <Card key={k} d={d} k={k} t={t} out={out} size={six ? 190 : 260} h={six ? 300 : 420} nameSize={six ? 52 : 64} dir={[k % 2 ? 1 : -1, k < nk / 2 ? -1 : 1]} />)}
    </div>;
    timerTop = six ? 1390 : 1350;
  }
  return (
    <AbsoluteFill style={{zIndex: 20, background: `rgba(8,14,28,${0.7 * (1 - out)})`}}>
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - out, transform: `scale(${1 + 0.03 * Math.sin(t * 9)})`}}>
        <div style={{...font, fontSize: h1.length > 14 ? 112 : 150, color: YELLOW, textShadow: `8px 8px 0 ${INK}, -4px -4px 0 ${INK}, 4px -4px 0 ${INK}, -4px 4px 0 ${INK}`, lineHeight: 1, textAlign: 'center'}}>{h1}</div>
        <div style={{...font, fontSize: 64, color: '#fff', textShadow: `5px 5px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}`, lineHeight: 1.1, textAlign: 'center'}}>{h2}</div>
      </div>
      {grid}
      {rem > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: Math.min(timerTop, 1620), display: 'flex', justifyContent: 'center', opacity: 1 - out}}>
          <div style={{position: 'relative', width: 260, height: 260, transform: `translateX(${shake}px) scale(${pulse})`}}>
            <svg width={260} height={260} style={{position: 'absolute'}}>
              <circle cx={130} cy={130} r={122} fill={INK} />
              <circle cx={130} cy={130} r={R} fill="#fff" />
              <circle cx={130} cy={130} r={R} fill="none" stroke={col} strokeWidth={26} strokeDasharray={`${C * (rem / tot)} ${C}`} transform="rotate(-90 130 130)" strokeLinecap="round" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 150, color: INK, paddingTop: 14}}>{sec}</div>
          </div>
        </div>
      )}
      {t >= ws - 0.3 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><div style={{transform: `scale(${popT(t, ws - 0.3, 8) * lerp(t, ws + 0.1, ws + 0.35, 1, 0)})`, ...font, fontSize: 300, color: RED, textShadow: `10px 10px 0 ${INK}, -5px -5px 0 ${INK}, 5px -5px 0 ${INK}, -5px 5px 0 ${INK}`}}>{T.mode === 'melee' ? 'FIGHT!' : 'WAR!'}</div></AbsoluteFill>}
    </AbsoluteFill>
  );
};
// ---------- marcador grande y simple ----------
const FastHud: React.FC<{d: any; t: number}> = ({d, t}) => {
  const T = d.T;
  if (t < T.warStart - 0.1 || t > T.winT) return null;
  if (d.NK === 2) return <DuelHud d={d} t={t} />;
  if (d.NK > 6) return <BoardHud d={d} t={t} />;
  const k0 = popT(t, T.warStart - 0.1, 12);
  const nk = d.NK;
  const alive = Array.from({length: nk}).filter((_, k) => !isDead(d, k, t)).length;
  const lastElim = (T.elim as number[][]).filter((e) => e[0] <= t).slice(-1)[0];
  const lp = lastElim ? popT(t, lastElim[0], 9) : 1;
  const six = nk > 4;
  return (
    <div style={{position: 'absolute', top: 60, left: 18, right: 18, zIndex: 10, transform: `translateY(${(1 - k0) * -400}px)`}}>
      <div style={{display: 'grid', gridTemplateColumns: six ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10}}>
        {Array.from({length: nk}).map((_, k) => {
          const p = (histAt(d, t)[k] || 0) / d.N;
          const dead = isDead(d, k, t);
          return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 8, background: dead ? 'rgba(40,40,46,0.9)' : 'rgba(16,22,34,0.9)', border: `5px solid ${dead ? '#666' : d.COLS[k]}`, borderRadius: 20, padding: '6px 10px', opacity: dead ? 0.6 : 1}}>
              <Ball d={d} k={k} size={six ? 56 : 70} mood={moodOf(d, t, k)} t={t} id={`fh${k}`} dead={dead} />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{...font, fontSize: six ? 22 : 28, color: dead ? '#999' : '#fff', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textDecoration: dead ? 'line-through' : 'none'}}>{d.NAMES[k]}</div>
                <div style={{...font, fontSize: six ? 40 : 50, color: dead ? '#999' : YELLOW, lineHeight: 1}}>{dead ? 'OUT' : `${Math.round(p * 100)}%`}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
        <div style={{transform: `scale(${0.8 + 0.2 * lp + (lastElim && t - lastElim[0] < 0.4 ? 0.25 * (1 - (t - lastElim[0]) / 0.4) : 0)})`, background: RED, border: '5px solid #fff', borderRadius: 18, padding: '4px 26px 0', ...font, fontSize: 46, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>{alive} LEFT</div>
      </div>
    </div>
  );
};

const DuelHud: React.FC<{d: any; t: number}> = ({d, t}) => {
  const T = d.T;
  const k0 = popT(t, T.warStart - 0.1, 12);
  const h = histAt(d, t);
  const p = h[0] / Math.max(1, h[0] + h[1]);
  return (
    <div style={{position: 'absolute', top: 60, left: 20, right: 20, zIndex: 10, transform: `translateY(${(1 - k0) * -400}px)`, background: 'rgba(16,22,34,0.9)', border: '6px solid #fff', borderRadius: 30, padding: '12px 16px'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Ball d={d} k={0} size={96} mood={moodOf(d, t, 0)} t={t} id="dh0" /><div style={{...font, fontSize: 74, color: YELLOW, textShadow: `3px 3px 0 ${INK}`}}>{Math.round(p * 100)}%</div></div>
        <div style={{...font, fontSize: 56, color: RED, textShadow: `3px 3px 0 ${INK}`}}>VS</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><div style={{...font, fontSize: 74, color: YELLOW, textShadow: `3px 3px 0 ${INK}`}}>{100 - Math.round(p * 100)}%</div><Ball d={d} k={1} size={96} mood={moodOf(d, t, 1)} t={t} id="dh1" /></div>
      </div>
      <div style={{position: 'relative', height: 44, borderRadius: 22, overflow: 'hidden', border: `6px solid ${INK}`, display: 'flex', marginTop: 8}}>
        <div style={{width: `${p * 100}%`, background: d.COLS[0]}} /><div style={{flex: 1, background: d.COLS[1]}} />
        <div style={{position: 'absolute', left: `calc(${p * 100}% - 5px)`, top: -4, width: 10, height: 52, background: '#fff', boxShadow: `0 0 ${10 + 8 * Math.sin(t * 10)}px #fff`}} />
      </div>
    </div>
  );
};
const BoardHud: React.FC<{d: any; t: number}> = ({d, t}) => {
  const T = d.T;
  const k0 = popT(t, T.warStart - 0.1, 12);
  const h = histAt(d, t);
  const nk = d.NK;
  const alive = Array.from({length: nk}).map((_, k) => k).filter((k) => !isDead(d, k, t));
  const top = [...alive].sort((a, b) => h[b] - h[a]).slice(0, 4);
  const lastElim = (T.elim as number[][]).filter((e) => e[0] <= t).slice(-1)[0];
  const bump = lastElim && t - lastElim[0] < 0.4 ? 0.3 * (1 - (t - lastElim[0]) / 0.4) : 0;
  const feed = (T.elim as number[][]).filter((e) => e[0] <= t && t - e[0] < 2.6).slice(-3);
  const giant = nk > 20;
  const live = alive.filter((k) => h[k] > 0);
  const kingdoms = live.filter((k) => k >= 2).length;
  const gchips = giant ? (h[1] > 0 ? [0, 1] : [0]) : top;
  return (
    <div style={{position: 'absolute', top: 60, left: 18, right: 18, zIndex: 10, transform: `translateY(${(1 - k0) * -400}px)`}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
        {gchips.map((k, i) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,22,34,0.9)', border: `5px solid ${d.COLS[k]}`, borderRadius: 20, padding: '6px 10px', gridColumn: giant ? 'span 1' : undefined}}>
            {!giant && <div style={{...font, fontSize: 34, color: i === 0 ? YELLOW : '#fff', width: 44}}>#{i + 1}</div>}
            <Ball d={d} k={k} size={60} mood={moodOf(d, t, k)} t={t} id={`bh${k}`} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{...font, fontSize: 26, color: '#fff', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{d.NAMES[k]}</div>
              <div style={{...font, fontSize: 44, color: YELLOW, lineHeight: 1}}>{Math.round((h[k] / d.N) * 100)}%</div>
            </div>
          </div>
        ))}
        {giant && h[1] <= 0 && <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,22,34,0.9)', border: '5px solid #fff', borderRadius: 20, ...font, fontSize: 40, color: '#fff', textAlign: 'center', lineHeight: 1}}>{kingdoms} TINY<br />KINGDOMS LEFT</div>}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
        <div style={{transform: `scale(${1 + bump})`, background: RED, border: '5px solid #fff', borderRadius: 18, padding: '4px 26px 0', ...font, fontSize: 46, color: '#fff', textShadow: `3px 3px 0 ${INK}`}}>{live.length} LEFT</div>
      </div>
      {!giant && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginTop: 10}}>
        {feed.map((e) => {
          const k = popT(t, e[0], 12) * lerp(t, e[0] + 2.3, e[0] + 2.6, 1, 0);
          return <div key={e[1]} style={{transform: `translateX(${(k - 1) * 300}px)`, opacity: k, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,22,34,0.88)', borderRadius: 14, padding: '4px 14px 2px', ...font, fontSize: 30}}>
            {e[3] >= 0 && <span style={{color: d.COLS[e[3]]}}>{d.NAMES[e[3]]}</span>}<span style={{color: '#fff'}}>💥</span><span style={{color: '#aaa', textDecoration: 'line-through'}}>{d.NAMES[e[1]]}</span>
          </div>;
        })}
      </div>}
    </div>
  );
};
const FastWinner: React.FC<{d: any; t: number}> = ({d, t}) => {
  const T = d.T;
  const w0 = T.winT as number;
  if (t < w0) return null;
  const k = popT(t, w0, 9);
  const wk = T.winner as number;
  return (
    <AbsoluteFill style={{zIndex: 18, alignItems: 'center', justifyContent: 'center', background: `rgba(8,14,28,${0.55 * k})`}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -60}}>
        <div style={{fontSize: 190, marginBottom: -80, zIndex: 2, transform: `rotate(${Math.sin(t * 6) * 8}deg)`}}>👑</div>
        <Ball d={d} k={wk} size={420} mood="happy" t={t} id="fwin" />
        <div style={{marginTop: 18, background: d.COLS[wk], border: `11px solid ${INK}`, borderRadius: 32, padding: '12px 38px 2px', ...font, fontSize: d.NAMES[wk].length > 8 ? 96 : 116, color: '#fff', textShadow: `5px 5px 0 ${INK}`, boxShadow: '0 12px 0 rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>{d.NAMES[wk]} WIN{d.NAMES[wk].endsWith('S') ? '' : 'S'}!</div>
        <div style={{marginTop: 24, transform: `scale(${popT(t, w0 + 0.4, 10)}) rotate(-2deg)`, background: '#fff', border: `8px solid ${INK}`, borderRadius: 26, padding: '10px 30px 2px', ...font, fontSize: 66, color: INK}}>Did <span style={{color: RED}}>YOUR</span> pick win? 👇</div>
      </div>
    </AbsoluteFill>
  );
};
export const MiniWarF: React.FC<{id: string; audio?: boolean}> = ({id, audio = true}) => {
  const d = get(id);
  const t = useCurrentFrame() / 30;
  const f = frameState(d, t);
  const T = d.T;
  const loop = lerp(t, T.duration - 0.4, T.duration, 0, 1);
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <Ocean t={t} />
      <MapLayer d={d} f={f} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0) 16%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.3))'}} />
      {t > T.warStart && t < T.winT && <Faces d={d} f={f} />}
      {t > T.warStart && t < T.winT && <BubblesL d={d} f={f} />}
      <FastHud d={d} t={t} />
      {t < T.winT && <Chip d={d} t={t} />}
      <Stamp d={d} t={t} />
      <Twist d={d} t={t} />
      <FastChoose d={d} t={t} />
      <FastWinner d={d} t={t} />
      {loop > 0 && <AbsoluteFill style={{opacity: loop, zIndex: 40}}><AbsoluteFill style={{background: '#164f86'}}><Ocean t={0} /><MapLayer d={d} f={frameState(d, 0)} /></AbsoluteFill><FastChoose d={d} t={0} /></AbsoluteFill>}
      {audio && <Audio src={staticFile(`mwf-${id}.wav`)} />}
    </AbsoluteFill>
  );
};
export const MiniThumbF: React.FC<{id: string}> = ({id}) => {
  const d = get(id);
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <Ocean t={0} /><MapLayer d={d} f={frameState(d, 12)} />
      <FastChoose d={d} t={0.9} />
    </AbsoluteFill>
  );
};
