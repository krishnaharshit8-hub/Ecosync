import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import City from './City';
import PowerNode from './PowerNode';
import NeuralWires from './NeuralWire';
import GridFloor from './GridFloor';
import WeatherSky from './WeatherSky';
import WeatherEffects from './WeatherEffects';
import useEcoStore from '../store/useEcoStore';

function SceneContent() {
  return (
    <>
      <WeatherSky />
      <GridFloor />
      <City />
      <PowerNode type="solar" />
      <PowerNode type="wind" />
      <PowerNode type="hydro" />
      <PowerNode type="gas" />
      <NeuralWires />
      <WeatherEffects />
    </>
  );
}

export default function Scene() {
  const clearSelection = useEcoStore((s) => s.clearSelection);

  return (
    <Canvas
      camera={{ position: [0, 35, 35], fov: 45, near: 0.1, far: 200 }}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onPointerMissed={() => clearSelection()}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={(20 * Math.PI) / 180}
        maxPolarAngle={(85 * Math.PI) / 180}
        minDistance={10}
        maxDistance={80}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
