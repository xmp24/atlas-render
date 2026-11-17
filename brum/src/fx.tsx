import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {easeOut, hash, prog, V3} from './anim';
import {starTex, puffTex} from './tex';

export const Puffs: React.FC<{t: number; t0: number; c: V3; r: number; n?: number; dur?: number; big?: number}> = ({t, t0, c, r, n = 10, dur = 1.3, big = 1}) => {
  const tex = puffTex();
  const d = t - t0;
  if (d < 0 || d > dur) return null;
  return (
    <group>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + hash(i) * 0.4;
        const k = easeOut(d / dur);
        const rr = r + k * (1.6 + hash(i + 3)) * big;
        const s = (0.7 + hash(i + 9) * 0.6) * (0.6 + k * 1.6) * big;
        return (
          <sprite key={i} position={[c[0] + Math.cos(a) * rr, c[1] + 0.35 + k * 0.7, c[2] + Math.sin(a) * rr]} scale={[s, s, s]}>
            <spriteMaterial map={tex} transparent depthWrite={false} opacity={(1 - k) * 0.95} />
          </sprite>
        );
      })}
    </group>
  );
};

export const Sparkles: React.FC<{t: number; t0: number; c: V3; n?: number; tint?: string; spread?: number; dur?: number}> = ({t, t0, c, n = 16, tint = '#ffffff', spread = 3, dur = 1.2}) => {
  const tex = starTex();
  const d = t - t0;
  if (d < 0 || d > dur) return null;
  return (
    <group>
      {Array.from({length: n}).map((_, i) => {
        const a = hash(i) * Math.PI * 2, e = (hash(i + 5) - 0.3) * 1.4;
        const k = easeOut(d / dur);
        const rr = k * spread * (0.6 + hash(i + 1) * 0.6);
        const s = 0.6 * (1 - k * 0.7) * (0.7 + 0.5 * Math.sin(d * 18 + i));
        return (
          <sprite key={i} position={[c[0] + Math.cos(a) * rr, c[1] + e * rr + k * 0.6, c[2] + Math.sin(a) * rr]} scale={[s, s, s]}>
            <spriteMaterial map={tex} color={tint} transparent depthWrite={false} opacity={1 - k} />
          </sprite>
        );
      })}
    </group>
  );
};

export const Confetti: React.FC<{t: number; t0: number; c?: V3}> = ({t, t0, c = [0, 0, 0]}) => {
  const d = t - t0;
  if (d < 0 || d > 4.0) return null;
  const cols = ['#ff5f7e', '#ffd23f', '#3d8bff', '#39c47a', '#c56bff', '#ff8a1f'];
  return (
    <group position={c}>
      {Array.from({length: 90}).map((_, i) => {
        const x0 = (hash(i) - 0.5) * 8, z0 = (hash(i + 1) - 0.5) * 6 + 0.5;
        const vy = 6 + hash(i + 2) * 4;
        const up = Math.min(d, 0.5);
        const y = 1.2 + vy * up - 6 * up * up - Math.max(0, d - 0.5) * (1.2 + hash(i + 3) * 0.7);
        if (y < 0.05) return null;
        return (
          <mesh key={i} position={[x0 * easeOut(Math.min(1, d * 2.5)) + Math.sin(d * 3 + i) * 0.3, y, z0]} rotation={[d * 7 + i, d * 5 + i * 2, i]}>
            <planeGeometry args={[0.17, 0.26]} />
            <meshStandardMaterial color={cols[i % 6]} side={THREE.DoubleSide} roughness={0.4} emissive={cols[i % 6]} emissiveIntensity={0.15} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Ring: React.FC<{t: number; t0: number; c: V3; color?: string}> = ({t, t0, c, color = '#ff8a1f'}) => {
  const d = t - t0;
  if (d < 0 || d > 0.9) return null;
  const k = easeOut(d / 0.9);
  return (
    <mesh position={[c[0], 0.14, c[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + k * 6, 1 + k * 6, 1]}>
      <ringGeometry args={[0.8, 1.0, 48]} />
      <meshBasicMaterial color={color} transparent opacity={1 - k} depthWrite={false} />
    </mesh>
  );
};

// estrellitas de mareo girando sobre la cabeza
export const Dizzy: React.FC<{t: number; t0: number; t1: number; c: V3}> = ({t, t0, t1, c}) => {
  const tex = starTex();
  if (t < t0 || t > t1) return null;
  const f = Math.min(1, (t - t0) / 0.15) * Math.min(1, (t1 - t) / 0.2);
  return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const a = t * 7 + (i / 4) * Math.PI * 2;
        return (
          <sprite key={i} position={[c[0] + Math.cos(a) * 0.7, c[1] + Math.sin(a * 2) * 0.08, c[2] + Math.sin(a) * 0.5]} scale={[0.4 * f, 0.4 * f, 0.4 * f]}>
            <spriteMaterial map={tex} color="#ffe14d" transparent depthWrite={false} />
          </sprite>
        );
      })}
    </group>
  );
};

// zzz
export const Zzz: React.FC<{t: number; t0: number; t1: number; c: V3; tex: THREE.Texture}> = ({t, t0, t1, c, tex}) => {
  if (t < t0 || t > t1) return null;
  const fade = prog(t, t0, t0 + 0.5) * (1 - prog(t, t1 - 0.25, t1));
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const ph = ((t - t0) / 2.0 + i / 3) % 1;
        const s = (0.22 + ph * 0.3) * 0.9;
        return (
          <sprite key={i} position={[c[0] + ph * 0.7 + Math.sin(ph * 6) * 0.12, c[1] + ph * 0.95, c[2]]} scale={[s, s, s]}>
            <spriteMaterial map={tex} transparent depthWrite={false} opacity={fade * Math.sin(ph * Math.PI)} />
          </sprite>
        );
      })}
    </group>
  );
};

