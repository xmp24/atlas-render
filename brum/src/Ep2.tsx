import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/lilita-one';
import {Bruno2, B2Pose, Mouth} from './Bruno2';
import {GiftBox, BoxPose} from './GiftBox';
import {Town, Sky} from './Town';
import {prog, lerp, clamp, easeInOut, easeOut, easeIn, easeOutBack, damped, hash, catmull, V3} from './anim';
import {Puffs, Sparkles, Confetti, Ring, Dizzy, Zzz, Car, Birds, Rising, Bunting, Butterflies} from './fx';
import {zTex} from './tex';
import VO from './vo.json';

const vo = VO as Record<string, {t: number; d: number}>;
const S = (k: string) => vo[k].t;
const E = (k: string) => vo[k].t + vo[k].d;
const BTALK: [number, number][] = Object.keys(vo).filter((k) => k[0] === 'b').map((k) => [S(k), E(k)]);

// eventos clave (s)
const K = {land: 4.0, pums: [11.8, 12.5, 13.2], lid: 14.0, open: 14.3, wake: 25.6, hero: 30.2, naranja: 36.8, bonk: 39.8,
  rev: 43.2, go: 43.8, m2: 45.3, m3: 46.8, m4: 48.3, m5: 49.6, stop: 51.0, door: 53.5, help: S('x1'), turn: S('x1') + 0.25};

// ---------------- utilidades de plano ----------------
type Cam = {pos: V3; at: V3; fov: number};
const mix3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const dolly = (p0: V3, a0: V3, f0: number, p1: V3, a1: V3, f1: number, ease = easeInOut) => (u: number): Cam => {
  const e = ease(u);
  return {pos: mix3(p0, p1, e), at: mix3(a0, a1, e), fov: lerp(f0, f1, e)};
};
type Shot = {t0: number; t1: number; f: (u: number, t: number) => Cam};

// ---------------- caja ----------------
const bounceOut = (x: number) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};
const boxY = (t: number) => (t >= K.land ? 0 : 46 * Math.pow(1 - clamp(t / K.land), 1.25));
function boxPose(t: number): BoxPose {
  let y = boxY(t);
  let sy = 1 - 0.22 * damped(t - K.land, 2.6, 5);
  let shake = 0;
  K.pums.forEach((p, i) => {
    const k = 0.7 + i * 0.3;
    shake += 0.07 * k * damped(t - p, 7, 7);
    sy -= 0.09 * k * damped(t - p, 4, 8);
    y += Math.abs(damped(t - p, 3, 8)) * 0.35 * k;
  });
  return {
    y, sy, shake, sway: Math.sin(t * 2.4) * 0.08 * (1 - clamp(t / K.land)),
    chute: 1 - easeInOut(prog(t, K.land, K.land + 0.8)), chuteGone: prog(t, K.land + 0.4, K.land + 1.8),
    lid: prog(t, K.lid, K.lid + 0.9), open: bounceOut(prog(t, K.open, K.open + 0.9)),
  };
}

// ---------------- Bruno ----------------
const RED_CAR = (t: number) => ({x: lerp(30, 8, prog(t, K.m4, K.m4 + 1.4)), z: -1.25});

