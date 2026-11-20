import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {INK, RED, YELLOW, font, Avatar, Mood} from './lib3';
import {Ocean} from './War5';
import {PIECES} from './War6';
import {ContMap, TEAMOF, TCOL, TFLAG} from './WarRel3';

const TXT = (size: number, color: string, sw = size * 0.13): React.CSSProperties => ({...font, fontSize: size, color, WebkitTextStroke: `${sw}px ${INK}`, paintOrder: 'stroke fill', lineHeight: 0.92, textShadow: `0 ${size * 0.07}px 0 rgba(0,0,0,0.55)`, whiteSpace: 'nowrap'});
const Box: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '6px 46px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
const TeamMap: React.FC<{cx: number; cy: number; s: number; op?: number}> = ({cx, cy, s, op = 1}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <g transform={`translate(960,540) scale(${s}) translate(${-cx},${-cy})`}>
      {PIECES.map((p, i) => { const st = /^Y\d\d$/.test(p.code); const c = st ? 'IN' : p.code; if (!TEAMOF[c]) return null; return <path key={i} d={p.d} fill={TCOL[TEAMOF[c]]} opacity={op} stroke={st ? TCOL[TEAMOF[c]] : INK} strokeWidth={(st ? 1.2 : 0.8) / s} />; })}
    </g>
  </svg>
);
const Av = (tm: string, size: number, mood: Mood, look: [number, number], id: string) => <Avatar size={size} code={TFLAG(tm)} mood={mood} t={0.5} seed={tm.charCodeAt(0)} look={look} id={id} />;
const P = (x: number, y: number, el: React.ReactNode) => <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)'}}>{el}</div>;
const REL = ['CHR', 'ISL', 'HIN', 'BUD'];