// coche genérico simpático (tráfico)
export const Car: React.FC<{x: number; z: number; yaw: number; color: string; wheel: number; bob?: number}> = ({x, z, yaw, color, wheel, bob = 0}) => {
  const g = useMemo(() => ({
    body: new RoundedBoxGeometry(1.5, 0.7, 2.5, 4, 0.28),
    top: new RoundedBoxGeometry(1.25, 0.65, 1.3, 4, 0.28),
    glass: new RoundedBoxGeometry(1.0, 0.42, 0.06, 3, 0.05),
    tire: new THREE.CylinderGeometry(0.32, 0.32, 0.26, 24),
    eye: new THREE.SphereGeometry(0.16, 16, 12),
    pup: new THREE.SphereGeometry(0.08, 12, 8),
  }), []);
  return (
    <group position={[x, bob, z]} rotation={[0, yaw, 0]}>
      <mesh geometry={g.body} position={[0, 0.65, 0]} castShadow><meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.7} /></mesh>
      <mesh geometry={g.top} position={[0, 1.2, -0.15]} castShadow><meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.7} /></mesh>
      <mesh geometry={g.glass} position={[0, 1.22, 0.52]} rotation={[-0.25, 0, 0]}><meshPhysicalMaterial color="#bfe8ff" roughness={0.05} clearcoat={1} /></mesh>
      {[0.2, -0.2].map((ex) => (
        <group key={ex} position={[ex, 1.24, 0.57]}>
          <mesh geometry={g.eye} scale={[1, 1.1, 0.5]}><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh geometry={g.pup} position={[0, 0, 0.07]}><meshStandardMaterial color="#111" /></mesh>
        </group>
      ))}
      {[[0.72, 0.8], [-0.72, 0.8], [0.72, -0.8], [-0.72, -0.8]].map(([wx, wz], i) => (
        <mesh key={i} geometry={g.tire} position={[wx, 0.32, wz]} rotation={[wheel, 0, Math.PI / 2]}><meshStandardMaterial color="#25252e" roughness={0.9} /></mesh>
      ))}
    </group>
  );
};

