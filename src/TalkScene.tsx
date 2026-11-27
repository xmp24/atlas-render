// Escena de conversación estilo countryballs: bolas grandes en primer plano sobre el mapa de su zona,
// subtítulos palabra a palabra, el que habla rebota, el que grita tiembla, los demás le miran.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COUNTRIES} from './HexWorld';
import {CBall} from './ThumbsCB';

const F: React.CSSProperties = {fontFamily: 'Lilita'};
const CODE: Record<string, number> = {}; COUNTRIES.forEach((c, i) => { CODE[c.c] = i; });
const NMX: Record<string, string> = {'United States of America': 'USA', 'United Arab Emirates': 'UAE', 'Dem. Rep. Congo': 'DR Congo'};
const NM = (code: string) => { const n = COUNTRIES[CODE[code]]?.n || code; return (NMX[n] || n).toUpperCase(); };
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
type Line = [number, number, string, string, string, number];   // t0 t1 spk txt eyes shout

const LAYOUT: Record<number, [number, number][]> = {
  1: [[960, 560]],
  2: [[560, 570], [1360, 570]],
  3: [[430, 590], [960, 560], [1490, 590]],
  4: [[330, 600], [760, 570], [1160, 570], [1590, 600]],
};
const SIZE: Record<number, number> = {1: 560, 2: 525, 3: 450, 4: 370};

// palabra actual según el tiempo (peso por longitud de la palabra)
const wordAt = (l: Line, t: number) => {
  const words = l[3].split(/\s+/).filter(Boolean);
  const w = words.map((x) => 1.2 + x.length); const tot = w.reduce((a, b) => a + b, 0);
  const u = cl((t - l[0]) / Math.max(0.2, l[1] - l[0]), 0, 0.999) * tot;
  let acc = 0;
  for (let i = 0; i < words.length; i++) { acc += w[i]; if (u < acc) return {i, words}; }
  return {i: words.length - 1, words};
};

export const TalkScene: React.FC<{scene: any; lines: Line[]; t: number}> = ({scene, lines, t}) => {
  const [t0, t1, cast] = scene as [number, number, string[]];
  const n = Math.min(4, cast.length);
  const pos = LAYOUT[n]; const size = SIZE[n];
  const fin = cl((t - t0) / 0.3, 0, 1), fout = cl((t1 + 0.25 - t) / 0.3, 0, 1); const a = Math.min(fin, fout);
  const mine = lines.filter((l) => l[0] >= t0 - 0.05 && l[0] <= t1 + 0.05);
  const cur = mine.filter((l) => t >= l[0] - 0.05 && t < l[1] + 0.12).slice(-1)[0];
  const lastOf = (c: string) => { const p = mine.filter((l) => l[2] === c && l[0] <= t + 0.05).slice(-1)[0]; return p; };
  const spkIdx = cur ? cast.indexOf(cur[2]) : -1;
  const out: React.ReactNode[] = [];
  // fondo: el mapa sigue detrás, oscurecido y algo desenfocado
  out.push(<AbsoluteFill key="dim" style={{zIndex: 25, opacity: a, backdropFilter: 'blur(2.5px)', background: 'radial-gradient(ellipse at 50% 55%, rgba(5,10,25,0.18) 0%, rgba(5,10,25,0.55) 75%)'}} />);
  cast.slice(0, 4).forEach((c, i) => {
    const k = CODE[c]; if (k === undefined) return;
    const [x, y] = pos[i];
    const enter = cl((t - (t0 + i * 0.08)) / 0.35, 0, 1); const sc = enter < 1 ? 1 - Math.pow(1 - enter, 3) * 1.0 + Math.sin(enter * Math.PI) * 0.12 : 1;
    const talking = cur && cur[2] === c && t >= cur[0];
    const shout = talking && cur[5] > 0;
    const last = lastOf(c);
    let eyes = (last ? last[4] : 'normal') as any;
    if (!last) eyes = 'normal';
    // mirar hacia el que habla
    const look = spkIdx >= 0 && spkIdx !== i ? (spkIdx > i ? 0.7 : -0.7) : (i < n / 2 ? 0.5 : -0.5);
    const bounce = talking ? Math.abs(Math.sin((t - cur[0]) * 9)) * size * 0.035 : Math.sin(t * 2.2 + i) * size * 0.008;
    const shx = shout ? Math.sin(t * 61) * 9 : 0, shy = shout ? Math.cos(t * 53) * 7 : 0;
    const s2 = (talking ? 1.05 : 0.97) * sc;
    const rot = talking ? Math.sin((t - cur[0]) * 6) * 4 : 0;
    out.push(
      <div key={'b' + c} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, zIndex: 26 + (talking ? 2 : 0), opacity: a,
        transform: `translate(${x - 960 + shx}px, ${y - 540 - bounce + shy}px) scale(${s2})`, transformOrigin: '960px 540px'}}>
        <CBall k={k} size={size} x={960} y={540} eyes={eyes} look={look} rot={rot} sweat={eyes === 'scared'} />
        {talking && <div style={{position: 'absolute', left: 960, top: 540 - size / 2 - 58, transform: 'translateX(-50%)', background: 'rgba(14,16,26,0.86)', color: '#fff', borderRadius: 14, padding: '6px 16px 2px', ...F, fontSize: 30, whiteSpace: 'nowrap', border: `3px solid ${shout ? '#ffd23f' : '#fff'}`}}>{NM(c)}</div>}
      </div>);
  });
  // subtítulo palabra a palabra (estilo shorts): 1-3 palabras grandes
  if (cur && t >= cur[0] - 0.02) {
    const {i, words} = wordAt(cur, t);
    const chunk = words.slice(Math.max(0, i - 1), i + 1).join(' ');
    const shout = cur[5] > 0; const nar = cur[2] === 'N';
    const pw = cl((t - cur[0]) * 8, 0, 1);
    out.push(<div key="cap" style={{position: 'absolute', left: 0, right: 0, top: 870, zIndex: 32, textAlign: 'center', opacity: a,
      transform: `scale(${0.9 + 0.1 * pw + (shout ? Math.sin(t * 30) * 0.02 : 0)})`}}>
      <span style={{...F, fontSize: shout ? 96 : 82, color: nar ? '#dfe7ff' : shout ? '#ffd23f' : '#fff', fontStyle: nar ? 'italic' : 'normal',
        WebkitTextStroke: '10px #0e101a', paintOrder: 'stroke fill', textShadow: '0 7px 0 rgba(0,0,0,0.45)', letterSpacing: 1}}>{shout ? chunk.toUpperCase() : chunk}</span>
    </div>);
  }
  return <>{out}</>;
};
