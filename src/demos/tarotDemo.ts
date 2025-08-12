import * as THREE from "three";
import type { CardAtlas } from "../CardAtlas";
import type { Layout } from "../Layout";
import { Sketch } from "../Sketch";
import { threeCardLayout } from "../layouts";
import { Deck } from "../Deck";
import {
  allOptions,
  ContextMenu,
  OptionClickEvent,
} from "../web-components/ContextMenu";
import { Card } from "../Card";

export const tarotDemo = (
  atlas: CardAtlas,
  layout: Layout,
  drawPos: THREE.Vector3,
  discardPos: THREE.Vector3
) => {
  const sketch = new Sketch();
  sketch.animate();

  if (layout == threeCardLayout) {
    sketch.camera.position.set(0, 0, 7);
  } else {
    layout.render(atlas, sketch.scene);
  }

  const deck = new Deck({
    atlas: atlas,
    drawPosition: drawPos,
    discardPosition: discardPos,
  });
  document.querySelectorAll("context-menu").forEach((v) => v.remove());
  const contextMenu = new ContextMenu(allOptions);
  contextMenu.hide();
  sketch.renderer.domElement.parentElement?.appendChild(contextMenu);
  sketch.renderer.domElement.parentElement?.addEventListener(
    "option-click",
    (e) => {
      if (!(e instanceof OptionClickEvent)) {
        return;
      }
      const card = sketch.hovered;
      if (!card) {
        return;
      }
      switch (e.data) {
        case "flip": {
          sketch.hovered?.flip();
          contextMenu.hide();
          break;
        }
        case "rotate-cw": {
          card.rotate("CW");
          break;
        }
        case "rotate-ccw": {
          card.rotate("CCW");
          break;
        }
        case "discard": {
          if (!deck) {
            return;
          }
          const { x, y } = deck.discardPosition;
          contextMenu.hide();

          const removePos = new THREE.Vector3(
            x,
            y,
            0.02 * deck.discarded.length
          );
          card.move(removePos, new THREE.Vector3(0, Math.PI, 0));
          deck.discard(card);
          break;
        }
      }
    }
  );

  const deckCard = new Card({
    cardName: "BACK",
    textureAtlas: atlas,
    canBeFlipped: false,
    canBeRotated: false,
  });
  const { x, y, z } = deck.drawPosition;
  deckCard.position.set(x, y, z);
  sketch.objectsOfInterest.push(deckCard);
  sketch.scene.add(deckCard);
  deckCard.name = "DECK";

  sketch.renderer.domElement.addEventListener("dblclick", () => {
    for (let i = 0; i < layout.cardSlots.length; i++) {
      const slot = layout.cardSlots[i];
      if (sketch.hovered?.name == "DECK") {
        const card = deck.draw();
        const { x, y } = deck.drawPosition;
        card.position.set(x, y, 0.01 * i);
        card.rotation.set(0, Math.PI, 0);
        sketch.scene.add(card);
        card.move(slot.position, slot.rotation, 500);
        sketch.objectsOfInterest.push(card);
      }
    }

    sketch.hovered?.flip();
  });

  sketch.renderer.domElement.addEventListener("contextmenu", (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (sketch.hovered?.name == "DECK") {
      return;
    }
    const containerElem = sketch.renderer.domElement.parentElement;
    if (!containerElem || !(containerElem instanceof HTMLDivElement)) {
      return;
    }

    if (sketch.hovered) {
      contextMenu.show();
      contextMenu.style.setProperty("top", `${e.clientY - 7}px`);
      contextMenu.style.setProperty("left", `${e.clientX - 7}px`);
    } else {
      contextMenu.hide();
    }
  });

  sketch.renderer.domElement.addEventListener("pointermove", () => {
    contextMenu.style.setProperty("display", "none");
  });
};
