import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export default function GridFloor() {
  const shaderRef = useRef();
  const faintShaderRef = useRef();

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // The flat inner tech grid (40x40 roughly)
  const gridShader = useMemo(() => ({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vec2 p = vWorldPos.xz;

        vec2 grid = abs(fract(p * 0.5 - 0.5) - 0.5) / fwidth(p * 0.5);
        float line = min(grid.x, grid.y);
        float gridAlpha = 1.0 - min(line, 1.0);

        vec2 subGrid = abs(fract(p * 2.0 - 0.5) - 0.5) / fwidth(p * 2.0);
        float subLine = min(subGrid.x, subGrid.y);
        float subGridAlpha = (1.0 - min(subLine, 1.0)) * 0.15;

        float circuit = sin(p.x * 3.0 + uTime * 0.3) * sin(p.y * 3.0 - uTime * 0.2);
        circuit = smoothstep(0.8, 1.0, circuit) * 0.1;

        vec3 gridColor = vec3(0.0, 0.83, 1.0); // #00D4FF
        vec3 color = gridColor * (gridAlpha * 0.3 + subGridAlpha + circuit);

        // No distance fade, constant 0.3 opacity base
        gl_FragColor = vec4(color, 0.3);
      }
    `,
  }), []);

  // Layer 2: Massive faint outer grid under terrain
  const faintGridShader = useMemo(() => ({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader: `
      varying vec3 vWorldPos;

      void main() {
        vec2 p = vWorldPos.xz;
        vec2 grid = abs(fract(p * 0.2 - 0.5) - 0.5) / fwidth(p * 0.2);
        float linewidth = 0.01;
        float line = min(grid.x, grid.y);
        float alpha = 1.0 - smoothstep(linewidth, linewidth + 0.02, line);

        gl_FragColor = vec4(0.0, 0.83, 1.0, alpha * 0.06); 
      }
    `,
  }), []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Generate organic terrain for outskirts
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 200, 80, 80);
    const noise2D = createNoise2D();
    const pos = geo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const distFromCenter = Math.sqrt(x*x + y*y);
        
        let height = 0;
        if (distFromCenter > 18) {
            const blend = THREE.MathUtils.smoothstep(distFromCenter, 18, 30);
            height = noise2D(x * 0.03, y * 0.03) * 3.0 * blend;
        }
        
        pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Outer organic terrain (Layer 3) */}
      <mesh geometry={terrainGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#1a2a1a" 
          roughness={0.9} 
          metalness={0.1}
          transparent={true} // Allow Extended grid to bleed through
          depthWrite={false}
        />
      </mesh>

      {/* Extended Outer Grid (Layer 2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[180, 180]} />
        <shaderMaterial
          ref={faintShaderRef}
          args={[faintGridShader]}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner tech grid overlay (Layer 1) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <shaderMaterial
          ref={shaderRef}
          args={[gridShader]}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
