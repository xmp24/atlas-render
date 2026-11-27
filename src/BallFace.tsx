// Countryball con cara completa: ojos + boca + extras. La boca se abre con la amplitud real de la voz.
import React from 'react';
import {staticFile} from 'remotion';
import {FlagCanvas} from './HexWorld';
import {INK} from './lib3';
import {EyesSvg} from './ThumbsCB';

export type Expr = 'normal' | 'happy' | 'smug' | 'angry' | 'furious' | 'evil' | 'scared' | 'shock' | 'sad' | 'cry' | 'laugh' | 'shades' | 'dead' | 'sleepy' | 'proud';
type Mouth = 'none' | 'smile' | 'frown' | 'smirk' | 'flat' | 'wavy' | 'O' | 'grin' | 'D' | 'tongue' | 'wail';
const FACE: Record<Expr, {e: string; m: Mouth}> = {
  normal: {e: 'normal', m: 'none'}, happy: {e: 'happy', m: 'none'}, smug: {e: 'smug', m: 'none'}, angry: {e: 'angry', m: 'none'}, furious: {e: 'furious', m: 'none'},
  evil: {e: 'evil', m: 'grin'}, scared: {e: 'scared', m: 'wavy'}, shock: {e: 'shock', m: 'O'}, sad: {e: 'sad', m: 'none'},
  cry: {e: 'sad', m: 'wail'}, laugh: {e: 'happy', m: 'D'}, shades: {e: 'shades', m: 'none'}, dead: {e: 'dead', m: 'none'},
  sleepy: {e: 'sleepy', m: 'none'}, proud: {e: 'smug', m: 'none'},
};
const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const Eyes2: React.FC<{e: string; s: number; look: number; blink: number}> = ({e, s, look, blink}) => {
  const lx = look * 0.06 * s, cy = 0.4 * s, dx = 0.17 * s, sw = s * 0.022;
  const xs = [0.5 * s - dx + lx, 0.5 * s + dx + lx];
  const rx = 0.085 * s, ry = 0.1 * s;
  if (blink > 0.5 && ['normal', 'smug', 'scared', 'shock', 'sad', 'angry'].includes(e))
    return <g>{xs.map((x, i) => <path key={i} d={`M${x - rx},${cy} Q${x},${cy + ry * 0.35} ${x + rx},${cy}`} fill="none" stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />)}</g>;
  if (e === 'furious') return <g>{xs.map((x, i) => <circle key={i} cx={x} cy={cy} r={rx * 1.12} fill="#ff1e1e" stroke={INK} strokeWidth={sw * 1.1} />)}</g>;
  if (e === 'happy') return <g>{xs.map((x, i) => <path key={i} d={`M${x - rx},${cy + ry * 0.25} Q${x},${cy - ry * 1.0} ${x + rx},${cy + ry * 0.25}`} fill="none" stroke={INK} strokeWidth={sw * 1.6} strokeLinecap="round" />)}</g>;
  if (e === 'sleepy') return <g>{xs.map((x, i) => <path key={i} d={`M${x - rx},${cy + ry * 0.1} Q${x},${cy + ry * 0.55} ${x + rx},${cy + ry * 0.1}`} fill="none" stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />)}</g>;
  if (e === 'shock') return <g>{xs.map((x, i) => <g key={i}><ellipse cx={x} cy={cy - ry * 0.1} rx={rx * 1.15} ry={ry * 1.3} fill="#fff" stroke={INK} strokeWidth={sw} /><circle cx={x + lx * 0.3} cy={cy - ry * 0.1} r={rx * 0.18} fill={INK} /></g>)}</g>;
  if (e === 'sad') return <g>{xs.map((x, i) => { const d = i === 0 ? 1 : -1;
    return <path key={i} d={`M${x - rx},${cy - ry * (d > 0 ? 0.15 : 0.75)} L${x + rx},${cy - ry * (d > 0 ? 0.75 : 0.15)} A${rx},${ry} 0 0 1 ${x - rx},${cy - ry * (d > 0 ? 0.15 : 0.75)} Z`} fill="#fff" stroke={INK} strokeWidth={sw} strokeLinejoin="round" transform={`translate(0,${ry * 0.3})`} />; })}</g>;
  if (e === 'evil') return <g>
    <defs><radialGradient id="evg"><stop offset="0" stopColor="#fff36b" /><stop offset="0.5" stopColor="#ff3b1f" /><stop offset="1" stopColor="#7a0000" /></radialGradient></defs>
    {xs.map((x, i) => { const d = i === 0 ? 1 : -1;
      return <path key={i} d={`M${x - rx * 1.1},${cy - ry * (d > 0 ? 0.95 : 0.05)} L${x + rx * 1.1},${cy - ry * (d > 0 ? 0.05 : 0.95)} A${rx * 1.1},${ry * 0.95} 0 0 1 ${x - rx * 1.1},${cy - ry * (d > 0 ? 0.95 : 0.05)} Z`} fill="url(#evg)" stroke={INK} strokeWidth={sw * 1.2} strokeLinejoin="round" transform={`translate(0,${ry * 0.35})`} />; })}</g>;
  return <EyesSvg e={e as any} s={s} look={look} />;
};

