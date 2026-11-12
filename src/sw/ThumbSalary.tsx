import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FlagImg} from '../Indo2';
import {CODE} from '../HexWorld';
import {font} from '../lib3';
import W from './world_sal.json';

const INK = '#0e1018';
const ANTON = {fontFamily: 'Anton'};
const sh = (n: number) => `${n}px ${n}px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}, 3px 3px 0 ${INK}`;
const STOPS: [number, string][] = [[100, '#c8141e'], [300, '#ff5a1a'], [800, '#ffb21a'], [1600, '#ffe23a'], [3200, '#9be24a'], [5500, '#2fbf4a'], [8200, '#0a8a34']];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const colS = (v: number) => {
  const lv = Math.log(Math.max(100, Math.min(8200, v)));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, ca] = STOPS[i], [b, cb] = STOPS[i + 1];
    if (lv <= Math.log(b)) { const k = (lv - Math.log(a)) / (Math.log(b) - Math.log(a)); const A = hex(ca), B = hex(cb); return `rgb(${A.map((x, j) => Math.round(x + (B[j] - x) * k)).join(',')})`; }
  }
  return STOPS[STOPS.length - 1][1];
};
const CS = (W as any).cs as {c: string; a2: string; d: string; s: number; x: number; y: number}[];
const fk = (a2: string) => CODE.indexOf(a2);
const money = (v: number) => '$' + v.toLocaleString('en-US');

const Map: React.FC<{dim?: number; tf?: string}> = ({dim = 0, tf = ''}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <defs>
      <radialGradient id="sea" cx="55%" cy="45%" r="75%"><stop offset="0%" stopColor="#2a5a92" /><stop offset="100%" stopColor="#10264a" /></radialGradient>
      <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse"><path d="M60,0 L0,0 0,60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={2} /></pattern>
      <filter id="mds"><feDropShadow dx={0} dy={6} stdDeviation={6} floodColor="#000" floodOpacity={0.55} /></filter>
    </defs>
    <rect width={1920} height={1080} fill="url(#sea)" /><rect width={1920} height={1080} fill="url(#grid)" />
    <g filter="url(#mds)" transform={tf}>{CS.map((c) => <path key={c.c} d={c.d} fill={colS(c.s)} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />)}</g>
    {dim > 0 && <rect width={1920} height={1080} fill={`rgba(0,0,0,${dim})`} />}
  </svg>
);
const Title: React.FC<{l: [string, string][]; fs?: number; top?: number}> = ({l, fs = 168, top = 60}) => (
  <div style={{position: 'absolute', left: 56, top}}>
    {l.map(([s, c], i) => <div key={i} style={{...font, fontSize: fs, color: c, textShadow: sh(9), lineHeight: 0.98, whiteSpace: 'nowrap'}}>{s}</div>)}
  </div>
);
const Pill: React.FC<{s: string; x?: number; y: number}> = ({s, x = 56, y}) => (
  <div style={{position: 'absolute', left: x, top: y, background: 'rgba(14,18,28,0.95)', border: '7px solid #fff', borderRadius: 26, padding: '12px 32px 4px', ...font, fontSize: 58, color: '#ffd23f'}}>{s}</div>
);
const Card: React.FC<{children: React.ReactNode; w?: number; rot?: number}> = ({children, w = 700, rot = 1.5}) => (
  <div style={{position: 'absolute', right: 56, top: 64, width: w, transform: `rotate(${rot}deg)`, background: '#fff6e2', border: `10px solid ${INK}`, borderRadius: 34, padding: '16px 28px 10px', boxShadow: '0 16px 0 rgba(0,0,0,0.5)'}}>{children}</div>
);
const Row: React.FC<{i: number; a2: string; n: string; v: string; col: string; hide?: boolean}> = ({i, a2, n, v, col, hide}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, height: 132, borderTop: '5px solid #e8d8b4'}}>
    <div style={{...font, fontSize: 62, color: INK, width: 40}}>{i}</div>
    <FlagImg k={fk(a2)} w={118} h={80} />
    <div style={{...font, fontSize: n.length > 9 ? 44 : 50, color: INK, flex: 1, whiteSpace: 'nowrap'}}>{n}</div>
    <div style={{...font, fontSize: 54, color: col, opacity: hide ? 0 : 1, whiteSpace: 'nowrap'}}>{v}</div>
  </div>
);
const Callout: React.FC<{x: number; y: number; a2: string; v: string; col: string; dx?: number; dy?: number; big?: boolean}> = ({x, y, a2, v, col, dx = 0, dy = -90, big}) => {
  const fs = big ? 92 : 70;
  return (<>
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}><path d={`M${x},${y} L${x + dx},${y + dy + 30}`} stroke={INK} strokeWidth={10} strokeLinecap="round" /><path d={`M${x},${y} L${x + dx},${y + dy + 30}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" /><circle cx={x} cy={y} r={11} fill="#fff" stroke={INK} strokeWidth={5} /></svg>
    <div style={{position: 'absolute', left: x + dx, top: y + dy, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 12, background: col, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 18px 0 10px', boxShadow: '0 8px 0 rgba(0,0,0,0.45)'}}>
      <FlagImg k={fk(a2)} w={big ? 96 : 76} h={big ? 64 : 50} />
      <span style={{...ANTON, fontSize: fs, color: '#fff', WebkitTextStroke: `${big ? 4 : 3}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 1.15}}>{v}</span>
    </div>
  </>);
};
const LegendBar: React.FC<{x: number; y: number; w: number; labs?: [string, string, string]}> = ({x, y, w, labs = ['$100', 'PER MONTH', '$8,000+']}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w}}>
    <div style={{height: 34, borderRadius: 17, border: `6px solid ${INK}`, background: `linear-gradient(90deg, ${STOPS.map(([, c], i) => `${c} ${(i / (STOPS.length - 1)) * 100}%`).join(',')})`}} />
    <div style={{display: 'flex', justifyContent: 'space-between', ...font, fontSize: 40, color: '#fff', textShadow: sh(4), marginTop: 4}}><span>{labs[0]}</span><span>{labs[1]}</span><span>{labs[2]}</span></div>
  </div>
);

