import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {grassTex, plazaTex, roadTex, stripeTex, signTex, clockTex} from './tex';
import {hash} from './anim';

const RB = (w: number, h: number, d: number, r = 0.25) => new RoundedBoxGeometry(w, h, d, 4, r);
const P: React.FC<{c: string; r?: number; map?: THREE.Texture; e?: string; ei?: number}> = ({c, r = 0.55, map, e, ei = 0}) => (
  <meshStandardMaterial color={c} roughness={r} map={map} emissive={e ?? '#000'} emissiveIntensity={ei} />
);

// Cielo degradado
export const Sky: React.FC<{dawn: number}> = ({dawn}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {top: {value: new THREE.Color('#5ab8ff')}, mid: {value: new THREE.Color('#a9dcff')}, hor: {value: new THREE.Color('#e8f7ff')}},
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(vP.y,0.0,1.0); vec3 c = mix(hor, mid, smoothstep(0.0,0.18,h)); c = mix(c, top, smoothstep(0.18,0.75,h)); gl_FragColor = vec4(c,1.0); #include <colorspace_fragment> }',
  }), []);
  // amanecer: horizonte melocotón que pasa a día
  const d = dawn;
  mat.uniforms.hor.value.set('#e8f7ff').lerp(new THREE.Color('#ffd2a8'), d);
  mat.uniforms.mid.value.set('#a9dcff').lerp(new THREE.Color('#ffc9d6'), d * 0.6);
  mat.uniforms.top.value.set('#5ab8ff').lerp(new THREE.Color('#7aa6f0'), d * 0.5);
  return <mesh material={mat}><sphereGeometry args={[400, 32, 16]} /></mesh>;
};

const Tree: React.FC<{x: number; z: number; s: number; v: number}> = ({x, z, s, v}) => {
  const greens = ['#4fbf5a', '#63c95f', '#3fae6a', '#7bd36b'];
  const c = greens[Math.floor(v * 4) % 4];
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.9, 0]} castShadow><cylinderGeometry args={[0.22, 0.3, 1.8, 10]} /><P c="#9a6a3c" r={0.8} /></mesh>
      {v > 0.5 ? (
        <>
          <mesh position={[0, 2.5, 0]} castShadow><sphereGeometry args={[1.25, 18, 14]} /><P c={c} r={0.7} /></mesh>
          <mesh position={[0.7, 2.1, 0.3]} castShadow><sphereGeometry args={[0.8, 14, 12]} /><P c={c} r={0.7} /></mesh>
          <mesh position={[-0.6, 2.2, -0.3]} castShadow><sphereGeometry args={[0.85, 14, 12]} /><P c={c} r={0.7} /></mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 2.4, 0]} castShadow><coneGeometry args={[1.25, 2.4, 14]} /><P c={c} r={0.7} /></mesh>
          <mesh position={[0, 3.4, 0]} castShadow><coneGeometry args={[0.9, 1.8, 14]} /><P c={c} r={0.7} /></mesh>
        </>
      )}
    </group>
  );
};

const House: React.FC<{x: number; z: number; ry: number; c: string; roof: string; s?: number}> = ({x, z, ry, c, roof, s = 1}) => {
  const g = useMemo(() => ({body: RB(3.6, 3, 3.4, 0.2), win: RB(0.8, 0.8, 0.1, 0.08), door: RB(0.9, 1.5, 0.12, 0.1)}), []);
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]} scale={s}>
      <mesh geometry={g.body} position={[0, 1.5, 0]} castShadow receiveShadow><P c={c} /></mesh>
      <mesh position={[0, 3.75, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[3.05, 1.7, 4]} /><P c={roof} r={0.5} /></mesh>
      <mesh geometry={g.door} position={[0, 0.78, 1.72]}><P c="#8a5a3a" /></mesh>
      <mesh geometry={g.win} position={[-1.05, 1.9, 1.72]}><P c="#cdeeff" r={0.15} e="#fff3c4" ei={0.15} /></mesh>
      <mesh geometry={g.win} position={[1.05, 1.9, 1.72]}><P c="#cdeeff" r={0.15} e="#fff3c4" ei={0.15} /></mesh>
      <mesh position={[1.1, 4.1, -0.4]} castShadow><boxGeometry args={[0.4, 0.9, 0.4]} /><P c="#d9776a" /></mesh>
    </group>
  );
};