function brunoAt(t: number): B2Pose {
  const p: B2Pose = {x: 0, y: 0.16, z: 0, yaw: 0, eyeOpen: 1, mouth: 'smile', brow: 0, browTilt: 0};
  const talking = (() => { for (const [a, b] of BTALK) if (t >= a && t <= b) { const env = clamp((t - a) / 0.05) * clamp((b - t) / 0.06); return env * (0.3 + 0.7 * Math.abs(Math.sin(t * Math.PI * 4.6)) * (0.5 + 0.5 * hash(Math.floor(t * 9)))); } return 0; })();
  p.talk = talking;
  if (t < K.wake) {
    p.sleep = true; p.eyeOpen = 0.08; p.mouth = 'smile';
    p.sy = 1 + 0.025 * Math.sin((t * 2 * Math.PI) / 2.0);
    [S('c1'), S('c2'), S('c3')].forEach((c, i) => {
      const d = t - c;
      if (d > 0 && d < 0.4) p.eyeOpen = 0.08 + (0.25 + i * 0.12) * Math.sin((d / 0.4) * Math.PI);
      p.sy! -= (0.05 + i * 0.03) * damped(d, 3.5, 6);
    });
    p.lookX = 0;
    return p;
  }
  const w = t - K.wake;
  // despertar explosivo
  p.eyeOpen = 0.08 + 0.92 * easeOutBack(clamp(w / 0.18), 3);
  p.eyeScale = 1 + 0.35 * damped(w, 2.2, 3.5) * (w < 1.2 ? 1 : 0) + (w < 0.6 ? 0.25 * (1 - w / 0.6) : 0);
  const jt = prog(t, K.wake + 0.02, K.wake + 0.62);
  p.lift = jt > 0 && jt < 1 ? Math.sin(jt * Math.PI) * 1.5 : 0;
  p.sy = 1 + (jt > 0 && jt < 1 ? 0.14 * Math.sin(jt * Math.PI) : 0) - 0.25 * damped(t - (K.wake + 0.62), 3, 6);
  p.sx = p.sz = 1 + 0.12 * damped(t - (K.wake + 0.62), 3, 6);
  p.brow = 1; p.mouth = 'grin';
  p.beacon = 0;
  p.lookX = w > 0.6 && w < 1.4 ? Math.sin(w * 9) * 0.9 : 0;
  // saluda con el gancho mientras dice hola
  if (t > S('b1') && t < E('b1') + 0.4) { p.arm = 25 * Math.sin(prog(t, S('b1'), S('b1') + 0.3) * Math.PI / 2); p.hookSway = Math.sin(t * 9) * 0.5; }
  // pose de héroe: "la grúa más rápida"
  if (t > S('b2') - 0.2 && t < S('n8')) {
    p.brow = 0.2; p.browTilt = -0.4; p.mouth = 'grin'; p.beacon = 0.5 + 0.5 * Math.sin(t * 14);
    p.arm = 30 * prog(t, S('b2'), S('b2') + 0.3);
    const sp = easeInOut(prog(t, K.hero + 0.6, K.hero + 1.3));
    p.yaw = sp * Math.PI * 2; p.bodyRoll = Math.sin(sp * Math.PI) * 0.12;
    p.hookSway = 0.6 * Math.sin(sp * Math.PI * 2);
  }
  // pregunta del color: piensa
  if (t > S('n8') && t < S('n9')) {
    p.lookY = -0.9 * prog(t, S('n8') + 0.4, S('n8') + 0.7); p.lookX = 0.7 * Math.sin(t * 2.5);
    p.browTilt = 0.6; p.brow = 0.3; p.mouth = 'flat';
    if (t > S('b3')) { p.lookY = 0.8; p.lookX = -0.6; }
  }
  if (t > S('n9') && t < K.naranja) { p.brow = 1; p.mouth = 'o'; p.eyeScale = 1.1; p.sy = 1 + 0.03 * Math.sin(t * 20); }
  // ¡naranja!
  const nj = t - K.naranja;
  p.glow = nj > 0 ? Math.exp(-nj * 1.8) * (0.7 + 0.3 * Math.sin(nj * 16)) : 0;
  const hop = (h: number, d = 0.4, k = 0.7) => {
    const q = prog(t, h, h + d);
    if (q > 0 && q < 1) p.lift = (p.lift ?? 0) + Math.sin(q * Math.PI) * k;
    const s = damped(t - (h + d), 3, 7) * 0.16;
    p.sy = (p.sy ?? 1) - s; p.sx = (p.sx ?? 1) + s * 0.6; p.sz = p.sx;
  };
  if (nj > 0 && nj < 1.3) { p.mouth = 'grin'; p.brow = 1; p.eyeScale = 1.15; }
  hop(K.naranja + 0.02, 0.4, 0.9); hop(S('b4') + 0.1, 0.35, 0.5);
  // ¡bonk! naranja en la cabeza
  const bk = t - K.bonk;
  if (bk > 0 && bk < 1.1) { p.cross = 1; p.mouth = 'o'; p.eyeScale = 0.92; p.brow = -0.3; p.browTilt = 0.6; }
  p.sy = (p.sy ?? 1) - 0.22 * damped(bk, 3, 6);
  if (t > S('b5') && t < E('b5') + 0.2) { p.mouth = 'grin'; p.cross = 0; p.lift = (p.lift ?? 0) + Math.abs(Math.sin(t * 16)) * 0.12; p.roll = Math.sin(t * 16) * 0.05; p.eyeOpen = 0.35; }
  // ¡vámonos! acelera en el sitio
  if (t > S('b6') && t < K.go) { p.brow = 0.4; p.browTilt = -0.5; p.mouth = 'grin'; }
  if (t > K.rev && t < K.go) {
    const r = prog(t, K.rev, K.go);
    p.pitch = -0.08 * r + Math.sin(t * 40) * 0.012; p.wheel = (t - K.rev) * 45; p.beacon = 0.5 + 0.5 * Math.sin(t * 16);
    p.sx = 1 + Math.sin(t * 40) * 0.01;
  }
  // montaje conduciendo
  if (t >= K.go && t < K.stop) {
    p.y = 0; p.brow = 1; p.mouth = 'grin'; p.eyeScale = 1.08; p.beacon = 0.5 + 0.5 * Math.sin(t * 16);
    let a: V3 = [0, 0, 0], yaw = Math.PI / 2;
    if (t < K.m2) { const u = easeIn(prog(t, K.go, K.m2)) * 0.85 + prog(t, K.go, K.m2) * 0.15; a = mix3([0, 0, 0], [12, 0, 1.2], u); yaw = lerp(0, Math.PI / 2, easeOut(prog(t, K.go, K.go + 0.35))); p.pitch = 0.06 * damped(t - K.go, 1.5, 3); }
    else if (t < K.m3) { a = mix3([-32, 0, 1.2], [-12, 0, 1.2], prog(t, K.m2, K.m3)); }
    else if (t < K.m4) {
      const u = prog(t, K.m3, K.m4); a = mix3([1.2, 0, -7], [1.2, 0, -28], u); yaw = Math.PI;
      const z = a[2]; const j = clamp((-15.2 - z) / 5.8);
      if (j > 0 && j < 1) { a[1] = Math.sin(j * Math.PI) * 1.8; p.pitch = (0.5 - j) * 0.35; p.mouth = 'o'; p.eyeScale = 1.3; }
      p.sy = 1 - 0.2 * damped((-(z + 21)) / 13.3, 3, 5);
    }
    else if (t < K.m5) { a = mix3([4, 0, 1.2], [17, 0, 1.2], prog(t, K.m4, K.m5)); if (t > K.m4 + 0.6 && t < K.m4 + 1.0) p.lookX = -1; }
    else {
      const u = easeOut(prog(t, K.m5, K.stop));
      a = catmull([[11, 0, 1.2], [17.5, 0, 1.1], [20.3, 0, -1.4], [20, 0, -4.2]], u);
      yaw = Math.PI / 2 + (Math.PI / 2) * easeOutBack(prog(t, K.m5 + 0.4, K.stop), 2.2);
      p.roll = 0.1 * Math.sin(prog(t, K.m5 + 0.4, K.stop) * Math.PI);
    }
    p.x = a[0]; p.lift = (p.lift ?? 0) + a[1] + Math.abs(Math.sin(t * 15)) * 0.03; p.z = a[2]; p.yaw = yaw;
    p.wheel = t * 30;
    p.wheelBounce = [0, 1, 2, 3].map((i) => Math.max(0, Math.sin(t * 13 + i * 1.7)) * 0.04);
    p.hookSway = Math.sin(t * 6) * 0.35;
  }
  // en el garaje
  if (t >= K.stop) {
    p.x = 20; p.y = 0; p.z = -4.2; p.yaw = Math.PI;
    p.pitch = 0.1 * damped(t - K.stop, 1.8, 4);
    p.hookSway = 0.6 * damped(t - K.stop, 1.3, 1.8);
    p.lookY = t > S('b7') - 0.3 && t < K.door ? 0.8 : 0; p.browTilt = t < K.door ? 0.5 : 0; p.brow = t > K.door ? 1 : 0.4;
    p.mouth = t > K.door ? 'o' : 'smile';
    if (t > K.door) p.eyeScale = 1 + 0.25 * easeOutBack(prog(t, K.door, K.door + 0.3));
    if (t > S('b8')) p.mouth = 'grin';
    // ¡ayuda!: se gira de golpe
    if (t > K.help) {
      const st = t - K.help;
      p.eyeScale = 1.35 - 0.2 * prog(t, K.help + 0.8, K.help + 1.3); p.brow = 1; p.mouth = 'o';
      p.lift = st < 0.35 ? Math.sin((st / 0.35) * Math.PI) * 0.5 : 0;
      p.yaw = Math.PI + Math.PI * easeOutBack(prog(t, K.turn, K.turn + 0.45), 1.8);
      if (t > S('b9') - 0.2) { p.brow = 0.2; p.browTilt = -0.6; p.mouth = 'smile'; p.eyeScale = 1.05; p.beacon = 0.5 + 0.5 * Math.sin(t * 16); p.arm = 20; }
    }
  }
  if (t > K.wake + 0.8) {
    // parpadeos
    for (const b of [28.5, 32.6, 35.6, 38.9, 41.4, 45.9, 52.0, 55.6, 59.3]) { const d = t - b; if (d >= 0 && d < 0.14) p.eyeOpen = Math.min(p.eyeOpen, 1 - 0.94 * Math.sin((d / 0.14) * Math.PI)); }
  }
  return p;
}

