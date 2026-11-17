import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import '@fontsource/lilita-one';
import {Bruno, BrunoPose} from './Bruno';
import {GiftBox, BoxPose} from './GiftBox';
import {Town, Sky} from './Town';
import {camAt, CamKey, prog, lerp, easeInOut, easeOut, easeOutQuad, easeOutBack, damped, talk, blinkAt, catmull, hash, clamp, V3} from './anim';
import {zTex, starTex, puffTex} from './tex';

// ---------------- línea de tiempo (segundos) ----------------
export const T = {
  land: 7.0, pums: [21.4, 22.2, 23.0], lid: 23.8, open: 24.0,
  counts: [34.0, 35.2, 36.4], wake: 37.2, naranja: 45.0, spin: 47.5, drive: 52.0, stop: 56.5, door: 58.6,
};
const TALK: [number, number][] = [[38.6, 39.65], [46.4, 47.06], [50.2, 51.85]];
const BLINKS = [39.9, 42.6, 47.2, 50.0, 53.6, 57.3, 59.5];

const KEYS: CamKey[] = [
  {t: 0.0, pos: [-30, 13, 40], at: [0, 7, 0], fov: 42},
  {t: 2.6, pos: [-24, 10, 31], at: [0, 15, 0], fov: 40},
  {t: 5.0, pos: [-14, 5, 18], at: [0, 5.5, 0], fov: 38},
  {t: 7.0, pos: [-9.5, 3.4, 12], at: [0, 1.9, 0], fov: 38},
  {t: 9.4, pos: [-8, 3.6, 10.5], at: [0, 1.9, 0], fov: 38},
  {t: 12.0, pos: [-6, 19, 24], at: [2, 0, -6], fov: 46},
  {t: 15.0, pos: [24, 21, 14], at: [6, 1, -8], fov: 46},
  {t: 17.6, pos: [14, 8, 15], at: [0, 1.6, 0], fov: 40},
  {t: 19.8, pos: [6.5, 3.6, 10.5], at: [0, 1.6, 0], fov: 38},
  {t: 23.5, pos: [4.6, 3.2, 9.2], at: [0, 1.5, 0], fov: 38},
  {t: 25.5, pos: [5.2, 3.6, 10], at: [0, 1.3, 0], fov: 38},
  {t: 28.0, pos: [2.8, 2.3, 6.8], at: [0, 1.35, 0.6], fov: 36},
  {t: 33.0, pos: [1.5, 1.95, 5.7], at: [0, 1.45, 0.9], fov: 34},
  {t: 37.0, pos: [0.9, 1.85, 5.2], at: [0, 1.5, 1.0], fov: 34},
  {t: 38.2, pos: [2.6, 2.6, 7.2], at: [0, 1.7, 0.6], fov: 38},
  {t: 41.6, pos: [1.2, 2.0, 6.0], at: [0, 1.55, 0.9], fov: 35},
  {t: 45.0, pos: [0.8, 1.9, 5.4], at: [0, 1.5, 1.0], fov: 34},
  {t: 47.3, pos: [3.4, 2.8, 7.6], at: [0, 1.3, 0], fov: 38},
  {t: 49.8, pos: [3.2, 2.5, 7.0], at: [0, 1.4, 0.4], fov: 37},
  {t: 51.8, pos: [-2.5, 3.0, 8.0], at: [1.5, 1.3, 0], fov: 40},
  {t: 54.2, pos: [6, 3.6, 9], at: [10, 1.4, 0.5], fov: 42},
  {t: 56.6, pos: [14.2, 3.2, 3.6], at: [20, 1.8, -5], fov: 42},
  {t: 60.0, pos: [15.2, 3.5, 3.0], at: [20, 2.2, -6.5], fov: 42},
];

const PATH: V3[] = [[0, 0, 0], [5, 0, 1.3], [12, 0, 0.7], [18.4, 0, -0.6], [20, 0, -4.2]];

const bounceOut = (x: number) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};

function boxPose(t: number): BoxPose {
  const f = prog(t, 1, T.land);
  let y = lerp(38, 0, easeOutQuad(f));
  let sy = 1 - 0.16 * damped(t - T.land, 2.2, 4);
  let shake = 0;
  for (const [i, p] of T.pums.entries()) {
    const k = 0.6 + i * 0.25;
    shake += 0.05 * k * damped(t - p, 6, 6);
    sy -= 0.07 * k * damped(t - p, 3.5, 7);
    y += Math.abs(damped(t - p, 2.5, 7)) * 0.25 * k;
  }
  return {
    y, sy, shake,
    sway: Math.sin(t * 1.7) * 0.07 * (1 - f),
    chute: 1 - easeInOut(prog(t, T.land, T.land + 1.4)),
    chuteGone: prog(t, T.land + 0.6, T.land + 2.8),
    lid: prog(t, T.lid, T.lid + 1.15),
    open: bounceOut(prog(t, T.open, T.open + 1.2)),
  };
}

