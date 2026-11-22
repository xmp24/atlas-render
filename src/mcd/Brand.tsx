// El Planeta Curioso — logo (800x800) y banner (2560x1440)
import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {geoOrthographic, geoPath, geoGraticule10} from 'd3-geo';
import {feature} from 'topojson-client';
import TOPO from '../worldtopo.json';
import {drawFace} from './McMap';

const INK = '#14213d';
const F1 = 'Lilita, sans-serif', F2 = 'Fredoka, sans-serif';
const LAND = (feature(TOPO as any, (TOPO as any).objects.countries) as any).features;
const PAL = ['#2fbf63', '#ffb020', '#ee4646', '#3fa7ff', '#9b5de5', '#2fbf63', '#ffd23f', '#2fbf63'];
let FONTS = false;
if (typeof window !== 'undefined') {
  const h = delayRender('brand-fonts');
  Promise.all([
    new FontFace('Lilita', `url(${staticFile('lilita.woff2')})`).load(),
    new FontFace('Fredoka', `url(${staticFile('fredoka700.woff2')})`, {weight: '700'}).load(),
  ].map((p) => p.then((f) => { (document as any).fonts.add(f); }).catch(() => null))).then(() => { FONTS = true; continueRender(h); });
}

// Planeta con cara: continentes reales coloreados, lupa y chinchetas
function drawPlanet(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, opts: {lupa?: boolean; rot?: number; pins?: [number, number, string][]}) {
  const proj = geoOrthographic().scale(R).translate([cx, cy]).rotate([opts.rot ?? -10, -18, 0]).clipAngle(90);
  const path = geoPath(proj, ctx);
  // sombra
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx + R * 0.05, cy + R * 1.08, R * 0.8, R * 0.12, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(); ctx.restore();
  // océano
  const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
  g.addColorStop(0, '#5cc8ff'); g.addColorStop(0.6, '#1f8ad6'); g.addColorStop(1, '#0d4f93');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath(); path(geoGraticule10() as any); ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = R * 0.006; ctx.stroke();
  LAND.forEach((f: any, i: number) => {
    ctx.beginPath(); path(f); ctx.fillStyle = PAL[(i * 7) % PAL.length]; ctx.fill();
    ctx.lineWidth = R * 0.006; ctx.strokeStyle = 'rgba(20,33,61,0.55)'; ctx.stroke();
  });
  // brillo
  const hl = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, 0, cx - R * 0.4, cy - R * 0.45, R * 0.9);
  hl.addColorStop(0, 'rgba(255,255,255,0.45)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  const sh = ctx.createRadialGradient(cx + R * 0.3, cy + R * 0.35, R * 0.4, cx, cy, R * 1.05);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,30,0.35)');
  ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.lineWidth = R * 0.07; ctx.strokeStyle = INK; ctx.stroke();
  // cara curiosa (una ceja levantada)
  drawFace(ctx, cx, cy + R * 0.08, R * 0.55, 'happy', 0, 0.6, 1);
  // chinchetas
  const pin = (lon: number, lat: number, col: string) => {
    const p = proj([lon, lat]); if (!p) return; const [x, y] = p; const s = R * 0.09;
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-s, -s * 1.2, -s, -s * 2.2, 0, -s * 2.3); ctx.bezierCurveTo(s, -s * 2.2, s, -s * 1.2, 0, 0);
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = R * 0.022; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -s * 1.55, s * 0.35, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  };
  (opts.pins ?? []).forEach(([lo, la, col]) => pin(lo, la, col));
  // lupa
  if (opts.lupa) {
    const lx = cx + R * 0.82, ly = cy + R * 0.62, lr = R * 0.36;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = R * 0.2; ctx.beginPath(); ctx.moveTo(lx + lr * 0.7, ly + lr * 0.7); ctx.lineTo(lx + lr * 1.6, ly + lr * 1.6); ctx.stroke();
    ctx.strokeStyle = '#8a4b22'; ctx.lineWidth = R * 0.12; ctx.beginPath(); ctx.moveTo(lx + lr * 0.8, ly + lr * 0.8); ctx.lineTo(lx + lr * 1.55, ly + lr * 1.55); ctx.stroke();
    ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,240,255,0.35)'; ctx.fill();
    ctx.lineWidth = R * 0.09; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = R * 0.05; ctx.strokeStyle = '#ffd23f'; ctx.stroke();
    ctx.beginPath(); ctx.arc(lx, ly, lr * 0.7, Math.PI * 1.1, Math.PI * 1.5); ctx.lineWidth = R * 0.035; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.stroke();
    ctx.restore();
  }
}

function useCanvas(draw: (ctx: CanvasRenderingContext2D) => void, deps: any[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [, force] = useState(0);
  useLayoutEffect(() => { if (!FONTS) { const id = setInterval(() => { if (FONTS) { force((x) => x + 1); clearInterval(id); } }, 50); return () => clearInterval(id); } }, []);
  useLayoutEffect(() => { const c = ref.current; if (!c) return; const ctx = c.getContext('2d')!; ctx.clearRect(0, 0, c.width, c.height); draw(ctx); }, deps);
  return ref;
}

export const BrandLogo: React.FC = () => {
  const ref = useCanvas((ctx) => {
    const g = ctx.createRadialGradient(400, 360, 50, 400, 400, 560);
    g.addColorStop(0, '#ffe36b'); g.addColorStop(1, '#ff9f1c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 800);
    for (let i = 0; i < 24; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0)'; const a = (i / 24) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(400, 400); ctx.arc(400, 400, 800, a, a + Math.PI / 12); ctx.fill(); }
    drawPlanet(ctx, 375, 375, 255, {lupa: true, pins: [[-3, 40, '#ee4646'], [26, -29, '#ffd23f'], [45, 24, '#2fbf63']]});
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={800} height={800} /></AbsoluteFill>;
};

export const BrandBanner: React.FC = () => {
  const ref = useCanvas((ctx) => {
    const W = 2560, H = 1440;
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0d3f73'); g.addColorStop(1, '#1a6aa8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // estrellas / puntos de mapa
    for (let i = 0; i < 140; i++) { const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * W, y = (Math.sin(i * 37.3) * 0.5 + 0.5) * H; ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2); ctx.fill(); }
    // franja central (zona segura 1546x423)
    ctx.fillStyle = 'rgba(255,210,63,0.95)'; ctx.beginPath(); ctx.roundRect(507, 520, 1546, 400, 60); ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
    drawPlanet(ctx, 770, 720, 250, {lupa: true, rot: 60, pins: [[-99, 19, '#ee4646'], [-65, -38, '#ffd23f'], [-100, 56, '#2fbf63']]});
    // planetas pequeños decorativos fuera de la zona segura
    drawPlanet(ctx, 260, 330, 120, {rot: -100});
    drawPlanet(ctx, 2310, 1120, 140, {rot: 150});
  }, []);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={2560} height={1440} />
      <div style={{position: 'absolute', left: 1080, top: 560, width: 940}}>
        <div style={{fontFamily: F1, fontSize: 92, color: '#fff', lineHeight: 1, WebkitTextStroke: `7px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`} as any}>EL PLANETA</div>
        <div style={{fontFamily: F1, fontSize: 158, color: '#ee4646', lineHeight: 1, WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 12px 0 ${INK}`, marginTop: 4} as any}>CURIOSO</div>
        <div style={{display: 'inline-block', marginTop: 20, fontFamily: F2, fontWeight: 700, fontSize: 44, color: '#fff', background: INK, borderRadius: 999, padding: '8px 30px'}}>El mundo, país por país</div>
      </div>
    </AbsoluteFill>
  );
};