// Edificio con letrero y puerta que se enrolla (open 0..1)
const Building: React.FC<{x: number; z: number; ry: number; w: number; h: number; d: number; c: string; trim: string; sign: string; signBg: string; door: string; doorB: string; open?: number; children?: React.ReactNode}> =
  ({x, z, ry, w, h, d, c, trim, sign, signBg, door, doorB, open = 0, children}) => {
  const g = useMemo(() => ({body: RB(w, h, d, 0.35), trim: RB(w + 0.3, 0.45, d + 0.3, 0.18), frame: RB(4.8, 4.0, 0.3, 0.15), sign: RB(w * 0.72, 1.4, 0.25, 0.2)}), [w, h, d]);
  const dt = stripeTex('door' + door, door, doorB, 10);
  const dh = 3.4 * (1 - open * 0.94);
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh geometry={g.body} position={[0, h / 2, 0]} castShadow receiveShadow><P c={c} /></mesh>
      <mesh geometry={g.trim} position={[0, h, 0]} castShadow><P c={trim} /></mesh>
      <mesh geometry={g.frame} position={[0, 2.0, d / 2]}><P c={trim} /></mesh>
      {/* interior oscuro cálido */}
      <mesh position={[0, 1.75, d / 2 + 0.165]}><planeGeometry args={[4.2, 3.4]} /><meshStandardMaterial color="#231d33" emissive="#ffc27a" emissiveIntensity={0.12 * open} /></mesh>
      <mesh position={[0, 0.05 + 3.4 - dh / 2, d / 2 + 0.18]}>
        <planeGeometry args={[4.2, dh]} />
        <meshStandardMaterial map={dt} roughness={0.5} />
      </mesh>
      <mesh geometry={g.sign} position={[0, h - 0.9, d / 2 + 0.2]} castShadow><P c="#ffffff" /></mesh>
      <mesh position={[0, h - 0.9, d / 2 + 0.34]}>
        <planeGeometry args={[w * 0.68, 1.25]} />
        <meshStandardMaterial map={signTex(sign, signBg, '#ffffff')} transparent roughness={0.5} />
      </mesh>
      {children}
    </group>
  );
};

const inRoad = (x: number, z: number, m = 3.2) => Math.abs(z) < m || Math.abs(x) < m;