export const ThumbRel: React.FC<{v: string}> = ({v}) => {
  if (v === '8') {
    // cada religión pintada con su bandera, una por bloque de continente
    const S = 1.05, CX = 975, CY = 455;
    const FL: Record<string, string> = {CHR: 'chrc', ISL: 'isl', BUD: 'bud', HIN: 'hin'};
    const BG: Record<string, string> = {CHR: '#00296a', ISL: '#083b02', HIN: '#e9572a'};
    const groups: Record<string, {tm: string; ds: string[]; bb: number[]}> = {};
    PIECES.forEach((p: any) => {
      const st = /^Y\d\d$/.test(p.code); const c = st ? 'IN' : p.code; const tm = TEAMOF[c];
      if (!tm) return;
      const cont = st ? 'AS' : p.cont === 'ME' ? 'AS' : p.cont;
      const key = tm === 'CHR' && cont === 'EU' && p.bbox[0] > 1150 ? `${tm}-RU` : tm === 'BUD' && c === 'MN' ? 'BUD-N' : tm === 'CHR' && cont === 'NA' && p.bbox[2] < 330 ? 'CHR-AK' : `${tm}-${cont}`;
      const g = (groups[key] = groups[key] || {tm, ds: [], bb: [1e9, 1e9, -1e9, -1e9]});
      g.ds.push(p.d); if (p.area > 25 || st) g.bb = [Math.min(g.bb[0], p.bbox[0]), Math.min(g.bb[1], p.bbox[1]), Math.max(g.bb[2], p.bbox[2]), Math.max(g.bb[3], p.bbox[3])];
    });
    return (
      <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
        <Ocean t={0} />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <defs>{Object.entries(groups).map(([k, g]) => <clipPath key={k} id={`g-${k}`}>{g.ds.map((d, i) => <path key={i} d={d} />)}</clipPath>)}</defs>
          <g transform={`translate(960,540) scale(${S}) translate(${-CX},${-CY})`}>
            {Object.entries(groups).map(([k, g]) => {
              const [x0, y0, x1, y1] = g.bb;
              return (
                <g key={k} clipPath={`url(#g-${k})`}>
                  <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={BG[g.tm] || TCOL[g.tm]} />
                  {FL[g.tm] && <image href={staticFile(`hw/relflags/${FL[g.tm]}.png`)} x={x0} y={y0} width={x1 - x0} height={y1 - y0} preserveAspectRatio={g.tm === 'BUD' ? 'xMidYMid slice' : 'xMidYMid meet'} />}
                </g>
              );
            })}
            {PIECES.map((p: any, i: number) => { const st = /^Y\d\d$/.test(p.code); const c = st ? 'IN' : p.code; if (!TEAMOF[c] || st) return null; return <path key={i} d={p.d} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={0.7 / S} />; })}
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  if (v === '7') return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><TeamMap cx={975} cy={455} s={1.05} />
    </AbsoluteFill>
  );
  if (v === '1') return (
    // el ateísmo contra todas las religiones
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #4a4f57, #0d0f14)', overflow: 'hidden'}}>
      <TeamMap cx={960} cy={480} s={1.08} op={0.3} />
      {P(960, 610, Av('ATH', 470, 'smug', [0, 0], 'a1'))}
      {[['CHR', 260, 330], ['ISL', 1660, 330], ['HIN', 290, 820], ['BUD', 1630, 820]].map(([tm, x, y]) => <React.Fragment key={tm as string}>{P(x as number, y as number, Av(tm as string, 250, 'angry', [Math.sign(960 - (x as number)) * 0.9, Math.sign(610 - (y as number)) * 0.5], `o1${tm}`))}</React.Fragment>)}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>{[[380, 390], [400, 770], [1540, 390], [1520, 770]].map(([x, y], i) => <line key={i} x1={x} y1={y} x2={960 + (x - 960) * 0.45} y2={610 + (y - 610) * 0.45} stroke={YELLOW} strokeWidth={16} strokeDasharray="30 18" />)}</svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={118}>EVERY RELIGION vs <span style={{color: '#5d636b'}}>ATHEISM</span></Box></div>
    </AbsoluteFill>
  );
  if (v === '2') return (
    // barra de dominio mundial
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={340} cam={{cx: 1180, cy: 380, s: 1.7}} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.55))'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 50, display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(16,22,34,0.9)', border: '8px solid #fff', borderRadius: 40, padding: '18px 28px'}}>
        {Av('CHR', 170, 'scared', [1, 0], 'h-c')}
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', ...TXT(84, '#fff', 10)}}><span style={{color: '#ffd166'}}>RELIGIONS 23%</span><span style={{color: '#c9ced6'}}>77%</span></div>
          <div style={{height: 70, borderRadius: 35, overflow: 'hidden', border: `8px solid ${INK}`, display: 'flex', marginTop: 8}}>
            {[['CHR', 7], ['ISL', 14], ['BUD', 2]].map(([tm, w]) => <div key={tm as string} style={{width: `${w}%`, background: TCOL[tm as string]}} />)}
            <div style={{flex: 1, background: TCOL.ATH}} />
          </div>
        </div>
        {Av('ATH', 170, 'smug', [-1, 0], 'h-a')}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center'}}><Box bg={RED} size={124} color="#fff">EVERY RELIGION GOES TO WAR</Box></div>
    </AbsoluteFill>
  );
  if (v === '3') return (
    // mapa con los colores de cada religión
    <AbsoluteFill style={{background: '#14467a', overflow: 'hidden'}}>
      <Ocean t={0} /><TeamMap cx={960} cy={500} s={1.12} />
      {[['CHR', 560, 380], ['ISL', 1040, 470], ['HIN', 1340, 520], ['BUD', 1540, 640], ['ATH', 1530, 360]].map(([tm, x, y]) => <React.Fragment key={tm as string}>{P(x as number, y as number, Av(tm as string, 200, 'angry', [0, 0], `m3${tm}`))}</React.Fragment>)}
      <div style={{position: 'absolute', left: 40, bottom: 40}}><Box bg="#fff" size={130}>RELIGION <span style={{color: RED}}>WAR</span></Box></div>
      <div style={{position: 'absolute', right: 40, top: 40}}><Box bg={YELLOW} size={100} rot={3}>WHO WINS?</Box></div>
    </AbsoluteFill>
  );
  if (v === '4') return (
    // todos a por el trofeo
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #ffe27a 0%, #e8a316 18%, #1d3a6e 55%, #0d1a33 100%)', overflow: 'hidden'}}>
      {Array.from({length: 16}).map((_, i) => <div key={i} style={{position: 'absolute', left: 960, top: 470, width: 1400, height: 60, background: 'rgba(255,240,180,0.12)', transformOrigin: '0 50%', transform: `rotate(${(i / 16) * 360}deg)`}} />)}
      {P(960, 450, <div style={{fontSize: 420, lineHeight: 1}}>🏆</div>)}
      {[['CHR', 260, 340], ['ISL', 1660, 340], ['HIN', 330, 800], ['BUD', 1590, 800], ['ATH', 960, 900]].map(([tm, x, y]) => <React.Fragment key={tm as string}>{P(x as number, y as number, Av(tm as string, 240, 'angry', [Math.sign(960 - (x as number)) * 0.9, Math.sign(450 - (y as number)) * 0.6], `t4${tm}`))}</React.Fragment>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={120}>ONLY <span style={{color: RED}}>1</span> RELIGION WINS?</Box></div>
    </AbsoluteFill>
  );
  if (v === '5') return (
    // Cristianismo contra Islam, pantalla partida
    <AbsoluteFill style={{background: TCOL.CHR, overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080 L1920,1080 L1920,0 Z" fill={TCOL.ISL} /><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080" fill="none" stroke="#fff" strokeWidth={26} /><path d="M1040,0 L900,320 L1010,350 L880,700 L990,730 L860,1080" fill="none" stroke={INK} strokeWidth={10} /></svg>
      {P(450, 580, Av('CHR', 540, 'angry', [1, 0], 'f-c'))}
      {P(1480, 580, Av('ISL', 540, 'angry', [-1, 0], 'f-i'))}
      {P(940, 540, <div style={TXT(190, YELLOW, 24)}>VS</div>)}
      <div style={{position: 'absolute', left: 60, top: 40}}><div style={TXT(110, '#fff')}>2.3 BILLION</div></div>
      <div style={{position: 'absolute', right: 60, top: 40}}><div style={TXT(110, '#fff')}>2.0 BILLION</div></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={100}>EVERY RELIGION GOES TO WAR</Box></div>
    </AbsoluteFill>
  );
  // 6: la alianza final
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean t={0} /><ContMap t={360} cam={{cx: 1200, cy: 400, s: 1.5}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.7) 85%)'}} />
      <div style={{position: 'absolute', left: 130, top: 560, transform: 'translateY(-50%)', display: 'flex', gap: 0}}>{REL.map((tm, i) => <div key={tm} style={{marginLeft: i ? -60 : 0}}>{Av(tm, 250, 'angry', [1, 0], `s6${tm}`)}</div>)}</div>
      {P(1560, 560, Av('ATH', 520, 'scared', [-1, -0.2], 's6a'))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Box bg={YELLOW} size={110}>ALL RELIGIONS UNITE</Box></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}><Box bg="#fff" size={110} rot={2}>AGAINST <span style={{color: '#5d636b'}}>ATHEISM</span>?!</Box></div>
    </AbsoluteFill>
  );
};
