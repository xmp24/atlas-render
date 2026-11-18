// Globo 3D (proyección ortográfica con textura real, luz y atmósfera)
import React, {useLayoutEffect, useRef} from 'react';
import {geoOrthographic, geoPath, geoGraticule10} from 'd3-geo';
import {feature} from 'topojson-client';
import TOPO from './worldtopo.json';
import {IMG, MAINCOL, MARBLE, KOF} from './HexWorld';

const FC = feature(TOPO as any, (TOPO as any).objects.countries) as any;
const GRAT = geoGraticule10();

export const Globe: React.FC<{W: number; H: number; lon: number; lat: number; radius: number; cx?: number; cy?: number; overlay?: number; highlight?: (code: string) => string | null; stars?: number}> = ({W, H, lon, lat, radius, cx = W / 2, cy = H / 2, overlay = 0.45, highlight, stars = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, W, H);
    if (IMG.stars && stars > 0) { ctx.globalAlpha = 0.9 * stars; const sw = W * 1.3; ctx.drawImage(IMG.stars, -((lon * 2) % 360) / 360 * sw * 0.2 - W * 0.1, -H * 0.15, sw, sw / 2); ctx.globalAlpha = 1; }
    // halo atmosférico
    const g = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.28);
    g.addColorStop(0, 'rgba(120,190,255,0.55)'); g.addColorStop(0.35, 'rgba(70,140,255,0.22)'); g.addColorStop(1, 'rgba(40,80,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2); ctx.fill();
    // textura por píxel
    const R = Math.round(radius);
    if (MARBLE && R > 2) {
      const x0 = Math.max(0, Math.floor(cx - R)), y0 = Math.max(0, Math.floor(cy - R));
      const x1 = Math.min(W, Math.ceil(cx + R)), y1 = Math.min(H, Math.ceil(cy + R));
      const w = x1 - x0, h = y1 - y0;
      if (w > 0 && h > 0) {
        const img = ctx.getImageData(x0, y0, w, h); const out = img.data;
        const src = MARBLE.data, TW = MARBLE.width, TH = MARBLE.height;
        const l0 = (lon * Math.PI) / 180, p0 = (lat * Math.PI) / 180;
        const cp = Math.cos(p0), sp = Math.sin(p0);
        // luz desde arriba-izquierda
        const L = [-0.45, -0.5, 0.74]; const ln = Math.hypot(L[0], L[1], L[2]);
        for (let yy = 0; yy < h; yy++) {
          const ny = (y0 + yy + 0.5 - cy) / radius;
          for (let xx = 0; xx < w; xx++) {
            const nx = (x0 + xx + 0.5 - cx) / radius;
            const r2 = nx * nx + ny * ny; if (r2 > 1) continue;
            const nz = Math.sqrt(1 - r2);
            // rotación inversa: punto de la esfera -> lat/lon
            const y3 = -ny * cp + nz * sp, z3 = ny * sp + nz * cp;
            const la = Math.asin(Math.max(-1, Math.min(1, y3)));
            const lo = l0 + Math.atan2(nx, z3);
            let u = ((lo / (2 * Math.PI) + 0.5) % 1 + 1) % 1; const v = 0.5 - la / Math.PI;
            const ti = (Math.min(TH - 1, Math.max(0, Math.floor(v * TH))) * TW + Math.floor(u * TW)) * 4;
            const dif = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / ln);
            const sh = 0.25 + 0.95 * dif;
            const rim = Math.pow(1 - nz, 3) * 0.5;
            const o = (yy * w + xx) * 4;
            const a = Math.min(1, (1 - Math.sqrt(r2)) * radius * 0.8);
            out[o] = out[o] * (1 - a) + Math.min(255, src[ti] * sh + 90 * rim) * a;
            out[o + 1] = out[o + 1] * (1 - a) + Math.min(255, src[ti + 1] * sh + 150 * rim) * a;
            out[o + 2] = out[o + 2] * (1 - a) + Math.min(255, src[ti + 2] * sh + 255 * rim) * a;
          }
        }
        ctx.putImageData(img, x0, y0);
      }
    }
    // países coloreados + rejilla
    const proj = geoOrthographic().rotate([-lon, -lat]).scale(radius).translate([cx, cy]).clipAngle(90);
    const path = geoPath(proj, ctx);
    if (overlay > 0) {
      for (const f of FC.features) {
        const k = KOF[f.properties.code];
        const hl = highlight ? highlight(f.properties.code) : null;
        ctx.globalAlpha = hl ? 0.85 : overlay;
        ctx.fillStyle = hl || (k !== undefined ? MAINCOL[k] : '#999');
        ctx.beginPath(); path(f); ctx.fill();
      }
      ctx.globalAlpha = 0.7; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(0.6, radius / 700);
      ctx.beginPath(); for (const f of FC.features) path(f); ctx.stroke();
    }
    ctx.globalAlpha = 0.14; ctx.strokeStyle = '#cfe6ff'; ctx.lineWidth = 1;
    ctx.beginPath(); path(GRAT as any); ctx.stroke();
    ctx.globalAlpha = 1;
    // sombra de terminador
    const sg = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.2, cx, cy, radius * 1.02);
    sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(0.75, 'rgba(0,0,10,0.12)'); sg.addColorStop(1, 'rgba(0,0,20,0.55)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, width: W, height: H}} />;
};
