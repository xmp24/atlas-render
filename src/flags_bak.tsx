import React from 'react';

// Banderas simplificadas dibujadas en una caja w x h (coordenadas locales)
type F = {w: number; h: number};
const H3 = ({w, h, c}: F & {c: string[]}) => (
  <>{c.map((col, i) => <rect key={i} x={0} y={(h / c.length) * i} width={w} height={h / c.length + 0.5} fill={col} />)}</>
);
const V3 = ({w, h, c}: F & {c: string[]}) => (
  <>{c.map((col, i) => <rect key={i} x={(w / c.length) * i} y={0} width={w / c.length + 0.5} height={h} fill={col} />)}</>
);
const Nordic = ({w, h, bg, cross, inner}: F & {bg: string; cross: string; inner?: string}) => {
  const t = Math.min(w, h) * 0.2, cx = w * 0.36, cy = h / 2;
  return (
    <>
      <rect width={w} height={h} fill={bg} />
      <rect x={0} y={cy - t / 2} width={w} height={t} fill={cross} />
      <rect x={cx - t / 2} y={0} width={t} height={h} fill={cross} />
      {inner && <><rect x={0} y={cy - t / 4} width={w} height={t / 2} fill={inner} /><rect x={cx - t / 4} y={0} width={t / 2} height={h} fill={inner} /></>}
    </>
  );
};

