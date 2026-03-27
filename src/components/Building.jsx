import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import useEcoStore from '../store/useEcoStore';

const TYPE_EMISSIVE = {
  hospital: '#FF2222',
  commercial: '#00AAFF',
  residential: '#00DD77',
};

const TYPE_ICONS = {
  hospital: '🏥',
  commercial: '🏢',
  residential: '🏠',
};

function ResidentialBuilding({ height, active, emissiveIntensity }) {
  return (
    <group>
      {/* Main Body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, height, 1.2]} />
        <meshStandardMaterial
          color="#8B6347"
          emissive={TYPE_EMISSIVE.residential}
          emissiveIntensity={emissiveIntensity * 0.5}
          roughness={0.95}
          transparent
          opacity={active ? 1 : 0.4}
        />
      </mesh>
      {/* Triangular Roof (Cone reversed) */}
      <mesh position={[0, height + 0.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.9, 0.6, 4]} />
        <meshStandardMaterial
          color="#8B2020"
          roughness={0.95}
          transparent
          opacity={active ? 1 : 0.4}
        />
      </mesh>
      {/* Light inside */}
      {active && <pointLight position={[0, height / 2, 0]} distance={4} intensity={0.3} color="#FFCC88" />}
    </group>
  );
}

function CommercialBuilding({ height, active, emissiveIntensity }) {
  const h1 = height * 0.40;
  const h2 = height * 0.35;
  const h3 = height * 0.25;

  const w1 = 1.4;
  const w2 = w1 * 0.85;
  const w3 = w2 * 0.85;

  const glassMatProps = {
    color: '#001122',
    emissive: '#003366',
    emissiveIntensity: emissiveIntensity * 2.0,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: active ? 0.8 : 0.3,
  };

  return (
    <group>
      {/* Floor 1 */}
      <mesh position={[0, h1 / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w1, h1, w1]} />
        <meshStandardMaterial {...glassMatProps} />
      </mesh>
      {/* Decorative banding F1 */}
      <mesh position={[0, h1 / 2, 0]}>
        <boxGeometry args={[w1 * 1.02, h1 * 0.1, w1 * 1.02]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Floor 2 */}
      <mesh position={[0, h1 + h2 / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w2, h2, w2]} />
        <meshStandardMaterial {...glassMatProps} />
      </mesh>

      {/* Floor 3 */}
      <mesh position={[0, h1 + h2 + h3 / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w3, h3, w3]} />
        <meshStandardMaterial {...glassMatProps} />
      </mesh>

      {/* Light inside */}
      {active && <pointLight position={[0, height / 2, 0]} distance={6} intensity={0.3} color="#FFFFEE" />}
    </group>
  );
}

function HospitalBuilding({ active, emissiveIntensity }) {
  const concreteMatProps = {
    color: '#CCCCCC',
    emissive: TYPE_EMISSIVE.hospital,
    emissiveIntensity: emissiveIntensity * 0.3,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: active ? 1 : 0.4,
  };

  return (
    <group>
      {/* Main Wing */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.5, 1.5]} />
        <meshStandardMaterial {...concreteMatProps} />
      </mesh>

      {/* Side Wing */}
      <mesh position={[0, 0.6, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.2, 2.5]} />
        <meshStandardMaterial {...concreteMatProps} />
      </mesh>

      {/* Helipad */}
      <mesh position={[-0.6, 1.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.6, 1.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={0.5} />
      </mesh>

      {/* Red Cross */}
      <group position={[0.6, 1.55, 0]}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.2]} />
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1.0} roughness={0} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 0.6]} />
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1.0} roughness={0} />
        </mesh>
      </group>

      {/* Light inside */}
      {active && <pointLight position={[0, 0.75, 0]} distance={5} intensity={0.3} color="#FFFFFF" />}
    </group>
  );
}


export default function Building({ building }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const selectBuilding = useEcoStore((s) => s.selectBuilding);
  const selectedBuilding = useEcoStore((s) => s.selectedBuilding);
  
  const isSelected = selectedBuilding?.id === building.id;
  const emissiveColor = TYPE_EMISSIVE[building.type];
  const energyPercent = building.battery_soc / 100;

  // Use refs for animation to save 60fps
  const animState = useRef({ intensity: 0.4 });

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;
    
    // Slow pulsing when active
    const pulse = Math.sin(t * 2 + building.position[0]) * 0.2 + 0.6; // 0.4 to 0.8
    const targetIntensity = building.active ? pulse : 0.05;
    
    // Lerp state for smoothness
    animState.current.intensity = THREE.MathUtils.lerp(
      animState.current.intensity,
      targetIntensity,
      0.1
    );

    const targetScale = hovered ? 1.05 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  const handleClick = (e) => {
    e.stopPropagation();
    selectBuilding(building);
  };

  return (
    <group position={building.position} rotation={[building.tilt[0], building.rotationY, building.tilt[2]]}>
      
      {/* Ground Shadow Plane */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Scale Group */}
      <group
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={handleClick}
      >
        {/* Building Geometry based on Type */}
        {building.type === 'residential' && <ResidentialBuilding height={building.height} active={building.active} emissiveIntensity={animState.current.intensity} />}
        {building.type === 'commercial' && <CommercialBuilding height={building.height} active={building.active} emissiveIntensity={animState.current.intensity} />}
        {building.type === 'hospital' && <HospitalBuilding active={building.active} emissiveIntensity={animState.current.intensity} />}

        {/* Energy bar on side depending on height */}
        {building.active && (
          <mesh position={[0.65, energyPercent * building.height * 0.5, 0]}>
            <boxGeometry args={[0.06, energyPercent * building.height, 0.06]} />
            <meshStandardMaterial
              color={energyPercent > 0.5 ? '#00ff88' : energyPercent > 0.25 ? '#ffaa00' : '#ff3333'}
              emissive={energyPercent > 0.5 ? '#00ff88' : energyPercent > 0.25 ? '#ffaa00' : '#ff3333'}
              emissiveIntensity={0.8}
            />
          </mesh>
        )}
      </group>

      {/* Floating label */}
      <Billboard position={[0, building.height + 1.2, 0]}>
        <Text
          fontSize={0.22}
          color={building.active ? '#ffffff' : '#666666'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {building.code}
        </Text>
      </Billboard>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, building.height + 2.5, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(6, 13, 26, 0.95)',
            border: `1px solid ${emissiveColor}`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#E0E8F0',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: emissiveColor }}>
              {TYPE_ICONS[building.type]} {building.name}
            </div>
            <div>Code: <span style={{color: '#fff', fontWeight: 600}}>{building.code}</span></div>
            <div>Status: {building.active ? '🟢 Online' : '🔴 Offline'}</div>
          </div>
        </Html>
      )}
    </group>
  );
}
