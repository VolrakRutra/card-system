import * as THREE from "three";
import type { CardAtlas } from "../CardAtlas";
import type { Layout } from "../Layout";
import { Sketch } from "../Sketch";
import {
  allOptions,
  ContextMenu,
  OptionClickEvent,
} from "../web-components/ContextMenu";
import { Deck } from "../Deck";
import { Card } from "../Card";

const BOARD_WIDTH = 4;
const BOARD_HEIGHT = 6;
const COLS = 4;
const ROWS = 6;

function intersectBoard(
  e: PointerEvent,

  sketch: Sketch,
  boardGroup: THREE.Object3D
): THREE.Vector3 | null {
  const rect = sketch.renderer.domElement.getBoundingClientRect();
  sketch.mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  sketch.mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  sketch.raycaster.setFromCamera(sketch.mouseNdc, sketch.camera);
  const hits = sketch.raycaster.intersectObject(boardGroup, true);
  return hits.length ? hits[0].point.clone() : null;
}

function snapToBoardCenter(
  pWorld: THREE.Vector3,
  boardGroup: THREE.Object3D
): { position: THREE.Vector3; col: number; row: number } {
  const cellW = BOARD_WIDTH / COLS;
  const cellH = BOARD_HEIGHT / ROWS;

  const pLocal = pWorld.clone();
  boardGroup.worldToLocal(pLocal);

  pLocal.x = THREE.MathUtils.clamp(pLocal.x, -BOARD_WIDTH / 2, BOARD_WIDTH / 2);
  pLocal.y = THREE.MathUtils.clamp(
    pLocal.y,
    -BOARD_HEIGHT / 2,
    BOARD_HEIGHT / 2
  );

  const col = THREE.MathUtils.clamp(
    Math.round((pLocal.x + BOARD_WIDTH / 2) / cellW - 0.5),
    0,
    COLS - 1
  );
  const row = THREE.MathUtils.clamp(
    Math.round((pLocal.y + BOARD_HEIGHT / 2) / cellH - 0.5),
    0,
    ROWS - 1
  );

  const xSnap = -BOARD_WIDTH / 2 + (col + 0.5) * cellW;
  const ySnap = -BOARD_HEIGHT / 2 + (row + 0.5) * cellH;

  const snappedLocal = new THREE.Vector3(xSnap, ySnap, 0);
  const snappedWorld = snappedLocal.clone();
  boardGroup.localToWorld(snappedWorld);

  return { position: snappedWorld.clone(), col, row };
}

export const macMahonDemo = (atlas: CardAtlas, layout: Layout) => {
  const sketch = new Sketch();
  sketch.animate();

  layout.render(atlas, sketch.scene);

  const contextMenu = new ContextMenu(
    allOptions.filter((v) => v.value.includes("rotate"))
  );
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
        case "rotate-cw": {
          card.rotate("CW");
          break;
        }
        case "rotate-ccw": {
          card.rotate("CCW");
          break;
        }
      }
    }
  );
  const macMahonFieldGroup = new THREE.Group();

  const macMahonField = new THREE.PlaneGeometry(4, 6, 4, 6);
  const macMahonField2 = new THREE.PlaneGeometry(4, 6, 4, 6);

  const mcMahonFieldMat = new THREE.MeshBasicMaterial({
    color: 0x00aaee,
    wireframe: true,
  });

  macMahonFieldGroup.add(
    new THREE.Mesh(macMahonField, mcMahonFieldMat),
    new THREE.Mesh(macMahonField2, mcMahonFieldMat)
  );
  macMahonField2.rotateY(Math.PI);
  sketch.scene.add(macMahonFieldGroup);

  const deck = new Deck({
    atlas,
    discardPosition: new THREE.Vector3(0, 0, 0),
    drawPosition: new THREE.Vector3(0, 0, 0),
  });

  for (let i = 0; i < layout.cardSlots.length; i++) {
    const cardPos = layout.cardSlots[i];
    const card = deck.draw();
    card.isFaceUp = true;
    const { x, y, z } = cardPos.position;
    card.position.set(x, y, z);
    card.canBeFlipped = false;
    sketch.scene.add(card);
    sketch.objectsOfInterest.push(card);
  }

  const drag = {
    active: false,
    card: null as Card | null,
    offset: new THREE.Vector3(),
    lastHit: new THREE.Vector3(),
  };

  if (sketch.controls) {
    sketch.controls.enableRotate = false;
  }

  sketch.renderer.domElement.style.touchAction = "none";
  sketch.renderer.domElement.addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      if (!sketch.hovered) {
        return;
      }
      if (e.button == 2) {
        return;
      }

      const hit = intersectBoard(e, sketch, macMahonFieldGroup);
      drag.active = true;
      drag.card = sketch.hovered;

      if (hit) {
        drag.lastHit.copy(hit);
        drag.offset.copy(drag.card.position).sub(hit);
      } else {
        drag.offset.set(0, 0, 0);
      }

      drag.card.position.z = 0.2;

      sketch.renderer.domElement.setPointerCapture(e.pointerId);
    }
  );

  sketch.renderer.domElement.addEventListener(
    "pointerup",
    (e: PointerEvent) => {
      e.stopPropagation();

      if (e.button == 2) {
        return;
      }

      if (!drag.active || !drag.card) {
        return;
      }

      const toSnap = drag.lastHit.clone().add(drag.offset).setZ(0);
      if (toSnap.x == 0 && toSnap.y == 0 && toSnap.z == 0) {
        return;
      }
      const snapped = snapToBoardCenter(toSnap, macMahonFieldGroup);
      drag.card.position.copy(snapped.position);
      drag.card.position.z = 0.01;

      drag.active = false;
      drag.card = null;

      sketch.renderer.domElement.releasePointerCapture(e.pointerId);
    }
  );

  sketch.renderer.domElement.addEventListener("pointermove", (e) => {
    sketch.setMouseFromEvent(e, sketch.renderer);

    sketch.raycaster.setFromCamera(sketch.mouseNdc, sketch.camera);

    const hits = sketch.raycaster.intersectObjects(
      sketch.objectsOfInterest,
      false
    );

    const newHover = hits.length ? (hits[0].object as THREE.Mesh) : null;

    if (newHover !== sketch.hovered) {
      contextMenu.style.setProperty("display", "none");
      if (sketch.hovered) {
        const m = sketch.hovered.material as THREE.ShaderMaterial;
        m.uniforms.highlight.value = 0.0;
      }

      if (newHover) {
        const m = newHover.material as THREE.ShaderMaterial;
        m.uniforms.highlight.value = 1.0;
      }
      if (newHover instanceof Card) {
        sketch.hovered = newHover;
      } else {
        sketch.hovered = null;
      }
    }

    if (drag.active && drag.card) {
      const hit = intersectBoard(e, sketch, macMahonFieldGroup);
      if (hit) {
        drag.lastHit.copy(hit);
        const p = hit.clone().add(drag.offset);
        drag.card.position.set(p.x, p.y, 0.01);
      }
    }
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
