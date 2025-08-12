import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Card } from "./Card";

export class Sketch {
  canvas: HTMLCanvasElement | null;
  container: HTMLDivElement | null;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  raycaster: THREE.Raycaster;
  controls: OrbitControls | null = null;

  // NDC = Normalized Device Coordinates
  mouseNdc: THREE.Vector2;
  hovered: Card | null;

  objectsOfInterest: Card[];

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>("#canvas");
    this.container = document.querySelector<HTMLDivElement>("#container");

    if (!this.canvas) {
      throw new Error("Canvas not found in the DOM");
    }

    this.raycaster = new THREE.Raycaster();
    this.mouseNdc = new THREE.Vector2();

    this.renderer = this.initRenderer();
    this.scene = this.initScene();
    this.camera = this.initCamera();
    this.hovered = null;

    this.objectsOfInterest = [];

    this.initLights();
    this.handleResize();

    this.initControls();

    this.handlePointerMove();
  }

  initRenderer(): THREE.WebGLRenderer {
    if (!this.canvas) {
      throw new Error("Canvas not found in the DOM");
    }
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    return renderer;
  }

  getRenderingContext() {
    return this.renderer.getContext();
  }

  initScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    return scene;
  }

  initCamera(): THREE.PerspectiveCamera {
    if (!this.canvas) {
      throw new Error("Canvas not found in the DOM");
    }
    const FOV = 60;
    const ASPECT_RATIO = this.canvas.clientWidth / this.canvas.clientHeight;
    const NEAR = 0.1;
    const FAR = 1000;
    const camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR, FAR);
    camera.position.set(0, 0, 10);
    return camera;
  }

  initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);

    this.scene.add(dirLight);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
  }

  setMouseFromEvent(e: MouseEvent, renderer: THREE.WebGLRenderer) {
    const rect = renderer.domElement.getBoundingClientRect();
    this.mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  handleResize() {
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    });
  }

  handlePointerMove() {
    this.renderer.domElement.addEventListener("pointermove", (e) => {
      this.setMouseFromEvent(e, this.renderer);
      this.raycaster.setFromCamera(this.mouseNdc, this.camera);

      const hits = this.raycaster.intersectObjects(
        this.objectsOfInterest,
        false
      );
      const newHover = hits.length ? (hits[0].object as Card) : null;
      if (newHover !== this.hovered) {
        if (this.hovered) {
          const m = this.hovered.material as THREE.ShaderMaterial;
          m.uniforms.highlight.value = 0.0;
        }

        if (newHover) {
          const m = newHover.material as THREE.ShaderMaterial;
          m.uniforms.highlight.value = 1.0;
        }
        if (newHover instanceof Card) {
          this.hovered = newHover;
        } else {
          this.hovered = null;
        }
      }
    });
  }

  animate() {
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }
}