function brunoPose(t: number): BrunoPose {
  const p: BrunoPose = {x: 0, y: 0.16, z: 0, yaw: 0, eyeOpen: 1, sleep: false, smile: 0.4};
  // dormido
  if (t < T.wake) {
    p.sleep = true;
    p.eyeOpen = 0.08;
    p.sy = 1 + 0.018 * Math.sin((t * 2 * Math.PI) / 2.6);
    for (const c of T.counts) {
      const d = t - c;
      if (d > 0 && d < 0.5) p.eyeOpen = 0.08 + 0.32 * Math.sin((d / 0.5) * Math.PI);
      p.sy! -= 0.05 * damped(d, 3, 6);
    }
    p.smile = 0.1;
    return p;
  }
  // despertar con salto
  const w = t - T.wake;
  p.eyeOpen = 0.08 + 0.92 * easeOutBack(clamp(w / 0.28));
  const jt = prog(t, T.wake + 0.05, T.wake + 0.75);
  p.lift = jt > 0 && jt < 1 ? Math.sin(jt * Math.PI) * 1.1 : 0;
  p.sy = 1 + (jt > 0 && jt < 1 ? 0.08 : 0) - 0.18 * damped(t - (T.wake + 0.75), 2.6, 5);
  p.sx = p.sz = 1 + 0.08 * damped(t - (T.wake + 0.75), 2.6, 5);
  p.beacon = t < 41 ? 0.5 + 0.5 * Math.sin(t * 9) : 0;
  p.smile = 1;
  // mira alrededor y luego a cámara
  p.lookX = t < T.wake + 1.6 ? Math.sin((t - T.wake) * 5) * 0.9 * prog(t, T.wake + 0.7, T.wake + 0.9) : 0;
  // "Bruno es de color...": se mira a sí mismo
  if (t > 41.8 && t < 44.9) {
    const k = prog(t, 41.8, 42.2) * (1 - prog(t, 43.1, 43.4));
    p.lookY = -1 * k; p.lookX = 0.6 * k * Math.sin(t * 3);
    p.sy = 1 + 0.02 * Math.sin(t * 8) * prog(t, 43.3, 43.6);
  }
  // ¡naranja! brillo + saltito
  const nj = t - T.naranja;
  p.glow = nj > 0 ? Math.exp(-nj * 1.6) * (0.6 + 0.4 * Math.sin(nj * 14)) : 0;
  const hop = (h: number, d = 0.5, k = 0.55) => {
    const q = prog(t, h, h + d);
    if (q > 0 && q < 1) p.lift = (p.lift ?? 0) + Math.sin(q * Math.PI) * k;
    const s = damped(t - (h + d), 2.8, 6) * 0.12;
    p.sy = (p.sy ?? 1) - s; p.sx = (p.sx ?? 1) + s * 0.6; p.sz = p.sx;
  };
  hop(T.naranja + 0.05); hop(46.45, 0.45, 0.4); hop(50.25, 0.45, 0.35); hop(59.0, 0.5, 0.5);
  // vuelta completa para enseñarse
  p.yaw = 2 * Math.PI * easeInOut(prog(t, T.spin, T.spin + 2.0));
  // conducir hasta el garaje
  const u = easeInOut(prog(t, T.drive, T.stop));
  if (t > T.drive) {
    const a = catmull(PATH, u), b = catmull(PATH, Math.min(1, u + 0.01)), c0 = catmull(PATH, Math.max(0, u - 0.01));
    p.x = a[0]; p.z = a[2]; p.y = lerp(0.16, 0, prog(t, T.drive, T.drive + 0.5));
    const ty = Math.atan2(b[0] - c0[0], b[2] - c0[2]);
    p.yaw = lerp(0, ty, prog(t, T.drive, T.drive + 0.7));
    if (t > T.stop) p.yaw = lerp(ty, Math.PI, easeInOut(prog(t, T.stop, T.stop + 0.8)));
    // distancia recorrida para girar ruedas
    let dist = 0; const N = 60;
    for (let i = 1; i <= N; i++) {
      const q0 = catmull(PATH, (u * (i - 1)) / N), q1 = catmull(PATH, (u * i) / N);
      dist += Math.hypot(q1[0] - q0[0], q1[2] - q0[2]);
    }
    p.wheel = dist / 0.42;
    const sp = prog(t, T.drive, T.drive + 0.6) * (1 - prog(t, T.stop - 0.6, T.stop));
    p.lift = (p.lift ?? 0) + Math.abs(Math.sin(t * 13)) * 0.04 * sp;
    p.pitch = -0.05 * damped(t - T.drive, 1.5, 4) + 0.07 * damped(t - T.stop, 1.6, 4);
    p.hookSway = 0.25 * damped(t - T.drive, 1.2, 1.5) - 0.3 * damped(t - T.stop, 1.2, 1.5);
  }
  p.wheel = (p.wheel ?? 0) + (t > T.spin && t < T.spin + 2 ? 0 : 0);
  p.mouth = talk(t, TALK);
  const bl = blinkAt(t, BLINKS);
  if (t > T.wake + 0.5) p.eyeOpen = Math.min(p.eyeOpen, 1 - 0.94 * bl);
  return p;
};