// ---------------- planos (cortes rápidos) ----------------
const bx = (t: number) => brunoAt(t);
const SHOTS: Shot[] = [
  {t0: 0, t1: 2.2, f: (u, t) => ({pos: [-4, 1.2, 10], at: [0, Math.max(boxY(t) * 0.75, 4), 0], fov: 52})},
  {t0: 2.2, t1: 3.6, f: (u, t) => ({pos: [-8.5, boxY(t) + 1.2, 8], at: [0, boxY(t) + 1.6, 0], fov: 40})},
  {t0: 3.6, t1: 5.2, f: dolly([-10, 4.2, 13], [0, 1.8, 0], 40, [-8.6, 3.4, 11], [0, 1.8, 0], 38)},
  {t0: 5.2, t1: 6.6, f: dolly([-6, 7, 13], [0, 1.6, 0], 44, [-5, 16, 20], [1, 0, -4], 46)},
  {t0: 6.6, t1: 8.1, f: dolly([32, 9, 7], [20, 2.5, -12], 44, [13, 7, 3], [12, 0, -8], 46)},
  {t0: 8.1, t1: 9.6, f: dolly([-15, 8, -14], [0, 4, -32], 44, [11, 8.5, -17], [0, 4, -32], 46)},
  {t0: 9.6, t1: 11.2, f: dolly([0.5, 26, 5], [0, 1, 0], 46, [0.5, 8.5, 7], [0, 1.5, 0], 42, easeOut)},
  {t0: 11.2, t1: 11.8, f: dolly([4.5, 2.9, 9], [0, 1.6, 0], 40, [4.2, 2.8, 8.6], [0, 1.6, 0], 40)},
  {t0: 11.8, t1: 12.5, f: dolly([3, 2.4, 6.9], [0, 1.6, 0], 40, [2.8, 2.4, 6.5], [0, 1.6, 0], 40)},
  {t0: 12.5, t1: 13.2, f: dolly([-3.2, 2.2, 6.2], [0, 1.7, 0], 40, [-3, 2.1, 5.9], [0, 1.7, 0], 40)},
  {t0: 13.2, t1: 14.0, f: dolly([1.4, 2.0, 5.4], [0, 1.9, 0], 38, [1.2, 2.0, 5.0], [0, 1.9, 0], 38)},
  {t0: 14.0, t1: 15.2, f: dolly([5, 0.8, 9], [0, 3.8, 0], 48, [5.6, 1.6, 10.2], [0, 1.5, 0], 44, easeOut)},
  {t0: 15.2, t1: 17.5, f: dolly([3.4, 2.6, 7.4], [0, 1.4, 0.5], 36, [2.6, 2.2, 6.2], [0, 1.4, 0.6], 36)},
  {t0: 17.5, t1: 22.0, f: dolly([1.7, 2.0, 5.9], [0, 1.5, 0.9], 34, [0.9, 1.85, 5.0], [0, 1.5, 1.0], 34)},
  {t0: 22.0, t1: 23.0, f: dolly([-1.5, 1.9, 5.0], [0, 1.6, 1], 34, [-1.4, 1.9, 4.8], [0, 1.6, 1], 34)},
  {t0: 23.0, t1: 24.0, f: dolly([1.1, 1.8, 4.4], [0, 1.65, 1.1], 33, [1.0, 1.8, 4.2], [0, 1.65, 1.1], 33)},
  {t0: 24.0, t1: 25.0, f: dolly([0, 1.75, 3.9], [0, 1.7, 1.2], 32, [0, 1.75, 3.7], [0, 1.7, 1.2], 32)},
  {t0: 25.0, t1: 25.6, f: dolly([0, 1.75, 3.4], [0, 1.7, 1.4], 30, [0, 1.75, 3.2], [0, 1.7, 1.4], 29)},
  {t0: 25.6, t1: 27.0, f: dolly([0, 1.75, 3.6], [0, 1.7, 1], 30, [2.9, 2.9, 7.8], [0, 1.9, 0.4], 42, easeOut)},
  {t0: 27.0, t1: S('b2') - 0.1, f: dolly([2.3, 2.2, 6.4], [0, 1.65, 0.6], 36, [1.9, 2.1, 6.0], [0, 1.65, 0.6], 36)},
  {t0: S('b2') - 0.1, t1: S('n8'), f: dolly([2.8, 0.7, 4.7], [0, 2.0, 0.3], 44, [3.4, 0.9, 5.5], [0, 1.9, 0.3], 44)},
  {t0: S('n8'), t1: S('n9'), f: dolly([1.5, 2.0, 5.7], [0, 1.6, 0.9], 35, [1.1, 1.9, 5.2], [0, 1.6, 0.9], 35)},
  {t0: S('n9'), t1: K.naranja, f: dolly([0, 1.9, 4.9], [0, 1.65, 1], 34, [0, 1.85, 4.3], [0, 1.65, 1], 33)},
  {t0: K.naranja, t1: S('b4'), f: dolly([0, 2.2, 6.8], [0, 1.7, 0.6], 40, [0, 2.1, 6.1], [0, 1.7, 0.6], 37, easeOut)},
  {t0: S('b4'), t1: S('b6') - 0.1, f: dolly([2.5, 2.8, 6.8], [0, 2.0, 0.5], 38, [2.1, 2.9, 6.3], [0, 2.0, 0.5], 38)},
  {t0: S('b6') - 0.1, t1: K.go, f: dolly([-3.3, 1.0, 4.5], [0.4, 1.3, 0], 42, [-3.6, 1.1, 4.9], [0.4, 1.3, 0], 42)},
  {t0: K.go, t1: K.m2, f: (u, t) => { const b = bx(t); return {pos: [b.x - 2.5, 1.3, b.z + 5.2], at: [b.x + 1.2, 1.1, b.z], fov: 42}; }},
  {t0: K.m2, t1: K.m3, f: (u, t) => { const b = bx(t); return {pos: [-16, 1.0, 5.5], at: [b.x, 1.3, b.z], fov: 42}; }},
  {t0: K.m3, t1: K.m4, f: (u, t) => { const b = bx(t); return {pos: [8.5, 2.2, b.z + 1.5], at: [b.x, 1.4 + (b.lift ?? 0) * 0.6, b.z - 0.5], fov: 42}; }},
  {t0: K.m4, t1: K.m5, f: (u, t) => { const b = bx(t); return {pos: [b.x + 6.5, 0.9, 3.4], at: [b.x, 1.1, 0.2], fov: 42}; }},
  {t0: K.m5, t1: K.stop, f: dolly([13, 2.6, 7.5], [17, 1.2, 0], 42, [14.5, 2.4, 5.5], [20, 1.4, -2.5], 42)},
  {t0: K.stop, t1: S('n11'), f: dolly([15.8, 1.7, 1.0], [20, 2.5, -8], 42, [16.2, 1.8, 0.4], [20, 2.6, -8], 42)},
  {t0: S('n11'), t1: S('b8') - 0.1, f: dolly([17.2, 2.6, 1.6], [20, 2.8, -8.5], 44, [17.6, 3.0, 0.4], [20, 2.8, -8.5], 44)},
  {t0: S('b8') - 0.1, t1: K.help, f: dolly([20.6, 2.0, -8.1], [20, 1.6, -4.2], 40, [20.5, 2.0, -7.9], [20, 1.6, -4.2], 38)},
  {t0: K.help, t1: S('b9') - 0.1, f: dolly([23, 2.3, 0.6], [20, 1.6, -4.2], 40, [23.2, 2.3, 0.8], [20, 1.6, -4.2], 40)},
  {t0: S('b9') - 0.1, t1: 60.1, f: dolly([20.6, 2.0, 0.9], [20, 1.6, -3.5], 38, [20.4, 1.95, 0.3], [20, 1.65, -3.5], 34)},
];

