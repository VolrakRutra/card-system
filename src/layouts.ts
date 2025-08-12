import * as THREE from "three";
import { Layout } from "./Layout";

export const FACE_UP_UPRIGHT = new THREE.Vector3(0, 0, 0);
const FACE_UP_REVERSED = new THREE.Vector3(0, 0, Math.PI);
export const FACE_DOWN_UPRIGHT = new THREE.Vector3(0, Math.PI, 0);

const POINT_LEFT_FACE_UP = new THREE.Vector3(0, 0, Math.PI / 2);
const POINT_RIGHT_FACE_UP = new THREE.Vector3(0, 0, -Math.PI / 2);
const POINT_RIGHT_FACE_DOWN = new THREE.Vector3(0, Math.PI, -Math.PI / 2);

const threeCardLayout = new Layout();
threeCardLayout.addCardSlot(
  new THREE.Vector3(-1.25, 0, -0.01),
  new THREE.Vector3(0.0, Math.PI, -0.25 + (Math.random() > 0.5 ? Math.PI : 0))
);
threeCardLayout.addCardSlot(
  new THREE.Vector3(0, 0.45, 0),
  new THREE.Vector3(0.0, Math.PI, Math.random() > 0.5 ? Math.PI : 0)
);
threeCardLayout.addCardSlot(
  new THREE.Vector3(1.25, 0, 0.01),
  new THREE.Vector3(0, Math.PI, 0.25 + (Math.random() > 0.5 ? Math.PI : 0))
);

const celticCrossLayout = new Layout();

const randomizeCardOrientation = () =>
  Math.random() < 0.5 ? FACE_UP_UPRIGHT : FACE_UP_REVERSED;

celticCrossLayout.addCardSlot(new THREE.Vector3(0, 0, 0), FACE_UP_UPRIGHT);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(0, 0, 0.1),
  Math.random() > 0.5 ? POINT_LEFT_FACE_UP : POINT_RIGHT_FACE_UP
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(0, 2, 0),
  randomizeCardOrientation()
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(-1.5, 0, 0),
  randomizeCardOrientation()
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(1.5, 0, 0),
  randomizeCardOrientation()
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(0, -2, 0),
  randomizeCardOrientation()
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(3, -3, 0),
  randomizeCardOrientation()
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(3, -1, 0),
  randomizeCardOrientation()
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(3, 1, 0),
  randomizeCardOrientation()
);
celticCrossLayout.addCardSlot(
  new THREE.Vector3(3, 3, 0),
  randomizeCardOrientation()
);

const texasHoldemLayout = new Layout();

// Other Player's Cards
texasHoldemLayout.addCardSlot(
  new THREE.Vector3(-4, -0.6, 2),
  POINT_RIGHT_FACE_DOWN
);
texasHoldemLayout.addCardSlot(
  new THREE.Vector3(-4, 0.6, 2),
  POINT_RIGHT_FACE_DOWN
);

texasHoldemLayout.addCardSlot(
  new THREE.Vector3(4, -0.6, 2),
  POINT_RIGHT_FACE_DOWN
);
texasHoldemLayout.addCardSlot(
  new THREE.Vector3(4, 0.6, 2),
  POINT_RIGHT_FACE_DOWN
);
texasHoldemLayout.addCardSlot(new THREE.Vector3(-0.6, 3, 2), FACE_DOWN_UPRIGHT);
texasHoldemLayout.addCardSlot(new THREE.Vector3(0.6, 3, 2), FACE_DOWN_UPRIGHT);

// Player's Cards
texasHoldemLayout.addCardSlot(new THREE.Vector3(-0.6, -2, 4), FACE_UP_UPRIGHT);
texasHoldemLayout.addCardSlot(new THREE.Vector3(0.6, -2, 4), FACE_UP_UPRIGHT);

// Flop
texasHoldemLayout.addCardSlot(new THREE.Vector3(-2.2, 0, 2), FACE_UP_UPRIGHT);
texasHoldemLayout.addCardSlot(new THREE.Vector3(-1.1, 0, 2), FACE_UP_UPRIGHT);
texasHoldemLayout.addCardSlot(new THREE.Vector3(0.0, 0, 2), FACE_UP_UPRIGHT);

// Turn
texasHoldemLayout.addCardSlot(new THREE.Vector3(1.1, 0, 2), FACE_UP_UPRIGHT);

// River
texasHoldemLayout.addCardSlot(new THREE.Vector3(2.2, 0, 2), FACE_UP_UPRIGHT);

const macMahonLayout = new Layout();

const mcMahonXs = [-4, -2.9, 2.9, 4];
const mcMahonYs = [2.75, 1.65, 0.55, -0.55, -1.65, -2.75];

for (let x of mcMahonXs) {
  for (let y of mcMahonYs) {
    macMahonLayout.addCardSlot(new THREE.Vector3(x, y, 0.01), FACE_UP_UPRIGHT);
  }
}

export {
  threeCardLayout,
  celticCrossLayout,
  texasHoldemLayout,
  macMahonLayout,
};
