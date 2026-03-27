import React from 'react';
import useEcoStore from '../store/useEcoStore';
import Building from './Building';

export default function City() {
  const buildings = useEcoStore((s) => s.buildings);

  return (
    <group>
      {buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
    </group>
  );
}
