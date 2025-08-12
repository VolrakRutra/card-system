uniform vec2 frontOffset;
uniform vec2 frontScale;
uniform vec2 backOffset;
uniform vec2 backScale;

varying vec2 vUvFront;
varying vec2 vUvBack;
varying vec3 vNormal;

void main() {
  // Front uses uv as-is
  vUvFront = uv * frontScale + frontOffset;

  // Back mirrors locally, then maps into its own atlas region
  vec2 uvBackLocal = vec2(1.0 - uv.x, uv.y);
  vUvBack = uvBackLocal * backScale + backOffset;

  vNormal = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}