// pájaros que cruzan el cielo
export const Birds: React.FC<{t: number}> = ({t}) => {
  return (
    <group>
      {Array.from({length: 7}).map((_, i) => {
        const ph = (t * 0.035 + hash(i) ) % 1;
        const x = -70 + ph * 140, z = -30 + hash(i + 4) * 50, y = 18 + hash(i + 2) * 8 + Math.sin(t * 1.3 + i) * 0.6;
        const fl = Math.sin(t * 14 + i * 2) * 0.6;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]} scale={0.7}>
            <mesh rotation={[0, 0, fl]} position={[0.45, 0, 0]}><boxGeometry args={[0.9, 0.06, 0.35]} /><meshStandardMaterial color="#3b3f5c" /></mesh>
            <mesh rotation={[0, 0, -fl]} position={[-0.45, 0, 0]}><boxGeometry args={[0.9, 0.06, 0.35]} /><meshStandardMaterial color="#3b3f5c" /></mesh>
          </group>
        );
      })}
    </group>
  );
};

// humo de chimenea / burbujas que suben (bucle)
export const Rising: React.FC<{t: number; c: V3; n?: number; speed?: number; size?: number; bubble?: boolean}> = ({t, c, n = 5, speed = 0.5, size = 0.6, bubble = false}) => {
  const tex = puffTex();
  return (
    <group>
      {Array.from({length: n}).map((_, i) => {
        const ph = (t * speed * 0.3 + i / n) % 1;
        const s = size * (0.5 + ph * 1.2);
        const pos: V3 = [c[0] + Math.sin(ph * 5 + i) * 0.5, c[1] + ph * 4, c[2] + Math.cos(ph * 4 + i) * 0.3];
        return bubble ? (
          <mesh key={i} position={pos} scale={s * 0.6}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial color="#e9fbff" roughness={0.05} clearcoat={1} transparent opacity={0.5 * Math.sin(ph * Math.PI)} iridescence={1} />
          </mesh>
        ) : (
          <sprite key={i} position={pos} scale={[s, s, s]}>
            <spriteMaterial map={tex} transparent depthWrite={false} opacity={0.75 * Math.sin(ph * Math.PI)} />
          </sprite>
        );
      })}
    </group>
  );
};

// banderines de colores sobre la plaza
export const Bunting: React.FC<{t: number; a: V3; b: V3; sag?: number}> = ({t, a, b, sag = 1.0}) => {
  const n = 16;
  const cols = ['#ff5f7e', '#ffd23f', '#3d8bff', '#39c47a', '#c56bff', '#ff8a1f'];
  const tri = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-0.28, 0); s.lineTo(0.28, 0); s.lineTo(0, -0.55); s.lineTo(-0.28, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]) - Math.PI / 2;
  return (
    <group>
      {Array.from({length: n}).map((_, i) => {
        const u = (i + 0.5) / n;
        const x = a[0] + (b[0] - a[0]) * u, z = a[2] + (b[2] - a[2]) * u;
        const y = a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * sag;
        return (
          <mesh key={i} geometry={tri} position={[x, y, z]} rotation={[Math.sin(t * 3 + i) * 0.25, yaw, 0]}>
            <meshStandardMaterial color={cols[i % 6]} side={THREE.DoubleSide} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

// mariposas
export const Butterflies: React.FC<{t: number; centers: V3[]}> = ({t, centers}) => (
  <group>
    {centers.map((c, i) => {
      const a = t * 0.9 + i * 2;
      const fl = Math.abs(Math.sin(t * 18 + i)) * 1.2;
      const col = ['#ff9df5', '#ffd23f', '#7fe3ff'][i % 3];
      return (
        <group key={i} position={[c[0] + Math.cos(a) * 1.4, c[1] + 0.9 + Math.sin(a * 2.3) * 0.4, c[2] + Math.sin(a) * 1.4]} rotation={[0, -a, 0]} scale={0.35}>
          <group rotation={[0, fl, 0]}><mesh position={[0.5, 0, 0]}><circleGeometry args={[0.5, 12]} /><meshStandardMaterial color={col} side={THREE.DoubleSide} /></mesh></group>
          <group rotation={[0, -fl, 0]}><mesh position={[-0.5, 0, 0]}><circleGeometry args={[0.5, 12]} /><meshStandardMaterial color={col} side={THREE.DoubleSide} /></mesh></group>
        </group>
      );
    })}
  </group>
);
