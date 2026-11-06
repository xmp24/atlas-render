// Miniaturas estilo "mapa animado": país con su silueta real + bandera + cara, mapamundi desenfocado, textos gigantes
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES, flagBmp, MAINCOL} from './HexWorld';
import {PolyCanvas, CEv, PIECES, PIECES_OF, PIECES_C, CAREA} from './PolyWorld';
import {Face, Mood, INK, font} from './lib3';
import JI from './hw/indo2d.json';

const K = (c: string) => COUNTRIES.findIndex((x) => x.c === c);
const W = 1280, H = 720;

// silueta del país (piezas grandes), rellena con su bandera, contorno negro grueso y cara
export const CountryChar: React.FC<{k: number; x: number; y: number; w: number; h: number; mood: Mood; look?: [number, number]; minFrac?: number; faceY?: number; faceR?: number; tilt?: number; redEyes?: boolean; near?: number; stroke?: number}> = ({k, x, y, w, h, mood, look = [0, 0], minFrac = 0.004, near = 0.9, stroke = 1, faceY = 0.5, faceR = 0.2, tilt = 0, redEyes}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const all = PIECES_OF[k].map((i) => PIECES[i]).filter((p) => p.path && p.bbox[2] - p.bbox[0] < 2500);
  const mp = all.reduce((a, p) => (p.area > a.area ? p : a), all[0]);
  const mr = Math.max(mp.bbox[2] - mp.bbox[0], mp.bbox[3] - mp.bbox[1]);
  const ps = all.filter((p) => p.area >= CAREA[k] * minFrac && Math.hypot(p.c[0] - mp.c[0], p.c[1] - mp.c[1]) <= mr * near);
  const b = [1e9, 1e9, -1e9, -1e9];
  for (const p of ps) { b[0] = Math.min(b[0], p.bbox[0]); b[1] = Math.min(b[1], p.bbox[1]); b[2] = Math.max(b[2], p.bbox[2]); b[3] = Math.max(b[3], p.bbox[3]); }
  const bw = (b[2] - b[0]) / 4, bh = (b[3] - b[1]) / 4; // en coordenadas 1920
  const pad = 0.1, s = Math.min((w * (1 - pad)) / bw, (h * (1 - pad)) / bh);
  const ox = (w - bw * s) / 2 - (b[0] / 4) * s, oy = (h - bh * s) / 2 - (b[1] / 4) * s;
  useLayoutEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; c.width = w * 2; c.height = h * 2; ctx.scale(2, 2);
    const trace = (fn: () => void) => { ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s); fn(); ctx.restore(); };
    const lw = (px: number) => px / s;
    // sombra
    ctx.save(); ctx.translate(0, Math.max(6, w * 0.02)); trace(() => { ctx.fillStyle = 'rgba(0,0,0,0.55)'; for (const p of ps) { ctx.lineWidth = lw(w * 0.04 * stroke); ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineJoin = 'round'; ctx.stroke(p.path!); ctx.fill(p.path!); } }); ctx.restore();
    // halo blanco + contorno negro
    trace(() => { ctx.lineJoin = 'round'; for (const p of ps) { ctx.lineWidth = lw(w * 0.04 * stroke); ctx.strokeStyle = '#ffffff'; ctx.stroke(p.path!); } for (const p of ps) { ctx.lineWidth = lw(w * 0.022 * stroke); ctx.strokeStyle = INK; ctx.stroke(p.path!); } });
    // bandera recortada a la silueta
    ctx.save(); { const pth = new Path2D(); for (const p of ps) pth.addPath(p.path!); ctx.translate(ox, oy); ctx.scale(s, s); ctx.clip(pth); ctx.setTransform(2, 0, 0, 2, 0, 0); }
    const bmp = flagBmp(k);
    const fx = ox + (b[0] / 4) * s, fy = oy + (b[1] / 4) * s, fw = bw * s, fh = bh * s;
    if (bmp) ctx.drawImage(bmp, fx, fy, fw, fh); else { ctx.fillStyle = MAINCOL[k]; ctx.fillRect(fx, fy, fw, fh); }
    const g = ctx.createRadialGradient(fx + fw * 0.3, fy + fh * 0.25, 0, fx + fw * 0.5, fy + fh * 0.5, Math.max(fw, fh) * 0.75);
    g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g; ctx.fillRect(fx, fy, fw, fh); ctx.restore();
  }, [k, w, h]);
  const fr = Math.min(w, h) * faceR;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${tilt}deg)`}}>
      <canvas ref={ref} style={{width: w, height: h}} />
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 2px #fff)'}}>
        {redEyes && <><circle cx={w / 2 - fr * 0.42} cy={h * faceY - fr * 0.05} r={fr * 0.42} fill="#ff2a2a" opacity={0.55} /><circle cx={w / 2 + fr * 0.42} cy={h * faceY - fr * 0.05} r={fr * 0.42} fill="#ff2a2a" opacity={0.55} /></>}
        <Face x={w / 2} y={h * faceY} r={fr} mood={mood} t={1} seed={k} look={look} />
      </svg>
    </div>
  );
};

// fondo: mapamundi con banderas, desenfocado, y caritas pequeñas en muchos países
const CAM = {cx: 3840, cy: 2050, s: 0.2};
const toScr = (p: number[], cam = CAM) => [(p[0] - cam.cx) * cam.s + W / 2, (p[1] - cam.cy) * cam.s + H / 2];
const BIG = ['US', 'CA', 'BR', 'AR', 'MX', 'RU', 'CN', 'IN', 'AU', 'DZ', 'SA', 'KZ', 'CD', 'IR', 'EG', 'NG', 'ZA', 'TR', 'FR', 'ES', 'DE', 'GB', 'PE', 'CO', 'MN', 'LY', 'SD', 'ET', 'JP', 'PK', 'TH', 'VE', 'CL', 'BO', 'AO', 'TZ', 'ML', 'NE', 'TD'];
export const WorldBg: React.FC<{cam?: {cx: number; cy: number; s: number}; skip?: string[]; mood?: Mood; blur?: number; colOver?: Record<number, string>}> = ({cam = CAM, skip = [], mood = 'scared', blur = 2.2, colOver}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#2f7fd0'}}>
    <div style={{position: 'absolute', inset: -20, filter: `blur(${blur}px) saturate(1.3) brightness(1.08)`}}>
      <PolyCanvas cev={(JI as any).cev as CEv[]} t={0} tm={0} byTm={false} cam={cam} W={W + 40} H={H + 40} opts={{squads: false, capitalsOff: true, war: null, empire: null, waves: true, colOver} as any} />
    </div>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: `blur(${blur * 0.5}px)`}}>
      {BIG.filter((c) => !skip.includes(c)).map((c) => { const k = K(c); if (k < 0) return null; const [x, y] = toScr(PIECES_C(k), cam); const r = Math.min(26, Math.max(12, Math.sqrt(CAREA[k]) * cam.s * 0.9));
        return <Face key={c} x={x} y={y} r={r} mood={mood} t={1} seed={k} />; })}
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,20,60,0.45) 100%)'}} />
  </AbsoluteFill>
);

export const Txt: React.FC<{text: string; y: number; size: number; col?: string; x?: number; rot?: number}> = ({text, y, size, col = '#ffffff', x = W / 2, rot = 0}) => (
  <div style={{position: 'absolute', left: x - 700, width: 1400, top: y, textAlign: 'center', transform: `rotate(${rot}deg)`, ...font, fontSize: size, lineHeight: 1, color: col, WebkitTextStroke: `${size * 0.19}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.07}px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
);
export const VS: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #fff27a, #ffc21a 70%)', border: `${r * 0.12}px solid ${INK}`, boxShadow: `0 ${r * 0.1}px 0 ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: r * 0.95, color: '#e5322d', WebkitTextStroke: `${r * 0.1}px ${INK}`, paintOrder: 'stroke fill'}}>VS</div>
);

