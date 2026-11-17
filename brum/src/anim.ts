// Utilidades de animación: easing, interpolación y cámara suave.
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
export const easeOutBack = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const easeOutElastic = (x: number) =>
  x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
// rebote amortiguado: sube y baja con oscilación que se apaga (para squash)
export const damped = (t: number, freq = 3, decay = 5) => (t < 0 ? 0 : Math.exp(-decay * t) * Math.sin(2 * Math.PI * freq * t));

export type V3 = [number, number, number];
export type CamKey = {t: number; pos: V3; at: V3; fov: number};

// Interpolación monótona (PCHIP) sobre una lista de valores en tiempos ts: sin rebasar y con velocidad continua
function pchip(ts: number[], ys: number[], t: number): number {
  const n = ts.length;
  if (t <= ts[0]) return ys[0];
  if (t >= ts[n - 1]) return ys[n - 1];
  let i = 0;
  while (i < n - 2 && t > ts[i + 1]) i++;
  const h = (k: number) => ts[k + 1] - ts[k];
  const d = (k: number) => (ys[k + 1] - ys[k]) / h(k);
  const m = (k: number) => {
    if (k === 0) return 0; // salida suave del primer key
    if (k === n - 1) return 0;
    const d0 = d(k - 1), d1 = d(k);
    if (d0 * d1 <= 0) return 0;
    const w1 = 2 * h(k) + h(k - 1), w2 = h(k) + 2 * h(k - 1);
    return (w1 + w2) / (w1 / d0 + w2 / d1);
  };
  const hh = h(i), s = (t - ts[i]) / hh;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return h00 * ys[i] + h10 * hh * m(i) + h01 * ys[i + 1] + h11 * hh * m(i + 1);
}

export function camAt(keys: CamKey[], t: number): {pos: V3; at: V3; fov: number} {
  const ts = keys.map((k) => k.t);
  const c = (f: (k: CamKey) => number) => pchip(ts, keys.map(f), t);
  return {
    pos: [c((k) => k.pos[0]), c((k) => k.pos[1]), c((k) => k.pos[2])],
    at: [c((k) => k.at[0]), c((k) => k.at[1]), c((k) => k.at[2])],
    fov: c((k) => k.fov),
  };
}

// Catmull-Rom centrípeta simple para trayectorias de vehículos
export function catmull(pts: V3[], u: number): V3 {
  const n = pts.length - 1;
  const x = clamp(u) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const s = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])];
}

// ruido determinista
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// boca al hablar: apertura 0..1 a ~3.8 sílabas/s, con variación
export const talk = (t: number, windows: [number, number][]) => {
  for (const [a, b] of windows) {
    if (t >= a && t <= b) {
      const env = clamp((t - a) / 0.06) * clamp((b - t) / 0.08);
      const v = Math.abs(Math.sin(t * Math.PI * 3.8)) * (0.55 + 0.45 * hash(Math.floor(t * 7.6)));
      return env * (0.25 + 0.75 * v);
    }
  }
  return 0;
};

// parpadeo automático: lista de instantes; devuelve 0..1 de cierre
export const blinkAt = (t: number, times: number[]) => {
  for (const b of times) {
    const d = t - b;
    if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
  }
  return 0;
};
