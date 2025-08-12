import type { AtlasData } from "./atlasData";
import { Card } from "./Card";
import type { CardAtlas } from "./CardAtlas";
import * as THREE from "three";

type CardState = "AVAILABLE" | "DRAWN" | "DISCARDED";

type DeckOptions<T extends AtlasData = AtlasData> = {
  atlas: CardAtlas<T>;
  drawPosition: THREE.Vector3;
  discardPosition: THREE.Vector3;
};

export class Deck<T extends AtlasData = AtlasData> {
  atlas: CardAtlas<T>;
  drawn: string[];
  available: string[];
  discarded: string[];
  drawPosition: THREE.Vector3;
  discardPosition: THREE.Vector3;
  constructor(options: DeckOptions<T>) {
    const { atlas, discardPosition, drawPosition } = options;
    this.atlas = atlas;
    this.available = [...atlas.lookup].filter(
      (v) => !atlas.excluded.includes(v)
    );
    this.drawn = [];
    this.discarded = [];

    this.discardPosition = discardPosition;
    this.drawPosition = drawPosition;
  }

  draw(): Card<T> {
    const idx = Math.floor(this.available.length * Math.random());
    const cardName = this.available.splice(idx, 1)[0];
    this.drawn.push(cardName);
    const card = new Card({ textureAtlas: this.atlas, cardName: cardName });
    return card;
  }

  cardState(cardName: string): CardState {
    if (this.available.includes(cardName)) {
      return "AVAILABLE";
    }

    if (this.drawn.includes(cardName)) {
      return "DRAWN";
    }

    return "DISCARDED";
  }

  discard(card: Card) {
    const state = this.cardState(card.name);
    switch (state) {
      case "DISCARDED": {
        return;
      }
      case "AVAILABLE": {
        const idx = this.available.indexOf(card.name);
        const c = this.available.splice(idx)[0];
        this.discarded.push(c);
        return;
      }

      case "DRAWN": {
        const idx = this.drawn.indexOf(card.name);
        const c = this.drawn.splice(idx)[0];
        this.discarded.push(c);
        return;
      }
    }
  }
}