// ---------------- efectos ----------------
const Puffs: React.FC<{t: number; t0: number; cx: number; cz: number; r: number; n?: number}> = ({t, t0, cx, cz, r, n = 10}) => {
  const tex = puffTex();
  const d = t - t0;
  if (d < 0 || d > 1.6) return null;
  return (
    <group>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + hash(i) * 0.4;
        const k = easeOut(d / 1.6);
        const rr = r + k * (1.8 + hash(i + 3));
        const s = (0.7 + hash(i + 9) * 0.6) * (0.6 + k * 1.6);
        return (
          <sprite key={i} position={[cx + Math.cos(a) * rr, 0.35 + k * 0.8, cz + Math.sin(a) * rr]} scale={[s, s, s]}>
            <spriteMaterial map={tex} transparent depthWrite={false} opacity={(1 - k) * 0.9} />
          </sprite>
        );
      })}
    </group>
  );
};

const Sparkles: React.FC<{t: number; t0: number; c: V3; n?: number; tint?: string; spread?: number}> = ({t, t0, c, n = 16, tint = '#ffffff', spread = 3}) => {
  const tex = starTex();
  const d = t - t0;
  if (d < 0 || d > 1.5) return null;
  return (
    <group>
      {Array.from({length: n}).map((_, i) => {
        const a = hash(i) * Math.PI * 2, e = (hash(i + 5) - 0.3) * 1.4;
        const k = easeOut(d / 1.5);
        const rr = k * spread * (0.6 + hash(i + 1) * 0.6);
        const s = 0.55 * (1 - k * 0.7) * (0.7 + 0.5 * Math.sin(d * 18 + i));
        return (
          <sprite key={i} position={[c[0] + Math.cos(a) * rr, c[1] + e * rr + k * 0.6, c[2] + Math.sin(a) * rr]} scale={[s, s, s]}>
            <spriteMaterial map={tex} color={tint} transparent depthWrite={false} opacity={1 - k} />
          </sprite>
        );
      })}
    </group>
  );
};

