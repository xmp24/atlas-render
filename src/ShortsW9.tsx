import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import TIR from './tl-iran.json';
import TTW from './tl-taiwan.json';
import {Cam, INK, RED, BLUE, YELLOW, clamp, lerp, font, popT, Avatar} from './lib3';
import {usePreload} from './War6';
import {camera9, RegionMap, Overlay9, Ocean9, LVP, Lay} from './War9';

const TLS: Record<string, any> = {iran: TIR, taiwan: TTW};
type Def = {part: number; hook: string; next: string; map: [number, number][]; end: number};
export const SW9: {id: string; part: number; frames: number}[] = Object.entries(TLS).flatMap(([id, T]) => (T.shorts as Def[]).map((d) => ({id, part: d.part, frames: Math.round(d.map[d.map.length - 1][0] * 30)})));
const SW = 1080, SH = 1920;
const VP: LVP = {W: SW, H: SH, ox: 540, oy: 1010, ui: 1.25};
const L: Lay = {W: SW, H: SH, vert: true};
const mapT = (ts: number, m: [number, number][]) => interpolate(ts, m.map((x) => x[0]), m.map((x) => x[1]), clamp);
const camV = (id: string, t: number): Cam => {
  const c = camera9(id, t);
  const s = Math.max(0.55, c.s * (c.s < 1.6 ? 0.78 : 0.9));
  return {cx: c.cx, cy: c.cy + 20 / s, s};
};
export const ShortW9: React.FC<{id: string; part: number}> = ({id, part}) => {
  usePreload();
  const T = TLS[id];
  const d = (T.shorts as Def[])[part - 1];
  const ts = useCurrentFrame() / 30;
  const t = mapT(ts, d.map);
  const cam = camV(id, t);
  const title = (T.cards as any[]).find((c) => c.kind === 'title');
  const hk = ts <= 1.6 ? (1 + 0.06 * Math.sin(ts * 14) * Math.exp(-ts * 3)) * lerp(ts, 1.3, 1.6, 1, 0, Easing.in(Easing.cubic)) : 0;
  const ek = ts >= d.end && d.next ? popT(ts, d.end, 11) : 0;
  return (
    <AbsoluteFill style={{background: '#1d5e9f', overflow: 'hidden'}}>
      <Ocean9 t={t} W={SW} H={SH} />
      <RegionMap id={id} t={t} cam={cam} vp={VP} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.3))'}} />
      <Overlay9 id={id} t={t} cam={cam} vp={VP} L={L} hideTitle={part === 1} />
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25}}>
        <div style={{background: YELLOW, border: `5px solid ${INK}`, borderRadius: 16, padding: '4px 18px 0', ...font, fontSize: 36, color: INK}}>PART {part}/6</div>
      </div>
      {hk > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30, background: `rgba(8,18,32,${0.45 * lerp(ts, 1.2, 1.6, 1, 0)})`}}>
          <div style={{transform: `scale(${hk}) rotate(-3deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
            <div style={{display: 'flex', gap: 30, alignItems: 'center'}}><Avatar size={220} code={title.a} mood="angry" t={ts} seed={1} look={[1, 0]} id="hk-a" /><div style={{...font, fontSize: 110, color: RED, textShadow: `6px 6px 0 ${INK}`}}>VS</div><Avatar size={220} code={title.b} mood="scared" t={ts} seed={2} look={[-1, 0]} id="hk-b" /></div>
            <div style={{background: INK, color: '#fff', borderRadius: 18, padding: '8px 24px 2px', ...font, fontSize: 42}}>{title.l1} {title.l2}</div>
            <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 36px 8px', ...font, fontSize: d.hook.length > 22 ? 88 : 104, color: RED, textAlign: 'center', lineHeight: 0.98, maxWidth: 1000}}>{d.hook}</div>
          </div>
        </AbsoluteFill>
      )}
      {ek > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', zIndex: 30, background: `rgba(8,18,32,${0.6 * ek})`}}>
          <div style={{transform: `scale(${ek}) rotate(-2deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
            <div style={{background: YELLOW, border: `7px solid ${INK}`, borderRadius: 22, padding: '6px 30px 0', ...font, fontSize: 62, color: INK}}>NEXT · PART {part + 1}/6</div>
            <div style={{background: '#fff', border: `11px solid ${INK}`, borderRadius: 34, padding: '20px 40px 8px', ...font, fontSize: 96, color: BLUE, textAlign: 'center', lineHeight: 1, maxWidth: 1000}}>{d.next}</div>
            <div style={{transform: `translateX(${Math.sin((ts - d.end) * 8) * 10}px)`, ...font, fontSize: 120, color: '#fff', textShadow: `6px 6px 0 ${INK}`}}>➜</div>
          </div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile(`short-${id}${part}.wav`)} />
    </AbsoluteFill>
  );
};
