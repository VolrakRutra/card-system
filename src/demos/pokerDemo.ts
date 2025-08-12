import { Card } from "../Card";
import type { CardAtlas } from "../CardAtlas";
import { Deck } from "../Deck";
import type { Layout } from "../Layout";
import { FACE_DOWN_UPRIGHT } from "../layouts";
import { Sketch } from "../Sketch";
import { ContextMenu, OptionClickEvent } from "../web-components/ContextMenu";
import * as THREE from "three";

const animatePokerCard = (
  deck: Deck,
  sketch: Sketch,
  targetPos: THREE.Vector3,
  targetRot: THREE.Vector3,
  orientation: THREE.Vector3,
  isDiscard: boolean = false
) => {
  const card = deck.draw();
  card.canBeFlipped = false;
  card.canBeRotated = false;
  {
    const { x, y, z } = deck.drawPosition;
    card.position.set(x, y, z);
  }
  {
    const { x, y, z } = orientation;
    card.rotation.set(x, y, z);
  }
  sketch.scene.add(card);
  card.move(targetPos, targetRot, 500);
  if (!isDiscard) {
    sketch.objectsOfInterest.push(card);
  }
};

const pokerPhases = [
  "DEAL",
  "DISCARD",
  "THREE",
  "DISCARD",
  "TURN",
  "DISCARD",
  "RIVER",
];

const handleDoubleClickPoker = (
  sketch: Sketch,
  layout: Layout,
  deck: Deck,
  step: number = 0
): number => {
  if (sketch.hovered?.name != "DECK") {
    return 0;
  }

  switch (pokerPhases[step]) {
    case "DEAL": {
      for (let slot of layout.cardSlots.slice(0, 8)) {
        animatePokerCard(
          deck,
          sketch,
          slot.position,
          slot.rotation,
          FACE_DOWN_UPRIGHT
        );
      }
      break;
    }
    case "DISCARD": {
      animatePokerCard(
        deck,
        sketch,
        deck.discardPosition,
        FACE_DOWN_UPRIGHT,
        FACE_DOWN_UPRIGHT,
        true
      );

      break;
    }
    case "THREE": {
      for (let slot of layout.cardSlots.slice(8, 11)) {
        animatePokerCard(
          deck,
          sketch,
          slot.position,
          slot.rotation,
          FACE_DOWN_UPRIGHT
        );
      }

      break;
    }
    case "TURN": {
      const slot = layout.cardSlots[11];
      animatePokerCard(
        deck,
        sketch,
        slot.position,
        slot.rotation,
        FACE_DOWN_UPRIGHT
      );

      break;
    }
    case "RIVER": {
      const slot = layout.cardSlots[12];
      animatePokerCard(
        deck,
        sketch,
        slot.position,
        slot.rotation,
        FACE_DOWN_UPRIGHT
      );

      break;
    }
  }
  return step + 1;
};

export const pokerDemo = (atlas: CardAtlas, layout: Layout) => {
  const sketch = new Sketch();
  sketch.animate();

  layout.render(atlas, sketch.scene);
  const contextMenu = new ContextMenu([
    {
      value: "discard",
      content: "Discard",
    },
  ]);
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
        case "discard": {
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

  const deck = new Deck({
    atlas: atlas,
    drawPosition: new THREE.Vector3(4.5, -4.5, 0),
    discardPosition: new THREE.Vector3(-4.5, -4.5, 0),
  });

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

  sketch.camera.position.set(0, 0, 12);
  deckCard.name = "DECK";
  if (sketch.controls) {
    sketch.controls.enableRotate = true;
  }

  let step = 0;
  sketch.renderer.domElement.addEventListener("dblclick", () => {
    if (sketch.hovered?.name == "DECK") {
      step = handleDoubleClickPoker(sketch, layout, deck, step);
    }

    sketch.hovered?.flip();
  });

  sketch.renderer.domElement.addEventListener("contextmenu", (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (sketch.hovered?.name == "DECK") {
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
