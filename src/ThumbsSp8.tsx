import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, CREAM, RED, BLUE, YELLOW, ORANGE, font, Avatar, Mood} from './lib3';
import {Ocean} from './War5';
import {PIECES} from './War6';
import {ContMap, TEAMOF, TCOL, TDARK, TFLAG, TNAME} from './War9';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 50px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
const TeamMap: React.FC<{cx: number; cy: number; s: number; op?: number}> = ({cx, cy, s, op = 0.62}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <g transform={`translate(960,540) scale(${s}) translate(${-cx},${-cy})`}>
      {PIECES.map((p, i) => <path key={i} d={p.d} fill={TCOL[TEAMOF[p.code]]} opacity={op} stroke={INK} strokeWidth={0.6 / s} />)}
    </g>
  </svg>
);
const Av = (tm: string, size: number, mood: Mood, look: [number, number], id: string) => <Avatar size={size} code={TFLAG(tm)} mood={mood} t={0.5} seed={tm.charCodeAt(0)} look={look} id={id} />;
export type TCfg = {order: string[]; big: string; n: string; a: string; b: string; pa: number; tug: number; cam: [number, number, number]; table: [string, number][]; t1: string; t2: string; t3: string; pill: string};
export const ThumbTour: React.FC<{v: string; c: TCfg}> = ({v, c}) => {
  if (v === 'A') return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={0} cam={{cx: 960, cy: 500, s: 1.08}} /><TeamMap cx={960} cy={500} s={1.08} op={0.45} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.65) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={130}>{c.n}, <span style={{color: RED}}>1 WINNER</span></Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'flex-end'}}>
        {c.order.map((tm, i) => <div key={tm} style={{transform: `translateY(${i % 2 ? 30 : 0}px)`}}><Avatar size={c.order.length > 6 ? (tm === c.big ? 250 : 208) : (tm === c.big ? 300 : 260)} code={TFLAG(tm)} mood="angry" t={0.5} seed={i} look={[i < c.order.length / 2 ? 1 : -1, 0]} id={`ta-${tm}`} /></div>)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={140} rot={2}>WHO WINS? 🏆</Box></div>
    </AbsoluteFill>
  );
  if (v === 'B') return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={c.tug} cam={{cx: c.cam[0], cy: c.cam[1], s: c.cam[2]}} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.5))'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 50, display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(16,22,34,0.9)', border: '8px solid #fff', borderRadius: 40, padding: '18px 28px'}}>
        {Av(c.a, 190, 'scared', [1, 0], 'h-a')}
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', ...TXT(84, '#fff', 10)}}><span style={{color: '#cfe0ff'}}>{c.pa}%</span><span style={{color: '#ffd0cc'}}>{100 - c.pa}%</span></div>
          <div style={{height: 70, borderRadius: 35, overflow: 'hidden', border: `8px solid ${INK}`, display: 'flex', marginTop: 8}}>
            <div style={{width: `${c.pa}%`, background: `repeating-linear-gradient(45deg, ${TCOL[c.a]}, ${TCOL[c.a]} 22px, ${TDARK[c.a]} 22px, ${TDARK[c.a]} 44px)`}} />
            <div style={{flex: 1, background: `repeating-linear-gradient(-45deg, ${TCOL[c.b]}, ${TCOL[c.b]} 22px, ${TDARK[c.b]} 22px, ${TDARK[c.b]} 44px)`}} />
          </div>
        </div>
        {Av(c.b, 190, 'smug', [-1, 0], 'h-b')}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center'}}><Box bg={RED} size={130} color="#fff">{TNAME[c.a]} vs {TNAME[c.b]}</Box></div>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={c.tug + 60} cam={{cx: 1000, cy: 480, s: 1.2}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.1) 55%)'}} />
      <div style={{position: 'absolute', left: 60, top: 70, zIndex: 6}}>
        <div style={TXT(150, '#fff')}>{c.t1}</div>
        <div style={{...TXT(150, YELLOW), marginTop: 10}}>{c.t2}</div>
        <div style={{...TXT(150, RED), marginTop: 10}}>{c.t3}</div>
        <div style={{marginTop: 40, display: 'inline-block', background: INK, border: '7px solid #fff', borderRadius: 24, padding: '10px 30px 2px', ...font, fontSize: 72, color: YELLOW}}>{c.pill}</div>
      </div>
      <div style={{position: 'absolute', right: 50, top: 120, width: 640, zIndex: 6, transform: 'rotate(2deg)'}}>
        <div style={{background: CREAM, border: `10px solid ${INK}`, borderRadius: 30, padding: '20px 26px', boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>
          <div style={{...font, fontSize: 60, color: INK, textAlign: 'center', marginBottom: 8}}>🏆 TOP 5</div>
          {c.table.map(([tm, p], i) => (
            <div key={tm} style={{display: 'flex', alignItems: 'center', gap: 16, height: 104, borderTop: '4px solid #e2d3b1'}}>
              <div style={{...font, fontSize: 56, color: INK, width: 40}}>{i + 1}</div><Avatar size={84} code={TFLAG(tm)} mood="angry" t={0.5} seed={i} id={`tt5-${tm}`} />
              <div style={{...font, fontSize: 52, color: INK, flex: 1}}>{TNAME[tm].length <= 3 ? TNAME[tm] : TNAME[tm].charAt(0) + TNAME[tm].slice(1).toLowerCase()}</div><div style={{...font, fontSize: 58, color: i === 0 ? ORANGE : BLUE}}>{p}%</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
const PC: TCfg = {order: ['US', 'BR', 'UK', 'FN', 'RS', 'IN', 'CN', 'JP'], big: 'CN', n: '8 SUPERPOWERS', a: 'US', b: 'CN', pa: 46, tug: 300, cam: [1250, 420, 1.25], table: [['CN', 31], ['US', 29], ['RS', 17], ['IN', 13], ['FN', 6]], t1: 'SUPERPOWER', t2: 'WAR', t3: 'CUP', pill: '195 COUNTRIES · 8 SUPERPOWERS'};
export const ThumbSp8: React.FC<{v: string}> = ({v}) => <ThumbTour v={v} c={PC} />;
