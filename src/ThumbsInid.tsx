import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Indo2, Ball, DWheel} from './Indo2';
import {CODE} from './HexWorld';
import {INK, YELLOW, RED, CREAM, font} from './lib3';

const KI = CODE.indexOf('IN'), KD = CODE.indexOf('ID');
const BOX: React.FC<{children: React.ReactNode; bg: string; size: number; rot?: number; color?: string}> = ({children, bg, size, rot = -2, color = INK}) => (
  <div style={{transform: `rotate(${rot}deg)`, background: bg, border: `12px solid ${INK}`, borderRadius: 32, padding: '8px 50px 0', ...font, fontSize: size, color, boxShadow: '0 14px 0 rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{children}</div>
);
const POW = ['LIGHTNING', 'METEOR', 'TSUNAMI', 'FREEZE', 'QUAKE', 'VOLCANO', 'CLONES', 'TORNADO', 'LASER', 'CURSE'];
const PCOL = ['#ffd23f', '#ff7a1e', '#1f6fe0', '#13b5c8', '#8a5a2b', '#d4110e', '#22a95b', '#7a8a99', '#ff2b8a', '#5b1a8f'];
export const ThumbInid: React.FC<{v: string}> = ({v}) => {
  const bg = <><Indo2 v="inid" audio={false} noHud /><AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)'}} /></>;
  if (v === 'A') return (
    <AbsoluteFill style={{overflow: 'hidden'}}>{bg}
      <div style={{position: 'absolute', left: 0, right: 0, top: 36, display: 'flex', justifyContent: 'center'}}><BOX bg="#fff" size={132}>INDIA <span style={{color: RED}}>vs</span> INDONESIA</BOX></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
        <Ball k={KI} size={360} mood="angry" t={0.5} look={[1, 0]} />
        <svg width={520} height={520} style={{overflow: 'visible'}}><DWheel items={POW} cols={PCOL} rot={-18} R={215} cx={260} cy={275} fs={30} /></svg>
        <Ball k={KD} size={360} mood="angry" t={0.5} look={[-1, 0]} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center'}}><BOX bg={YELLOW} size={108} rot={2}>BUT WITH SUPERPOWERS ⚡</BOX></div>
    </AbsoluteFill>
  );
  if (v === 'B') {
    const side = (k: number, flip: boolean, col: string) => (
      <div style={{display: 'flex', flexDirection: flip ? 'row-reverse' : 'row', alignItems: 'center', gap: 20, flex: 1}}>
        <Ball k={k} size={200} mood="scared" t={0.5} look={[flip ? -1 : 1, 0]} />
        <div style={{flex: 1}}>
          <div style={{...font, fontSize: 120, color: '#ff3b3b', textShadow: `7px 7px 0 ${INK}`, textAlign: flip ? 'right' : 'left', lineHeight: 1}}>1%</div>
          <div style={{height: 70, width: 500, background: '#1a1f2b', border: `8px solid ${INK}`, borderRadius: 40, overflow: 'hidden', display: 'flex', justifyContent: flip ? 'flex-end' : 'flex-start', marginLeft: flip ? 'auto' : 0}}><div style={{width: 40, background: col, boxShadow: `0 0 20px ${col}`}} /></div>
        </div>
      </div>
    );
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>{bg}
        <div style={{position: 'absolute', left: 50, right: 50, top: 40, display: 'flex', alignItems: 'center', gap: 30, background: 'rgba(16,22,34,0.9)', border: '9px solid #fff', borderRadius: 44, padding: '18px 30px'}}>
          {side(KI, false, '#ff8a1e')}
          <div style={{...font, fontSize: 90, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>VS</div>
          {side(KD, true, '#e5322d')}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center'}}><BOX bg={RED} size={128} color="#fff">WHO WINS AT 1%? 🏆</BOX></div>
      </AbsoluteFill>
    );
  }
  const rows: [string, string][] = [['⚡', 'Lightning'], ['🌋', 'Volcano'], ['🌊', 'Tsunami'], ['👥', 'Clone army'], ['🛰️', 'Space laser']];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>{bg}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.8), rgba(0,0,0,0.1) 62%)'}} />
      <div style={{position: 'absolute', left: 60, top: 60}}>
        <div style={{...font, fontSize: 170, color: '#ff9a2e', textShadow: `9px 9px 0 ${INK}`, lineHeight: 1}}>INDIA</div>
        <div style={{...font, fontSize: 130, color: YELLOW, textShadow: `9px 9px 0 ${INK}`, lineHeight: 1.1}}>VS</div>
        <div style={{...font, fontSize: 170, color: '#fff', textShadow: `9px 9px 0 ${INK}`, lineHeight: 1}}>INDONESIA</div>
        <div style={{marginTop: 40, display: 'inline-block', background: INK, border: '7px solid #fff', borderRadius: 24, padding: '10px 30px 2px', ...font, fontSize: 64, color: YELLOW}}>10 SUPERPOWERS · 1 WINNER</div>
      </div>
      <div style={{position: 'absolute', right: 50, top: 110, width: 560, transform: 'rotate(2deg)'}}>
        <div style={{background: CREAM, border: `10px solid ${INK}`, borderRadius: 30, padding: '20px 26px', boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>
          <div style={{...font, fontSize: 62, color: INK, textAlign: 'center', marginBottom: 8}}>🎰 POWERS</div>
          {rows.map(([e, n]) => (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 18, height: 112, borderTop: '4px solid #e2d3b1'}}>
              <div style={{fontSize: 72, width: 90, textAlign: 'center'}}>{e}</div><div style={{...font, fontSize: 60, color: INK}}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
