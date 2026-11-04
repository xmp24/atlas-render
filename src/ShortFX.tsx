// Capa común de los shorts: gancho en el frame 0, flash en cada corte y llamada al vídeo largo
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, YELLOW, RED, font, lerp} from './lib3';
export const segTime = (lt: number, segs?: number[][]) => {
  if (!segs) return {t: lt, cuts: [] as number[], sdur: 0};
  let acc = 0; let t = -1; const cuts: number[] = [];
  for (const [o, d] of segs) { if (acc > 0) cuts.push(acc); if (t < 0 && lt < acc + d) t = o + (lt - acc); acc += d; }
  if (t < 0) { const [o, d] = segs[segs.length - 1]; t = o + d - 0.001; }
  return {t, cuts, sdur: acc};
};
export const ShortCup: React.FC<{lt: number; dur: number; hook: string[]; cta: string[]; cuts: number[]}> = ({lt, dur, hook, cta, cuts}) => {
  const ha = lt < 3.2 ? Math.min(1, lt / 0.12 + 0.6) * lerp(lt, 2.8, 3.2, 1, 0) : 0;
  const ca = lerp(lt, dur - 4.2, dur - 3.8, 0, 1);
  let fl = 0; for (const c of cuts) { const d = lt - c; if (d >= 0 && d < 0.18) fl = Math.max(fl, 1 - d / 0.18); }
  const sc = lt < 0.25 ? 1.35 - lt * 1.4 : 1;
  return (<>
    {fl > 0 && <AbsoluteFill style={{background: '#fff', opacity: fl * 0.55, zIndex: 70}} />}
    {ha > 0 && <div style={{position: 'absolute', top: 290, left: 30, right: 30, textAlign: 'center', zIndex: 71, opacity: ha, transform: `scale(${sc})`}}>
      <div style={{...font, fontSize: 104, lineHeight: 1, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`}}>{hook[0]}</div>
      <div style={{...font, fontSize: 116, lineHeight: 1.05, color: YELLOW, WebkitTextStroke: `11px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`}}>{hook[1]}</div>
    </div>}
    {ca > 0 && <AbsoluteFill style={{zIndex: 72, background: `rgba(0,0,0,${0.45 * ca})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div style={{transform: `scale(${0.7 + 0.3 * ca})`, opacity: ca, textAlign: 'center', padding: '0 40px'}}>
        <div style={{...font, fontSize: 96, lineHeight: 1.05, color: '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{cta[0]}</div>
        <div style={{...font, fontSize: 100, lineHeight: 1.05, color: YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill'}}>{cta[1]}</div>
      </div>
      <div style={{opacity: ca, background: RED, border: `7px solid ${INK}`, borderRadius: 30, padding: '18px 34px 8px', ...font, fontSize: 60, color: '#fff', transform: `scale(${1 + 0.04 * Math.sin(lt * 8)})`}}>FULL VIDEO ON THE CHANNEL ➜</div>
    </AbsoluteFill>}
  </>);
};
