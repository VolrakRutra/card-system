import * as THREE from "three";

import vertexShader from "./shaders/cardVert.glsl?raw";
import fragmentShader from "./shaders/cardFrag.glsl?raw";

import { toOffsetScale, type CardAtlas } from "./CardAtlas";
import type { AtlasData } from "./atlasData";

type CardOptions<T extends AtlasData> = {
  textureAtlas: CardAtlas<T>;
  cardName: T["lookup"][number];
  canBeFlipped?: boolean;
  canBeRotated?: boolean;
  canBeDiscarded?: boolean;
};

const WIDTH_SEGMENTS = 16;
const HEIGHT_SEGMENTS = 16;

const ease = (t: number) => {
  return t * t * (3 - 2 * t);
};

const quatFromOrientation = (ori: THREE.Vector3): THREE.Quaternion => {
  const e = new THREE.Euler(ori.x, ori.y, ori.z, "XYZ");
  return new THREE.Quaternion().setFromEuler(e);
};

const isVectorFaceUp = (ori: THREE.Vector3): boolean => {
  const TAU = Math.PI * 2;
  const y = ((ori.y % TAU) + TAU) % TAU;
  const EPS = 1e-3;
  return y < EPS || Math.abs(y - TAU) < EPS;
};

export class Card<T extends AtlasData = AtlasData> extends THREE.Mesh {
  name: string;
  isFaceUp: boolean;

  canBeFlipped: boolean;
  canBeRotated: boolean;
  canBeDiscarded: boolean;
  constructor(opts: CardOptions<T>) {
    const {
      textureAtlas,
      cardName,
      canBeFlipped = true,
      canBeRotated = true,
      canBeDiscarded = true,
    } = opts;
    const geometry = new THREE.PlaneGeometry(
      textureAtlas.cardWidth / textureAtlas.cardWidth,
      textureAtlas.cardHeight / textureAtlas.cardWidth,
      WIDTH_SEGMENTS,
      HEIGHT_SEGMENTS
    );

    const frontRegion = textureAtlas.cardIndexToUv(
      textureAtlas.getCardIndexByName(cardName)
    );

    const { offset: frontOffset, scale: frontScale } =
      toOffsetScale(frontRegion);

    const backRegion = textureAtlas.cardBackUv();
    const { offset: backOffset, scale: backScale } = toOffsetScale(backRegion);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        textureAtlas: { value: textureAtlas.texture },

        frontOffset: { value: frontOffset },
        frontScale: { value: frontScale },
        backOffset: { value: backOffset },
        backScale: { value: backScale },

        highlight: { value: 0.0 },
        highlightTint: { value: new THREE.Vector3(1.0, 0.95, 0.7) },
      },
      vertexShader,
      fragmentShader,

      transparent: true,
      side: THREE.DoubleSide,
    });

    super(geometry, material);
    this.name = cardName;
    this.isFaceUp = false;
    this.canBeFlipped = canBeFlipped;
    this.canBeRotated = canBeRotated;
    this.canBeDiscarded = canBeDiscarded;
  }

  flip() {
    if (!this.canBeFlipped) {
      return;
    }
    const axis = new THREE.Vector3(0, 1, 0);
    const total = Math.PI;
    const duration = 500;
    let turned = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const target = total * (p * p * (3 - 2 * p));
      const delta = target - turned;

      this.rotateOnAxis(axis, delta);
      turned += delta;

      if (p < 1) {
        requestAnimationFrame(tick);
      }
    };
    this.isFaceUp = !this.isFaceUp;
    requestAnimationFrame(tick);
  }

  rotate(dir: "CW" | "CCW") {
    if (!this.canBeRotated) {
      return;
    }
    const dirMul = dir == "CW" ? -1 : 1;
    const faceUpMul = this.isFaceUp ? 1 : -1;
    const axis = new THREE.Vector3(0, 0, 1);
    const total = (dirMul * faceUpMul * Math.PI) / 2;
    const duration = 500;
    let turned = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const target = total * (p * p * (3 - 2 * p));
      const delta = target - turned;

      this.rotateOnAxis(axis, delta);
      turned += delta;

      if (p < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  move(toPos: THREE.Vector3, toOrientation: THREE.Vector3, duration = 600) {
    const startPos = this.position.clone();
    const startQuat = this.quaternion.clone();
    const endQuat = quatFromOrientation(toOrientation);

    const t0 = performance.now();

    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const e = ease(p);

      this.position.lerpVectors(startPos, toPos, e);
      this.quaternion.slerpQuaternions(startQuat, endQuat, e);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        this.position.copy(toPos);
        this.quaternion.copy(endQuat);
        this.isFaceUp = isVectorFaceUp(toOrientation);
      }
    };

    requestAnimationFrame(tick);
  }
}
