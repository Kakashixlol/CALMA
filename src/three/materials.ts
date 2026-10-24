import * as THREE from 'three';

// Detect software WebGL as instructed by the threejs skill
export const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

// High-Resolution Procedural PCB Canvas Texture Generator
function createDetailedPcbTexture(
  baseColor: string,
  traceColor: string,
  silkColor: string,
  title: string,
  boardCode: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Soldermask Base with subtle matte fiber weave
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro-texture cross-hatch for FR-4 fiberglass weave
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let y = 0; y < 1024; y += 4) {
    ctx.fillRect(0, y, 1024, 1.5);
  }
  for (let x = 0; x < 1024; x += 4) {
    ctx.fillRect(x, 0, 1.5, 1024);
  }

  // 2. Copper Traces & Ground Plane Polygons
  ctx.strokeStyle = traceColor;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // Complex multi-layer simulated routing buses
  const busY = [120, 200, 280, 360, 440, 520, 600, 680, 760, 840];
  busY.forEach((y, idx) => {
    ctx.moveTo(60, y);
    ctx.lineTo(240, y);
    ctx.lineTo(320, y + (idx % 2 === 0 ? 30 : -30));
    ctx.lineTo(580, y + (idx % 2 === 0 ? 30 : -30));
    ctx.lineTo(660, y);
    ctx.lineTo(960, y);
  });

  // Vertical trace stubs & 45-degree angled routing
  for (let x = 120; x < 900; x += 90) {
    ctx.moveTo(x, 80);
    ctx.lineTo(x, 260);
    ctx.lineTo(x + 40, 300);
    ctx.lineTo(x + 40, 500);
    ctx.lineTo(x, 540);
    ctx.lineTo(x, 920);
  }
  ctx.stroke();

  // 3. Ground Plane Thermal Relief Vias & Gold Pads
  for (let i = 0; i < 90; i++) {
    const vx = 80 + (i * 73) % 860;
    const vy = 80 + (i * 107) % 860;

    // Copper annulus
    ctx.fillStyle = '#c89e3a';
    ctx.beginPath();
    ctx.arc(vx, vy, 7, 0, Math.PI * 2);
    ctx.fill();

    // Solder mask clearance
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(vx, vy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Drilled via hole (dark void)
    ctx.fillStyle = '#111315';
    ctx.beginPath();
    ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. IC Component Footprint Pad Arrays (SMD lands)
  const drawSmtFootprint = (cx: number, cy: number, padsX: number, padsY: number, padW: number, padH: number) => {
    ctx.fillStyle = '#dfb858'; // Gold plating
    const startX = cx - (padsX * (padW + 6)) / 2;
    const startY = cy - (padsY * (padH + 6)) / 2;
    for (let r = 0; r < padsY; r++) {
      for (let c = 0; c < padsX; c++) {
        ctx.fillRect(startX + c * (padW + 6), startY + r * (padH + 6), padW, padH);
      }
    }
  };

  drawSmtFootprint(420, 380, 8, 4, 12, 16);
  drawSmtFootprint(700, 480, 6, 4, 10, 14);
  drawSmtFootprint(280, 680, 4, 2, 14, 18);

  // 5. Silkscreen Legend & Markings
  ctx.fillStyle = silkColor;
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  ctx.fillText(title, 80, 960);

  ctx.font = '22px monospace';
  ctx.fillText(`CALMA HW: ${boardCode} · LEAD-FREE RoHS`, 80, 915);
  ctx.fillText('GND  VCC  SDA  SCL  INT  ADC', 80, 110);

  // Component designator labels (R1, C1, U1, Q1, D1)
  ctx.font = 'bold 16px monospace';
  ctx.fillText('U1', 415, 340);
  ctx.fillText('U2', 695, 440);
  ctx.fillText('C1', 360, 390);
  ctx.fillText('R1', 490, 390);
  ctx.fillText('C2', 650, 490);
  ctx.fillText('R2', 760, 490);
  ctx.fillText('J1 (I2C/PWR)', 80, 80);

  // Polarity / Pin 1 indicator dots
  ctx.beginPath();
  ctx.arc(360, 335, 4, 0, Math.PI * 2);
  ctx.arc(640, 435, 4, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// High-Resolution Li-Po Battery Foil Texture
function createDetailedBatteryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Brushed aluminum foil gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#b8bcc2');
  grad.addColorStop(0.15, '#e4e8ee');
  grad.addColorStop(0.4, '#c8ccd2');
  grad.addColorStop(0.7, '#f0f3f8');
  grad.addColorStop(0.85, '#d4d8de');
  grad.addColorStop(1, '#a8acb2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Horizontal metallic micro-scratches
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let y = 0; y < 512; y += 3) {
    ctx.fillRect(0, y, 1024, 1);
  }

  // Battery Technical Typography & Markings
  ctx.fillStyle = '#1c2024';
  ctx.font = 'bold 42px -apple-system, sans-serif';
  ctx.fillText('CALMA  RECHARGEABLE  Li-Po', 90, 110);

  ctx.font = 'bold 36px monospace';
  ctx.fillText('+  3.7V   500 mAh   1.85 Wh  -', 90, 175);

  ctx.font = '24px monospace';
  ctx.fillText('MODEL: 503035 · CERTIFIED IEC 62133 · CE', 90, 230);
  ctx.fillText('MAX CHARGE: 4.2V · DISCHARGE CUTOFF: 3.0V', 90, 275);
  ctx.fillText('DATE CODE: 2026-W42 · S/N: CLM-BAT-09281', 90, 320);

  // Warning Notice with red alert badge
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(90, 370, 840, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('⚠ CAUTION: DO NOT PUNCTURE, CRUSH, SHORT CIRCUIT OR INCINERATE', 110, 402);

  // Barcode representation
  ctx.fillStyle = '#1c2024';
  let bx = 90;
  for (let i = 0; i < 48; i++) {
    const bw = (i % 3 === 0) ? 6 : (i % 2 === 0) ? 4 : 2;
    ctx.fillRect(bx, 440, bw, 40);
    bx += bw + 3;
  }
  ctx.font = '16px monospace';
  ctx.fillText('5 030350 928144', 380, 470);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// High-Resolution Laser-Etched ESP32-WROOM-32 RF Shield Texture
function createDetailedRfShieldTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Brushed Nickel-plated Can Base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#d8dce0');
  grad.addColorStop(0.5, '#eceff3');
  grad.addColorStop(1, '#c8ccd2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Shield Perimeter Stamped Lip / Seam
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 480, 480);

  // Laser Engraved Espressif Logo & Text (dark matte burn finish)
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText('ESP32', 50, 95);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('WROOM-32', 50, 140);

  ctx.font = '19px monospace';
  ctx.fillText('FCC ID: 2AC7Z-ESPWROOM32', 50, 190);
  ctx.fillText('IC: 21098-ESPWROOM32', 50, 225);
  ctx.fillText('CMIIT ID: 2016DP3252', 50, 260);
  ctx.fillText('Wi-Fi 802.11 b/g/n + BT 4.2', 50, 295);
  ctx.fillText('CALMA WEARABLE PROTO-A', 50, 330);

  // Regulatory Certification Icons (CE, FCC, WEEE)
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#374151';
  // CE stylized
  ctx.beginPath();
  ctx.arc(410, 420, 24, 0.5 * Math.PI, 1.5 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(450, 420, 24, 0.5 * Math.PI, 1.5 * Math.PI);
  ctx.stroke();
  ctx.fillRect(430, 418, 14, 4);

  // Espressif Stylized Logo Mark
  ctx.strokeRect(390, 60, 70, 70);
  ctx.beginPath();
  ctx.arc(425, 95, 20, 0, Math.PI * 2);
  ctx.stroke();

  // 2D Data Matrix barcode simulation
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c * 3) % 2 === 0 || r === 0 || c === 0 || r === 7 || c === 7) {
        ctx.fillRect(50 + c * 7, 370 + r * 7, 6, 6);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Molded Plastic Enclosure Fine Texture
function createEnclosureBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Mold-Tech MT-11010 fine EDM stippling
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    const v = Math.min(255, Math.max(0, 128 + noise));
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export class MaterialLibrary {
  public housingSolid: THREE.MeshStandardMaterial;
  public housingXRay: THREE.MeshPhysicalMaterial;
  public topLidSolid: THREE.MeshStandardMaterial;
  public lowerPlate: THREE.MeshStandardMaterial;
  public opticalLens: THREE.MeshPhysicalMaterial;
  public wristStrap: THREE.MeshStandardMaterial;
  public stainlessSteel: THREE.MeshStandardMaterial;
  public brushedSteel: THREE.MeshStandardMaterial;
  public goldContacts: THREE.MeshStandardMaterial;
  public brassNut: THREE.MeshStandardMaterial;
  public esp32Pcb: THREE.MeshStandardMaterial;
  public esp32Shield: THREE.MeshStandardMaterial;
  public bluePcb: THREE.MeshStandardMaterial;
  public redPcb: THREE.MeshStandardMaterial;
  public blackPcb: THREE.MeshStandardMaterial;
  public batteryFoil: THREE.MeshStandardMaterial;
  public kaptonTape: THREE.MeshPhysicalMaterial;
  public coinMotor: THREE.MeshStandardMaterial;
  public rgbLedBody: THREE.MeshStandardMaterial;
  public rgbLedEmitter: THREE.MeshStandardMaterial;
  public icBlack: THREE.MeshStandardMaterial;
  public ceramicWhite: THREE.MeshStandardMaterial;
  public solderSilver: THREE.MeshStandardMaterial;
  public jstPlastic: THREE.MeshStandardMaterial;
  public trimmerBlue: THREE.MeshStandardMaterial;
  public resistorBeige: THREE.MeshStandardMaterial;
  public wireRed: THREE.MeshStandardMaterial;
  public wireBlack: THREE.MeshStandardMaterial;
  public wireBlue: THREE.MeshStandardMaterial;
  public wireYellow: THREE.MeshStandardMaterial;
  public wireGreen: THREE.MeshStandardMaterial;
  public wireWhite: THREE.MeshStandardMaterial;
  public wireCopper: THREE.MeshStandardMaterial;

  constructor() {
    const bumpMap = createEnclosureBumpTexture();

    // 1. Main Housing (PETG/ABS matte molded dark charcoal)
    this.housingSolid = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x22262c),
      roughness: 0.52,
      metalness: 0.12,
      bumpMap: bumpMap,
      bumpScale: 0.04,
    });

    // 2. X-Ray Ghosted Housing for transparency mode
    this.housingXRay = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x384452),
      transparent: true,
      opacity: 0.22,
      roughness: 0.25,
      metalness: 0.12,
      depthWrite: false,
    });

    // 3. Top Lid (PETG/ABS matching housing with slight rim contrast)
    this.topLidSolid = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x272c33),
      roughness: 0.48,
      metalness: 0.14,
      bumpMap: bumpMap,
      bumpScale: 0.035,
    });

    // 4. Lower Sensor Plate (Precision resin / PLA finish)
    this.lowerPlate = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x191c20),
      roughness: 0.65,
      metalness: 0.08,
      bumpMap: bumpMap,
      bumpScale: 0.05,
    });

    // 5. Optical Lens (Stepped optical acrylic PMMA)
    this.opticalLens = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.88,
      roughness: 0.04,
      metalness: 0.01,
      transmission: isSoftwareGl ? 0 : 0.94,
      ior: 1.492, // Real PMMA index
      thickness: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      depthWrite: false,
    });

    // 6. Wrist Strap (Silicone rubber / flexible TPU with soft matte finish)
    this.wristStrap = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1e23),
      roughness: 0.88,
      metalness: 0.03,
    });

    // 7. Medical Grade 316L Stainless Steel (electrodes, screws, USB shell)
    this.stainlessSteel = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xe0e4e8),
      roughness: 0.22,
      metalness: 0.94,
    });

    // 8. Brushed Stainless Steel for buckle and shield frame
    this.brushedSteel = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd2d6dc),
      roughness: 0.35,
      metalness: 0.90,
    });

    // 9. Gold Plating for contact pads, pins, test points
    this.goldContacts = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xdfb43a),
      roughness: 0.18,
      metalness: 0.96,
    });

    // 10. Brass for threaded knurled inserts and screw bosses
    this.brassNut = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xc99c42),
      roughness: 0.32,
      metalness: 0.88,
    });

    // 11. ESP32 PCB & Shield
    const esp32Texture = createDetailedPcbTexture('#154226', '#22633c', '#e6f4ea', 'ESP32-WROOM-32', 'REV 1.0.4');
    this.esp32Pcb = new THREE.MeshStandardMaterial({
      map: esp32Texture,
      roughness: 0.42,
      metalness: 0.22,
    });

    const rfTexture = createDetailedRfShieldTexture();
    this.esp32Shield = new THREE.MeshStandardMaterial({
      map: rfTexture,
      color: new THREE.Color(0xdce0e4),
      roughness: 0.26,
      metalness: 0.92,
    });

    // 12. Sensor PCBs
    const blueTexture = createDetailedPcbTexture('#0f3258', '#1a548e', '#dbeafe', 'TP4056 USB-C', 'PWR-V2');
    this.bluePcb = new THREE.MeshStandardMaterial({
      map: blueTexture,
      roughness: 0.42,
      metalness: 0.22,
    });

    const redTexture = createDetailedPcbTexture('#521418', '#86242a', '#fee2e2', 'MAX30102 PPG', 'BIO-OPT-1');
    this.redPcb = new THREE.MeshStandardMaterial({
      map: redTexture,
      roughness: 0.42,
      metalness: 0.22,
    });

    const blackTexture = createDetailedPcbTexture('#14171a', '#282d34', '#e2e8f0', 'GROVE GSR / EDA', 'EDA-V1.2');
    this.blackPcb = new THREE.MeshStandardMaterial({
      map: blackTexture,
      roughness: 0.48,
      metalness: 0.18,
    });

    // 13. Li-Po Battery
    const battTexture = createDetailedBatteryTexture();
    this.batteryFoil = new THREE.MeshStandardMaterial({
      map: battTexture,
      color: new THREE.Color(0xf0f4f8),
      roughness: 0.30,
      metalness: 0.86,
    });

    this.kaptonTape = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd49214),
      transparent: true,
      opacity: 0.78,
      roughness: 0.20,
      metalness: 0.12,
      clearcoat: 0.8,
    });

    // 14. Coin Vibration Motor
    this.coinMotor = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4d8de),
      roughness: 0.22,
      metalness: 0.92,
    });

    // 15. WS2812B RGB LED
    this.rgbLedBody = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf5f2ec),
      roughness: 0.35,
      metalness: 0.06,
    });

    this.rgbLedEmitter = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00f0d0), // Default CALMA Teal
      emissive: new THREE.Color(0x00f0d0),
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.1,
    });

    // 16. Discrete Components & ICs
    this.icBlack = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1c1f),
      roughness: 0.52,
      metalness: 0.14,
    });

    this.ceramicWhite = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xe6ebf0),
      roughness: 0.38,
      metalness: 0.08,
    });

    this.solderSilver = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xcfd4dc),
      roughness: 0.20,
      metalness: 0.94,
    });

    this.jstPlastic = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf2f5f8),
      roughness: 0.40,
      metalness: 0.04,
    });

    this.trimmerBlue = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1d4ed8),
      roughness: 0.45,
      metalness: 0.1,
    });

    this.resistorBeige = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd6cbb0),
      roughness: 0.55,
      metalness: 0.05,
    });

    // 17. Multi-Color Connecting Wires
    this.wireRed = new THREE.MeshStandardMaterial({ color: 0xd9383a, roughness: 0.55 });
    this.wireBlack = new THREE.MeshStandardMaterial({ color: 0x181b20, roughness: 0.55 });
    this.wireBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.55 });
    this.wireYellow = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.55 });
    this.wireGreen = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 });
    this.wireWhite = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55 });
    this.wireCopper = new THREE.MeshStandardMaterial({ color: 0xc87538, metalness: 0.88, roughness: 0.28 });
  }

  public setLedColor(hex: string | number, intensity: number = 2.2) {
    const col = new THREE.Color(hex);
    this.rgbLedEmitter.color.copy(col);
    this.rgbLedEmitter.emissive.copy(col);
    this.rgbLedEmitter.emissiveIntensity = intensity;
  }
}