const Confetti: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const d = t - t0;
  if (d < 0 || d > 4.5) return null;
  const cols = ['#ff5f7e', '#ffd23f', '#3d8bff', '#39c47a', '#c56bff', '#ff8a1f'];
  return (
    <group>
      {Array.from({length: 70}).map((_, i) => {
        const x0 = (hash(i) - 0.5) * 7, z0 = (hash(i + 1) - 0.5) * 5 + 0.5;
        const vy = 5 + hash(i + 2) * 3;
        const y = 1.2 + vy * Math.min(d, 0.6) - Math.max(0, d - 0.6) * (1.1 + hash(i + 3) * 0.6) - 4 * Math.min(d, 0.6) ** 2;
        if (y < 0.05) return null;
        return (
          <mesh key={i} position={[x0 * easeOut(Math.min(1, d * 2)) + Math.sin(d * 3 + i) * 0.3, y, z0]} rotation={[d * 6 + i, d * 4 + i * 2, i]}>
            <planeGeometry args={[0.16, 0.24]} />
            <meshStandardMaterial color={cols[i % 6]} side={THREE.DoubleSide} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

const Zzz: React.FC<{t: number}> = ({t}) => {
  const tex = zTex();
  if (t < 25.2 || t > T.wake) return null;
  const fade = prog(t, 25.2, 26) * (1 - prog(t, T.wake - 0.3, T.wake));
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const ph = ((t - 25.2) / 2.4 + i / 3) % 1;
        const s = 0.25 + ph * 0.35;
        return (
          <sprite key={i} position={[0.45 + ph * 0.7 + Math.sin(ph * 6) * 0.12, 2.3 + ph * 0.95, 1.0]} scale={[s * 0.8, s * 0.8, s * 0.8]}>
            <spriteMaterial map={tex} transparent depthWrite={false} opacity={fade * Math.sin(ph * Math.PI)} />
          </sprite>
        );
      })}
    </group>
  );
};

const Ring: React.FC<{t: number; t0: number; c: V3}> = ({t, t0, c}) => {
  const d = t - t0;
  if (d < 0 || d > 1.2) return null;
  const k = easeOut(d / 1.2);
  return (
    <mesh position={[c[0], 0.12, c[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + k * 5, 1 + k * 5, 1]}>
      <ringGeometry args={[0.85, 1.0, 48]} />
      <meshBasicMaterial color="#ff8a1f" transparent opacity={1 - k} depthWrite={false} />
    </mesh>
  );
};

// ---------------- cámara y luces ----------------
const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera, gl, scene} = useThree();
  const c = camAt(KEYS, t);
  const w = easeInOut(prog(t, 51.6, 52.6)) * (1 - easeInOut(prog(t, 55.4, 56.6)));
  if (w > 0) {
    const b = brunoPose(t);
    const fp: V3 = [b.x - 3.2, 3.3, b.z + 8.2], fa: V3 = [b.x + 2.2, 1.3, b.z];
    for (let i = 0; i < 3; i++) { c.pos[i] = lerp(c.pos[i], fp[i], w); c.at[i] = lerp(c.at[i], fa[i], w); }
    c.fov = lerp(c.fov, 40, w);
  }
  // pequeño temblor al aterrizar la caja y al saltar Bruno
  const sh = 0.06 * damped(t - T.land, 7, 6) + 0.025 * damped(t - (T.wake + 0.75), 7, 7);
  camera.position.set(c.pos[0], c.pos[1] + sh, c.pos[2]);
  camera.lookAt(c.at[0], c.at[1], c.at[2]);
  (camera as THREE.PerspectiveCamera).fov = c.fov;
  (camera as THREE.PerspectiveCamera).near = 0.1;
  (camera as THREE.PerspectiveCamera).far = 900;
  camera.updateProjectionMatrix();
  gl.toneMapping = THREE.NeutralToneMapping;
  gl.toneMappingExposure = 1.0;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.fog = new THREE.Fog(new THREE.Color('#dff1ff'), 90, 330);
  return null;
};

const Lights: React.FC<{t: number}> = ({t}) => {
  const dawn = 1 - prog(t, 0, 9);
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#fff1dc', 2.4);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const s = l.shadow.camera as THREE.OrthographicCamera;
    s.left = -34; s.right = 34; s.top = 34; s.bottom = -34; s.near = 1; s.far = 160;
    l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03; l.shadow.radius = 4;
    return l;
  }, []);
  light.position.set(28 - dawn * 10, 42 - dawn * 18, 26);
  light.target.position.set(6, 0, -3);
  light.color.set('#fff1dc').lerp(new THREE.Color('#ffc58a'), dawn * 0.7);
  light.intensity = 2.4 - dawn * 0.6;
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      <hemisphereLight args={['#d8f0ff', '#8fd16a', 1.05 - dawn * 0.2]} />
      <ambientLight intensity={0.18} />
    </>
  );
};

// ---------------- capa 2D ----------------
const pop = (t: number, a: number, b: number, inD = 0.35, outD = 0.25) => easeOutBack(prog(t, a, a + inD)) * (1 - easeInOut(prog(t, b - outD, b)));

