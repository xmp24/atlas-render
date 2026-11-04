import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import SH from './shortsgl.json';
import {Cam, INK, RED, BLUE, YELLOW, clamp, lerp, font, popT, Avatar} from './lib3';
import {usePreload} from './War6';
import {camera, ArcticMap, Overlay, OceanA, LVP, Lay} from './War8';

type Def = {part: number; hook: string; next: string; map: [number, number][]; end: number};
export const SGL = SH as unknown as Def[];
const SW = 1080, SHh = 1920;
const VP: LVP = {W: SW, H: SHh, ox: 540, oy: 1010, ui: 1.25};
const L: Lay = {W: SW, H: SHh, vert: true};
const mapT = (ts: number, m: [number, number][]) => interpolate(ts, m.map((x) => x[0]), m.map((x) => x[1]), clamp);
const camV = (t: number): Cam => {
  const c = camera(t);
  const s = Math.max(0.62, c.s * (c.s < 1.6 ? 0.74 : 0.88));
  const hw = 540 / s;
  return {cx: Math.max(hw - 120, Math.min(2040 - hw, c.cx)), cy: c.cy + 20 / s, s};
};
const Hook: React.FC<{ts: number; text: string}> = ({ts, text}) => {
  if (ts > 1.6) return null;
  const k = (1 + 0.06 * Math.sin(ts * 14) * Math.exp(-ts * 3)) * lerp(ts, 1.3, 1.6, 1, 0, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30, background: `rgba(8,18,32,${0.45 * lerp(ts, 1.2, 1.6, 1, 0)})`}}>
      <div style={{transform: `scale(${k}) rotate(-3deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{display: 'flex', gap: 30, alignItems: 'center'}}><Avatar size={220} code="us" mood="angry" t={ts} seed={1} look={[1, 0]} id="hk-us" /><div style={{...font, fontSize: 110, color: RED, textShadow: `6px 6px 0 ${INK}`}}>VS</div><Avatar size={220} code="gl" mood="scared" t={ts} seed={2} look={[-1, 0]} id="hk-gl" /></div>
        <div style={{background: INK, color: '#fff', borderRadius: 18, padding: '8px 24px 2px', ...font, fontSize: 42}}>USA vs GREENLAND</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 36px 8px', ...font, fontSize: 104, color: RED, textAlign: 'center', lineHeight: 0.98, maxWidth: 1000}}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};
const End: React.FC<{ts: number; d: Def}> = ({ts, d}) => {
  if (ts < d.end || !d.next) return null;
  const k = popT(ts, d.end, 11);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30, background: `rgba(8,18,32,${0.6 * k})`}}>
      <div style={{transform: `scale(${k}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: 62, color: INK}}>NEXT · PART {d.part + 1}/6</div>
        <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 40px 8px', ...font, fontSize: 100, color: BLUE, textAlign: 'center', lineHeight: 1, maxWidth: 1000}}>{d.next}</div>
        <div style={{transform: `translateX(${Math.sin((ts - d.end) * 8) * 10}px)`, ...font, fontSize: 120, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>➜</div>
      </div>
    </AbsoluteFill>
  );
};
export const ShortGL: React.FC<{part: number}> = ({part}) => {
  usePreload();
  const d = SGL[part - 1];
  const ts = useCurrentFrame() / 30;
  const t = mapT(ts, d.map);
  const cam = camV(t);
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <OceanA t={t} W={SW} H={SHh} />
      <ArcticMap t={t} cam={cam} vp={VP} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3))'}} />
      <Overlay t={t} cam={cam} vp={VP} L={L} hideTitle={part === 1 && ts < 1.6} />
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25}}>
        <div style={{background: YELLOW, border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 18px 0', ...font, fontSize: 36, color: INK}}>PART {part}/6</div>
      </div>
      <Hook ts={ts} text={d.hook} />
      <End ts={ts} d={d} />
      <Audio src={staticFile(`shortgl${part}.wav`)} />
    </AbsoluteFill>
  );
};
import CUT from './glcut.json';
const CM = (CUT as unknown as Def[])[0].map;
export const CUTDUR = Math.round(CM[CM.length - 1][0] * 30);
export const WarGLCut: React.FC = () => {
  usePreload();
  const t = mapT(useCurrentFrame() / 30, CM);
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: '#164f86', overflow: 'hidden'}}>
      <OceanA t={t} W={1920} H={1080} />
      <ArcticMap t={t} cam={cam} />
      <Overlay t={t} cam={cam} vp={{W: 1920, H: 1080, ox: 960, oy: 540, ui: 1}} L={{W: 1920, H: 1080, vert: false}} />
      <Audio src={staticFile('glcut.wav')} />
    </AbsoluteFill>
  );
};
