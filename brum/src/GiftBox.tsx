import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const W = 3.3, D = 4.0, H = 3.0, T = 0.14;
const PINK = '#ff5fa2', RIB = '#ffd23f';

export type BoxPose = {
  y: number; sway: number; shake: number; sy: number;
  open: number; // 0 cerrada, 1 lados abatidos
  lid: number; // 0 en su sitio, 1 aterrizada a un lado
  chute: number; // 1 desplegado, 0 recogido
  chuteGone: number; // 0..1 desaparece
};

function stripes() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 64;
  const x = c.getContext('2d')!;
  const cols = ['#ff4d5e', '#ffffff', '#ffd23f', '#ffffff'];
  for (let i = 0; i < 8; i++) { x.fillStyle = cols[i % 4]; x.fillRect((i * 512) / 8, 0, 512 / 8 + 1, 64); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const Mat: React.FC<{c: string}> = ({c}) => <meshPhysicalMaterial color={c} roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.4} />;

export const GiftBox: React.FC<{p: BoxPose}> = ({p}) => {
  const g = useMemo(() => ({
    side: new RoundedBoxGeometry(W, H, T, 3, 0.06),
    sideZ: new RoundedBoxGeometry(T, H, D, 3, 0.06),
    ribV: new THREE.BoxGeometry(0.5, H, 0.04),
    ribVz: new THREE.BoxGeometry(0.04, H, 0.5),
    base: new RoundedBoxGeometry(W, 0.16, D, 3, 0.06),
    lid: new RoundedBoxGeometry(W + 0.2, 0.34, D + 0.2, 4, 0.1),
    ribL1: new THREE.BoxGeometry(W + 0.24, 0.36, 0.52),
    ribL2: new THREE.BoxGeometry(0.52, 0.36, D + 0.24),
    loop: new THREE.TorusGeometry(0.42, 0.13, 14, 28),
    knot: new THREE.SphereGeometry(0.24, 20, 14),
    dome: new THREE.SphereGeometry(3.4, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2.3),
    line: new THREE.CylinderGeometry(0.02, 0.02, 1, 5),
    tex: stripes(),
  }), []);

  const o = p.open;
  const ang = o * (Math.PI / 2) * 0.98;
  // trayectoria de la tapa: sube girando y cae a un lado
  const L = p.lid;
  const lidX = -5.2 * L, lidZ = -2.8 * L;
  const lidY = H + 0.17 + Math.sin(Math.PI * L) * 4.2 - (H + 0.02) * L;
  const lidRot = L * Math.PI * 1.15;

  const panel = (key: string, pos: [number, number, number], rot: [number, number, number], vertZ: boolean) => (
    <group key={key} position={pos} rotation={rot}>
      <mesh geometry={vertZ ? g.sideZ : g.side} position={[0, H / 2, 0]} castShadow receiveShadow>
        <Mat c={PINK} />
      </mesh>
      <mesh geometry={vertZ ? g.ribVz : g.ribV} position={[vertZ ? (pos[0] > 0 ? T / 2 + 0.01 : -T / 2 - 0.01) : 0, H / 2, vertZ ? 0 : pos[2] > 0 ? T / 2 + 0.01 : -T / 2 - 0.01]}>
        <Mat c={RIB} />
      </mesh>
    </group>
  );

  // cuerdas del paracaídas: de las esquinas de la tapa al borde de la cúpula
  const ch = p.chute;
  const domeY = H + 0.35 + 4.6 * ch;
  const lines = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz], i) => {
    const a = new THREE.Vector3(sx * (W / 2), H + 0.3, sz * (D / 2));
    const b = new THREE.Vector3(sx * 2.25 * (0.4 + 0.6 * ch), domeY + 0.35, sz * 2.25 * (0.4 + 0.6 * ch));
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return {mid, len, q, i};
  });

  return (
    <group position={[0, p.y, 0]} rotation={[0, 0, p.sway + p.shake]} scale={[1 + (1 - p.sy) * 0.5, p.sy, 1 + (1 - p.sy) * 0.5]}>
      <mesh geometry={g.base} position={[0, 0.08, 0]} castShadow receiveShadow>
        <Mat c={PINK} />
      </mesh>
      {panel('f', [0, 0.1, D / 2 - T / 2], [ang, 0, 0], false)}
      {panel('b', [0, 0.1, -D / 2 + T / 2], [-ang, 0, 0], false)}
      {panel('r', [W / 2 - T / 2, 0.1, 0], [0, 0, -ang], true)}
      {panel('l', [-W / 2 + T / 2, 0.1, 0], [0, 0, ang], true)}
      {/* tapa con lazo */}
      <group position={[lidX, lidY, lidZ]} rotation={[Math.sin(Math.PI * L) * 0.9, lidRot, Math.sin(Math.PI * L) * 0.7]}>
        <mesh geometry={g.lid} castShadow receiveShadow><Mat c={PINK} /></mesh>
        <mesh geometry={g.ribL1}><Mat c={RIB} /></mesh>
        <mesh geometry={g.ribL2}><Mat c={RIB} /></mesh>
        <mesh geometry={g.loop} position={[-0.42, 0.45, 0]} rotation={[0, 0.3, 0.5]} castShadow><Mat c={RIB} /></mesh>
        <mesh geometry={g.loop} position={[0.42, 0.45, 0]} rotation={[0, -0.3, -0.5]} castShadow><Mat c={RIB} /></mesh>
        <mesh geometry={g.knot} position={[0, 0.3, 0]}><Mat c={'#ffb800'} /></mesh>
      </group>
      {/* paracaídas */}
      {p.chuteGone < 1 && L === 0 ? (
        <group position={[p.chuteGone * -3, -p.chuteGone * 3, p.chuteGone * -4]} rotation={[p.chuteGone * -0.9, 0, p.chuteGone * 0.5]}>
          <mesh geometry={g.dome} position={[0, domeY, 0]} scale={[0.35 + 0.65 * ch, 0.25 + 0.75 * ch, 0.35 + 0.65 * ch]} castShadow>
            <meshStandardMaterial map={g.tex} side={THREE.DoubleSide} roughness={0.7} transparent opacity={1 - p.chuteGone} />
          </mesh>
          {lines.map((l) => (
            <mesh key={l.i} geometry={g.line} position={l.mid} quaternion={l.q} scale={[1, l.len, 1]}>
              <meshBasicMaterial color="#ffffff" transparent opacity={1 - p.chuteGone} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};