const MouthSvg: React.FC<{m: Mouth; s: number; open: number; t: number}> = ({m, s, open, t}) => {
  const cx = 0.5 * s, cy = 0.68 * s, w = 0.13 * s, sw = s * 0.022;
  const dark = '#3b0a10', tongue = '#e2525f';
  // abierta (hablando, O, grin, D, wail): forma con relleno
  const op = cl(open, 0, 1);
  if (op > 0.06 || m === 'O' || m === 'grin' || m === 'D' || m === 'wail') {
    const base = m === 'O' ? 0.55 : m === 'grin' ? 0.35 : m === 'D' ? 0.55 : m === 'wail' ? 0.75 : 0;
    const h = s * 0.035 + s * 0.13 * Math.max(op, base);
    const ww = m === 'grin' ? w * 1.45 : m === 'O' ? w * 0.6 + op * w * 0.2 : m === 'wail' ? w * 1.0 : w * (0.95 + op * 0.25);
    const frown = m === 'frown' || m === 'wavy';
    const top = cy - (frown ? h * 0.15 : 0);
    let d: string;
    if (m === 'O') d = `M${cx - ww},${cy} A${ww},${h * 0.7} 0 1 0 ${cx + ww},${cy} A${ww},${h * 0.7} 0 1 0 ${cx - ww},${cy} Z`;
    else if (frown) d = `M${cx - ww},${top + h * 0.6} Q${cx},${top - h * 0.6} ${cx + ww},${top + h * 0.6} Q${cx},${top + h * 0.9} ${cx - ww},${top + h * 0.6} Z`;
    else d = `M${cx - ww},${top - h * 0.12} Q${cx},${top + h * 0.05} ${cx + ww},${top - h * 0.12} Q${cx + ww * 0.85},${top + h * 1.25} ${cx},${top + h * 1.25} Q${cx - ww * 0.85},${top + h * 1.25} ${cx - ww},${top - h * 0.12} Z`;
    const teeth = m === 'grin' || m === 'frown';
    return <g>
      <clipPath id={`mc${Math.round(s)}${m}`}><path d={d} /></clipPath>
      <path d={d} fill={dark} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <g clipPath={`url(#mc${Math.round(s)}${m})`}>
        <ellipse cx={cx} cy={top + h * 1.2} rx={ww * 0.6} ry={h * 0.5} fill={tongue} />
        {teeth && <rect x={cx - ww} y={top - h} width={ww * 2} height={h * (m === 'grin' ? 1.35 : 1.05)} fill="#fff" />}
        {m === 'grin' && [-0.5, 0, 0.5].map((f, i) => <line key={i} x1={cx + ww * f} y1={top - h} x2={cx + ww * f} y2={top + h * 0.35} stroke={INK} strokeWidth={sw * 0.6} />)}
      </g>
    </g>;
  }
  if (m === 'none') return null;
  if (m === 'smile' || m === 'smirk') {
    const a = m === 'smirk' ? 0.35 : 0;
    return <path d={`M${cx - w * 0.8},${cy - w * 0.05 - a * w * 0.2} Q${cx},${cy + w * 0.55} ${cx + w * 0.85},${cy - w * 0.2 - a * w * 0.5}`} fill="none" stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />;
  }
  if (m === 'frown') return <path d={`M${cx - w * 0.75},${cy + w * 0.35} Q${cx},${cy - w * 0.35} ${cx + w * 0.75},${cy + w * 0.35}`} fill="none" stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />;
  if (m === 'wavy') { const ph = t * 18; return <path d={`M${cx - w * 0.8},${cy} ${[0, 1, 2, 3, 4].map((i) => `L${cx - w * 0.8 + w * 0.4 * (i + 0.5)},${cy + (i % 2 ? 1 : -1) * w * 0.14 * (1 + 0.2 * Math.sin(ph))}`).join(' ')} L${cx + w * 0.8},${cy}`} fill="none" stroke={INK} strokeWidth={sw * 1.2} strokeLinejoin="round" strokeLinecap="round" />; }
  if (m === 'tongue') return <g><path d={`M${cx - w * 0.7},${cy} L${cx + w * 0.7},${cy}`} stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" /><path d={`M${cx + w * 0.05},${cy} q0,${w * 0.55} ${w * 0.3},${w * 0.5} q${w * 0.25},0 ${w * 0.2},${-w * 0.5}`} fill={tongue} stroke={INK} strokeWidth={sw} /></g>;
  return <path d={`M${cx - w * 0.6},${cy} L${cx + w * 0.6},${cy}`} stroke={INK} strokeWidth={sw * 1.3} strokeLinecap="round" />;
};

