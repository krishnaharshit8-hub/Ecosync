export const buildingVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const buildingFragmentShader = `
  uniform vec3 uColor;
  uniform float uEmissiveIntensity;
  uniform float uTime;
  uniform float uActive;
  uniform float uEnergyPercent;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    float pulse = sin(uTime * 2.0) * 0.15 + 0.85;
    float emissive = uEmissiveIntensity * pulse * uActive;

    // Edge glow
    float edgeFactor = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float edgeGlow = pow(edgeFactor, 2.0) * 0.3;

    // Energy bar on side (show on front face)
    float barWidth = 0.05;
    float barX = step(0.85, vUv.x) * step(vUv.x, 0.95);
    float barY = step(0.0, vUv.y) * step(vUv.y, uEnergyPercent);
    float bar = barX * barY;

    vec3 baseColor = uColor * (0.3 + emissive * 0.7);
    vec3 barColor = mix(vec3(1.0, 0.3, 0.1), vec3(0.1, 1.0, 0.5), uEnergyPercent);
    vec3 finalColor = mix(baseColor, barColor, bar * 0.8);
    finalColor += edgeGlow * uColor;

    float alpha = mix(0.2, 1.0, uActive);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;