export const ThumbSalary: React.FC<{v: string}> = ({v}) => {
  if (v === 'AES' || v === 'AES0') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,14,30,0.82), rgba(8,14,30,0.25) 46%, rgba(0,0,0,0) 62%)'}} />
      <Title l={[['SALARIO', '#fff'], ['MEDIO', '#ffd23f'], ['EN CADA', '#fff'], ['PAÍS', '#3dff6a']]} fs={150} top={44} />
      <Pill s="💰 195 PAÍSES · AL MES" y={672} />
      <Card>
        <div style={{...font, fontSize: 66, color: INK, textAlign: 'center', marginBottom: 4}}>💰 TOP 5</div>
        {[['CH', 'Suiza', '8.218 $'], ['LU', 'Luxemburgo', '6.740 $'], ['US', 'EE. UU.', '6.562 $'], ['IS', 'Islandia', '6.548 $'], ['NO', 'Noruega', '5.772 $']].map(([a, n, s], i) => <Row key={a} i={i + 1} a2={a} n={n} v={s} col="#11943c" hide={v === 'AES0' && i < 3} />)}
      </Card>
      <LegendBar x={56} y={830} w={760} labs={['100 $', 'AL MES', '8.000+ $']} />
    </AbsoluteFill>
  );
  if (v === 'A') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,14,30,0.82), rgba(8,14,30,0.25) 46%, rgba(0,0,0,0) 62%)'}} />
      <Title l={[['AVERAGE', '#fff'], ['SALARY', '#ffd23f'], ['IN EVERY', '#fff'], ['COUNTRY', '#3dff6a']]} fs={150} top={44} />
      <Pill s="💰 195 COUNTRIES · PER MONTH" y={672} />
      <Card>
        <div style={{...font, fontSize: 66, color: INK, textAlign: 'center', marginBottom: 4}}>💰 TOP 5</div>
        {[['CH', 'Switzerland', 8218], ['LU', 'Luxembourg', 6740], ['US', 'USA', 6562], ['IS', 'Iceland', 6548], ['NO', 'Norway', 5772]].map(([a, n, s], i) => <Row key={a as string} i={i + 1} a2={a as string} n={n as string} v={money(s as number)} col="#11943c" />)}
      </Card>
      <LegendBar x={56} y={830} w={760} />
    </AbsoluteFill>
  );
  if (v === 'B') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,14,30,0.85), rgba(8,14,30,0.25) 48%, rgba(0,0,0,0) 62%)'}} />
      <Title l={[['WHERE DO', '#fff'], ['PEOPLE', '#ffd23f'], ['EARN THE', '#fff'], ['MOST?', '#3dff6a']]} fs={150} top={44} />
      <Pill s="RICHEST VS POOREST 💸" y={672} />
      <Card w={620} rot={-1.5}>
        <div style={{...font, fontSize: 56, color: INK, textAlign: 'center'}}>MONTHLY SALARY</div>
        {[['CH', 'Switzerland', '$8,218', '#11943c'], ['MW', 'Malawi', '$138', '#d4141e']].map(([a, n, s, c], i) => (
          <React.Fragment key={a}>
            {i === 1 && <div style={{textAlign: 'center', ...font, fontSize: 70, color: '#fff', background: INK, borderRadius: 20, margin: '6px 150px', padding: '4px 0 0'}}>VS</div>}
            <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '10px 0'}}>
              <FlagImg k={fk(a)} w={170} h={114} />
              <div><div style={{...font, fontSize: 50, color: INK, lineHeight: 1}}>{n}</div><div style={{...ANTON, fontSize: 104, color: c, lineHeight: 1.05}}>{s}</div></div>
            </div>
          </React.Fragment>
        ))}
        <div style={{textAlign: 'center', marginTop: 6, background: '#ffd23f', border: `6px solid ${INK}`, borderRadius: 18, ...font, fontSize: 54, color: INK, padding: '4px 0 0'}}>60× MORE 🤯</div>
      </Card>
      <LegendBar x={56} y={830} w={760} />
    </AbsoluteFill>
  );
  // C: mapa protagonista con cifras en los países
  const K = 0.72, TX = 240, TY = 210;
  const byC = (c: string) => { const o = CS.find((q) => q.c === c)!; return {...o, x: o.x * K + TX, y: o.y * K + TY}; };
  const us = byC('USA'), ch = byC('CHE'), ind = byC('IND'), cn = byC('CHN'), ao = byC('AGO'), ca = byC('CAN'), no = byC('NOR');
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Map tf={`translate(${TX},${TY}) scale(${K})`} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,14,30,0.86), rgba(8,14,30,0.2) 30%, rgba(0,0,0,0) 45%)'}} />
      <div style={{position: 'absolute', top: 26, width: '100%', textAlign: 'center', ...font, fontSize: 132, color: '#fff', textShadow: sh(9), whiteSpace: 'nowrap'}}>
        HOW MUCH PEOPLE <span style={{color: '#3dff6a'}}>EARN</span> 💰
      </div>
      <Callout x={us.x + 10} y={us.y + 10} a2="US" v="$6,562" col="#2fbf4a" dx={10} dy={150} />
      <Callout x={ch.x} y={ch.y} a2="CH" v="$8,218" col="#0a8a34" dx={-260} dy={-20} big />
      <Callout x={no.x - 10} y={no.y + 20} a2="NO" v="$5,772" col="#2fbf4a" dx={-250} dy={-60} />
      <Callout x={cn.x} y={cn.y} a2="CN" v="$1,229" col="#e8b400" dx={150} dy={-90} />
      <Callout x={ind.x} y={ind.y} a2="IN" v="$735" col="#ff8a1a" dx={30} dy={180} />
      <Callout x={ao.x} y={ao.y} a2="AO" v="$134" col="#c8141e" dx={-300} dy={40} big />
      <LegendBar x={1120} y={960} w={740} />
    </AbsoluteFill>
  );
};