const EyesCB: React.FC<{e: string; s: number; look: number; blink: boolean; t: number}> = ({e, s, look, blink, t}) => {
  // ojos estilo countryball: grandes, juntos, a media altura y desplazados hacia donde mira
  const sw = s * 0.03, cy = s * 0.47, ew = s * 0.125, eh = s * 0.12, dx = s * 0.132;
  const ox = look * s * 0.15;
  const xs = [s / 2 - dx + ox, s / 2 + dx + ox];
  const P = {fill: '#fff', stroke: INK, strokeWidth: sw, strokeLinejoin: 'round' as const};
  const L = {fill: 'none', stroke: INK, strokeWidth: sw * 1.15, strokeLinecap: 'round' as const};
  if (blink && ['normal', 'smug', 'proud', 'scared', 'shock', 'sad', 'angry'].includes(e)) e = 'closed';
  return <g>{xs.map((x, i) => {
    const inner = i === 0 ? 1 : -1; // hacia el centro
    switch (e) {
      case 'closed': case 'sleepy': return <path key={i} d={`M${x - ew * 0.85},${cy - eh * 0.1} Q${x},${cy + eh * 0.75} ${x + ew * 0.85},${cy - eh * 0.1}`} {...L} />;
      case 'happy': return <path key={i} d={`M${x - ew * 0.85},${cy + eh * 0.35} Q${x},${cy - eh * 0.85} ${x + ew * 0.85},${cy + eh * 0.35}`} {...L} />;
      case 'smug': case 'proud': return <path key={i} d={`M${x - ew},${cy - eh * 0.15} L${x + ew},${cy - eh * 0.15} Q${x + ew},${cy + eh * 0.95} ${x},${cy + eh * 0.95} Q${x - ew},${cy + eh * 0.95} ${x - ew},${cy - eh * 0.15} Z`} {...P} />;
      case 'angry': case 'evil': case 'furious_s': {
        const hi = cy - eh * 0.85, lo = cy - eh * 0.05; const yl = inner > 0 ? hi : lo, yr = inner > 0 ? lo : hi;
        return <path key={i} d={`M${x - ew},${yl} L${x + ew},${yr} Q${x + ew},${cy + eh} ${x},${cy + eh} Q${x - ew},${cy + eh} ${x - ew},${yl} Z`} {...P} fill={e === 'evil' ? '#ff1e1e' : '#fff'} />; }
      case 'sad': { const hi = cy - eh * 0.85, lo = cy - eh * 0.1; const yl = inner > 0 ? lo : hi, yr = inner > 0 ? hi : lo;
        return <path key={i} d={`M${x - ew},${yl} L${x + ew},${yr} Q${x + ew},${cy + eh} ${x},${cy + eh} Q${x - ew},${cy + eh} ${x - ew},${yl} Z`} {...P} />; }
      case 'furious': return <ellipse key={i} cx={x} cy={cy} rx={ew * 1.05} ry={eh * 1.05} {...P} fill="#ff2020" />;
      case 'shock': return <g key={i}><ellipse cx={x} cy={cy - eh * 0.1} rx={ew * 1.05} ry={eh * 1.25} {...P} /><circle cx={x + ox * 0.15} cy={cy} r={ew * 0.16} fill={INK} /></g>;
      case 'scared': return <g key={i}><ellipse cx={x} cy={cy} rx={ew} ry={eh * 1.1} {...P} /><circle cx={x + ox * 0.2} cy={cy + eh * 0.2} r={ew * 0.22} fill={INK} /></g>;
      case 'dead': return <g key={i} {...L}><path d={`M${x - ew * 0.6},${cy - eh * 0.6} L${x + ew * 0.6},${cy + eh * 0.6} M${x + ew * 0.6},${cy - eh * 0.6} L${x - ew * 0.6},${cy + eh * 0.6}`} /></g>;
      case 'shades': return <g key={i}><ellipse cx={x} cy={cy} rx={ew * 1.12} ry={eh * 1.1} fill="#2a2ad8" stroke={INK} strokeWidth={sw} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((j) => <circle key={j} cx={x + Math.cos(j * 2.4 + i) * ew * (0.25 + (j % 3) * 0.22)} cy={cy + Math.sin(j * 2.4 + i) * eh * (0.25 + (j % 3) * 0.22)} r={s * 0.009} fill="#7a7aff" opacity={0.5 + 0.5 * Math.sin(t * 6 + j)} />)}</g>;
      default: return <ellipse key={i} cx={x} cy={cy} rx={ew} ry={eh} {...P} />;
    }
  })}{e === 'shades' && <path d={`M${xs[0] + ew * 1.05},${cy - eh * 0.2} L${xs[1] - ew * 1.05},${cy - eh * 0.2}`} stroke={INK} strokeWidth={sw} />}</g>;
};

