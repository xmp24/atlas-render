import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type BrunoPose = {
  x: number; y?: number; z: number; yaw: number;
  lift?: number; sx?: number; sy?: number; sz?: number; pitch?: number; roll?: number;
  eyeOpen: number; lookX?: number; lookY?: number; mouth?: number; smile?: number;
  wheel?: number; beacon?: number; glow?: number; sleep?: boolean; hookSway?: number;
};

export const ORANGE = '#ff8a1f';
const YELLOW = '#ffcf3a';
const DARK = '#2f3b57';

const RB = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 5, r);

// plástico de juguete brillante
const Toy: React.FC<{color: string; rough?: number; emissive?: string; ei?: number}> = ({color, rough = 0.38, emissive = '#000000', ei = 0}) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.55} clearcoatRoughness={0.28} emissive={emissive} emissiveIntensity={ei} />
);

const Wheel: React.FC<{x: number; z: number; rot: number; g: any}> = ({x, z, rot, g}) => (
  <group position={[x, 0.42, z]} rotation={[rot, 0, 0]}>
    <mesh geometry={g.tire} rotation={[0, 0, Math.PI / 2]} castShadow>
      <meshStandardMaterial color="#2a2a33" roughness={0.85} />
    </mesh>
    <mesh geometry={g.hub} rotation={[0, 0, Math.PI / 2]} castShadow>
      <Toy color={YELLOW} />
    </mesh>
    <mesh geometry={g.cap} rotation={[0, 0, Math.PI / 2]}>
      <meshStandardMaterial color="#9aa6b8" roughness={0.3} metalness={0.4} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <mesh key={i} geometry={g.bolt} position={[Math.sign(x) * 0.19, Math.cos(a) * 0.15, Math.sin(a) * 0.15]}>
          <meshStandardMaterial color="#e09a10" roughness={0.4} />
        </mesh>
      );
    })}
  </group>
);

