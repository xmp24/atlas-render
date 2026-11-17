import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type Mouth = 'smile' | 'open' | 'o' | 'grin' | 'flat';
export type B2Pose = {
  x: number; y?: number; z: number; yaw: number;
  lift?: number; sx?: number; sy?: number; sz?: number; pitch?: number; roll?: number;
  eyeOpen: number; lookX?: number; lookY?: number; eyeScale?: number; cross?: number;
  mouth?: Mouth; talk?: number; brow?: number; browTilt?: number;
  wheel?: number; wheelBounce?: number[]; beacon?: number; glow?: number; sleep?: boolean;
  arm?: number; hookSway?: number; bodyRoll?: number;
};

export const ORANGE = '#ff8a1f';
const YELLOW = '#ffcf3a';
const DARK = '#2f3b57';
const RB = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 5, r);

function decal() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#ffcf3a'; x.beginPath(); x.arc(128, 128, 118, 0, 7); x.fill();
  x.lineWidth = 14; x.strokeStyle = '#ffffff'; x.stroke();
  x.font = 'bold 170px "Lilita One", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 18; x.strokeStyle = '#c95a00'; x.strokeText('B', 128, 140);
  x.fillStyle = '#ffffff'; x.fillText('B', 128, 140);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function rimTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#ffcf3a'; x.fillRect(0, 0, 256, 256);
  x.fillStyle = '#ffe58a'; x.beginPath();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = i % 2 ? 50 : 112; x.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); }
  x.fill();
  x.fillStyle = '#e09a10'; x.beginPath(); x.arc(128, 128, 34, 0, 7); x.fill();
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(110, 108, 12, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const Toy: React.FC<{color: string; rough?: number; ei?: number; map?: THREE.Texture}> = ({color, rough = 0.32, ei = 0, map}) => (
  <meshPhysicalMaterial color={color} map={map} roughness={rough} clearcoat={0.7} clearcoatRoughness={0.18} emissive={color} emissiveIntensity={ei} />
);

export const Bruno2: React.FC<{p: B2Pose}> = ({p}) => {
  const g = useMemo(() => ({
    chassis: RB(1.62, 0.36, 3.1, 0.14),
    cab: RB(1.62, 1.32, 1.32, 0.3),
    glass: RB(1.34, 0.66, 0.08, 0.07),
    side: RB(0.06, 0.52, 0.8, 0.04),
    door: RB(0.04, 0.95, 0.95, 0.12),
    bed: RB(1.6, 0.52, 1.55, 0.18),
    stripe: RB(1.63, 0.1, 1.5, 0.04),
    bumper: RB(1.82, 0.3, 0.34, 0.13),
    grille: RB(0.9, 0.18, 0.06, 0.05),
    fender: new THREE.TorusGeometry(0.5, 0.11, 10, 24, Math.PI),
    arm: RB(0.26, 0.26, 1.6, 0.09),
    tire: new THREE.CylinderGeometry(0.43, 0.43, 0.36, 40),
    tread: new THREE.TorusGeometry(0.43, 0.035, 8, 40),
    hub: new THREE.CircleGeometry(0.27, 32),
    bolt: new THREE.SphereGeometry(0.035, 8, 8),
    eye: new THREE.SphereGeometry(0.28, 32, 24),
    iris: new THREE.SphereGeometry(0.15, 24, 16),
    pupil: new THREE.SphereGeometry(0.09, 16, 12),
    shine: new THREE.SphereGeometry(0.05, 12, 8),
    shine2: new THREE.SphereGeometry(0.025, 8, 6),
    brow: new THREE.CapsuleGeometry(0.055, 0.3, 6, 12),
    closed: new THREE.TorusGeometry(0.17, 0.038, 10, 24, Math.PI),
    smile: new THREE.TorusGeometry(0.22, 0.05, 12, 32, Math.PI),
    ring: new THREE.TorusGeometry(0.11, 0.045, 12, 24),
    half: new THREE.CircleGeometry(0.5, 32, Math.PI, Math.PI),
    blob: new THREE.SphereGeometry(0.5, 20, 14),
    lamp: new THREE.SphereGeometry(0.13, 16, 12),
    turret: new THREE.CylinderGeometry(0.28, 0.33, 0.26, 24),
    cable: new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6),
    hook: new THREE.TorusGeometry(0.12, 0.04, 10, 20, Math.PI * 1.45),
    beacon: new THREE.CylinderGeometry(0.13, 0.16, 0.2, 20),
    beaconTop: new THREE.SphereGeometry(0.14, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mirrorArm: new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6),
    mirror: RB(0.08, 0.26, 0.2, 0.04),
    exhaust: new THREE.CylinderGeometry(0.07, 0.07, 0.8, 12),
    flap: RB(0.4, 0.3, 0.04, 0.03),
    decal: decal(),
    rim: rimTex(),
  }), []);

  const eo = Math.max(0.06, p.eyeOpen);
  const es = p.eyeScale ?? 1;
  const glow = p.glow ?? 0;
  const bea = p.beacon ?? 0;
  const lx = p.lookX ?? 0, ly = p.lookY ?? 0;
  const brow = p.brow ?? 0, bt = p.browTilt ?? 0;
  const armA = ((35 + (p.arm ?? 0)) * Math.PI) / 180;
  const tipY = 1.55 + 1.5 * Math.sin(armA), tipZ = -0.55 - 1.5 * Math.cos(armA);
  const mouth = p.mouth ?? 'smile';
  const tk = p.talk ?? 0;
  const wb = p.wheelBounce ?? [0, 0, 0, 0];
  const closedSleep = p.sleep && p.eyeOpen < 0.2;

  const eye = (sx: number) => {
    const cross = (p.cross ?? 0) * -sx * 0.9;
    return (
      <group position={[sx * 0.34, 1.7, 1.47]}>
        <group scale={[es, es * eo * 1.12, 0.5]} visible={!closedSleep}>
          <mesh geometry={g.eye} castShadow><meshPhysicalMaterial color="#ffffff" roughness={0.15} clearcoat={1} /></mesh>
          <group position={[(lx + cross) * 0.085, ly * 0.08, 0.2]}>
            <mesh geometry={g.iris}><meshStandardMaterial color="#3f2a1a" roughness={0.25} /></mesh>
            <mesh geometry={g.pupil} position={[0, 0, 0.08]}><meshStandardMaterial color="#0d0b12" roughness={0.2} /></mesh>
            <mesh geometry={g.shine} position={[0.055, 0.06, 0.13]}><meshBasicMaterial color="#ffffff" /></mesh>
            <mesh geometry={g.shine2} position={[-0.05, -0.05, 0.13]}><meshBasicMaterial color="#ffffff" /></mesh>
          </group>
        </group>
        {closedSleep ? (
          <mesh geometry={g.closed} rotation={[0, 0, Math.PI]} position={[0, 0.02, 0.06]} scale={[1.1, 0.8, 1]}><meshStandardMaterial color="#3a2010" /></mesh>
        ) : null}
        {/* ceja */}
        <mesh geometry={g.brow} position={[sx * -0.02, 0.36 + brow * 0.09 * es + (es - 1) * 0.2, 0.06]} rotation={[0, 0, Math.PI / 2 + sx * (bt * 0.35)]}>
          <meshStandardMaterial color="#5a2a0c" roughness={0.5} />
        </mesh>
      </group>
    );
  };

  const Wheel = ({x, z, i}: {x: number; z: number; i: number}) => (
    <group position={[x, 0.43 + wb[i], z]}>
      <group rotation={[p.wheel ?? 0, 0, 0]}>
        <mesh geometry={g.tire} rotation={[0, 0, Math.PI / 2]} castShadow><meshStandardMaterial color="#25252e" roughness={0.9} /></mesh>
        {[-0.12, 0, 0.12].map((o, k) => (
          <mesh key={k} geometry={g.tread} position={[o, 0, 0]} rotation={[0, Math.PI / 2, 0]}><meshStandardMaterial color="#1b1b22" roughness={0.95} /></mesh>
        ))}
        <mesh geometry={g.hub} position={[Math.sign(x) * 0.185, 0, 0]} rotation={[0, (Math.sign(x) * Math.PI) / 2, 0]}>
          <meshPhysicalMaterial map={g.rim} roughness={0.3} clearcoat={0.8} />
        </mesh>
      </group>
      <mesh geometry={g.fender} position={[0, wb[i] * -1 + 0.02, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1.6]} castShadow>
        <Toy color={ORANGE} ei={glow * 0.6} />
      </mesh>
    </group>
  );

  return (
    <group position={[p.x, (p.y ?? 0) + (p.lift ?? 0), p.z]} rotation={[0, p.yaw, 0]}>
      <group rotation={[p.pitch ?? 0, 0, p.roll ?? 0]} scale={[p.sx ?? 1, p.sy ?? 1, p.sz ?? 1]}>
        <mesh geometry={g.chassis} position={[0, 0.62, 0]} castShadow receiveShadow><Toy color={DARK} rough={0.5} /></mesh>
        <Wheel x={0.85} z={0.95} i={0} />
        <Wheel x={-0.85} z={0.95} i={1} />
        <Wheel x={0.85} z={-0.95} i={2} />
        <Wheel x={-0.85} z={-0.95} i={3} />
        <group rotation={[0, 0, p.bodyRoll ?? 0]}>
          {/* cabina */}
          <mesh geometry={g.cab} position={[0, 1.43, 0.75]} castShadow receiveShadow><Toy color={ORANGE} ei={glow * 0.6} /></mesh>
          <mesh geometry={g.glass} position={[0, 1.7, 1.4]}>
            <meshPhysicalMaterial color="#bfe8ff" roughness={0.05} clearcoat={1} emissive="#9fd8ff" emissiveIntensity={0.1} />
          </mesh>
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh geometry={g.side} position={[s * 0.81, 1.72, 0.8]}><meshPhysicalMaterial color="#bfe8ff" roughness={0.05} clearcoat={1} /></mesh>
              <mesh geometry={g.door} position={[s * 0.815, 1.3, 0.78]}><meshStandardMaterial color="#e2700f" roughness={0.4} /></mesh>
              <mesh position={[s * 0.84, 1.15, 0.78]} rotation={[0, (s * Math.PI) / 2, 0]}>
                <circleGeometry args={[0.24, 32]} /><meshStandardMaterial map={g.decal} transparent roughness={0.4} />
              </mesh>
              <mesh geometry={g.mirrorArm} position={[s * 0.92, 1.75, 1.25]} rotation={[0, 0, (s * Math.PI) / 2]}><meshStandardMaterial color="#5b6680" /></mesh>
              <mesh geometry={g.mirror} position={[s * 1.08, 1.82, 1.25]}><meshPhysicalMaterial color="#9fb3c8" metalness={0.6} roughness={0.15} /></mesh>
              <mesh geometry={g.flap} position={[s * 0.85, 0.42, -1.5]}><meshStandardMaterial color="#222" /></mesh>
            </group>
          ))}
          {eye(1)}
          {eye(-1)}
          {/* boca */}
          <group position={[0, 1.08, 1.42]}>
            {tk > 0.04 || mouth === 'open' ? (
              <group>
                <mesh geometry={g.half} scale={[0.5, 0.22 + 0.5 * Math.max(tk, mouth === 'open' ? 0.6 : 0), 1]} position={[0, 0.06, 0]}>
                  <meshStandardMaterial color="#4a1208" roughness={0.5} />
                </mesh>
                <mesh geometry={g.blob} scale={[0.2, 0.08, 0.04]} position={[0, 0.06 - 0.09 * Math.max(tk, 0.5), 0.01]}>
                  <meshStandardMaterial color="#ff6f86" roughness={0.5} />
                </mesh>
              </group>
            ) : mouth === 'o' ? (
              <mesh geometry={g.ring}><meshStandardMaterial color="#4a1208" /></mesh>
            ) : mouth === 'grin' ? (
              <group>
                <mesh geometry={g.half} scale={[0.62, 0.45, 1]} position={[0, 0.08, 0]}><meshStandardMaterial color="#4a1208" roughness={0.5} /></mesh>
                <mesh geometry={g.blob} scale={[0.5, 0.06, 0.03]} position={[0, 0.06, 0.01]}><meshStandardMaterial color="#ffffff" /></mesh>
                <mesh geometry={g.blob} scale={[0.25, 0.08, 0.04]} position={[0, -0.1, 0.01]}><meshStandardMaterial color="#ff6f86" /></mesh>
              </group>
            ) : mouth === 'flat' ? (
              <mesh geometry={g.brow} rotation={[0, 0, Math.PI / 2]} scale={[0.8, 0.8, 0.8]}><meshStandardMaterial color="#5a1e0e" /></mesh>
            ) : (
              <mesh geometry={g.smile} rotation={[0, 0, Math.PI]}><meshStandardMaterial color="#5a1e0e" roughness={0.4} /></mesh>
            )}
          </group>
          {[0.62, -0.62].map((x) => (
            <mesh key={x} geometry={g.blob} position={[x, 1.1, 1.41]} scale={[0.27, 0.17, 0.06]}><meshStandardMaterial color="#ff8f9e" roughness={0.6} /></mesh>
          ))}
          <mesh geometry={g.bumper} position={[0, 0.72, 1.47]} castShadow><meshPhysicalMaterial color="#d4dde9" roughness={0.18} metalness={0.55} clearcoat={0.6} /></mesh>
          <mesh geometry={g.grille} position={[0, 0.72, 1.65]}><meshStandardMaterial color="#5b6680" roughness={0.4} /></mesh>
          {[0.68, -0.68].map((x) => (
            <mesh key={x} geometry={g.lamp} position={[x, 0.74, 1.62]} scale={[1, 0.85, 0.5]}>
              <meshStandardMaterial color="#fff2a8" emissive="#ffd84a" emissiveIntensity={0.9} />
            </mesh>
          ))}
          <mesh geometry={g.beacon} position={[0, 2.19, 0.75]}><meshStandardMaterial color="#6b7385" roughness={0.4} /></mesh>
          <mesh geometry={g.beaconTop} position={[0, 2.28, 0.75]}>
            <meshStandardMaterial color="#ffb52e" emissive="#ff9a00" emissiveIntensity={0.2 + bea * 3} roughness={0.15} />
          </mesh>
          <mesh geometry={g.exhaust} position={[0.62, 1.9, 0.05]}><meshPhysicalMaterial color="#c8d2de" metalness={0.8} roughness={0.2} /></mesh>
          {/* caja trasera */}
          <mesh geometry={g.bed} position={[0, 1.04, -0.72]} castShadow receiveShadow><Toy color={ORANGE} ei={glow * 0.6} /></mesh>
          <mesh geometry={g.stripe} position={[0, 0.99, -0.72]}><Toy color={YELLOW} /></mesh>
          <mesh geometry={g.turret} position={[0, 1.41, -0.55]} castShadow><meshStandardMaterial color="#5b6680" roughness={0.45} metalness={0.25} /></mesh>
          <group position={[0, 1.55, -0.55]} rotation={[armA, 0, 0]}>
            <mesh geometry={g.arm} position={[0, 0, -0.75]} castShadow><Toy color={YELLOW} /></mesh>
          </group>
          <group position={[0, tipY, tipZ]} rotation={[p.hookSway ?? 0, 0, (p.hookSway ?? 0) * 0.6]}>
            <mesh geometry={g.cable} position={[0, -0.35, 0]}><meshStandardMaterial color="#3d4352" /></mesh>
            <mesh geometry={g.hook} position={[0, -0.78, 0]} rotation={[0, Math.PI / 2, Math.PI * 0.75]} castShadow>
              <meshPhysicalMaterial color="#aeb8c8" metalness={0.7} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
