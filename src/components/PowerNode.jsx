import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import useEcoStore from '../store/useEcoStore';

const NODE_CONFIG = {
  solar: {
    position: [-18, 0, -10],
    color: '#FFD700',
    emissive: '#FFD700',
    label: 'SOLAR',
    icon: '☀️',
  },
  wind: {
    position: [18, 0, -10],
    color: '#00D4FF',
    emissive: '#00D4FF',
    label: 'WIND',
    icon: '💨',
  },
  hydro: {
    position: [-18, 0, 10],
    color: '#0066FF',
    emissive: '#0066FF',
    label: 'HYDRO',
    icon: '💧',
  },
  gas: {
    position: [18, 0, 10],
    color: '#FF6B00',
    emissive: '#FF6B00',
    label: 'GAS',
    icon: '🔥',
  },
};

// Solar Node sub-component
function SolarNode({ config, data }) {
  const groupRef = useRef();
  const panelRefs = useRef([]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group>
      {/* Hexagonal platform */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 6]} />
        <meshStandardMaterial
          color="#1a1a00"
          emissive="#FFD700"
          emissiveIntensity={data.active ? 0.2 : 0.02}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Solar panels grid (rotating) */}
      <group ref={groupRef} position={[0, 0.3, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const r = 1.5;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0.1, Math.sin(angle) * r]}
              rotation={[-Math.PI / 4, angle, 0]}
            >
              <boxGeometry args={[0.8, 0.05, 0.6]} />
              <meshStandardMaterial
                color="#1a2a44"
                emissive="#FFD700"
                emissiveIntensity={data.active ? 0.4 : 0.02}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Sun ray particles */}
      {data.active && (
        <SunRays />
      )}
    </group>
  );
}

function SunRays() {
  const pointsRef = useRef();
  const count = 30;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1 + Math.random() * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = 0.5 + Math.random() * 2;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.02;
      if (pos[i * 3 + 1] > 3) pos[i * 3 + 1] = 0.5;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FFD700"
        size={0.15}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Wind Node sub-component
function WindNode({ config, data }) {
  const blade1Ref = useRef();
  const blade2Ref = useRef();
  const blade3Ref = useRef();

  const weatherData = useEcoStore((s) => s.weatherData);
  const speed = weatherData.wind_speed * 0.3;

  useFrame(() => {
    const s = data.active ? speed : 0.02;
    if (blade1Ref.current) blade1Ref.current.rotation.z += s * 0.05;
    if (blade2Ref.current) blade2Ref.current.rotation.z += s * 0.05;
    if (blade3Ref.current) blade3Ref.current.rotation.z += s * 0.05;
  });

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.2, 0.4, 4, 8]} />
        <meshStandardMaterial
          color="#1a3355"
          emissive="#00D4FF"
          emissiveIntensity={data.active ? 0.15 : 0.02}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Hub */}
      <mesh position={[0, 4.1, 0.3]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#334466" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Blades */}
      {[0, 120, 240].map((angle, i) => (
        <group key={i} position={[0, 4.1, 0.3]} rotation={[0, 0, (angle * Math.PI) / 180]}
          ref={i === 0 ? blade1Ref : i === 1 ? blade2Ref : blade3Ref}
        >
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.1, 2.2, 0.05]} />
            <meshStandardMaterial
              color="#2a4a6a"
              emissive="#00D4FF"
              emissiveIntensity={data.active ? 0.2 : 0.02}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Hydro Node sub-component
function HydroNode({ config, data }) {
  const waterRef = useRef();

  return (
    <group>
      {/* Dam shape */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[3, 1.6, 1.5]} />
        <meshStandardMaterial
          color="#0a2244"
          emissive="#0066FF"
          emissiveIntensity={data.active ? 0.2 : 0.02}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* Dam top ridge */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[3.3, 0.1, 1.7]} />
        <meshStandardMaterial
          color="#1a3366"
          emissive="#0066FF"
          emissiveIntensity={data.active ? 0.3 : 0.02}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Water flow particles */}
      {data.active && <WaterFlow />}
    </group>
  );
}

function WaterFlow() {
  const pointsRef = useRef();
  const count = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 1] = Math.random() * -1.5;
      pos[i * 3 + 2] = 0.8 + Math.random() * 0.5;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.04;
      if (pos[i * 3 + 1] < -2) {
        pos[i * 3 + 1] = 0;
        pos[i * 3] = (Math.random() - 0.5) * 2.5;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#0088FF"
        size={0.12}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Gas Node sub-component
function GasNode({ config, data }) {
  const flameRef = useRef();

  useFrame((state) => {
    if (flameRef.current && data.active) {
      const t = state.clock.elapsedTime;
      flameRef.current.scale.set(
        1 + Math.sin(t * 8) * 0.15,
        1 + Math.sin(t * 10 + 1) * 0.25,
        1 + Math.sin(t * 7 + 2) * 0.15
      );
      flameRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 12) * 0.3;
    }
  });

  return (
    <group>
      {/* Industrial tower */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 3, 8]} />
        <meshStandardMaterial
          color="#2a1a0a"
          emissive="#FF6B00"
          emissiveIntensity={data.active ? 0.15 : 0.02}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Stack */}
      <mesh position={[0, 3.3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Flame */}
      {data.active && (
        <mesh ref={flameRef} position={[0, 3.8, 0]}>
          <coneGeometry args={[0.25, 0.8, 8]} />
          <meshStandardMaterial
            color="#FF4400"
            emissive="#FF6B00"
            emissiveIntensity={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Secondary flame */}
      {data.active && (
        <mesh position={[0, 4.1, 0]}>
          <coneGeometry args={[0.12, 0.4, 6]} />
          <meshStandardMaterial
            color="#FFAA00"
            emissive="#FFD700"
            emissiveIntensity={0.6}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

// Main PowerNode wrapper
export default function PowerNode({ type }) {
  const config = NODE_CONFIG[type];
  const data = useEcoStore((s) => s.powerSources[type]);
  const ringRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005;
      ringRef.current.material.opacity = data.active
        ? 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15
        : 0.05;
    }
    if (auraRef.current) {
      const pulseScale = data.active
        ? 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2 * (data.output_kw / data.max_kw)
        : 0.5;
      auraRef.current.scale.set(pulseScale, 1, pulseScale);
      auraRef.current.material.opacity = data.active ? 0.08 : 0.01;
    }
  });

  const NodeComponent = {
    solar: SolarNode,
    wind: WindNode,
    hydro: HydroNode,
    gas: GasNode,
  }[type];

  const arrow = data.output_kw > 0 ? '▲' : '▼';

  return (
    <group position={config.position}>
      {/* Node geometry */}
      <NodeComponent config={config} data={data} />

      {/* Base ring */}
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.2, 32]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={0.3}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pulsing aura */}
      <mesh ref={auraRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 32]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={0.06}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating label */}
      <Billboard position={[0, type === 'wind' ? 5.5 : 3.5, 0]}>
        <Text
          fontSize={0.35}
          color={data.active ? config.color : '#555555'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          font={undefined}
        >
          {`${config.label} — ${data.output_kw.toFixed(1)} kW ${arrow}`}
        </Text>
      </Billboard>
    </group>
  );
}