// cejas y boca por expresión (ojos estilo referencia + cara más expresiva)
const XF: Record<string, {e: string; b: string; m: string}> = {
  normal: {e: 'normal', b: 'none', m: 'smile'}, happy: {e: 'happy', b: 'up', m: 'D'}, smug: {e: 'smug', b: 'one', m: 'smirk'},
  proud: {e: 'smug', b: 'up', m: 'smile'}, angry: {e: 'angry', b: 'V', m: 'frown'}, furious: {e: 'furious', b: 'V', m: 'grit'},
  evil: {e: 'evil', b: 'V', m: 'grin'}, scared: {e: 'scared', b: 'worry', m: 'wavy'}, shock: {e: 'shock', b: 'high', m: 'O'},
  sad: {e: 'sad', b: 'worry', m: 'frown'}, cry: {e: 'closed', b: 'worry', m: 'wail'}, laugh: {e: 'happy', b: 'up', m: 'laugh'},
  shades: {e: 'shades', b: 'none', m: 'smirk'}, dead: {e: 'dead', b: 'none', m: 'tongue'}, sleepy: {e: 'sleepy', b: 'none', m: 'o'},
};
const Brows: React.FC<{b: string; s: number; ox: number; t: number}> = ({b, s, ox}) => {
  if (b === 'none') return null;
  const dx = s * 0.132, cy = s * 0.47 - s * 0.12 - s * 0.075, w = s * 0.11, th = s * 0.04;
  const xs = [s / 2 - dx + ox, s / 2 + dx + ox];
  return <g stroke={INK} strokeWidth={th} strokeLinecap="round" fill="none">{xs.map((x, i) => {
    const inn = i === 0 ? 1 : -1; // +1 = el extremo interior está a la derecha
    const xi = x + inn * w, xo = x - inn * w;
    switch (b) {
      case 'V': return <path key={i} d={`M${xo},${cy - s * 0.035} L${xi},${cy + s * 0.04}`} />;
      case 'worry': return <path key={i} d={`M${xo},${cy + s * 0.02} L${xi},${cy - s * 0.035}`} />;
      case 'high': return <path key={i} d={`M${xo},${cy - s * 0.01} Q${x},${cy - s * 0.07} ${xi},${cy - s * 0.01}`} />;
      case 'up': return <path key={i} d={`M${xo},${cy} Q${x},${cy - s * 0.045} ${xi},${cy}`} />;
      case 'one': return i === 1 ? <path key={i} d={`M${xo},${cy - s * 0.01} Q${x},${cy - s * 0.07} ${xi},${cy - s * 0.02}`} /> : <path key={i} d={`M${xo},${cy + s * 0.01} L${xi},${cy + s * 0.015}`} />;
      default: return null;
    }
  })}</g>;
};
const MouthCB: React.FC<{m: string; s: number; open: number; ox: number; t: number}> = ({m, s, open, ox, t}) => {
  const cx = s / 2 + ox * 0.9, cy = s * 0.715, w = s * 0.1, sw = s * 0.026;
  const dark = '#4a0d14', tongue = '#e2525f';
  const op = Math.max(0, Math.min(1, open));
  const talk = op > 0.08;
  // bocas abiertas (al hablar o por expresión)
  if (talk || ['D', 'O', 'grin', 'wail', 'laugh', 'grit'].includes(m)) {
    const ex = m === 'laugh' ? 0.6 + 0.35 * Math.abs(Math.sin(t * 13)) : m === 'D' ? 0.5 : m === 'O' ? 0.6 : m === 'wail' ? 0.75 : m === 'grin' ? 0.35 : m === 'grit' ? 0.28 : 0;
    const o = Math.max(op, ex);
    const h = s * 0.02 + s * 0.11 * o;
    if (m === 'O') { const r = w * (0.45 + 0.25 * o); return <ellipse cx={cx} cy={cy} rx={r} ry={h * 0.62} fill={dark} stroke={INK} strokeWidth={sw} />; }
    const ww = m === 'grin' ? w * 1.5 : m === 'grit' ? w * 1.3 : m === 'wail' ? w * 1.05 : w * (0.85 + o * 0.35);
    const sad = m === 'frown' || m === 'wail' || m === 'wavy';
    const y0 = cy - h * 0.3;
    const d = sad
      ? `M${cx - ww},${y0 + h * 0.75} Q${cx},${y0 - h * 0.45} ${cx + ww},${y0 + h * 0.75} Q${cx},${y0 + h * 1.15} ${cx - ww},${y0 + h * 0.75} Z`
      : m === 'smirk'
        ? `M${cx - ww},${y0 + h * 0.15} Q${cx},${y0 + h * 0.05} ${cx + ww},${y0 - h * 0.25} Q${cx + ww * 0.5},${y0 + h * 1.15} ${cx - ww * 0.2},${y0 + h * 1.0} Q${cx - ww * 0.8},${y0 + h * 0.8} ${cx - ww},${y0 + h * 0.15} Z`
        : `M${cx - ww},${y0} Q${cx},${y0 + h * 0.15} ${cx + ww},${y0} Q${cx + ww * 0.85},${y0 + h * 1.25} ${cx},${y0 + h * 1.25} Q${cx - ww * 0.85},${y0 + h * 1.25} ${cx - ww},${y0} Z`;
    const id = `mcb${Math.round(s)}${m}${Math.round(o * 10)}`;
    const teeth = m === 'grin' || m === 'grit' || m === 'frown';
    return <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <path d={d} fill={dark} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={cx} cy={y0 + h * 1.25} rx={ww * 0.55} ry={h * 0.45} fill={tongue} />
        {teeth && <rect x={cx - ww} y={y0 - h} width={ww * 2} height={h * (m === 'grit' ? 2.4 : 1.3)} fill="#fff" />}
        {(m === 'grin' || m === 'grit') && [-0.5, 0, 0.5].map((f, i) => <line key={i} x1={cx + ww * f} y1={y0 - h} x2={cx + ww * f} y2={y0 + h * 2} stroke={INK} strokeWidth={sw * 0.5} />)}
        {m === 'grit' && <line x1={cx - ww} y1={y0 + h * 0.55} x2={cx + ww} y2={y0 + h * 0.55} stroke={INK} strokeWidth={sw * 0.6} />}
      </g>
    </g>;
  }
  if (m === 'smile') return <path d={`M${cx - w * 0.7},${cy - w * 0.05} Q${cx},${cy + w * 0.5} ${cx + w * 0.7},${cy - w * 0.05}`} fill="none" stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" />;
  if (m === 'smirk') return <path d={`M${cx - w * 0.6},${cy + w * 0.1} Q${cx + w * 0.1},${cy + w * 0.35} ${cx + w * 0.75},${cy - w * 0.25}`} fill="none" stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" />;
  if (m === 'frown') return <path d={`M${cx - w * 0.65},${cy + w * 0.3} Q${cx},${cy - w * 0.3} ${cx + w * 0.65},${cy + w * 0.3}`} fill="none" stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" />;
  if (m === 'wavy') return <path d={`M${cx - w * 0.75},${cy} ${[0, 1, 2, 3].map((i) => `L${cx - w * 0.75 + w * 0.375 * (i + 1)},${cy + (i % 2 ? -1 : 1) * w * 0.15}`).join(' ')}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
  if (m === 'tongue') return <g><path d={`M${cx - w * 0.6},${cy} L${cx + w * 0.6},${cy}`} stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" /><path d={`M${cx + w * 0.05},${cy} q0,${w * 0.5} ${w * 0.28},${w * 0.45} q${w * 0.22},0 ${w * 0.18},${-w * 0.45}`} fill={tongue} stroke={INK} strokeWidth={sw * 0.8} /></g>;
  if (m === 'o') return <ellipse cx={cx} cy={cy} rx={w * 0.22} ry={w * 0.26} fill={dark} stroke={INK} strokeWidth={sw * 0.8} />;
  return null;
};

export const Ball2: React.FC<{k: number; size: number; expr: Expr; open?: number; look?: number; rot?: number; t: number; seed?: number; flash?: number; sx?: number; sy?: number; gray?: number}> = ({k, size, expr, open = 0, look = 0, rot = 0, t, seed = 0, flash = 0, sx = 1, sy = 1, gray = 0}) => {
  const s = size; const w = s * 1.06;
  const ph = (t + seed * 0.731) % (3.1 + (seed % 7) * 0.17);
  const blink = ph < 0.11;
  const F = XF[expr] || XF.normal;
  const ox = look * s * 0.15;
  return (
    <div style={{position: 'absolute', left: -w / 2, top: -s / 2, width: w, height: s, transform: `rotate(${rot}deg) scale(${sx},${sy})`, transformOrigin: '50% 100%'}}>
      {expr === 'evil' && [0, 1].map((i) => <div key={'h' + i} style={{position: 'absolute', left: w * (i ? 0.64 : 0.16), top: -s * 0.16, width: s * 0.2, height: s * 0.3, background: 'linear-gradient(#ff3a1a, #7a0000)', clipPath: i ? 'polygon(10% 100%, 100% 0%, 90% 100%)' : 'polygon(10% 100%, 0% 0%, 90% 100%)'}} />)}
      <div style={{position: 'absolute', inset: 0, borderRadius: '50% 50% 47% 47% / 55% 55% 45% 45%', overflow: 'hidden', border: `${Math.max(2.5, s * 0.026)}px solid ${INK}`, filter: gray > 0 ? `grayscale(${gray}) brightness(${1 - 0.25 * gray})` : undefined}}>
        <FlagCanvas k={k} w={w} h={s} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 45% at 50% 112%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0) 100%), radial-gradient(ellipse at 45% 40%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.22) 100%)'}} />
        {expr === 'evil' && <div style={{position: 'absolute', inset: 0, background: 'rgba(120,0,0,0.25)'}} />}
        {(expr === 'happy' || expr === 'laugh' || expr === 'proud') && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${30 + look * 15}% 62%, rgba(255,90,120,0.45) 0%, rgba(255,90,120,0) 9%), radial-gradient(circle at ${70 + look * 15}% 62%, rgba(255,90,120,0.45) 0%, rgba(255,90,120,0) 9%)`}} />}
        {(expr === 'furious' || expr === 'angry') && <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(200,0,0,0.0) 30%, rgba(200,0,0,0.18))'}} />}
        {(expr === 'scared' || expr === 'shock') && <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(60,90,200,0.32), rgba(60,90,200,0) 45%)'}} />}
        {flash > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} />}
      </div>
      <svg width={w} height={s} viewBox={`${(s - w) / 2} 0 ${w} ${s}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <EyesCB e={F.e} s={s} look={look} blink={blink} t={t} />
        <Brows b={F.b} s={s} ox={ox} t={t} />
        <MouthCB m={F.m} s={s} open={open} ox={ox} t={t} />
        {expr === 'cry' && [0, 1].map((i) => { const x = s / 2 + (i ? 1 : -1) * s * 0.132 + ox; return <path key={i} d={`M${x},${s * 0.53} L${x},${s * (0.6 + 0.35 * ((t * 1.7 + i * 0.4) % 1))}`} stroke="#6cc4ff" strokeWidth={s * 0.055} strokeLinecap="round" opacity={0.9} />; })}
        {(expr === 'scared' || expr === 'shock') && <path d={`M${s * 0.88},${s * 0.2} q${s * 0.05},${s * 0.09} 0,${s * 0.13} q${-s * 0.05},${-s * 0.04} 0,${-s * 0.13} Z`} fill="#bfe6ff" stroke={INK} strokeWidth={s * 0.012} />}
        {(expr === 'angry' || expr === 'furious') && <g transform={`translate(${s * 0.86},${s * 0.14}) scale(${s / 200 * (1 + 0.12 * Math.sin(t * 10))})`}><path d="M-14,-4 Q-4,-4 -4,-14 M4,-14 Q4,-4 14,-4 M14,4 Q4,4 4,14 M-4,14 Q-4,4 -14,4" fill="none" stroke="#e0161b" strokeWidth={6} strokeLinecap="round" /></g>}
        {expr === 'sleepy' && <text x={s * 0.85} y={s * 0.08 - ((t * 20) % 20)} fontFamily="Lilita" fontSize={s * 0.22} fill="#fff" stroke={INK} strokeWidth={s * 0.02} paintOrder="stroke">z</text>}
      </svg>
    </div>
  );
};

export const Gun: React.FC<{w: number; flip: boolean; recoil: number; fire: boolean; hand?: string}> = ({w, flip, recoil, fire, hand = '#d33'}) => {
  // AK estilo countryball: madera + metal, sujetado con dos manitas. Coordenadas: largo 100 apuntando a la derecha.
  const k = w / 100;
  return (
    <svg width={w * 1.5} height={w * 0.7} viewBox="-75 -35 150 70" style={{position: 'absolute', left: -w * 0.75, top: -w * 0.35, overflow: 'visible', transform: `scaleX(${flip ? -1 : 1}) translateX(${-recoil * w * 0.07}px) rotate(${-recoil * 5}deg)`}}>
      <g stroke={INK} strokeWidth={2.2 / Math.max(0.6, k * 0.9)} strokeLinejoin="round">
        <path d="M-52,-3 L-24,-6 L-24,4 L-50,13 Q-55,13 -55,9 Z" fill="#a8602a" />
        <path d="M-50,8 L-26,1" stroke="#7a4219" strokeWidth={1.2} fill="none" />
        <rect x={-25} y={-8} width={38} height={10} rx={1.5} fill="#5d636b" />
        <path d="M-15,1 L-10,1 L-13,13 L-18,12 Z" fill="#6b3b18" />
        <path d="M-3,2 L6,2 Q9,12 15,19 L7,22 Q0,13 -3,2 Z" fill="#c9762f" />
        <rect x={13} y={-7} width={19} height={7} rx={1.5} fill="#b8692c" />
        <rect x={12} y={-10} width={22} height={3} fill="#4a4f56" />
        <rect x={32} y={-5.5} width={20} height={3} fill="#3c4046" />
        <rect x={47} y={-9} width={2.5} height={4} fill="#3c4046" />
      </g>
      <circle cx={-13} cy={6} r={6.5} fill={hand} stroke={INK} strokeWidth={2} />
      <circle cx={22} cy={2} r={6.5} fill={hand} stroke={INK} strokeWidth={2} />
      {fire && <g transform="translate(55,-4)"><path d="M0,0 L10,-9 L9,-2 L24,-4 L11,2 L22,10 L7,5 L3,13 Z" fill="#ffe36a" stroke="#ff8a00" strokeWidth={1.5} /><circle r={4} fill="#fff" /></g>}
    </svg>
  );
};