function camAtT(t: number): Cam {
  const s = SHOTS.find((x) => t >= x.t0 && t < x.t1) ?? SHOTS[SHOTS.length - 1];
  const c = s.f(clamp((t - s.t0) / (s.t1 - s.t0)), t);
  // golpes de zoom en momentos clave
  const punches = [K.land, ...K.pums, K.lid, K.wake, K.naranja, K.bonk, K.go, K.door, K.help];
  let fov = c.fov;
  for (const pt of punches) { const d = t - pt; if (d > 0 && d < 0.4) fov *= 1 - 0.07 * Math.sin((d / 0.4) * Math.PI); }
  const sh = 0.09 * damped(t - K.land, 8, 7) + 0.05 * damped(t - (K.wake + 0.62), 8, 8) + 0.04 * damped(t - K.bonk, 8, 8) + 0.03 * damped(t - (K.stop - 0.6), 8, 6);
  const sh2 = (t > K.rev && t < K.go) ? Math.sin(t * 50) * 0.012 : 0;
  return {pos: [c.pos[0] + sh2, c.pos[1] + sh, c.pos[2]], at: c.at, fov};
}

// ---------------- luces y ambiente ----------------
const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera, gl, scene} = useThree();
  const env = useMemo(() => { const pm = new THREE.PMREMGenerator(gl); const tx = pm.fromScene(new RoomEnvironment(), 0.04).texture; return tx; }, [gl]);
  const c = camAtT(t);
  camera.position.set(...c.pos);
  camera.lookAt(...c.at);
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = c.fov; pc.near = 0.1; pc.far = 900; pc.updateProjectionMatrix();
  gl.toneMapping = THREE.NeutralToneMapping; gl.toneMappingExposure = 1.05;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.environment = env; (scene as any).environmentIntensity = 0.35;
  scene.fog = new THREE.Fog(new THREE.Color('#dff1ff'), 90, 330);
  return null;
};
const Lights: React.FC<{t: number}> = ({t}) => {
  const dawn = 1 - prog(t, 0, 5);
  const l = useMemo(() => {
    const d = new THREE.DirectionalLight('#fff1dc', 2.6);
    d.castShadow = true; d.shadow.mapSize.set(2048, 2048);
    const s = d.shadow.camera as THREE.OrthographicCamera;
    s.left = -36; s.right = 36; s.top = 36; s.bottom = -36; s.near = 1; s.far = 170;
    d.shadow.bias = -0.0004; d.shadow.normalBias = 0.03; return d;
  }, []);
  l.position.set(26 - dawn * 8, 44 - dawn * 14, 24); l.target.position.set(6, 0, -6);
  l.color.set('#fff1dc').lerp(new THREE.Color('#ffc58a'), dawn * 0.6); l.intensity = 2.6 - dawn * 0.5;
  return (<><primitive object={l} /><primitive object={l.target} /><hemisphereLight args={['#d8f0ff', '#8fd16a', 0.95]} /></>);
};