const star5 = (cx: number, cy: number, r: number, fill: string, k: number | string = 0) => <polygon key={k} points={Array.from({length: 10}).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.42 : r; return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`; }).join(' ')} fill={fill} />;
export const FLAG_OF: Record<string, string> = {
  Russia: 'ru', Kaliningrad: 'ru', Belarus: 'by', Poland: 'pl', Lithuania: 'lt', Latvia: 'lv', Estonia: 'ee',
  Finland: 'fi', Sweden: 'se', Norway: 'no', Denmark: 'dk', Germany: 'de', France: 'fr', Italy: 'it', Spain: 'es',
  'United Kingdom': 'gb', Netherlands: 'nl', Belgium: 'be', Ireland: 'ie', Portugal: 'pt', Austria: 'at',
  Czechia: 'cz', Slovakia: 'sk', Hungary: 'hu', Romania: 'ro', Bulgaria: 'bg', Greece: 'gr', Ukraine: 'ua',
  Luxembourg: 'lu', Croatia: 'hr', Slovenia: 'si', Switzerland: 'ch', Turkey: 'tr',
  'North Korea': 'kp',
};

export const Flag: React.FC<F & {code: string}> = ({code, w, h}) => {
  switch (code) {
    case 'ru': return <H3 w={w} h={h} c={['#ffffff', '#1c57a5', '#d52b1e']} />;
    case 'by': return <><rect width={w} height={h * 0.66} fill="#c8313e" /><rect y={h * 0.66} width={w} height={h * 0.34} fill="#4aa657" /><rect width={w * 0.08} height={h} fill="#ffffff" /><rect x={w * 0.02} width={w * 0.04} height={h} fill="#c8313e" opacity={0.7} /></>;
    case 'pl': return <H3 w={w} h={h} c={['#ffffff', '#dc143c']} />;
    case 'lt': return <H3 w={w} h={h} c={['#fdb913', '#006a44', '#c1272d']} />;
    case 'lv': return <><rect width={w} height={h} fill="#9e3039" /><rect y={h * 0.4} width={w} height={h * 0.2} fill="#ffffff" /></>;
    case 'ee': return <H3 w={w} h={h} c={['#0072ce', '#1a1a1a', '#ffffff']} />;
    case 'fi': return <Nordic w={w} h={h} bg="#ffffff" cross="#003580" />;
    case 'se': return <Nordic w={w} h={h} bg="#006aa7" cross="#fecc00" />;
    case 'no': return <Nordic w={w} h={h} bg="#ba0c2f" cross="#ffffff" inner="#00205b" />;
    case 'dk': return <Nordic w={w} h={h} bg="#c8102e" cross="#ffffff" />;
    case 'de': return <H3 w={w} h={h} c={['#1a1a1a', '#dd0000', '#ffce00']} />;
    case 'fr': return <V3 w={w} h={h} c={['#0055a4', '#ffffff', '#ef4135']} />;
    case 'it': return <V3 w={w} h={h} c={['#009246', '#ffffff', '#ce2b37']} />;
    case 'es': return <><rect width={w} height={h} fill="#c60b1e" /><rect y={h * 0.25} width={w} height={h * 0.5} fill="#ffc400" /></>;
    case 'gb': {
      const t = Math.min(w, h);
      return (
        <>
          <rect width={w} height={h} fill="#012169" />
          <path d={`M0,0L${w},${h}M${w},0L0,${h}`} stroke="#ffffff" strokeWidth={t * 0.2} />
          <path d={`M0,0L${w},${h}M${w},0L0,${h}`} stroke="#c8102e" strokeWidth={t * 0.07} />
          <rect x={0} y={h / 2 - t * 0.12} width={w} height={t * 0.24} fill="#ffffff" />
          <rect x={w / 2 - t * 0.12} y={0} width={t * 0.24} height={h} fill="#ffffff" />
          <rect x={0} y={h / 2 - t * 0.07} width={w} height={t * 0.14} fill="#c8102e" />
          <rect x={w / 2 - t * 0.07} y={0} width={t * 0.14} height={h} fill="#c8102e" />
        </>
      );
    }
    case 'nl': return <H3 w={w} h={h} c={['#ae1c28', '#ffffff', '#21468b']} />;
    case 'lu': return <H3 w={w} h={h} c={['#ed2939', '#ffffff', '#00a1de']} />;
    case 'be': return <V3 w={w} h={h} c={['#1a1a1a', '#fdda24', '#ef3340']} />;
    case 'ie': return <V3 w={w} h={h} c={['#169b62', '#ffffff', '#ff883e']} />;
    case 'pt': return <><rect width={w} height={h} fill="#da291c" /><rect width={w * 0.4} height={h} fill="#046a38" /><circle cx={w * 0.4} cy={h / 2} r={Math.min(w, h) * 0.14} fill="#ffe900" /></>;
    case 'at': return <H3 w={w} h={h} c={['#c8102e', '#ffffff', '#c8102e']} />;
    case 'cz': return <><H3 w={w} h={h} c={['#ffffff', '#d7141a']} /><path d={`M0,0L${w * 0.45},${h / 2}L0,${h}Z`} fill="#11457e" /></>;
    case 'sk': return <H3 w={w} h={h} c={['#ffffff', '#0b4ea2', '#ee1c25']} />;
    case 'hu': return <H3 w={w} h={h} c={['#ce2939', '#ffffff', '#477050']} />;
    case 'ro': return <V3 w={w} h={h} c={['#002b7f', '#fcd116', '#ce1126']} />;
    case 'bg': return <H3 w={w} h={h} c={['#ffffff', '#00966e', '#d62612']} />;
    case 'hr': return <H3 w={w} h={h} c={['#ff0000', '#ffffff', '#171796']} />;
    case 'si': return <H3 w={w} h={h} c={['#ffffff', '#005da4', '#ed1c24']} />;
    case 'ua': return <H3 w={w} h={h} c={['#0057b7', '#ffd700']} />;
    case 'gr': {
      const s = h / 9;
      return (
        <>
          {Array.from({length: 9}).map((_, i) => <rect key={i} y={i * s} width={w} height={s + 0.5} fill={i % 2 ? '#ffffff' : '#0d5eaf'} />)}
          <rect width={s * 5} height={s * 5} fill="#0d5eaf" />
          <rect x={0} y={s * 2} width={s * 5} height={s} fill="#ffffff" />
          <rect x={s * 2} y={0} width={s} height={s * 5} fill="#ffffff" />
        </>
      );
    }
    case 'ch': { const m = Math.min(w, h); return <><rect width={w} height={h} fill="#da291c" /><rect x={w / 2 - m * 0.08} y={h / 2 - m * 0.28} width={m * 0.16} height={m * 0.56} fill="#fff" /><rect x={w / 2 - m * 0.28} y={h / 2 - m * 0.08} width={m * 0.56} height={m * 0.16} fill="#fff" /></>; }
    case 'tr': { const m = Math.min(w, h); return <><rect width={w} height={h} fill="#e30a17" /><circle cx={w * 0.42} cy={h / 2} r={m * 0.22} fill="#fff" /><circle cx={w * 0.46} cy={h / 2} r={m * 0.18} fill="#e30a17" /></>; }
    case 'ca': {
      const m = Math.min(w, h);
      return (
        <>
          <rect width={w} height={h} fill="#fff" />
          <rect width={w * 0.25} height={h} fill="#d52b1e" />
          <rect x={w * 0.75} width={w * 0.25} height={h} fill="#d52b1e" />
          <path d={`M${w / 2},${h / 2 - m * 0.3} L${w / 2 + m * 0.12},${h / 2 - m * 0.05} L${w / 2 + m * 0.26},${h / 2 - m * 0.1} L${w / 2 + m * 0.18},${h / 2 + m * 0.12} L${w / 2 + m * 0.03},${h / 2 + m * 0.12} L${w / 2 + m * 0.03},${h / 2 + m * 0.3} L${w / 2 - m * 0.03},${h / 2 + m * 0.3} L${w / 2 - m * 0.03},${h / 2 + m * 0.12} L${w / 2 - m * 0.18},${h / 2 + m * 0.12} L${w / 2 - m * 0.26},${h / 2 - m * 0.1} L${w / 2 - m * 0.12},${h / 2 - m * 0.05} Z`} fill="#d52b1e" />
        </>
      );
    }
    case 'kp': {
      const m = Math.min(w, h);
      const star = Array.from({length: 10}).map((_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? m * 0.07 : m * 0.17;
        return `${w * 0.36 + Math.cos(a) * rr},${h / 2 + Math.sin(a) * rr}`;
      }).join(' ');
      return (
        <>
          <rect width={w} height={h} fill="#024fa2" />
          <rect y={h * 0.17} width={w} height={h * 0.66} fill="#ffffff" />
          <rect y={h * 0.21} width={w} height={h * 0.58} fill="#ed1c27" />
          <circle cx={w * 0.36} cy={h / 2} r={m * 0.2} fill="#ffffff" />
          <polygon points={star} fill="#ed1c27" />
        </>
      );
    }
    case 'cn': {
      const st = (cx: number, cy: number, r: number, k: number) => <polygon key={k} points={Array.from({length: 10}).map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.4 : r; return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`; }).join(' ')} fill="#ffde00" />;
      return <><rect width={w} height={h} fill="#de2910" />{st(w * 0.17, h * 0.27, h * 0.15, 0)}{[[0.33, 0.1], [0.4, 0.2], [0.4, 0.35], [0.33, 0.45]].map(([x, y], i) => st(w * x, h * y, h * 0.05, i + 1))}</>;
    }
    case 'us': return (
      <>
        {Array.from({length: 13}).map((_, i) => <rect key={i} y={(h / 13) * i} width={w} height={h / 13 + 0.5} fill={i % 2 ? '#ffffff' : '#b22234'} />)}
        <rect width={w * 0.42} height={(h / 13) * 7} fill="#3c3b6e" />
        {Array.from({length: 20}).map((_, i) => <circle key={`s${i}`} cx={w * 0.42 * ((i % 5) + 0.5) / 5} cy={((h / 13) * 7) * (Math.floor(i / 5) + 0.5) / 4} r={Math.min(w, h) * 0.022} fill="#fff" />)}
      </>
    );
    case 'gl': return <><rect width={w} height={h / 2} fill="#fff" /><rect y={h / 2} width={w} height={h / 2} fill="#d00c33" /><path d={`M${w * 0.15},${h / 2} A${h * 0.3},${h * 0.3} 0 0 1 ${w * 0.15 + h * 0.6},${h / 2} Z`} fill="#d00c33" /><path d={`M${w * 0.15},${h / 2} A${h * 0.3},${h * 0.3} 0 0 0 ${w * 0.15 + h * 0.6},${h / 2} Z`} fill="#fff" /></>;
    case 'ir': return <><H3 w={w} h={h} c={['#239f40', '#ffffff', '#da0000']} /><circle cx={w / 2} cy={h / 2} r={h * 0.11} fill="none" stroke="#da0000" strokeWidth={h * 0.04} /><rect x={w / 2 - h * 0.02} y={h * 0.36} width={h * 0.04} height={h * 0.28} fill="#da0000" /></>;
    case 'tw': return <><rect width={w} height={h} fill="#fe0000" /><rect width={w / 2} height={h / 2} fill="#000095" /><circle cx={w / 4} cy={h / 4} r={h * 0.12} fill="#fff" /><circle cx={w / 4} cy={h / 4} r={h * 0.07} fill="#000095" /><circle cx={w / 4} cy={h / 4} r={h * 0.055} fill="#fff" /></>;
    case 'jp': return <><rect width={w} height={h} fill="#fff" /><circle cx={w / 2} cy={h / 2} r={h * 0.3} fill="#bc002d" /></>;
    case 'il': return <><rect width={w} height={h} fill="#fff" /><rect y={h * 0.1} width={w} height={h * 0.13} fill="#0038b8" /><rect y={h * 0.77} width={w} height={h * 0.13} fill="#0038b8" /><polygon points={`${w / 2},${h * 0.32} ${w / 2 + h * 0.15},${h * 0.58} ${w / 2 - h * 0.15},${h * 0.58}`} fill="none" stroke="#0038b8" strokeWidth={h * 0.035} /><polygon points={`${w / 2},${h * 0.68} ${w / 2 + h * 0.15},${h * 0.42} ${w / 2 - h * 0.15},${h * 0.42}`} fill="none" stroke="#0038b8" strokeWidth={h * 0.035} /></>;
    case 'sa': return <><rect width={w} height={h} fill="#006c35" /><rect x={w * 0.25} y={h * 0.32} width={w * 0.5} height={h * 0.08} rx={h * 0.03} fill="#fff" /><rect x={w * 0.25} y={h * 0.62} width={w * 0.5} height={h * 0.04} fill="#fff" /></>;
    case 'ph': return <><rect width={w} height={h / 2} fill="#0038a8" /><rect y={h / 2} width={w} height={h / 2} fill="#ce1126" /><polygon points={`0,0 ${w * 0.43},${h / 2} 0,${h}`} fill="#fff" /><circle cx={w * 0.14} cy={h / 2} r={h * 0.09} fill="#fcd116" /></>;
    case 'ye': return <H3 w={w} h={h} c={['#ce1126', '#ffffff', '#000000']} />;
    case 'qa': return <><rect width={w} height={h} fill="#8d1b3d" /><rect width={w * 0.3} height={h} fill="#fff" /><path d={Array.from({length: 9}).map((_, i) => `${i ? 'L' : 'M'}${w * 0.3},${(h / 9) * i} L${w * 0.38},${(h / 9) * (i + 0.5)}`).join(' ') + ` L${w * 0.3},${h} Z`} fill="#fff" /></>;
    case 'ae': return <><H3 w={w} h={h} c={['#00732f', '#ffffff', '#000000']} /><rect width={w * 0.26} height={h} fill="#ff0000" /></>;
    case 'lb': return <><H3 w={w} h={h} c={['#ed1c24', '#ffffff', '#ffffff', '#ed1c24']} /><polygon points={`${w / 2},${h * 0.3} ${w / 2 + h * 0.16},${h * 0.66} ${w / 2 - h * 0.16},${h * 0.66}`} fill="#00a651" /></>;
    case 'iq': return <H3 w={w} h={h} c={['#ce1126', '#ffffff', '#000000']} />;
    case 'kw': return <><H3 w={w} h={h} c={['#007a3d', '#ffffff', '#ce1126']} /><polygon points={`0,0 ${w * 0.25},${h / 3} ${w * 0.25},${h * 2 / 3} 0,${h}`} fill="#000" /></>;
    case 'om': return <><H3 w={w} h={h} c={['#ffffff', '#db161b', '#008000']} /><rect width={w * 0.27} height={h} fill="#db161b" /></>;
    case 'kr': return <><rect width={w} height={h} fill="#fff" /><circle cx={w / 2} cy={h / 2} r={h * 0.22} fill="#cd2e3a" /><path d={`M${w / 2 - h * 0.22},${h / 2} A${h * 0.11},${h * 0.11} 0 0 0 ${w / 2},${h / 2} A${h * 0.11},${h * 0.11} 0 0 1 ${w / 2 + h * 0.22},${h / 2} A${h * 0.22},${h * 0.22} 0 0 1 ${w / 2 - h * 0.22},${h / 2} Z`} fill="#0047a0" /></>;
    case 'is': return <Nordic w={w} h={h} bg="#02529c" cross="#ffffff" inner="#dc1e35" />;
    case 'tna': return <><rect width={w} height={h} fill="#6b3fc4" /><rect y={h * 0.62} width={w} height={h * 0.12} fill="#fff" /><rect y={h * 0.8} width={w} height={h * 0.08} fill="#fff" />{star5(w * 0.28, h * 0.36, h * 0.24, '#fff')}{star5(w * 0.62, h * 0.3, h * 0.1, '#ffd23f', 1)}{star5(w * 0.8, h * 0.3, h * 0.1, '#ffd23f', 2)}</>;
    case 'tsa': return <><rect width={w} height={h} fill="#1f9e55" /><polygon points={`0,${h} ${w * 0.35},${h} ${w},0 ${w * 0.65},0`} fill="#ffd23f" />{star5(w * 0.2, h * 0.28, h * 0.17, '#fff')}<circle cx={w * 0.78} cy={h * 0.72} r={h * 0.14} fill="#1d56c9" stroke="#fff" strokeWidth={h * 0.03} /></>;
    case 'teu': return <Flag code="eu" w={w} h={h} />;
    case 'taf': return <><H3 w={w} h={h} c={['#d42a24', '#ffc21a', '#1f9e55']} />{star5(w / 2, h / 2, h * 0.26, '#111')}</>;
    case 'tas': return <><rect width={w} height={h} fill="#d42a24" />{Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <polygon key={i} points={`${w / 2},${h / 2} ${w / 2 + Math.cos(a - 0.12) * h},${h / 2 + Math.sin(a - 0.12) * h} ${w / 2 + Math.cos(a + 0.12) * h},${h / 2 + Math.sin(a + 0.12) * h}`} fill="#e8473d" />; })}<circle cx={w / 2} cy={h / 2} r={h * 0.26} fill="#ffd23f" /></>;
    case 'toc': return <><rect width={w} height={h} fill="#14a3b3" /><path d={`M0,${h * 0.78} Q${w * 0.25},${h * 0.66} ${w * 0.5},${h * 0.78} T${w},${h * 0.78} V${h} H0 Z`} fill="#0b6f86" />{[[0.3, 0.2], [0.42, 0.45], [0.3, 0.62], [0.18, 0.4], [0.36, 0.36]].map(([x, y], i) => star5(w * x, h * y, h * (i === 4 ? 0.05 : 0.09), '#fff', i))}{star5(w * 0.72, h * 0.32, h * 0.16, '#ffd23f', 9)}</>;
    case 'eu': {
      const r = Math.min(w, h) * 0.32;
      return (
        <>
          <rect width={w} height={h} fill="#003399" />
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={w / 2 + Math.cos(a) * r} cy={h / 2 + Math.sin(a) * r} r={Math.min(w, h) * 0.05} fill="#ffcc00" />;
          })}
        </>
      );
    }
    default: return <rect width={w} height={h} fill="#efe3c8" />;
  }
};
