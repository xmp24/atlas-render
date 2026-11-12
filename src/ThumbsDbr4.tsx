import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Indo2, FlagImg} from './Indo2';
import {CODE} from './HexWorld';
import {INK, YELLOW, RED, CREAM, font} from './lib3';

const TOP: [string, string, number, string][] = [['CN', 'China', 29, '#e8a33a'], ['IN', 'India', 24, '#2f7fd6'], ['PK', 'Pakistan', 15, '#2f7fd6'], ['ID', 'Indonesia', 9, '#2f7fd6'], ['TR', 'Turkey', 7, '#2f7fd6']];
const sh = `9px 9px 0 ${INK}, -3px -3px 0 ${INK}, 3px -3px 0 ${INK}, -3px 3px 0 ${INK}`;
export const ThumbDbr4: React.FC<{v: string}> = ({v}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Indo2 v="dbras4" audio={false} noHud />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,14,30,0.78), rgba(8,14,30,0.15) 48%, rgba(0,0,0,0) 70%)'}} />
    <div style={{position: 'absolute', left: 56, top: 70}}>
      <div style={{...font, fontSize: 205, color: '#fff', textShadow: sh, lineHeight: 0.95}}>ASIA</div>
      <div style={{...font, fontSize: 205, color: YELLOW, textShadow: sh, lineHeight: 0.95}}>BATTLE</div>
      <div style={{...font, fontSize: 205, color: '#ff4a3a', textShadow: sh, lineHeight: 0.95}}>ROYALE</div>
      <div style={{marginTop: 34, display: 'inline-block', background: 'rgba(14,18,28,0.95)', border: '7px solid #fff', borderRadius: 26, padding: '12px 34px 4px', ...font, fontSize: 66, color: YELLOW}}>32 COUNTRIES · 1 WINNER</div>
    </div>
    <div style={{position: 'absolute', right: 60, top: 70, width: 620, transform: 'rotate(1.5deg)'}}>
      <div style={{background: CREAM, border: `10px solid ${INK}`, borderRadius: 34, padding: '18px 30px 10px', boxShadow: '0 16px 0 rgba(0,0,0,0.5)'}}>
        <div style={{...font, fontSize: 70, color: INK, textAlign: 'center', marginBottom: 6}}>🏆 TOP 5</div>
        {TOP.map(([c, n, p, col], i) => (
          <div key={c} style={{display: 'flex', alignItems: 'center', gap: 20, height: 128, borderTop: '5px solid #e2d3b1'}}>
            <div style={{...font, fontSize: 64, color: INK, width: 44}}>{i + 1}</div>
            <div style={{border: `4px solid ${INK}`, borderRadius: 8, overflow: 'hidden', lineHeight: 0}}><FlagImg k={CODE.indexOf(c)} w={120} h={80} /></div>
            <div style={{...font, fontSize: 64, color: INK, flex: 1}}>{n}</div>
            <div style={{...font, fontSize: 66, color: col}}>{p}%</div>
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);