// naranja que le cae en la cabeza
const Fruit: React.FC<{t: number}> = ({t}) => {
  const t0 = K.bonk - 0.6;
  if (t < t0 || t > K.go) return null;
  let pos: V3;
  if (t < K.bonk) pos = [0.05, lerp(11, 2.75, easeIn(prog(t, t0, K.bonk))), 0.75];
  else { const d = t - K.bonk; const u = clamp(d / 0.9); pos = [0.05 + u * 2.2, Math.max(0.35, 2.75 + 3.2 * d - 9 * d * d), 0.75 + u * 1.6]; }
  return (
    <group position={pos} rotation={[t * 5, 0, t * 3]}>
      <mesh castShadow><sphereGeometry args={[0.35, 24, 18]} /><meshPhysicalMaterial color="#ff8c1a" roughness={0.55} clearcoat={0.3} /></mesh>
      <mesh position={[0, 0.36, 0]} rotation={[0, 0, 0.6]}><sphereGeometry args={[0.12, 10, 8]} /><meshStandardMaterial color="#3fae4a" /></mesh>
    </group>
  );
};
const Bump: React.FC = () => (
  <mesh position={[1.2, -0.25, -18]} rotation={[0, Math.PI / 2, 0]} scale={[3.2, 1, 1.4]} castShadow receiveShadow>
    <cylinderGeometry args={[1, 1, 3.6, 32, 1, false, 0, Math.PI]} />
    <meshStandardMaterial color="#ffd23f" roughness={0.6} />
  </mesh>
);