const Overlay: React.FC<{t: number; W: number}> = ({t, W}) => {
  const u = W / 1920;
  const font = '"Lilita One", sans-serif';
  const outline = (c: string, px: number) => ({WebkitTextStroke: `${px * u}px ${c}`, paintOrder: 'stroke fill' as any});
  const LOGO = 'Pueblo Brum';
  const cols = ['#ff8a1f', '#ffd23f', '#3d8bff', '#ff5f7e', '#39c47a', '#c56bff', '#ff8a1f', '#3d8bff', '#ffd23f', '#ff5f7e', '#39c47a'];
  const q = pop(t, 3.4, 6.6);
  const lg = 1 - easeInOut(prog(t, 16.9, 17.4));
  const nj = pop(t, T.naranja, 47.2, 0.4, 0.3);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* viñeta suave */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(30,20,60,0.16) 100%)'}} />
      {q > 0.01 ? (
        <div style={{position: 'absolute', left: 1240 * u, top: 150 * u, width: 230 * u, height: 230 * u, borderRadius: '50%', background: '#ffffff',
          boxShadow: `0 ${10 * u}px 0 rgba(0,0,0,0.15)`, transform: `scale(${q}) rotate(${Math.sin(t * 4) * 6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: font, fontSize: 190 * u, color: '#ff5fa2', ...outline('#7a1d4a', 10)}}>?</div>
      ) : null}
      {t > 9.9 && t < 17.4 ? (
        <div style={{position: 'absolute', top: 380 * u, width: '100%', textAlign: 'center', fontFamily: font, fontSize: 210 * u, letterSpacing: 4 * u, transform: `scale(${lg})`}}>
          {LOGO.split('').map((ch, i) => {
            const a = 10.0 + i * 0.09;
            const k = easeOutBack(prog(t, a, a + 0.45), 2.6);
            const bob = Math.sin((t - a) * 5 + i) * 10 * u * prog(t, a + 0.5, a + 0.9);
            return (
              <span key={i} style={{display: 'inline-block', color: cols[i], ...outline('#2b2350', 22), transform: `translateY(${(1 - k) * -300 * u + bob}px) scale(${k}) rotate(${(1 - k) * 30}deg)`,
                textShadow: `0 ${12 * u}px 0 rgba(43,35,80,0.35)`, width: ch === ' ' ? 60 * u : undefined}}>{ch}</span>
            );
          })}
        </div>
      ) : null}
      {T.counts.map((c, i) => {
        const k = pop(t, c, c + 1.0, 0.3, 0.25);
        if (k < 0.01) return null;
        return (
          <div key={i} style={{position: 'absolute', left: (760 + i * 200) * u, top: 120 * u, width: 180 * u, textAlign: 'center', fontFamily: font, fontSize: 200 * u,
            color: ['#ff5f7e', '#3d8bff', '#39c47a'][i], ...outline('#ffffff', 22), transform: `scale(${k})`, textShadow: `0 ${10 * u}px 0 rgba(0,0,0,0.18)`}}>{i + 1}</div>
        );
      })}
      {nj > 0.01 ? (
        <div style={{position: 'absolute', bottom: 90 * u, width: '100%', textAlign: 'center', fontFamily: font, fontSize: 170 * u, color: '#ff8a1f', ...outline('#ffffff', 26),
          transform: `scale(${nj}) rotate(${Math.sin(t * 5) * 3}deg)`, textShadow: `0 ${12 * u}px 0 rgba(160,70,0,0.35)`}}>¡naranja!</div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- composición ----------------
export const Ep1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender('fuentes'));
  useEffect(() => {
    Promise.all([document.fonts.load('150px "Lilita One"'), document.fonts.ready]).then(() => { setReady(true); continueRender(h); });
  }, [h]);
  if (!ready) return null;
  const bp = brunoPose(t);
  const garage = easeInOut(prog(t, T.door, T.door + 1.2));
  return (
    <AbsoluteFill style={{background: '#a9dcff'}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 40, position: [0, 5, 20]}}>
        <Rig t={t} />
        <Lights t={t} />
        <Sky dawn={1 - prog(t, 0, 9)} />
        <Town t={t} garageOpen={garage} />
        <GiftBox p={boxPose(t)} />
        {t > T.lid - 0.2 ? <Bruno p={bp} /> : null}
        <Puffs t={t} t0={T.land} cx={0} cz={0} r={2.4} n={14} />
        <Puffs t={t} t0={T.wake + 0.75} cx={0} cz={0.3} r={1.4} n={8} />
        <Puffs t={t} t0={T.stop} cx={bp.x} cz={bp.z} r={1.0} n={6} />
        <Sparkles t={t} t0={T.lid} c={[0, 3.2, 0]} n={22} spread={3.5} />
        <Sparkles t={t} t0={T.naranja} c={[0, 1.6, 1.0]} n={20} tint="#ffb35c" spread={2.6} />
        <Sparkles t={t} t0={T.door} c={[20, 2.4, -8.0]} n={16} tint="#9cc8ff" spread={3} />
        <Confetti t={t} t0={T.wake + 0.1} />
        <Zzz t={t} />
        <Ring t={t} t0={T.naranja} c={[0, 0, 0]} />
      </ThreeCanvas>
      <Overlay t={t} W={width} />
    </AbsoluteFill>
  );
};
