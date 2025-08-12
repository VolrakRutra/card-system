import "./style.css";
import * as THREE from "three";

import {
  animalTarotAtlas,
  atlantisTarotAtlas,
  playingCardAtlas,
  macMahonAtlas,
} from "./atlasData";

import {
  celticCrossLayout,
  texasHoldemLayout,
  threeCardLayout,
  macMahonLayout,
} from "./layouts";

import { MenuHandler } from "./MenuHandler";

import { tarotDemo } from "./demos/tarotDemo";
import { pokerDemo } from "./demos/pokerDemo";
import { macMahonDemo } from "./demos/macMahonDemo";

const menuHandler = new MenuHandler();
menuHandler.open();
document.querySelector("#menu-button")?.addEventListener("click", () => {
  menuHandler.toggle();
});

const demoButtons = document.querySelectorAll("[id^=demo-]");

demoButtons.forEach((b) => {
  b.addEventListener("click", () => {
    menuHandler.close();
    switch (b.id) {
      case "demo-tarot-three": {
        tarotDemo(
          atlantisTarotAtlas,
          threeCardLayout,
          new THREE.Vector3(2.5, -2, 0),
          new THREE.Vector3(-2.5, -2, 0)
        );
        return;
      }
      case "demo-tarot-celtic": {
        tarotDemo(
          animalTarotAtlas,
          celticCrossLayout,
          new THREE.Vector3(4.5, -4.5, 0),
          new THREE.Vector3(-4.5, -4.5, 0)
        );
        return;
      }
      case "demo-poker": {
        pokerDemo(playingCardAtlas, texasHoldemLayout);
        return;
      }
      case "demo-macmahon": {
        macMahonDemo(macMahonAtlas, macMahonLayout);
        return;
      }
    }
  });
});