// ---------------- capa 2D ----------------
const popk = (t: number, a: number, b: number, inD = 0.25, outD = 0.2) => easeOutBack(prog(t, a, a + inD), 2.4) * (1 - easeInOut(prog(t, b - outD, b)));
const Overlay: React.FC<{t: number; W: number}> = ({t, W}) => {
  const u = W / 1920;
  const font = '"Lilita One", sans-serif';
  const st = (c: string, px: number) => ({WebkitTextStroke: `${px * u}px ${c}`, paintOrder: 'stroke fill' as any});
  const LOGO = 'Pueblo Brum';
  const cols = ['#ff8a1f', '#ffd23f', '#3d8bff', '#ff5f7e', '#39c47a', '#c56bff', '#ff8a1f', '#3d8bff', '#ffd23f', '#ff5f7e', '#39c47a'];
  const q = popk(t, 0.9, 3.5);
  const lgo = easeInOut(prog(t, 10.6, 11.1)); const lg = 1;
  const burst = (k: number, txt: string, col: string, x: number, y: number, size: number, rot = -6) => k > 0.01 ? (
    <div style={{position: 'absolute', left: x * u, top: y * u, transform: `translate(-50%,-50%) scale(${k}) rotate(${rot + Math.sin(t * 9) * 2}deg)`, fontFamily: font, fontSize: size * u, color: col, ...st('#ffffff', 24), textShadow: `0 ${10 * u}px 0 rgba(40,20,60,0.35)`, whiteSpace: 'nowrap'}}>{txt}</div>
  ) : null;
  // líneas de velocidad
  const speed = t > K.go && t < K.stop - 0.3 ? 1 : 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 64%, rgba(30,20,60,0.18) 100%)'}} />
      {speed ? (
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', opacity: 0.55}}>
          {Array.from({length: 26}).map((_, i) => {
            const a = hash(i) * Math.PI * 2, r0 = 620 + hash(i + 3) * 200, len = 140 + hash(Math.floor(t * 15) + i) * 220;
            return <line key={i} x1={960 + Math.cos(a) * r0} y1={540 + Math.sin(a) * r0 * 0.6} x2={960 + Math.cos(a) * (r0 + len)} y2={540 + Math.sin(a) * (r0 + len) * 0.6} stroke="#ffffff" strokeWidth={5 + hash(i) * 6} strokeLinecap="round" />;
          })}
        </svg>
      ) : null}
      {q > 0.01 ? (
        <div style={{position: 'absolute', left: 1300 * u, top: 120 * u, width: 230 * u, height: 230 * u, borderRadius: '50%', background: '#fff', boxShadow: `0 ${10 * u}px 0 rgba(0,0,0,0.15)`,
          transform: `scale(${q}) rotate(${Math.sin(t * 6) * 8}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 190 * u, color: '#ff5fa2', ...st('#7a1d4a', 10)}}>?</div>
      ) : null}
      {t > 5.25 && t < 11.15 ? (
        <div style={{position: 'absolute', top: 360 * u, width: '100%', textAlign: 'center', fontFamily: font, fontSize: 230 * u, transform: `translateY(${-lgo * 700 * u}px)`, opacity: 1 - lgo}}>
          {LOGO.split('').map((ch, i) => {
            const a = 5.3 + i * 0.05;
            const k = easeOutBack(prog(t, a, a + 0.3), 3);
            const bob = Math.sin((t - a) * 7 + i) * 12 * u * prog(t, a + 0.4, a + 0.7);
            return <span key={i} style={{display: 'inline-block', color: cols[i], ...st('#2b2350', 24), transform: `translateY(${(1 - k) * -360 * u + bob}px) scale(${k}) rotate(${(1 - k) * 40 + Math.sin(t * 4 + i) * 3}deg)`, textShadow: `0 ${14 * u}px 0 rgba(43,35,80,0.35)`, width: ch === ' ' ? 60 * u : undefined}}>{ch}</span>;
          })}
        </div>
      ) : null}
      {[S('c1'), S('c2'), S('c3')].map((c, i) => burst(popk(t, c, c + 0.95), String(i + 1), ['#ff5f7e', '#3d8bff', '#39c47a'][i], 960, 190, 260 + i * 40, 0))}
      {burst(popk(t, S('n7'), K.wake + 0.5), '¡DESPIERTA!', '#ffd23f', 960, 180, 170)}
      {burst(popk(t, K.naranja, S('b4') + 0.4), '¡NARANJA!', '#ff8a1f', 960, 900, 200)}
      {burst(popk(t, K.bonk, K.bonk + 0.9), '¡BONK!', '#ffd23f', 1250, 230, 170, 10)}
      {burst(popk(t, K.go, K.go + 1.1), '¡ZUUUM!', '#3d8bff', 1350, 260, 170, -10)}
      {t > K.help && t < S('b9') ? (
        <div style={{position: 'absolute', left: 40 * u, top: 120 * u, transform: `scale(${popk(t, K.help, S('b9'))}) rotate(-5deg)`, transformOrigin: 'left top', background: '#fff', borderRadius: 40 * u, padding: `${18 * u}px ${44 * u}px`,
          boxShadow: `0 ${10 * u}px 0 rgba(0,0,0,0.18)`, fontFamily: font, fontSize: 120 * u, color: '#ff4b4b', ...st('#7a1010', 6)}}>¡AYUDA!</div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- composición ----------------
export const Ep2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender('fuentes'));
  useEffect(() => { Promise.all([document.fonts.load('150px "Lilita One"'), document.fonts.ready]).then(() => { setReady(true); continueRender(h); }); }, [h]);
  if (!ready) return null;
  const bp = brunoAt(t);
  const garage = easeOut(prog(t, K.door, K.door + 0.8));
  const rc = RED_CAR(t);
  const zt = zTex();
  return (
    <AbsoluteFill style={{background: '#a9dcff'}}>
      <AbsoluteFill style={{filter: 'saturate(1.14) contrast(1.05)'}}>
        <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 40, position: [0, 5, 20]}}>
          <Rig t={t} />
          <Lights t={t} />
          <Sky dawn={1 - prog(t, 0, 5)} />
          <Town t={t} garageOpen={garage} />
          <Bump />
          <Bunting t={t} a={[-8, 7.2, -7]} b={[8, 7.2, -7]} sag={0.9} />
          <Rising t={t} c={[-20.5, 6.4, -12]} n={6} bubble size={0.8} />
          <Rising t={t} c={[-7.1, 4.6, 22.4]} n={4} size={0.7} />
          <Rising t={t} c={[11.1, 4.6, -24.4]} n={4} size={0.7} />
          <Rising t={t} c={[-30.4, 4.6, -5.1]} n={4} size={0.7} />
          <Birds t={t} />
          <Butterflies t={t} centers={[[-7, 0, 6], [8, 0, -6], [-8.5, 0, -5]]} />
          {/* tráfico */}
          {(() => { const gx = 12 + ((t * 5) % 40); return t < K.stop - 1 || t > 58 ? <Car x={gx} z={-1.25} yaw={Math.PI / 2} color="#39c47a" wheel={t * 14} /> : null; })()}
          {(() => { const x = t > K.m4 - 0.2 && t < K.m5 ? rc.x : -12 - ((t * 4.5) % 40); return <Car x={x} z={rc.z} yaw={-Math.PI / 2} color="#ff4b4b" wheel={-t * 14} />; })()}
          {(() => { const z = -50 + ((t * 4) % 38); return t < K.m3 - 0.3 || t > K.m4 ? <Car x={1.25} z={z} yaw={0} color="#c56bff" wheel={t * 12} /> : null; })()}
          {t > K.door ? <pointLight position={[20, 2.6, -7.6]} color="#ffc47a" intensity={22 * garage} distance={9} decay={2} /> : null}
          <GiftBox p={boxPose(t)} />
          {t > K.lid - 0.15 ? <Bruno2 p={bp} /> : null}
          <Fruit t={t} />
          <Puffs t={t} t0={K.land} c={[0, 0, 0]} r={2.4} n={16} big={1.2} />
          <Puffs t={t} t0={K.wake + 0.62} c={[0, 0, 0.3]} r={1.4} n={10} />
          <Puffs t={t} t0={K.rev} c={[0, 0, -1.6]} r={0.8} n={8} dur={1.1} />
          <Puffs t={t} t0={K.go} c={[0, 0, -1]} r={1.0} n={10} />
          <Puffs t={t} t0={K.m3 + 0.85} c={[1.2, 0, -21.2]} r={1.2} n={10} />
          <Puffs t={t} t0={K.m5 + 0.6} c={[19.5, 0, -1.5]} r={1.2} n={12} big={1.1} />
          <Sparkles t={t} t0={K.lid} c={[0, 3.2, 0]} n={26} spread={3.8} />
          <Sparkles t={t} t0={K.naranja} c={[0, 1.6, 1.0]} n={24} tint="#ffb35c" spread={3} />
          <Sparkles t={t} t0={K.m3 + 0.85} c={[1.2, 1.5, -21.2]} n={14} tint="#ffe14d" spread={2.2} />
          <Sparkles t={t} t0={K.door + 0.2} c={[20, 2.4, -8.0]} n={20} tint="#ffe9a0" spread={3.4} />
          <Confetti t={t} t0={K.wake + 0.05} />
          <Zzz t={t} t0={15.3} t1={K.wake} c={[0.45, 2.35, 1.0]} tex={zt} />
          <Dizzy t={t} t0={K.bonk} t1={K.bonk + 1.0} c={[0, 2.85, 0.75]} />
          <Ring t={t} t0={K.naranja} c={[0, 0, 0]} />
          <Ring t={t} t0={K.wake + 0.62} c={[0, 0, 0]} color="#ffffff" />
        </ThreeCanvas>
      </AbsoluteFill>
      <Overlay t={t} W={width} />
    </AbsoluteFill>
  );
};
