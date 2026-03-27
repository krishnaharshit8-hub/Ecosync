export const wireVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wireFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  uniform float uIntensity;
  uniform float uActive;

  varying vec2 vUv;

  void main() {
    float pulse = sin(vUv.x * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    float glow = pulse * uIntensity;
    vec3 color = mix(uBaseColor, uGlowColor, glow);
    float alpha = mix(0.05, 0.8, uActive) * (0.5 + glow * 0.5);
    gl_FragColor = vec4(color, alpha);
  }
`;
