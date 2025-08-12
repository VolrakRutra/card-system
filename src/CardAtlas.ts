import * as THREE from "three";
import { clamp } from "three/src/math/MathUtils.js";

import type { AtlasData } from "./atlasData";
export type UVRegion = {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
};

export function toOffsetScale({ u0, v0, u1, v1 }: UVRegion) {
  return {
    offset: new THREE.Vector2(u0, v0),
    scale: new THREE.Vector2(u1 - u0, v1 - v0),
  };
}

export class CardAtlas<T extends AtlasData = AtlasData> {
  texture: THREE.Texture | null = null;
  width: number = 0;
  height: number = 0;
  cardWidth: number;
  cardHeight: number;
  hGap: number;
  vGap: number;
  textureUrl: string;
  hasLoaded: boolean;
  cardBackIndex: number;
  lookup: T["lookup"];
  excluded: T["lookup"];

  constructor(data: T) {
    const {
      cardHeight,
      cardWidth,
      hGap = 0,
      vGap = 0,
      textureUrl,
      lookup,
      excluded,
    } = data;

    this.textureUrl = textureUrl;
    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;

    this.lookup = lookup;
    this.hasLoaded = false;
    this.vGap = vGap;
    this.hGap = hGap;
    this.cardBackIndex = this.lookup.indexOf("BACK");
    this.excluded = excluded;
  }

  async load(): Promise<void> {
    const loader = new THREE.TextureLoader();
    const tex = await new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(this.textureUrl, resolve, undefined, reject);
    });

    this.texture = tex;
    this.width = tex.width;
    this.height = tex.height;
    this.hasLoaded = true;
  }

  private cardIndexToLocation(index: number): { row: number; col: number } {
    const cardsInRow = Math.floor(this.width / this.cardWidth);
    const col = index % cardsInRow;
    const row = Math.floor(index / cardsInRow);
    return { row, col };
  }

  private cardLocationToCoords(
    row: number,
    col: number
  ): { x: number; y: number } {
    return {
      x: col * (this.cardWidth + this.hGap),
      y: row * (this.cardHeight + this.vGap),
    };
  }

  private cardCoordsToUv(x: number, y: number): UVRegion {
    const u0 = x / this.width;
    const u1 = (x + this.cardWidth) / this.width;
    const v0 = 1 - (y + this.cardHeight) / this.height;
    const v1 = 1 - y / this.height;

    return {
      u0: clamp(u0, 0, 1),
      u1: clamp(u1, 0, 1),
      v0: clamp(v0, 0, 1),
      v1: clamp(v1, 0, 1),
    };
  }

  cardIndexToUv(index: number): UVRegion {
    const { row, col } = this.cardIndexToLocation(index);
    const { x, y } = this.cardLocationToCoords(row, col);
    return this.cardCoordsToUv(x, y);
  }

  cardBackUv(): UVRegion {
    return this.cardIndexToUv(this.cardBackIndex);
  }

  getCardIndexByName(name: string): number {
    return this.lookup.indexOf(name);
  }
}
