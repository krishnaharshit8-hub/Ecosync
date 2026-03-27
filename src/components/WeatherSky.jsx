import React from 'react';
import useEcoStore from '../store/useEcoStore';

export default function WeatherSky() {
  const weatherData = useEcoStore((s) => s.weatherData);
  const weatherOverride = useEcoStore((s) => s.weatherOverride);

  // Apply visual overrides
  let cloudFactor = weatherData.clouds / 100;
  let ambientIntensity = 0.15 + (1 - cloudFactor) * 0.2;
  let skyTint = '#060D1A'; // Default deep navy

  switch (weatherOverride) {
    case 'OVERCAST':
      cloudFactor = 1.0;
      ambientIntensity = 0.15;
      break;
    case 'THUNDERSTORM':
      cloudFactor = 1.0;
      ambientIntensity = 0.1;
      skyTint = '#040811';
      break;
    case 'HEAT_WAVE':
      cloudFactor = 0.0;
      ambientIntensity = 0.4;
      skyTint = '#1a0d05';
      break;
    case 'BLIZZARD':
      cloudFactor = 1.0;
      ambientIntensity = 0.2;
      skyTint = '#081222';
      break;
    case 'PERFECT_WIND':
      cloudFactor = 0.2;
      ambientIntensity = 0.3;
      break;
  }

  return (
    <>
      {/* Ambient light - brighter when sunny, tinted for extreme weather */}
      <ambientLight 
        intensity={ambientIntensity} 
        color={weatherOverride === 'HEAT_WAVE' ? '#ffcc88' : weatherOverride === 'BLIZZARD' ? '#99ccff' : '#88aacc'} 
      />

      {/* Directional "sun" - dims with clouds */}
      <directionalLight
        position={[15, 25, 10]}
        intensity={0.3 * (1 - cloudFactor * 0.5)}
        color={weatherOverride === 'HEAT_WAVE' ? '#ff9900' : '#ffeedd'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-near={1}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Soft fill light */}
      <pointLight position={[0, 10, 0]} intensity={0.2} color="#00D4FF" distance={40} />

      {/* Weather-based atmosphere fog */}
      <fogExp2 attach="fog" color={skyTint} density={0.012} />

      {/* Background color */}
      <color attach="background" args={[skyTint]} />
    </>
  );
}
