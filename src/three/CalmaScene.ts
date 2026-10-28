import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CALMA_COMPONENTS } from '../data/componentsData';
import { CameraPreset, ComponentData, ViewDisplayMode } from '../types/cad';
import { MaterialLibrary, isSoftwareGl } from './materials';
import {
  buildEsp32Board,
  buildGroveGsr,
  buildGsrElectrodes,
  buildLipoBattery,
  buildLowerSensorPlate,
  buildMainHousing,
  buildMax30102,
  buildMax30205,
  buildMotorDriver,
  buildMpu6050,
  buildOpticalLens,
  buildTopLid,
  buildTp4056Charger,
  buildVibrationMotor,
  buildWristStrap,
  buildWs2812bLed,
} from './proceduralGeometry';
import { buildVirtualWristModel } from './wristModel';

export interface SceneCallbacks {
  onSelectComponent: (componentId: string | null) => void;
  onHoverComponent: (componentId: string | null) => void;
}

export class CalmaSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  public matLib: MaterialLibrary;

  // Component Map
  public componentGroups: Map<string, THREE.Group> = new Map();
  public componentDataMap: Map<string, ComponentData> = new Map();
  public visibilityMap: Map<string, boolean> = new Map();

  // Virtual Human Wrist Model
  private wristModel: THREE.Group | null = null;
  private isWornMode: boolean = false;
  private multiHighlightBoxes: THREE.BoxHelper[] = [];

  // State
  private explodeTarget: number = 0; // 0 to 1
  private currentExplode: number = 0;
  private selectedId: string | null = null;
  private hoveredId: string | null = null;
  private isolatedId: string | null = null;
  private viewMode: ViewDisplayMode = 'solid';
  private showDimensions: boolean = false;
  private showLeaderLines: boolean = false;
  private presentationMode: boolean = false;

  // LED Animation State
  private ledAnimationMode: 'solid' | 'pulse' | 'breathing' | 'warning' = 'solid';
  private currentLedColor: string = '#00f0d0';

  // Camera Animation
  private cameraTargetPos: THREE.Vector3 = new THREE.Vector3(80, 60, 95);
  private cameraLookTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private isCameraTransitioning: boolean = false;

  // Section Clipping Plane
  private clipPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10);
  private sectionActive: boolean = false;

  // Annotations Group
  private dimensionsGroup: THREE.Group = new THREE.Group();
  private leadersGroup: THREE.Group = new THREE.Group();
  private selectionBox: THREE.BoxHelper | null = null;

  // Haptic Motor Vibration State
  private isVibrating: boolean = false;
  private vibrationTimer: number = 0;

  // Raycasting
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mousePos: THREE.Vector2 = new THREE.Vector2();
  private mountElement: HTMLElement;
  private callbacks: SceneCallbacks;

  // Render loop control
  private animFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();
  private isDisposed: boolean = false;

  constructor(mountElement: HTMLElement, callbacks: SceneCallbacks) {
    this.mountElement = mountElement;
    this.callbacks = callbacks;

    // 1. Scene & Environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1015); // Deep dark engineering charcoal
    this.scene.fog = new THREE.Fog(0x0c1015, 180, 480);

    // 2. Camera
    const aspect = mountElement.clientWidth / mountElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 1, 1000);
    this.camera.position.set(80, 60, 95);

    // 3. Renderer with ACES Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.localClippingEnabled = true;

    mountElement.appendChild(this.renderer.domElement);

    // 4. Studio Environment Lighting (RoomEnvironment)
    const pmremGen = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGen.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGen.dispose();

    // 5. Materials
    this.matLib = new MaterialLibrary();

    // 6. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 350;
    this.controls.maxPolarAngle = Math.PI - 0.05;
    this.controls.target.set(0, 0, 0);

    // Listen to user interaction to cancel scripted camera transitions
    this.controls.addEventListener('start', () => {
      this.isCameraTransitioning = false;
    });

    // 7. Lighting Rig
    this.setupLighting();

    // 8. Ground Plane & Contact Shadow
    this.setupGround();

    // 9. Build Assembly
    this.buildAssembly();

    // 10. Build 3D CAD Dimension Callouts
    this.buildDimensions();

    // 11. Event Listeners
    this.setupEvents();

    // 12. Start Loop
    this.animate();
  }

  private setupLighting() {
    // Ambient / Fill light
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x111827, 0.75);
    this.scene.add(hemiLight);

    // Key Light (warm studio spotlight with soft shadow)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.0);
    keyLight.position.set(70, 110, 80);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 20;
    keyLight.shadow.camera.far = 300;
    keyLight.shadow.camera.left = -60;
    keyLight.shadow.camera.right = 60;
    keyLight.shadow.camera.top = 60;
    keyLight.shadow.camera.bottom = -60;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Fill Light (cool rim)
    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 1.1);
    fillLight.position.set(-80, 50, -70);
    this.scene.add(fillLight);

    // Front Specular Kick Light (brings out USB-C metal chamfer and RF shield)
    const frontKick = new THREE.DirectionalLight(0xffffff, 0.8);
    frontKick.position.set(40, -10, 90);
    this.scene.add(frontKick);

    // Bottom Bounce Light (for under-chassis sensor inspection)
    const bounceLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    bounceLight.position.set(0, -90, 20);
    this.scene.add(bounceLight);
  }

  private setupGround() {
    // Circular contact shadow plane under the watch
    const groundGeom = new THREE.PlaneGeometry(300, 300);
    groundGeom.rotateX(-Math.PI / 2);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 110);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    });

    const groundMesh = new THREE.Mesh(groundGeom, shadowMat);
    groundMesh.position.y = -35;
    this.scene.add(groundMesh);

    // Subtle CAD Grid
    const grid = new THREE.GridHelper(260, 26, 0x1e293b, 0x111827);
    grid.position.y = -35.1;
    this.scene.add(grid);
  }

  private buildAssembly() {
    // Populate component definitions map
    CALMA_COMPONENTS.forEach((c) => {
      this.componentDataMap.set(c.id, c);
      this.visibilityMap.set(c.id, true);
    });

    // Instantiate 3D geometries
    const builders: Record<string, () => THREE.Group> = {
      main_housing: () => buildMainHousing(this.matLib),
      top_lid: () => buildTopLid(this.matLib),
      lower_sensor_plate: () => buildLowerSensorPlate(this.matLib),
      optical_lens: () => buildOpticalLens(this.matLib),
      gsr_electrodes: () => buildGsrElectrodes(this.matLib),
      wrist_strap: () => buildWristStrap(this.matLib),
      esp32_board: () => buildEsp32Board(this.matLib),
      lipo_battery: () => buildLipoBattery(this.matLib),
      tp4056_charger: () => buildTp4056Charger(this.matLib),
      mpu6050_sensor: () => buildMpu6050(this.matLib),
      vibration_motor: () => buildVibrationMotor(this.matLib),
      rgb_led: () => buildWs2812bLed(this.matLib),
      motor_driver: () => buildMotorDriver(this.matLib),
      max30102_sensor: () => buildMax30102(this.matLib),
      grove_gsr_module: () => buildGroveGsr(this.matLib),
      max30205_sensor: () => buildMax30205(this.matLib),
    };

    Object.entries(builders).forEach(([id, builder]) => {
      const group = builder();
      group.name = id;
      const data = this.componentDataMap.get(id);
      if (data) {
        group.position.set(...data.assembledPosition);
      }

      // Mark userData for raycasting
      group.traverse((child) => {
        child.userData = { componentId: id };
      });

      this.componentGroups.set(id, group);
      this.scene.add(group);
    });

    this.scene.add(this.dimensionsGroup);
    this.scene.add(this.leadersGroup);

    // 12. Build Virtual Human Forearm & Wrist (for Worn / Digital Twin Mode)
    this.wristModel = buildVirtualWristModel(this.matLib);
    this.wristModel.visible = this.isWornMode;
    this.scene.add(this.wristModel);
  }

  private buildDimensions() {
    this.dimensionsGroup.clear();

    const makeLine = (p1: [number, number, number], p2: [number, number, number], color = 0x38bdf8) => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
      ]);
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.8 });
      return new THREE.Line(geom, mat);
    };

    const makeSprite = (text: string, pos: [number, number, number], color: string = '#38bdf8') => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 72;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = 'rgba(12, 16, 21, 0.90)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 60, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 36);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(...pos);
      sprite.scale.set(15, 4.2, 1);
      return sprite;
    };

    // Dimension: Length 60 mm (along X)
    this.dimensionsGroup.add(makeLine([-30, 16, 22], [30, 16, 22]));
    this.dimensionsGroup.add(makeLine([-30, 14, 22], [-30, 18, 22]));
    this.dimensionsGroup.add(makeLine([ 30, 14, 22], [ 30, 18, 22]));
    this.dimensionsGroup.add(makeSprite('60.0 mm (L)', [0, 20, 22], '#38bdf8'));

    // Dimension: Width 35 mm (along Z)
    this.dimensionsGroup.add(makeLine([35, 16, -17.5], [35, 16, 17.5]));
    this.dimensionsGroup.add(makeLine([35, 14, -17.5], [35, 18, -17.5]));
    this.dimensionsGroup.add(makeLine([35, 14,  17.5], [35, 18,  17.5]));
    this.dimensionsGroup.add(makeSprite('35.0 mm (W)', [35, 20, 0], '#38bdf8'));

    // Dimension: Height 18 mm (along Y)
    this.dimensionsGroup.add(makeLine([-36, -9, 0], [-36, 9, 0]));
    this.dimensionsGroup.add(makeLine([-38, -9, 0], [-34, -9, 0]));
    this.dimensionsGroup.add(makeLine([-38,  9, 0], [-34,  9, 0]));
    this.dimensionsGroup.add(makeSprite('18.0 mm (H)', [-44, 0, 0], '#38bdf8'));

    // Lower Sensor Plate: 40 x 25 mm callout
    this.dimensionsGroup.add(makeLine([-20, -14, -16], [20, -14, -16], 0x14b8a6));
    this.dimensionsGroup.add(makeLine([-20, -12, -16], [-20, -16, -16], 0x14b8a6));
    this.dimensionsGroup.add(makeLine([ 20, -12, -16], [ 20, -16, -16], 0x14b8a6));
    this.dimensionsGroup.add(makeSprite('40 × 25 mm Base', [0, -18, -16], '#14b8a6'));

    // Optical Lens Callout: 16 x 16 mm
    this.dimensionsGroup.add(makeSprite('16 × 16 mm Lens', [0, -14, 18], '#a855f7'));

    // GSR Electrodes: Ø 10 mm
    this.dimensionsGroup.add(makeSprite('Ø 10.0 mm Electrodes', [13, -16, 0], '#f59e0b'));

    this.dimensionsGroup.visible = this.showDimensions;
  }

  private setupEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleHover();
    });

    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleClick();
    });

    window.addEventListener('resize', this.handleResize);
  }

  private handleHover() {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const visibleMeshes: THREE.Object3D[] = [];
    
    this.componentGroups.forEach((group, id) => {
      if (this.visibilityMap.get(id) && group.visible) {
        group.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) visibleMeshes.push(obj);
        });
      }
    });

    const intersects = this.raycaster.intersectObjects(visibleMeshes, true);
    if (intersects.length > 0) {
      const topObj = intersects[0].object;
      const compId = topObj.userData.componentId;
      if (compId && compId !== this.hoveredId) {
        this.hoveredId = compId;
        this.callbacks.onHoverComponent(compId);
      }
    } else if (this.hoveredId !== null) {
      this.hoveredId = null;
      this.callbacks.onHoverComponent(null);
    }
  }

  private handleClick() {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const visibleMeshes: THREE.Object3D[] = [];
    
    this.componentGroups.forEach((group, id) => {
      if (this.visibilityMap.get(id) && group.visible) {
        group.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) visibleMeshes.push(obj);
        });
      }
    });

    const intersects = this.raycaster.intersectObjects(visibleMeshes, true);
    if (intersects.length > 0) {
      const compId = intersects[0].object.userData.componentId;
      if (compId) {
        this.selectComponent(compId, true);
        return;
      }
    }
    this.selectComponent(null, true);
  }

  public selectComponent(id: string | null, notify: boolean = true) {
    if (this.selectedId === id) return;
    this.selectedId = id;

    if (notify) {
      this.callbacks.onSelectComponent(id);
    }

    // Update highlight box
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.dispose();
      this.selectionBox = null;
    }

    if (id) {
      const group = this.componentGroups.get(id);
      if (group && group.visible) {
        this.selectionBox = new THREE.BoxHelper(group, 0x14b8a6); // Teal highlight
        (this.selectionBox.material as THREE.LineBasicMaterial).linewidth = 2;
        this.scene.add(this.selectionBox);
      }
    }
  }

  public focusOnComponent(id: string) {
    const group = this.componentGroups.get(id);
    if (!group) return;

    this.selectComponent(id);
    const box = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 15);

    this.cameraLookTarget.copy(center);
    this.cameraTargetPos.set(center.x + maxDim * 2.2, center.y + maxDim * 1.8, center.z + maxDim * 2.5);
    this.isCameraTransitioning = true;
  }

  public setVisibility(id: string, visible: boolean) {
    this.visibilityMap.set(id, visible);
    const group = this.componentGroups.get(id);
    if (group) group.visible = visible;

    if (!visible && this.selectedId === id) {
      this.selectComponent(null);
    }
  }

  public isolateComponent(id: string | null) {
    this.isolatedId = id;
    if (id === null) {
      // Restore all
      this.componentGroups.forEach((group, compId) => {
        const origVis = this.visibilityMap.get(compId) ?? true;
        group.visible = origVis;
      });
      if (this.selectedId) {
        this.selectComponent(this.selectedId);
      }
    } else {
      // Hide all except target
      this.componentGroups.forEach((group, compId) => {
        group.visible = compId === id;
      });
      this.selectComponent(id);
      this.focusOnComponent(id);
    }
  }

  public resetAllVisibility() {
    this.isolatedId = null;
    this.componentGroups.forEach((group, id) => {
      this.visibilityMap.set(id, true);
      group.visible = true;
    });
    this.selectComponent(null);
  }

  public setExplodeAmount(amount: number) {
    // Clamp 0 to 1
    this.explodeTarget = Math.max(0, Math.min(1, amount));
  }

  public setViewMode(mode: ViewDisplayMode) {
    this.viewMode = mode;

    const housing = this.componentGroups.get('main_housing');
    const lid = this.componentGroups.get('top_lid');

    if (mode === 'xray') {
      // Make enclosure transparent
      if (housing) {
        housing.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material === this.matLib.housingSolid) {
            (child as THREE.Mesh).material = this.matLib.housingXRay;
          }
        });
      }
      if (lid) {
        lid.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material === this.matLib.topLidSolid) {
            (child as THREE.Mesh).material = this.matLib.housingXRay;
          }
        });
      }
      this.renderer.clippingPlanes = [];
      this.sectionActive = false;
    } else if (mode === 'section') {
      // Restore solid material and activate clipping plane
      this.restoreSolidMaterials();
      this.sectionActive = true;
      this.renderer.clippingPlanes = [this.clipPlane];
    } else {
      // Solid normal mode
      this.restoreSolidMaterials();
      this.renderer.clippingPlanes = [];
      this.sectionActive = false;
    }
  }

  private restoreSolidMaterials() {
    const housing = this.componentGroups.get('main_housing');
    const lid = this.componentGroups.get('top_lid');

    if (housing) {
      housing.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material === this.matLib.housingXRay) {
          (child as THREE.Mesh).material = this.matLib.housingSolid;
        }
      });
    }
    if (lid) {
      lid.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material === this.matLib.housingXRay) {
          (child as THREE.Mesh).material = this.matLib.topLidSolid;
        }
      });
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    this.isCameraTransitioning = true;
    switch (preset) {
      case 'assembled':
        this.cameraTargetPos.set(80, 60, 95);
        this.cameraLookTarget.set(0, 0, 0);
        break;
      case 'top':
        this.cameraTargetPos.set(0, 115, 0.1);
        this.cameraLookTarget.set(0, 0, 0);
        break;
      case 'bottom':
        this.cameraTargetPos.set(0, -115, 0.1);
        this.cameraLookTarget.set(0, 0, 0);
        break;
      case 'electronics':
        this.cameraTargetPos.set(35, 55, 65);
        this.cameraLookTarget.set(0, 4, 0);
        break;
      case 'exploded':
        this.cameraTargetPos.set(115, 85, 125);
        this.cameraLookTarget.set(0, -8, 0);
        break;
      case 'closeup':
        this.cameraTargetPos.set(24, 18, 32);
        this.cameraLookTarget.set(0, -4, 0);
        break;
      case 'front':
        this.cameraTargetPos.set(0, 0, 125);
        this.cameraLookTarget.set(0, 0, 0);
        break;
      case 'right':
        this.cameraTargetPos.set(135, 0, 0);
        this.cameraLookTarget.set(0, 0, 0);
        break;
      case 'isometric':
        this.cameraTargetPos.set(85, 75, 85);
        this.cameraLookTarget.set(0, 0, 0);
        break;
      case 'worn_closeup':
        this.cameraTargetPos.set(38, 30, 52);
        this.cameraLookTarget.set(0, -6, 0);
        break;
      case 'worn_forearm':
        this.cameraTargetPos.set(95, 65, 115);
        this.cameraLookTarget.set(0, -10, 0);
        break;
    }
  }

  public setWornMode(worn: boolean) {
    this.isWornMode = worn;
    if (this.wristModel) {
      this.wristModel.visible = worn;
    }
    // If entering worn mode, collapse explode to 0 so watch sits flush on wrist
    if (worn && this.explodeTarget > 0) {
      this.setExplodeAmount(0);
    }
  }

  public getWornMode(): boolean {
    return this.isWornMode;
  }

  public highlightComponents(ids: string[]) {
    this.clearMultiHighlights();
    ids.forEach((id) => {
      const group = this.componentGroups.get(id);
      if (group && group.visible) {
        const helper = new THREE.BoxHelper(group, 0x38bdf8); // Cyan pipeline highlight
        (helper.material as THREE.LineBasicMaterial).linewidth = 2;
        this.scene.add(helper);
        this.multiHighlightBoxes.push(helper);
      }
    });
  }

  public clearMultiHighlights() {
    this.multiHighlightBoxes.forEach((helper) => {
      this.scene.remove(helper);
      helper.dispose();
    });
    this.multiHighlightBoxes = [];
  }

  public setLedMode(mode: 'solid' | 'pulse' | 'breathing' | 'warning', colorHex: string = '#00f0d0') {
    this.ledAnimationMode = mode;
    this.currentLedColor = colorHex;
    if (mode === 'solid') {
      this.matLib.setLedColor(colorHex, 2.0);
    }
  }

  public toggleDimensions(show?: boolean) {
    this.showDimensions = show !== undefined ? show : !this.showDimensions;
    this.dimensionsGroup.visible = this.showDimensions;
    return this.showDimensions;
  }

  public togglePresentationMode(active?: boolean) {
    this.presentationMode = active !== undefined ? active : !this.presentationMode;
    this.controls.autoRotate = this.presentationMode;
    this.controls.autoRotateSpeed = 1.4;
    return this.presentationMode;
  }

  public triggerHapticVibration() {
    this.isVibrating = true;
    this.vibrationTimer = 1.6; // vibrate for 1.6s
  }

  public setLedState(hex: string, intensity: number = 2.0) {
    this.matLib.setLedColor(hex, intensity);
  }

  public captureScreenshot(): string {
    // Render immediately to canvas before extracting data URL
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  private handleResize = () => {
    if (!this.mountElement || this.isDisposed) return;
    const width = this.mountElement.clientWidth;
    const height = this.mountElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // 1. Smoothly interpolate explode amount using exponential damping
    this.currentExplode = THREE.MathUtils.damp(this.currentExplode, this.explodeTarget, 7.5, delta);

    // Apply exploded transforms to each component group
    this.componentGroups.forEach((group, id) => {
      const data = this.componentDataMap.get(id);
      if (!data) return;

      const [ax, ay, az] = data.assembledPosition;
      const [ex, ey, ez] = data.explodedPosition;

      // Linear interpolation per component
      group.position.x = ax + (ex - ax) * this.currentExplode;
      group.position.y = ay + (ey - ay) * this.currentExplode;
      group.position.z = az + (ez - az) * this.currentExplode;
    });

    // 2. Smooth camera transition interpolation
    if (this.isCameraTransitioning) {
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.cameraTargetPos.x, 5.0, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.cameraTargetPos.y, 5.0, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.cameraTargetPos.z, 5.0, delta);

      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.cameraLookTarget.x, 5.0, delta);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.cameraLookTarget.y, 5.0, delta);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.cameraLookTarget.z, 5.0, delta);

      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.2) {
        this.isCameraTransitioning = false;
      }
    }

    // 3. Vibration Motor visual haptic micro-shake
    if (this.isVibrating) {
      this.vibrationTimer -= delta;
      const motor = this.componentGroups.get('vibration_motor');
      if (motor) {
        const shake = Math.sin(Date.now() * 0.08) * 0.45;
        motor.position.x += shake;
      }
      if (this.vibrationTimer <= 0) {
        this.isVibrating = false;
      }
    }

    // 4. Dynamic LED Animation
    const now = Date.now();
    let computedIntensity = 2.0;
    if (this.ledAnimationMode === 'pulse') {
      computedIntensity = 1.0 + Math.sin(now * 0.008) * 0.8;
      this.matLib.setLedColor(this.currentLedColor, Math.max(0.2, computedIntensity));
    } else if (this.ledAnimationMode === 'breathing') {
      computedIntensity = 0.6 + Math.sin(now * 0.0022) * 0.55;
      this.matLib.setLedColor(this.currentLedColor, Math.max(0.1, computedIntensity));
    } else if (this.ledAnimationMode === 'warning') {
      computedIntensity = (now % 500 < 250) ? 2.8 : 0.2;
      this.matLib.setLedColor(this.currentLedColor, computedIntensity);
    }

    // 5. Update Selection Bounding Box if active
    if (this.selectionBox && this.selectedId) {
      const targetGroup = this.componentGroups.get(this.selectedId);
      if (targetGroup) {
        this.selectionBox.update();
      }
    }

    // 6. Update Multi-Highlight Bounding Boxes
    if (this.multiHighlightBoxes.length > 0) {
      this.multiHighlightBoxes.forEach((box) => box.update());
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.handleResize);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
