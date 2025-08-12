precision mediump float;

uniform sampler2D textureAtlas;

varying vec3 vNormal;
varying vec2 vUvFront;
varying vec2 vUvBack;

uniform float highlight;
uniform vec3 highlightTint;

void main() {
    float frontFace = step(0.0, vNormal.z);
    vec4 texFront = texture2D(textureAtlas, vUvFront);
    vec4 texBack = texture2D(textureAtlas, vUvBack);
    vec4 baseColor = mix(texBack, texFront, frontFace);

    vec3 boosted = baseColor.rgb * 1.25;
    vec3 tinted = mix(boosted, highlightTint, 0.35);
    vec3 finalRgb = mix(baseColor.rgb, tinted, clamp(highlight, 0.0, 1.0));

    gl_FragColor = vec4(finalRgb, baseColor.a);
}