export const Bruno: React.FC<{p: BrunoPose}> = ({p}) => {
  const g = useMemo(() => {
    const smileT = new THREE.TorusGeometry(0.21, 0.05, 12, 32, Math.PI);
    return {
      chassis: RB(1.62, 0.36, 3.1, 0.14),
      cab: RB(1.6, 1.3, 1.3, 0.28),
      glass: RB(1.34, 0.64, 0.08, 0.06),
      side: RB(0.06, 0.5, 0.78, 0.03),
      bed: RB(1.58, 0.5, 1.55, 0.16),
      stripe: RB(1.6, 0.09, 1.5, 0.04),
      bumper: RB(1.78, 0.28, 0.32, 0.12),
      arm: RB(0.24, 0.24, 1.6, 0.08),
      tire: new THREE.CylinderGeometry(0.42, 0.42, 0.34, 36),
      hub: new THREE.CylinderGeometry(0.25, 0.25, 0.36, 28),
      cap: new THREE.CylinderGeometry(0.09, 0.09, 0.39, 16),
      bolt: new THREE.SphereGeometry(0.035, 8, 8),
      eye: new THREE.SphereGeometry(0.27, 32, 24),
      pupil: new THREE.SphereGeometry(0.135, 24, 16),
      shine: new THREE.SphereGeometry(0.048, 12, 8),
      closed: new THREE.TorusGeometry(0.17, 0.035, 10, 24, Math.PI),
      smile: smileT,
      mouthIn: new THREE.SphereGeometry(0.5, 24, 16),
      cheek: new THREE.SphereGeometry(0.5, 16, 12),
      lamp: new THREE.SphereGeometry(0.12, 16, 12),
      turret: new THREE.CylinderGeometry(0.28, 0.32, 0.26, 24),
      cable: new THREE.CylinderGeometry(0.018, 0.018, 0.7, 6),
      hook: new THREE.TorusGeometry(0.12, 0.038, 10, 20, Math.PI * 1.45),
      beacon: new THREE.CylinderGeometry(0.13, 0.15, 0.2, 20),
      beaconTop: new THREE.SphereGeometry(0.13, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    };
  }, []);

  const eo = Math.max(0.06, p.eyeOpen);
  const m = p.mouth ?? 0;
  const glow = p.glow ?? 0;
  const bea = p.beacon ?? 0;
  const lx = p.lookX ?? 0, ly = p.lookY ?? 0;
  const armA = (35 * Math.PI) / 180;
  const tipY = 1.55 + 1.5 * Math.sin(armA), tipZ = -0.55 - 1.5 * Math.cos(armA);

  const eye = (sx: number) => (
    <group position={[sx * 0.33, 1.68, 1.47]}>
      <group scale={[1, eo * 1.12, 0.5]} visible={!(p.sleep && p.eyeOpen < 0.2)}>
        <mesh geometry={g.eye} castShadow>
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh geometry={g.pupil} position={[lx * 0.085, ly * 0.08, 0.2]}>
          <meshStandardMaterial color="#14121e" roughness={0.2} />
        </mesh>
        <mesh geometry={g.shine} position={[lx * 0.085 + 0.055, ly * 0.08 + 0.065, 0.31]}>
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      {p.sleep && p.eyeOpen < 0.2 ? (
        <mesh geometry={g.closed} rotation={[0, 0, Math.PI]} position={[0, 0.02, 0.06]} scale={[1.1, 0.8, 1]}>
          <meshStandardMaterial color="#3a2010" />
        </mesh>
      ) : null}
    </group>
  );

  return (
    <group position={[p.x, (p.y ?? 0) + (p.lift ?? 0), p.z]} rotation={[0, p.yaw, 0]}>
      <group rotation={[p.pitch ?? 0, 0, p.roll ?? 0]} scale={[p.sx ?? 1, p.sy ?? 1, p.sz ?? 1]}>
        {/* chasis y ruedas */}
        <mesh geometry={g.chassis} position={[0, 0.62, 0]} castShadow receiveShadow>
          <Toy color={DARK} rough={0.5} />
        </mesh>
        <Wheel x={0.84} z={0.95} rot={p.wheel ?? 0} g={g} />
        <Wheel x={-0.84} z={0.95} rot={p.wheel ?? 0} g={g} />
        <Wheel x={0.84} z={-0.95} rot={p.wheel ?? 0} g={g} />
        <Wheel x={-0.84} z={-0.95} rot={p.wheel ?? 0} g={g} />
        {/* cabina */}
        <mesh geometry={g.cab} position={[0, 1.42, 0.75]} castShadow receiveShadow>
          <Toy color={ORANGE} emissive={ORANGE} ei={glow * 0.7} />
        </mesh>
        <mesh geometry={g.glass} position={[0, 1.68, 1.4]}>
          <meshPhysicalMaterial color="#bfe8ff" roughness={0.08} clearcoat={1} emissive="#9fd8ff" emissiveIntensity={0.12} />
        </mesh>
        <mesh geometry={g.side} position={[0.8, 1.68, 0.78]}>
          <meshPhysicalMaterial color="#bfe8ff" roughness={0.08} clearcoat={1} />
        </mesh>
        <mesh geometry={g.side} position={[-0.8, 1.68, 0.78]}>
          <meshPhysicalMaterial color="#bfe8ff" roughness={0.08} clearcoat={1} />
        </mesh>
        {eye(1)}
        {eye(-1)}
        {/* boca */}
        <group position={[0, 1.07, 1.41]}>
          {m < 0.06 ? (
            <mesh geometry={g.smile} rotation={[0, 0, Math.PI]} scale={[1 + (p.smile ?? 0) * 0.25, 1 + (p.smile ?? 0) * 0.35, 1]}>
              <meshStandardMaterial color="#5a1e0e" roughness={0.4} />
            </mesh>
          ) : (
            <group>
              <mesh geometry={g.mouthIn} scale={[0.42, 0.1 + 0.3 * m, 0.1]} position={[0, -0.02, 0]}>
                <meshStandardMaterial color="#4a1208" roughness={0.5} />
              </mesh>
              <mesh geometry={g.mouthIn} scale={[0.2, 0.08, 0.06]} position={[0, -0.04 - 0.09 * m, 0.03]}>
                <meshStandardMaterial color="#ff6f86" roughness={0.5} />
              </mesh>
            </group>
          )}
        </group>
        <mesh geometry={g.cheek} position={[0.6, 1.1, 1.4]} scale={[0.26, 0.17, 0.06]}>
          <meshStandardMaterial color="#ff8f9e" roughness={0.6} />
        </mesh>
        <mesh geometry={g.cheek} position={[-0.6, 1.1, 1.4]} scale={[0.26, 0.17, 0.06]}>
          <meshStandardMaterial color="#ff8f9e" roughness={0.6} />
        </mesh>
        {/* parachoques y faros */}
        <mesh geometry={g.bumper} position={[0, 0.72, 1.46]} castShadow>
          <meshStandardMaterial color="#c9d3e0" roughness={0.3} metalness={0.35} />
        </mesh>
        <mesh geometry={g.lamp} position={[0.66, 0.74, 1.6]} scale={[1, 0.85, 0.5]}>
          <meshStandardMaterial color="#fff2a8" emissive="#ffd84a" emissiveIntensity={0.6} />
        </mesh>
        <mesh geometry={g.lamp} position={[-0.66, 0.74, 1.6]} scale={[1, 0.85, 0.5]}>
          <meshStandardMaterial color="#fff2a8" emissive="#ffd84a" emissiveIntensity={0.6} />
        </mesh>
        {/* luz del techo */}
        <mesh geometry={g.beacon} position={[0, 2.17, 0.75]}>
          <meshStandardMaterial color="#6b7385" roughness={0.4} />
        </mesh>
        <mesh geometry={g.beaconTop} position={[0, 2.26, 0.75]}>
          <meshStandardMaterial color="#ffb52e" emissive="#ff9a00" emissiveIntensity={0.15 + bea * 2.2} roughness={0.2} />
        </mesh>
        {/* caja trasera con franja */}
        <mesh geometry={g.bed} position={[0, 1.03, -0.72]} castShadow receiveShadow>
          <Toy color={ORANGE} emissive={ORANGE} ei={glow * 0.7} />
        </mesh>
        <mesh geometry={g.stripe} position={[0, 0.98, -0.72]}>
          <Toy color={YELLOW} />
        </mesh>
        {/* grúa */}
        <mesh geometry={g.turret} position={[0, 1.4, -0.55]} castShadow>
          <meshStandardMaterial color="#5b6680" roughness={0.45} metalness={0.2} />
        </mesh>
        <group position={[0, 1.55, -0.55]} rotation={[armA, 0, 0]}>
          <mesh geometry={g.arm} position={[0, 0, -0.75]} castShadow>
            <Toy color={YELLOW} />
          </mesh>
        </group>
        <group position={[0, tipY, tipZ]} rotation={[0, 0, p.hookSway ?? 0]}>
          <mesh geometry={g.cable} position={[0, -0.35, 0]}>
            <meshStandardMaterial color="#3d4352" />
          </mesh>
          <mesh geometry={g.hook} position={[0, -0.78, 0]} rotation={[0, Math.PI / 2, Math.PI * 0.75]} castShadow>
            <meshStandardMaterial color="#8d97a8" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