export const Town: React.FC<{t: number; garageOpen: number}> = ({t, garageOpen}) => {
  const trees = useMemo(() => {
    const out: {x: number; z: number; s: number; v: number}[] = [];
    let i = 0;
    while (out.length < 46 && i < 2000) {
      i++;
      const a = hash(i) * Math.PI * 2, r = 11 + hash(i + 99) * 48;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (inRoad(x, z, 4.2)) continue;
      // fuera de edificios
      const blocks = [[20, -12, 7], [-20, -12, 7], [0, -32, 9], [22, 14, 7]];
      if (blocks.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br)) continue;
      if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 4)) continue;
      out.push({x, z, s: 0.8 + hash(i + 7) * 0.6, v: hash(i + 3)});
    }
    return out;
  }, []);
  const houses: [number, number, number, string, string][] = [
    [-6, 22, Math.PI, '#ffc2d4', '#ff6f91'], [9, 12, Math.PI, '#c9b6ff', '#7b61ff'], [-14, 18, Math.PI * 0.9, '#bff0d4', '#3fbf86'],
    [-30, -4, Math.PI / 2, '#ffe0b3', '#ff8a5c'], [-29, 9, Math.PI / 2, '#d4f2ff', '#4aa8ff'], [33, -2, -Math.PI / 2, '#fff1a8', '#ffb400'],
    [10, -24, 0, '#ffd1dc', '#ff7aa2'], [-10, -24, 0, '#d8ffc9', '#5fcf54'], [34, 24, -Math.PI * 0.75, '#e6d4ff', '#9b6bff'],
    [-8, 30, Math.PI, '#ffe3c2', '#ff9a52'], [12, 30, Math.PI, '#c8f3ff', '#33b5e5'],
  ];
  const gt = grassTex(), pt = plazaTex(), rt = roadTex();
  const cl = clockTex();
  return (
    <group>
      {/* suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[260, 64]} /><meshStandardMaterial map={gt} roughness={0.95} /></mesh>
      {/* carreteras */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, r]} position={[Math.sin(r) * 34, 0.02, Math.cos(r) * 34]} receiveShadow>
          <planeGeometry args={[4.6, 54]} /><meshStandardMaterial map={rt} roughness={0.8} />
        </mesh>
      ))}
      {/* plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow><circleGeometry args={[8.2, 64]} /><meshStandardMaterial map={pt} roughness={0.75} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]} receiveShadow><ringGeometry args={[8.2, 8.75, 64]} /><P c="#ffffff" /></mesh>
      {/* flores alrededor de la plaza */}
      {Array.from({length: 40}).map((_, i) => {
        const a = (i / 40) * Math.PI * 2;
        if (Math.abs(Math.sin(a)) < 0.2 || Math.abs(Math.cos(a)) < 0.2) return null;
        const cols = ['#ff5f7e', '#ffd23f', '#ff9df5', '#ffffff', '#ff8a1f'];
        return (
          <group key={i} position={[Math.cos(a) * 9.4, 0, Math.sin(a) * 9.4]}>
            <mesh position={[0, 0.35, 0]}><sphereGeometry args={[0.55, 10, 8]} /><P c="#58c45a" r={0.8} /></mesh>
            <mesh position={[0.15, 0.75, 0.1]}><sphereGeometry args={[0.16, 8, 6]} /><P c={cols[i % 5]} r={0.5} /></mesh>
            <mesh position={[-0.2, 0.7, -0.1]}><sphereGeometry args={[0.14, 8, 6]} /><P c={cols[(i + 2) % 5]} r={0.5} /></mesh>
          </group>
        );
      })}
      {/* farolas */}
      {[[4, 4.5], [-4, -4.5], [4, -4.5], [14, 3.6], [26, 3.6], [-14, -3.6], [-26, 3.6]].map(([x, z], i) => (
        <group key={i} position={[x * (Math.abs(x) < 5 ? 2.15 : 1), 0, z * (Math.abs(x) < 5 ? 1.45 : 1)]}>
          <mesh position={[0, 1.6, 0]} castShadow><cylinderGeometry args={[0.08, 0.11, 3.2, 8]} /><P c="#3b4a6b" /></mesh>
          <mesh position={[0, 3.35, 0]}><sphereGeometry args={[0.3, 14, 10]} /><P c="#fff6c8" e="#ffe08a" ei={0.4} /></mesh>
        </group>
      ))}
      {/* edificios */}
      <Building x={20} z={-12} ry={0} w={9} h={5.6} d={7} c="#3d8bff" trim="#ffffff" sign="GARAJE" signBg="#1f5fd1" door="#d7e9ff" doorB="#b7d4ff" open={garageOpen} />
      <Building x={-20} z={-12} ry={0} w={9} h={5.2} d={7} c="#7fe3ff" trim="#ffffff" sign="LAVADERO" signBg="#16a6d9" door="#ffffff" doorB="#c9f3ff">
        {[[-2.5, 6.4, 0.9], [-0.6, 6.9, 1.2], [1.6, 6.5, 1.0], [3, 7.2, 0.6], [0.4, 8.1, 0.7]].map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, 0.5]}><sphereGeometry args={[r, 20, 16]} /><meshPhysicalMaterial color="#e9fbff" roughness={0.05} transmission={0} transparent opacity={0.55} clearcoat={1} /></mesh>
        ))}
      </Building>
      <Building x={0} z={-32} ry={0} w={12} h={6.2} d={8} c="#39c47a" trim="#fff7e0" sign="ESTACIÓN" signBg="#1f8a55" door="#fff7e0" doorB="#e6dcc0">
        <mesh position={[0, 8.0, 0]} castShadow><cylinderGeometry args={[1.7, 1.7, 0.6, 32]} /><P c="#fff7e0" /></mesh>
        <mesh position={[0, 8.0, 0.31]}><circleGeometry args={[1.5, 32]} /><meshStandardMaterial map={cl} /></mesh>
        <mesh position={[0, 6.6, 0]} castShadow><boxGeometry args={[2.6, 1.0, 2.6]} /><P c="#39c47a" /></mesh>
      </Building>
      <Building x={22} z={14} ry={Math.PI} w={9} h={5.6} d={7} c="#ff4b4b" trim="#ffffff" sign="BOMBEROS" signBg="#c9182b" door="#ffffff" doorB="#ffd6d6">
        <mesh position={[3.4, 7, 0]} castShadow><boxGeometry args={[1.6, 3, 1.6]} /><P c="#ff4b4b" /></mesh>
        <mesh position={[3.4, 8.8, 0]}><sphereGeometry args={[0.45, 16, 12]} /><P c="#ffd23f" e="#ff9a00" ei={0.3} /></mesh>
      </Building>
      {houses.map(([x, z, ry, c, r], i) => <House key={i} x={x} z={z} ry={ry} c={c} roof={r} />)}
      {trees.map((tr, i) => <Tree key={i} {...tr} />)}
      {/* colinas lejanas */}
      {Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + 0.2, r = 95 + hash(i + 40) * 30;
        const cols = ['#7ccf6a', '#6cc46a', '#8fd877', '#5fb862'];
        return (
          <mesh key={i} position={[Math.cos(a) * r, -4, Math.sin(a) * r]} scale={[1, 0.42 + hash(i) * 0.25, 1]}>
            <sphereGeometry args={[26 + hash(i + 5) * 14, 24, 16]} /><P c={cols[i % 4]} r={0.95} />
          </mesh>
        );
      })}
      {/* nubes */}
      {Array.from({length: 11}).map((_, i) => {
        const a = (i / 11) * Math.PI * 2, r = 45 + hash(i + 70) * 50;
        const dx = ((t * 0.6 + hash(i) * 40) % 80) - 40;
        return (
          <group key={i} position={[Math.cos(a) * r + dx, 26 + hash(i + 11) * 14, Math.sin(a) * r]} scale={1.4 + hash(i + 3)}>
            {[[0, 0, 0, 2.4], [2.2, -0.4, 0.3, 1.8], [-2.2, -0.5, 0, 1.7], [0.9, 1.1, 0, 1.6], [-1, 0.8, 0.4, 1.4]].map(([x, y, z, rr], j) => (
              <mesh key={j} position={[x, y, z]}><sphereGeometry args={[rr, 16, 12]} /><meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.25} /></mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};