const ID = K('ID'), US = K('US'), CN = K('CN');
const M: Record<string, React.ReactNode> = {
  // 1: Indonesia enorme y furiosa contra el mundo
  m1: (<>
    <WorldBg cam={{cx: 4300, cy: 2150, s: 0.21}} skip={['ID']} />
    <CountryChar k={ID} stroke={0.55} minFrac={0.01} x={W / 2} y={392} w={1080} h={430} mood="angry" faceY={0.42} faceR={0.36} redEyes />
    <Txt text="INDONESIA" y={18} size={104} />
    <Txt text="VS THE WORLD" y={590} size={104} col="#ff3b30" />
  </>),
  // 2: Indonesia vs EE. UU.
  m2: (<>
    <WorldBg cam={{cx: 3840, cy: 2100, s: 0.2}} skip={['US', 'ID']} />
    <CountryChar k={US} x={330} y={380} w={560} h={360} mood="angry" faceY={0.5} faceR={0.4} look={[0.7, 0]} redEyes />
    <CountryChar k={ID} stroke={0.55} minFrac={0.01} x={950} y={385} w={600} h={300} mood="angry" faceY={0.45} faceR={0.48} look={[-0.7, 0]} redEyes />
    <VS x={W / 2} y={385} r={78} />
    <Txt text="WHO WINS?" y={18} size={104} />
    <Txt text="INDONESIA OR USA?" y={598} size={92} col="#ff3b30" />
  </>),
  // 3: ¿y si Indonesia atacara al mundo?
  m3: (<>
    <WorldBg cam={{cx: 4300, cy: 2150, s: 0.21}} skip={['ID']} mood="shocked" />
    <CountryChar k={ID} stroke={0.55} minFrac={0.01} x={W / 2} y={392} w={1000} h={400} mood="smug" faceY={0.42} faceR={0.38} />
    <Txt text="WHAT IF INDONESIA" y={22} size={92} />
    <Txt text="ATTACKED THE WORLD?" y={598} size={88} col="#ff3b30" />
  </>),
  // 4: el mundo tiene miedo de Indonesia
  m4: (<>
    <WorldBg cam={{cx: 4300, cy: 2150, s: 0.21}} skip={['ID']} mood="scared" />
    <CountryChar k={ID} stroke={0.55} minFrac={0.01} x={W / 2} y={392} w={1000} h={400} mood="angry" faceY={0.42} faceR={0.38} redEyes />
    <Txt text="COUNTRIES THAT FEAR" y={22} size={90} />
    <Txt text="INDONESIA" y={590} size={110} col="#ff3b30" />
  </>),
  // 5: el final: Indonesia vs China
  m5: (<>
    <WorldBg cam={{cx: 5300, cy: 2100, s: 0.3}} skip={['CN', 'ID']} />
    <CountryChar k={CN} x={350} y={385} w={580} h={400} mood="angry" faceY={0.5} faceR={0.36} look={[0.7, 0]} redEyes />
    <CountryChar k={ID} stroke={0.55} minFrac={0.01} x={940} y={390} w={620} h={300} mood="angry" faceY={0.45} faceR={0.48} look={[-0.7, 0]} redEyes />
    <VS x={W / 2 + 10} y={385} r={78} />
    <Txt text="THE FINAL BATTLE" y={20} size={98} />
    <Txt text="INDONESIA VS CHINA" y={598} size={90} col="#ff3b30" />
  </>),
};
export const ThumbMap: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#2f7fd0', overflow: 'hidden'}}>{M[id]}</AbsoluteFill>;
export const MAP_IDS = Object.keys(M);
