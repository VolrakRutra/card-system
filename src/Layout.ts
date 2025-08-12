import * as THREE from "three";
import type { CardAtlas } from "./CardAtlas";
export type Slot = { position: THREE.Vector3; rotation: THREE.Vector3 };
export class Layout {
  cardSlots: Slot[];
  constructor() {
    this.cardSlots = [];
  }

  addCardSlot(pos: THREE.Vector3, rot: THREE.Vector3) {
    const cardSlot = {
      position: pos,
      rotation: rot,
    };

    this.cardSlots.push(cardSlot);
  }

  render(atlas: CardAtlas, scene: THREE.Scene) {
    const { cardWidth, cardHeight } = atlas;
    for (let card of this.cardSlots) {
      const geom = new THREE.PlaneGeometry(1, cardHeight / cardWidth);
      const mat = new THREE.MeshBasicMaterial({
        color: "white",
        wireframe: true,
      });

      const mesh = new THREE.Mesh(geom, mat);
      {
        const { x, y, z } = card.position;
        mesh.position.set(x, y, z - 0.01);
      }
      {
        const { x, y, z } = card.rotation;
        mesh.rotateX(x);
        mesh.rotateY(y);
        mesh.rotateZ(z);
      }
      mesh.scale.set(0.95, 0.95, 0.95);

      scene.add(mesh);
    }
  }
}
