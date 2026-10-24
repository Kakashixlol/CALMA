import * as THREE from 'three';
import { MaterialLibrary } from './materials';

/**
 * Creates a rounded rectangular 2D shape in the X-Z plane (or X-Y depending on extrusion)
 */
export function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

/**
 * Creates a stadium / pill 2D shape (straight middle section with semicircular ends)
 */
export function createStadiumShape(width: number, height: number): THREE.Shape {
  const shape = new THREE.Shape();
  const r = height / 2;
  const straightW = Math.max(0.1, width - height);
  const halfS = straightW / 2;

  shape.moveTo(-halfS, -r);
  shape.lineTo(halfS, -r);
  shape.absarc(halfS, 0, r, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-halfS, r);
  shape.absarc(-halfS, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);

  return shape;
}

// ---------------------------------------------------------------------------
// REUSABLE HARDWARE & ELECTRONICS GEOMETRY BUILDERS
// ---------------------------------------------------------------------------

/**
 * Builds an authentic SMD 0603 or 0805 passive chip (Capacitor or Resistor)
 */
function createSmdPassive(
  length: number,
  width: number,
  height: number,
  isCapacitor: boolean,
  matLib: MaterialLibrary
): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = isCapacitor ? matLib.ceramicWhite : matLib.icBlack;
  const terminalWidth = length * 0.22;
  const centerLength = length - terminalWidth * 2;

  // Center Ceramic / Epoxy Body
  const centerGeom = new THREE.BoxGeometry(centerLength, height, width);
  const centerMesh = new THREE.Mesh(centerGeom, bodyMat);
  centerMesh.castShadow = true;
  group.add(centerMesh);

  // Silver / Solder Plated End Terminals
  const termGeom = new THREE.BoxGeometry(terminalWidth, height + 0.05, width + 0.05);
  const leftTerm = new THREE.Mesh(termGeom, matLib.solderSilver);
  leftTerm.position.x = -centerLength / 2 - terminalWidth / 2;
  const rightTerm = new THREE.Mesh(termGeom, matLib.solderSilver);
  rightTerm.position.x = centerLength / 2 + terminalWidth / 2;

  group.add(leftTerm, rightTerm);
  return group;
}

/**
 * Builds an authentic IC package (SOP, SOIC, or TSSOP) with realistic Gull-Wing metal leads
 */
function createSopIc(
  bodyLength: number,
  bodyWidth: number,
  bodyHeight: number,
  pinsPerSide: number,
  matLib: MaterialLibrary
): THREE.Group {
  const group = new THREE.Group();

  // Molded Epoxy Case with bevelled top edge
  const bodyGeom = new THREE.BoxGeometry(bodyLength, bodyHeight, bodyWidth);
  const bodyMesh = new THREE.Mesh(bodyGeom, matLib.icBlack);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Pin 1 Index Dimple / Chamfer
  const dimpleGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12);
  const dimple = new THREE.Mesh(dimpleGeom, matLib.solderSilver);
  dimple.position.set(-bodyLength / 2 + 0.7, bodyHeight / 2 + 0.02, -bodyWidth / 2 + 0.7);
  group.add(dimple);

  // Gull-Wing Leads on both long sides
  const leadPitch = (bodyLength - 1.2) / Math.max(1, pinsPerSide - 1);
  const startX = -((pinsPerSide - 1) * leadPitch) / 2;

  const leadGeom = new THREE.BoxGeometry(0.38, 0.15, 0.75);

  for (let i = 0; i < pinsPerSide; i++) {
    const px = startX + i * leadPitch;
    // Front side pin
    const pinFront = new THREE.Mesh(leadGeom, matLib.solderSilver);
    pinFront.position.set(px, -bodyHeight / 2 + 0.1, bodyWidth / 2 + 0.35);
    // Back side pin
    const pinBack = new THREE.Mesh(leadGeom, matLib.solderSilver);
    pinBack.position.set(px, -bodyHeight / 2 + 0.1, -bodyWidth / 2 - 0.35);

    group.add(pinFront, pinBack);
  }

  return group;
}

/**
 * Builds an authentic SMT tactile pushbutton (EN and BOOT switches on ESP32)
 */
function createTactileSwitch(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // Metal bracket housing (3.5 × 2.8 × 1.4 mm)
  const bracketGeom = new THREE.BoxGeometry(3.5, 1.2, 2.8);
  const bracket = new THREE.Mesh(bracketGeom, matLib.stainlessSteel);
  bracket.castShadow = true;
  group.add(bracket);

  // Actuator button plunger (circular black / white nylon button)
  const buttonGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.7, 16);
  const button = new THREE.Mesh(buttonGeom, matLib.icBlack);
  button.position.y = 0.8;
  group.add(button);

  // Solder lugs on edges
  const lugGeom = new THREE.BoxGeometry(0.7, 0.2, 0.4);
  const lug1 = new THREE.Mesh(lugGeom, matLib.solderSilver);
  lug1.position.set(-1.8, -0.4, 0.8);
  const lug2 = new THREE.Mesh(lugGeom, matLib.solderSilver);
  lug2.position.set(-1.8, -0.4, -0.8);
  const lug3 = new THREE.Mesh(lugGeom, matLib.solderSilver);
  lug3.position.set(1.8, -0.4, 0.8);
  const lug4 = new THREE.Mesh(lugGeom, matLib.solderSilver);
  lug4.position.set(1.8, -0.4, -0.8);

  group.add(lug1, lug2, lug3, lug4);
  return group;
}

// ---------------------------------------------------------------------------
// 1. MAIN HOUSING (main_box): 60 x 35 x 18 mm
// ---------------------------------------------------------------------------
export function buildMainHousing(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'main_housing';

  const length = 60; // X
  const width = 35;  // Z
  const height = 18; // Y
  const wall = 2.0;
  const cornerR = 5.5;

  // --- Outer Hollow Shell with 2.0 mm wall thickness ---
  const outerShape = createRoundedRectShape(length, width, cornerR);
  const innerHole = createRoundedRectShape(length - wall * 2, width - wall * 2, Math.max(1.0, cornerR - wall));
  outerShape.holes.push(innerHole);

  const extrudeSettings = {
    depth: height - wall,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.6,
    bevelThickness: 0.6,
  };

  const wallGeom = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
  wallGeom.rotateX(Math.PI / 2);
  wallGeom.translate(0, -height / 2 + wall, 0);

  const wallsMesh = new THREE.Mesh(wallGeom, matLib.housingSolid);
  wallsMesh.castShadow = true;
  wallsMesh.receiveShadow = true;
  group.add(wallsMesh);

  // --- Base Floor with Stepped Optical Window and GSR Electrode Bores ---
  const baseShape = createRoundedRectShape(length, width, cornerR);

  // 1) Central Optical Sensor cutout (16.2 × 16.2 mm)
  const opticalHole = createRoundedRectShape(16.2, 16.2, 1.2);
  baseShape.holes.push(opticalHole);

  // 2) Left & Right GSR Electrode Ports (dia 10.4 mm)
  const leftGsrHole = new THREE.Path();
  leftGsrHole.absarc(-13, 0, 5.2, 0, Math.PI * 2, true);
  baseShape.holes.push(leftGsrHole);

  const rightGsrHole = new THREE.Path();
  rightGsrHole.absarc(13, 0, 5.2, 0, Math.PI * 2, true);
  baseShape.holes.push(rightGsrHole);

  const baseGeom = new THREE.ExtrudeGeometry(baseShape, {
    depth: wall,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.5,
    bevelThickness: 0.5,
  });
  baseGeom.rotateX(Math.PI / 2);
  baseGeom.translate(0, -height / 2, 0);

  const baseMesh = new THREE.Mesh(baseGeom, matLib.housingSolid);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // --- Optical Seating Recess Shoulder (18.2 × 18.2 mm stepped shoulder) ---
  const stepShape = createRoundedRectShape(18.2, 18.2, 2.0);
  const stepInner = createRoundedRectShape(16.2, 16.2, 1.2);
  stepShape.holes.push(stepInner);

  const stepGeom = new THREE.ExtrudeGeometry(stepShape, { depth: 0.8, bevelEnabled: false });
  stepGeom.rotateX(Math.PI / 2);
  stepGeom.translate(0, -height / 2 + wall, 0);
  const stepMesh = new THREE.Mesh(stepGeom, matLib.housingSolid);
  group.add(stepMesh);

  // --- 4 Corner Cylindrical Screw Bosses with Brass Threaded M2 Inserts ---
  const bossRadius = 2.8;
  const bossGeom = new THREE.CylinderGeometry(bossRadius, bossRadius, height - wall, 24);
  const insertGeom = new THREE.CylinderGeometry(1.4, 1.4, 3.8, 16);
  const insertHoleGeom = new THREE.CylinderGeometry(0.95, 0.95, 4.0, 12);

  const bossPositions = [
    [-length / 2 + 5.5, -height / 2 + (height - wall) / 2 + wall, -width / 2 + 5.5],
    [ length / 2 - 5.5, -height / 2 + (height - wall) / 2 + wall, -width / 2 + 5.5],
    [-length / 2 + 5.5, -height / 2 + (height - wall) / 2 + wall,  width / 2 - 5.5],
    [ length / 2 - 5.5, -height / 2 + (height - wall) / 2 + wall,  width / 2 - 5.5],
  ];

  bossPositions.forEach(([bx, by, bz]) => {
    // Plastic molded boss pillar
    const boss = new THREE.Mesh(bossGeom, matLib.housingSolid);
    boss.position.set(bx, by, bz);
    boss.castShadow = true;
    group.add(boss);

    // Brass knurled M2 threaded insert
    const insert = new THREE.Mesh(insertGeom, matLib.brassNut);
    insert.position.set(bx, height / 2 - 2.0, bz);
    group.add(insert);

    // Dark threaded pilot hole
    const insertHole = new THREE.Mesh(insertHoleGeom, matLib.icBlack);
    insertHole.position.set(bx, height / 2 - 1.8, bz);
    group.add(insertHole);
  });

  // --- Internal Perfboard Mounting Ledges with Reinforcing Gusset Ribs ---
  const shelfLength = length - wall * 2 - 12;
  const shelfGeom = new THREE.BoxGeometry(shelfLength, 1.4, 2.2);

  const shelfNorth = new THREE.Mesh(shelfGeom, matLib.housingSolid);
  shelfNorth.position.set(0, -height / 2 + 5.5, width / 2 - wall - 1.1);
  const shelfSouth = new THREE.Mesh(shelfGeom, matLib.housingSolid);
  shelfSouth.position.set(0, -height / 2 + 5.5, -width / 2 + wall + 1.1);
  group.add(shelfNorth, shelfSouth);

  // Reinforcing gussets under shelves
  for (let gx = -16; gx <= 16; gx += 16) {
    const gussetGeom = new THREE.BoxGeometry(1.2, 4.0, 1.8);
    const gN = new THREE.Mesh(gussetGeom, matLib.housingSolid);
    gN.position.set(gx, -height / 2 + 3.2, width / 2 - wall - 0.9);
    const gS = new THREE.Mesh(gussetGeom, matLib.housingSolid);
    gS.position.set(gx, -height / 2 + 3.2, -width / 2 + wall + 0.9);
    group.add(gN, gS);
  }

  // --- Stepped Lid Locating Rim Ledge (0.2mm edge clearance) ---
  const ledgeShape = createRoundedRectShape(length, width, cornerR);
  const ledgeInner = createRoundedRectShape(length - 3.2, width - 3.2, cornerR - 1.6);
  ledgeShape.holes.push(ledgeInner);

  const ledgeGeom = new THREE.ExtrudeGeometry(ledgeShape, { depth: 1.2, bevelEnabled: false });
  ledgeGeom.rotateX(Math.PI / 2);
  ledgeGeom.translate(0, height / 2 - 1.2, 0);
  const ledgeMesh = new THREE.Mesh(ledgeGeom, matLib.housingSolid);
  group.add(ledgeMesh);

  // --- USB-C Port Opening Bezel on +X Wall ---
  const usbBezelGeom = new THREE.BoxGeometry(1.2, 4.8, 10.6);
  const usbBezel = new THREE.Mesh(usbBezelGeom, matLib.housingSolid);
  usbBezel.position.set(length / 2 - wall / 2, -height / 2 + 8.5, 0);

  // Dark inner cavity of slot
  const usbSlotInner = new THREE.Mesh(
    new THREE.BoxGeometry(wall + 0.6, 3.4, 9.2),
    matLib.icBlack
  );
  usbSlotInner.position.set(length / 2 - wall / 2, -height / 2 + 8.5, 0);
  group.add(usbBezel, usbSlotInner);

  return group;
}

// ---------------------------------------------------------------------------
// 2. TOP LID (top_lid): 60 x 35 x 2 mm
// ---------------------------------------------------------------------------
export function buildTopLid(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'top_lid';

  const length = 60;
  const width = 35;
  const cornerR = 5.5;

  // Upper Main Face Plate: 60 × 35 × 1.0 mm with chamfered rim
  const topPlateShape = createRoundedRectShape(length, width, cornerR);
  // Status LED window aperture (6.0 × 6.0 mm)
  const ledWindowHole = createRoundedRectShape(6.0, 6.0, 0.8);
  topPlateShape.holes.push(ledWindowHole);

  const topPlateGeom = new THREE.ExtrudeGeometry(topPlateShape, {
    depth: 1.0,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.5,
    bevelThickness: 0.5,
  });
  topPlateGeom.rotateX(Math.PI / 2);

  const topMesh = new THREE.Mesh(topPlateGeom, matLib.topLidSolid);
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  group.add(topMesh);

  // Stepped Locating Underside Lip (55.6 × 30.6 × 1.2 mm - 0.2mm edge clearance)
  const stepLipShape = createRoundedRectShape(length - 4.4, width - 4.4, Math.max(1.0, cornerR - 2.2));
  stepLipShape.holes.push(ledWindowHole);

  const stepLipGeom = new THREE.ExtrudeGeometry(stepLipShape, {
    depth: 1.2,
    bevelEnabled: false,
  });
  stepLipGeom.rotateX(Math.PI / 2);
  stepLipGeom.translate(0, -1.2, 0);

  const stepMesh = new THREE.Mesh(stepLipGeom, matLib.topLidSolid);
  stepMesh.castShadow = true;
  group.add(stepMesh);

  // 45-degree Chamfered Light-Funnel Bezel around the LED window
  const funnelGeom = new THREE.CylinderGeometry(3.6, 2.5, 0.6, 16);
  const funnelMesh = new THREE.Mesh(funnelGeom, matLib.topLidSolid);
  funnelMesh.position.set(0, 0.2, 0);
  group.add(funnelMesh);

  // 4 Corner M2 Machine Screws with Torx / Hex-Socket Drive Wells
  const wellGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.7, 24);
  const screwHeadGeom = new THREE.CylinderGeometry(1.8, 1.8, 0.5, 24);
  const socketGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.35, 6); // Hexagonal socket

  const screwPositions = [
    [-length / 2 + 5.5, 0.45, -width / 2 + 5.5],
    [ length / 2 - 5.5, 0.45, -width / 2 + 5.5],
    [-length / 2 + 5.5, 0.45,  width / 2 - 5.5],
    [ length / 2 - 5.5, 0.45,  width / 2 - 5.5],
  ];

  screwPositions.forEach(([sx, sy, sz]) => {
    // Counterbore recess well
    const well = new THREE.Mesh(wellGeom, matLib.housingSolid);
    well.position.set(sx, sy - 0.1, sz);
    group.add(well);

    // Stainless steel screw head
    const screw = new THREE.Mesh(screwHeadGeom, matLib.stainlessSteel);
    screw.position.set(sx, sy, sz);
    screw.castShadow = true;
    group.add(screw);

    // Hex socket drive depression
    const socket = new THREE.Mesh(socketGeom, matLib.icBlack);
    socket.position.set(sx, sy + 0.2, sz);
    group.add(socket);
  });

  return group;
}

// ---------------------------------------------------------------------------
// 3. LOWER SENSOR PLATE: 40 x 25 x 3 mm
// ---------------------------------------------------------------------------
export function buildLowerSensorPlate(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'lower_sensor_plate';

  const length = 40;
  const width = 25;
  const height = 3;
  const cornerR = 3.5;

  const shape = createRoundedRectShape(length, width, cornerR);

  // Optical sensor cutout (16.2 × 16.2 mm)
  const opticalHole = createRoundedRectShape(16.2, 16.2, 1.2);
  shape.holes.push(opticalHole);

  // Dual GSR electrode holes (dia 10.4 mm)
  const leftGSR = new THREE.Path();
  leftGSR.absarc(-13, 0, 5.2, 0, Math.PI * 2, true);
  shape.holes.push(leftGSR);

  const rightGSR = new THREE.Path();
  rightGSR.absarc(13, 0, 5.2, 0, Math.PI * 2, true);
  shape.holes.push(rightGSR);

  const plateGeom = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.5,
    bevelThickness: 0.5,
  });
  plateGeom.rotateX(Math.PI / 2);

  const plateMesh = new THREE.Mesh(plateGeom, matLib.lowerPlate);
  plateMesh.castShadow = true;
  plateMesh.receiveShadow = true;
  group.add(plateMesh);

  // Raised Circular Seating Collars for the electrodes with O-ring groove
  [-13, 13].forEach((xPos) => {
    const collarGeom = new THREE.CylinderGeometry(5.8, 5.8, 0.6, 24);
    const collar = new THREE.Mesh(collarGeom, matLib.lowerPlate);
    collar.position.set(xPos, height / 2 + 0.3, 0);
    group.add(collar);

    // Rubber O-Ring sealing gasket
    const oRingGeom = new THREE.TorusGeometry(5.4, 0.4, 8, 24);
    oRingGeom.rotateX(Math.PI / 2);
    const oRing = new THREE.Mesh(oRingGeom, matLib.icBlack);
    oRing.position.set(xPos, height / 2 + 0.5, 0);
    group.add(oRing);
  });

  return group;
}

// ---------------------------------------------------------------------------
// 4. TRANSPARENT OPTICAL SENSOR LENS: 16 x 16 x 2 mm (Two-Step Acrylic)
// ---------------------------------------------------------------------------
export function buildOpticalLens(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'optical_lens';

  // Upper retaining flange: 18 × 18 × 1.0 mm with rounded corners
  const upperShape = createRoundedRectShape(18, 18, 2.0);
  const upperGeom = new THREE.ExtrudeGeometry(upperShape, {
    depth: 1.0,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.25,
    bevelThickness: 0.25,
  });
  upperGeom.rotateX(Math.PI / 2);

  const upperMesh = new THREE.Mesh(upperGeom, matLib.opticalLens);
  upperMesh.position.y = 0.5;
  upperMesh.renderOrder = 2;
  group.add(upperMesh);

  // Lower optical step: 15.6 × 15.6 × 1.0 mm (locates in the 16.2mm window)
  const lowerShape = createRoundedRectShape(15.6, 15.6, 1.5);
  const lowerGeom = new THREE.ExtrudeGeometry(lowerShape, {
    depth: 1.0,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.2,
    bevelThickness: 0.2,
  });
  lowerGeom.rotateX(Math.PI / 2);

  const lowerMesh = new THREE.Mesh(lowerGeom, matLib.opticalLens);
  lowerMesh.position.y = -0.5;
  lowerMesh.renderOrder = 2;
  group.add(lowerMesh);

  // Polished perimeter edge refraction ring
  const ringGeom = new THREE.BoxGeometry(15.8, 0.3, 15.8);
  const edgeRing = new THREE.Mesh(ringGeom, matLib.opticalLens);
  edgeRing.position.y = 0;
  edgeRing.renderOrder = 2;
  group.add(edgeRing);

  return group;
}

// ---------------------------------------------------------------------------
// 5. GSR ELECTRODES: Dual 10 mm 316L Stainless Steel Skin-Contact Discs
// ---------------------------------------------------------------------------
export function buildGsrElectrodes(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'gsr_electrodes';

  [-13, 13].forEach((xPos) => {
    // 10 mm diameter main disc
    const discGeom = new THREE.CylinderGeometry(5.0, 5.0, 1.8, 32);
    const disc = new THREE.Mesh(discGeom, matLib.stainlessSteel);
    disc.position.set(xPos, 0, 0);
    disc.castShadow = true;
    disc.receiveShadow = true;

    // Smooth spherical skin-contact dome (R=22mm for comfortable ergonomic contact)
    const domeGeom = new THREE.SphereGeometry(5.0, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.28);
    domeGeom.rotateX(Math.PI);
    domeGeom.scale(1, 0.45, 1);
    const dome = new THREE.Mesh(domeGeom, matLib.stainlessSteel);
    dome.position.set(xPos, -0.9, 0);
    dome.castShadow = true;

    // Micro-machined sweat-adherence radial rings on face
    const grooveGeom = new THREE.TorusGeometry(3.2, 0.15, 8, 24);
    grooveGeom.rotateX(Math.PI / 2);
    const groove = new THREE.Mesh(grooveGeom, matLib.brushedSteel);
    groove.position.set(xPos, -1.3, 0);

    // Backside M2 Threaded Mounting Stud
    const stemGeom = new THREE.CylinderGeometry(1.0, 1.0, 3.8, 16);
    const stem = new THREE.Mesh(stemGeom, matLib.stainlessSteel);
    stem.position.set(xPos, 2.0, 0);

    // Miniature Brass Hex Retaining Nut (3.5mm across flats)
    const nutGeom = new THREE.CylinderGeometry(1.8, 1.8, 1.2, 6);
    const nut = new THREE.Mesh(nutGeom, matLib.brassNut);
    nut.position.set(xPos, 2.5, 0);

    // Solder lug eyelet terminal
    const eyeletGeom = new THREE.TorusGeometry(1.2, 0.25, 8, 16);
    eyeletGeom.rotateX(Math.PI / 2);
    const eyelet = new THREE.Mesh(eyeletGeom, matLib.solderSilver);
    eyelet.position.set(xPos, 3.2, 0);

    group.add(disc, dome, groove, stem, nut, eyelet);
  });

  return group;
}

// ---------------------------------------------------------------------------
// 6. WRIST STRAP WITH CRADLE: 220 x 22 x 2.4 mm (Flexible TPU / Silicone)
// ---------------------------------------------------------------------------
export function buildWristStrap(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'wrist_strap';

  // --- 1. Central Housing Cradle Pocket (64 × 39 × 14 mm) ---
  const cradleOuter = createRoundedRectShape(64, 39, 6.2);
  const cradleInner = createRoundedRectShape(60.4, 35.4, 4.8);
  cradleOuter.holes.push(cradleInner);

  const cradleGeom = new THREE.ExtrudeGeometry(cradleOuter, {
    depth: 13,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.8,
    bevelThickness: 0.8,
  });
  cradleGeom.rotateX(Math.PI / 2);
  cradleGeom.translate(0, 5.5, 0);

  const cradleMesh = new THREE.Mesh(cradleGeom, matLib.wristStrap);
  cradleMesh.castShadow = true;
  cradleMesh.receiveShadow = true;
  group.add(cradleMesh);

  // Cradle retaining lip
  const lipShape = createRoundedRectShape(64, 39, 6.2);
  const lipInner = createRoundedRectShape(59.2, 34.2, 4.4);
  lipShape.holes.push(lipInner);
  const lipGeom = new THREE.ExtrudeGeometry(lipShape, { depth: 1.2, bevelEnabled: false });
  lipGeom.rotateX(Math.PI / 2);
  lipGeom.translate(0, 6.2, 0);
  const lipMesh = new THREE.Mesh(lipGeom, matLib.wristStrap);
  group.add(lipMesh);

  // --- 2. Curved Ergonomic Strap Bands (Stadium Cross-Section) ---
  const strapWidth = 22;
  const strapThickness = 2.4;

  // Helper to build a smooth curved strap ribbon with soft stadium edges
  const buildSmoothStrapMesh = (curve: THREE.CatmullRomCurve3, segments: number) => {
    const points = curve.getPoints(segments);
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const tangent = (i < points.length - 1)
        ? points[i + 1].clone().sub(pt).normalize()
        : pt.clone().sub(points[i - 1]).normalize();
      const binormal = new THREE.Vector3(0, 0, 1);
      const normal = new THREE.Vector3().crossVectors(tangent, binormal).normalize();

      const halfW = strapWidth / 2;
      const halfT = strapThickness / 2;

      // 8 cross-section vertices for filleted edge profile
      const p1 = pt.clone().addScaledVector(binormal, -halfW).addScaledVector(normal, 0);
      const p2 = pt.clone().addScaledVector(binormal, -halfW + 1.2).addScaledVector(normal, halfT);
      const p3 = pt.clone().addScaledVector(binormal,  halfW - 1.2).addScaledVector(normal, halfT);
      const p4 = pt.clone().addScaledVector(binormal,  halfW).addScaledVector(normal, 0);
      const p5 = pt.clone().addScaledVector(binormal,  halfW - 1.2).addScaledVector(normal, -halfT);
      const p6 = pt.clone().addScaledVector(binormal, -halfW + 1.2).addScaledVector(normal, -halfT);

      vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z, p5.x, p5.y, p5.z, p6.x, p6.y, p6.z);
      for (let k = 0; k < 6; k++) normals.push(normal.x, normal.y, normal.z);
      const u = i / segments;
      uvs.push(0, u, 0.2, u, 0.8, u, 1, u, 0.8, u, 0.2, u);

      if (i < points.length - 1) {
        const b = i * 6;
        // Top surface
        indices.push(b + 1, b + 7, b + 2, b + 2, b + 7, b + 8);
        // Right fillet
        indices.push(b + 2, b + 8, b + 3, b + 3, b + 8, b + 9);
        // Bottom surface
        indices.push(b + 5, b + 4, b + 11, b + 4, b + 10, b + 11);
        // Left fillet
        indices.push(b, b + 6, b + 1, b + 1, b + 6, b + 7);
        // Bottom-left fillet
        indices.push(b + 5, b + 11, b, b, b + 11, b + 6);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, matLib.wristStrap);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // 1) Longer Strap (+X) with natural wrist curvature
  const longCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(32, 0, 0),
    new THREE.Vector3(68, -7, 0),
    new THREE.Vector3(104, -25, 0),
    new THREE.Vector3(128, -48, 0),
  ]);
  const longMesh = buildSmoothStrapMesh(longCurve, 28);
  group.add(longMesh);

  // 9 Stadium Adjustment Holes (length 4.2mm × width 1.6mm)
  const holeGeom = new THREE.CylinderGeometry(1.2, 1.2, strapThickness + 0.8, 16);
  for (let h = 0; h < 9; h++) {
    const t = 0.30 + h * 0.07;
    const pos = longCurve.getPointAt(Math.min(t, 0.96));
    const holeMarker = new THREE.Mesh(holeGeom, matLib.housingSolid);
    holeMarker.position.copy(pos);
    group.add(holeMarker);
  }

  // 2) Shorter Strap (-X) with Buckle Frame and Tongue
  const shortCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-32, 0, 0),
    new THREE.Vector3(-60, -7, 0),
    new THREE.Vector3(-85, -23, 0),
  ]);
  const shortMesh = buildSmoothStrapMesh(shortCurve, 20);
  group.add(shortMesh);

  // --- Solid 316L Stainless Steel Buckle Assembly ---
  const buckleGroup = new THREE.Group();
  buckleGroup.position.set(-86, -24, 0);

  // Outer U-shaped buckle frame
  const frameGeom = new THREE.TorusGeometry(strapWidth / 2 + 1.4, 1.5, 12, 28, Math.PI * 1.2);
  frameGeom.rotateY(Math.PI / 2);
  const frameMesh = new THREE.Mesh(frameGeom, matLib.stainlessSteel);
  frameMesh.castShadow = true;
  buckleGroup.add(frameMesh);

  // Pivot hinge cross-pin
  const hingePinGeom = new THREE.CylinderGeometry(1.1, 1.1, strapWidth + 3.0, 16);
  hingePinGeom.rotateX(Math.PI / 2);
  const hingePin = new THREE.Mesh(hingePinGeom, matLib.stainlessSteel);
  buckleGroup.add(hingePin);

  // Buckle Tongue / Prong resting in the strap slot
  const tongueGeom = new THREE.CylinderGeometry(0.7, 0.7, 7.5, 12);
  tongueGeom.rotateZ(Math.PI / 3);
  const tongueMesh = new THREE.Mesh(tongueGeom, matLib.stainlessSteel);
  tongueMesh.position.set(2.0, 0.8, 0);
  buckleGroup.add(tongueMesh);

  group.add(buckleGroup);

  // Dual Flexible Keeper Loops
  [-68, -75].forEach((kx) => {
    const keeperGeom = new THREE.TorusGeometry(strapWidth / 2 + 1.0, 1.3, 10, 24);
    keeperGeom.scale(1, 0.45, 1);
    keeperGeom.rotateY(Math.PI / 2);
    const keeper = new THREE.Mesh(keeperGeom, matLib.wristStrap);
    keeper.position.set(kx, -15 + (kx + 68) * 0.4, 0);
    keeper.castShadow = true;
    group.add(keeper);
  });

  return group;
}

// ---------------------------------------------------------------------------
// 7. ESP32-WROOM-32 DEVELOPMENT BOARD: 52 x 28 x 6 mm
// ---------------------------------------------------------------------------
export function buildEsp32Board(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'esp32_board';

  // --- FR-4 Dark Green PCB Substrate (52 × 28 × 1.6 mm) with rounded corners ---
  const pcbShape = createRoundedRectShape(52, 28, 1.8);
  // 4 corner mounting holes (dia 2.0 mm)
  const holePositions = [
    [-23.5, -11.5],
    [ 23.5, -11.5],
    [-23.5,  11.5],
    [ 23.5,  11.5],
  ];
  holePositions.forEach(([hx, hy]) => {
    const h = new THREE.Path();
    h.absarc(hx, hy, 1.0, 0, Math.PI * 2, true);
    pcbShape.holes.push(h);
  });

  const pcbGeom = new THREE.ExtrudeGeometry(pcbShape, { depth: 1.6, bevelEnabled: false });
  pcbGeom.rotateX(Math.PI / 2);
  const pcbMesh = new THREE.Mesh(pcbGeom, matLib.esp32Pcb);
  pcbMesh.castShadow = true;
  pcbMesh.receiveShadow = true;
  group.add(pcbMesh);

  // Gold Annular Solder Rings around the 4 mounting holes
  holePositions.forEach(([hx, hy]) => {
    const ringGeom = new THREE.RingGeometry(1.0, 1.6, 16);
    ringGeom.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeom, matLib.goldContacts);
    ring.position.set(hx, 0.82, -hy);
    group.add(ring);
  });

  // --- ESP32 Metallic RF Shield Can (18 × 18 × 2.8 mm) ---
  const shieldShape = createRoundedRectShape(18, 18, 1.0);
  const shieldGeom = new THREE.ExtrudeGeometry(shieldShape, {
    depth: 2.8,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.3,
    bevelThickness: 0.3,
  });
  shieldGeom.rotateX(Math.PI / 2);
  shieldGeom.translate(-4, 0.8 + 2.8, 0);

  const shieldMesh = new THREE.Mesh(shieldGeom, matLib.esp32Shield);
  shieldMesh.castShadow = true;
  group.add(shieldMesh);

  // Solder ground tabs connecting shield to PCB
  [-13, 5].forEach((sx) => {
    [-9, 9].forEach((sz) => {
      const solderGeom = new THREE.BoxGeometry(1.2, 0.8, 1.2);
      const solder = new THREE.Mesh(solderGeom, matLib.solderSilver);
      solder.position.set(sx, 1.1, sz);
      group.add(solder);
    });
  });

  // --- Printed Inverted-F Antenna (PIFA) Gold Meander Traces ---
  const antPlateGeom = new THREE.BoxGeometry(8.5, 0.1, 22.0);
  const antPlate = new THREE.Mesh(antPlateGeom, matLib.goldContacts);
  antPlate.position.set(-20.5, 0.85, 0);
  group.add(antPlate);

  // Meander copper slots
  for (let m = -8; m <= 8; m += 4) {
    const slotGeom = new THREE.BoxGeometry(5.0, 0.15, 1.5);
    const slot = new THREE.Mesh(slotGeom, matLib.esp32Pcb);
    slot.position.set(-20.5, 0.88, m);
    group.add(slot);
  }

  // --- Micro-USB Connector at Board Edge ---
  const usbShellGeom = new THREE.BoxGeometry(6.5, 3.0, 7.8);
  const usbShell = new THREE.Mesh(usbShellGeom, matLib.stainlessSteel);
  usbShell.position.set(24.5, 2.2, 0);
  usbShell.castShadow = true;

  // Dark internal opening with 5 gold contact fingers
  const usbTongueGeom = new THREE.BoxGeometry(3.0, 0.6, 4.8);
  const usbTongue = new THREE.Mesh(usbTongueGeom, matLib.icBlack);
  usbTongue.position.set(24.5, 2.0, 0);

  const fingerGeom = new THREE.BoxGeometry(2.4, 0.15, 0.4);
  for (let f = -1.6; f <= 1.6; f += 0.8) {
    const finger = new THREE.Mesh(fingerGeom, matLib.goldContacts);
    finger.position.set(24.5, 2.4, f);
    group.add(finger);
  }
  group.add(usbShell, usbTongue);

  // --- Dual Rows of 19-Pin Headers (pitch 2.54 mm) ---
  const pinHeaderBaseGeom = new THREE.BoxGeometry(48.5, 2.5, 2.5);
  const pinGeom = new THREE.BoxGeometry(0.64, 4.2, 0.64); // Authentic square 0.025" pins

  [-11.5, 11.5].forEach((zPos) => {
    // Ribbed black PBT insulator strip
    const plasticBase = new THREE.Mesh(pinHeaderBaseGeom, matLib.icBlack);
    plasticBase.position.set(0, 2.0, zPos);
    group.add(plasticBase);

    for (let p = -22.86; p <= 22.86; p += 2.54) {
      // Gold-plated header pin
      const pin = new THREE.Mesh(pinGeom, matLib.goldContacts);
      pin.position.set(p, 4.2, zPos);
      pin.castShadow = true;

      // Solder fillet beneath PCB
      const filletGeom = new THREE.CylinderGeometry(0.5, 0.8, 0.6, 8);
      const fillet = new THREE.Mesh(filletGeom, matLib.solderSilver);
      fillet.position.set(p, -0.9, zPos);

      group.add(pin, fillet);
    }
  });

  // --- Active ICs & Passive SMT Components ---
  // 1. CP2102 USB-UART Bridge IC (QFN-28)
  const cp2102 = createSopIc(5.0, 5.0, 1.0, 7, matLib);
  cp2102.position.set(16, 1.3, 0);
  group.add(cp2102);

  // 2. AMS1117 3.3V Low-Dropout Voltage Regulator (SOT-223)
  const regBody = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.6, 3.5), matLib.icBlack);
  const regTab = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 1.8), matLib.solderSilver);
  regTab.position.set(0, 0.5, -2.2);
  const regGroup = new THREE.Group();
  regGroup.position.set(10, 1.5, 6);
  regGroup.add(regBody, regTab);
  group.add(regGroup);

  // 3. 40.000 MHz Quartz Crystal Oscillator (SMD metal can)
  const xtalGeom = new THREE.BoxGeometry(3.2, 0.9, 2.5);
  const xtalMesh = new THREE.Mesh(xtalGeom, matLib.stainlessSteel);
  xtalMesh.position.set(8, 1.25, -6);
  group.add(xtalMesh);

  // 4. "EN" and "BOOT" Tactile Micro-Buttons
  const enButton = createTactileSwitch(matLib);
  enButton.position.set(22, 1.5, 7.5);
  const bootButton = createTactileSwitch(matLib);
  bootButton.position.set(22, 1.5, -7.5);
  group.add(enButton, bootButton);

  // 5. Cluster of 0603 Capacitors & 0805 Resistors
  const smdOffsets = [
    [12, 1.1, -2, true],
    [14, 1.1, -4, false],
    [14, 1.1, 4, true],
    [10, 1.1, 1, false],
    [6, 1.1, 8, true],
    [6, 1.1, -8, false],
  ] as const;

  smdOffsets.forEach(([sx, sy, sz, isCap]) => {
    const smd = createSmdPassive(1.6, 0.8, 0.7, isCap, matLib);
    smd.position.set(sx, sy, sz);
    group.add(smd);
  });

  // 6. SMD Power (Red) and Status (Blue) LEDs
  const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.8), matLib.wireRed);
  pwrLed.position.set(18, 1.1, 5.5);
  const statLed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.8), matLib.wireBlue);
  statLed.position.set(18, 1.1, -5.5);
  group.add(pwrLed, statLed);

  return group;
}

// ---------------------------------------------------------------------------
// 8. LI-PO RECHARGEABLE BATTERY (35 x 25 x 5 mm, 3.7V 500mAh)
// ---------------------------------------------------------------------------
export function buildLipoBattery(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'lipo_battery';

  // Pillowed pouch cell body with soft radiused edges
  const bodyShape = createRoundedRectShape(35, 25, 3.8);
  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 4.8,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.8,
    bevelThickness: 0.8,
  });
  bodyGeom.rotateX(Math.PI / 2);

  const bodyMesh = new THREE.Mesh(bodyGeom, matLib.batteryFoil);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 3-Sided Crimped and Heat-Sealed Flange Rim
  const flangeGeom = new THREE.BoxGeometry(37.5, 0.5, 27.5);
  const flangeMesh = new THREE.Mesh(flangeGeom, matLib.batteryFoil);
  flangeMesh.position.set(0, 0, 0);
  group.add(flangeMesh);

  // Polyimide Kapton Tape wrapping over terminal PCM
  const kaptonGeom = new THREE.BoxGeometry(7.0, 5.2, 26.2);
  const kaptonMesh = new THREE.Mesh(kaptonGeom, matLib.kaptonTape);
  kaptonMesh.position.set(-15, 0, 0);
  group.add(kaptonMesh);

  // Terminal PCB substrate inside tape
  const pcmGeom = new THREE.BoxGeometry(5.0, 1.2, 22.0);
  const pcmMesh = new THREE.Mesh(pcmGeom, matLib.esp32Pcb);
  pcmMesh.position.set(-15, 0, 0);
  group.add(pcmMesh);

  // Flexible Red (+) and Black (-) 28AWG silicone lead wires
  const redWireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-17.5, 0, 4.0),
    new THREE.Vector3(-22.0, 1.5, 5.5),
    new THREE.Vector3(-27.0, 0.5, 7.5),
    new THREE.Vector3(-31.0, 0.0, 8.5),
  ]);
  const redGeom = new THREE.TubeGeometry(redWireCurve, 16, 0.55, 8, false);
  const redMesh = new THREE.Mesh(redGeom, matLib.wireRed);

  const blackWireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-17.5, 0, -4.0),
    new THREE.Vector3(-22.0, 1.5, -5.5),
    new THREE.Vector3(-27.0, 0.5, -7.5),
    new THREE.Vector3(-31.0, 0.0, -8.5),
  ]);
  const blackGeom = new THREE.TubeGeometry(blackWireCurve, 16, 0.55, 8, false);
  const blackMesh = new THREE.Mesh(blackGeom, matLib.wireBlack);

  group.add(redMesh, blackMesh);

  // JST-PH 2.0mm 2-Pin White Nylon Keyed Connector Plug
  const jstPlugGeom = new THREE.BoxGeometry(5.0, 3.2, 5.5);
  const jstPlug = new THREE.Mesh(jstPlugGeom, matLib.jstPlastic);
  jstPlug.position.set(-33.0, 0.0, 0);

  // Metal crimp contacts inside
  const pin1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 0.4), matLib.goldContacts);
  pin1.position.set(-33.5, 0.0, 1.0);
  const pin2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 0.4), matLib.goldContacts);
  pin2.position.set(-33.5, 0.0, -1.0);

  group.add(jstPlug, pin1, pin2);
  return group;
}

// ---------------------------------------------------------------------------
// 9. TP4056 USB-C CHARGER & PROTECTION MODULE: 25 x 19 x 4 mm
// ---------------------------------------------------------------------------
export function buildTp4056Charger(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tp4056_charger';

  // Blue Soldermask PCB: 25 × 19 × 1.6 mm with gold pads
  const pcbShape = createRoundedRectShape(25, 19, 1.2);
  const pcbGeom = new THREE.ExtrudeGeometry(pcbShape, { depth: 1.6, bevelEnabled: false });
  pcbGeom.rotateX(Math.PI / 2);

  const pcbMesh = new THREE.Mesh(pcbGeom, matLib.bluePcb);
  pcbMesh.castShadow = true;
  group.add(pcbMesh);

  // Solder Pads on edges (B+, B-, IN+, IN-, OUT+, OUT-)
  const padGeom = new THREE.BoxGeometry(1.6, 0.1, 1.6);
  const padPos = [
    [-11.5, 0.85, 7.5],
    [-11.5, 0.85, -7.5],
    [-6.0,  0.85, 7.5],
    [-6.0,  0.85, -7.5],
    [ 11.5, 0.85, 7.5],
    [ 11.5, 0.85, -7.5],
  ];
  padPos.forEach(([px, py, pz]) => {
    const pad = new THREE.Mesh(padGeom, matLib.goldContacts);
    pad.position.set(px, py, pz);
    group.add(pad);
  });

  // Precision Deep-Drawn Stainless Steel USB-C Receptacle Shell (8.4 × 3.2 × 7.3 mm)
  const usbOuter = createStadiumShape(8.4, 3.2);
  const usbInner = createStadiumShape(7.4, 2.4);
  usbOuter.holes.push(usbInner);

  const usbGeom = new THREE.ExtrudeGeometry(usbOuter, { depth: 7.2, bevelEnabled: false });
  usbGeom.rotateY(Math.PI / 2);
  usbGeom.translate(11.0, 2.2, 0);

  const usbMesh = new THREE.Mesh(usbGeom, matLib.stainlessSteel);
  usbMesh.castShadow = true;

  // Center Black Tongue with 24 gold contact pins
  const tongueGeom = new THREE.BoxGeometry(6.2, 0.65, 6.0);
  const tongue = new THREE.Mesh(tongueGeom, matLib.icBlack);
  tongue.position.set(11.0, 2.2, 0);

  group.add(usbMesh, tongue);

  // TP4056 Linear Li-Ion Charger SOP-8 IC
  const tp4056Ic = createSopIc(4.9, 3.9, 1.4, 4, matLib);
  tp4056Ic.position.set(-2, 1.5, 2);
  group.add(tp4056Ic);

  // DW01A 6-Pin Protection IC
  const dw01a = createSopIc(2.9, 1.6, 1.1, 3, matLib);
  dw01a.position.set(-7, 1.35, -4);
  group.add(dw01a);

  // FS8205A Dual N-Channel Power MOSFET (TSSOP-8)
  const mosfet = createSopIc(3.0, 4.4, 1.1, 4, matLib);
  mosfet.position.set(-7, 1.35, 3.5);
  group.add(mosfet);

  // SMD 1206 Current Set Resistor & Ceramic Capacitors
  const smd1 = createSmdPassive(2.0, 1.25, 0.8, false, matLib); // 1.2k resistor
  smd1.position.set(3, 1.2, 2);
  const cap1 = createSmdPassive(2.0, 1.25, 1.0, true, matLib);
  cap1.position.set(4, 1.3, -3);
  group.add(smd1, cap1);

  // Status Indicator LEDs: Red (Charging) & Blue (Standby / Full)
  const chrgLed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.8), matLib.wireRed);
  chrgLed.position.set(2, 1.2, 6.0);
  const stdbyLed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.8), matLib.wireBlue);
  stdbyLed.position.set(2, 1.2, -6.0);
  group.add(chrgLed, stdbyLed);

  return group;
}

// ---------------------------------------------------------------------------
// 10. MPU-6050 6-AXIS MOTION IMU BREAKOUT: 20 x 15 x 3 mm
// ---------------------------------------------------------------------------
export function buildMpu6050(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mpu6050_sensor';

  // Navy Blue PCB: 20 × 15 × 1.6 mm
  const pcbShape = createRoundedRectShape(20, 15, 1.0);
  const pcbGeom = new THREE.ExtrudeGeometry(pcbShape, { depth: 1.6, bevelEnabled: false });
  pcbGeom.rotateX(Math.PI / 2);

  const pcbMesh = new THREE.Mesh(pcbGeom, matLib.bluePcb);
  pcbMesh.castShadow = true;
  group.add(pcbMesh);

  // InvenSense MPU-6050 QFN-24 Sensor IC (4.0 × 4.0 × 0.9 mm)
  const qfnGeom = new THREE.BoxGeometry(4.0, 0.9, 4.0);
  const qfnMesh = new THREE.Mesh(qfnGeom, matLib.icBlack);
  qfnMesh.position.set(2, 1.25, 0);

  // Gold Pin 1 Dot on QFN
  const dotGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12);
  const dot = new THREE.Mesh(dotGeom, matLib.goldContacts);
  dot.position.set(0.6, 1.72, -1.3);
  group.add(qfnMesh, dot);

  // 8 Gold Through-Hole Header Pads along the edge
  for (let i = -7; i <= 7; i += 2.0) {
    const pad = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.8, 12), matLib.goldContacts);
    pad.rotateX(Math.PI / 2);
    pad.position.set(i, 0.82, -6.0);
    group.add(pad);
  }

  // Decoupling Capacitors (0603)
  const cap = createSmdPassive(1.6, 0.8, 0.7, true, matLib);
  cap.position.set(2, 1.15, -4.5);
  group.add(cap);

  return group;
}

// ---------------------------------------------------------------------------
// 11. COIN VIBRATION MOTOR: 10 mm diameter x 3 mm ERM Haptic Motor
// ---------------------------------------------------------------------------
export function buildVibrationMotor(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vibration_motor';

  // Stamped Brushed Stainless Steel Enclosure (10mm dia × 3.0mm)
  const bodyGeom = new THREE.CylinderGeometry(5.0, 5.0, 2.7, 32);
  const bodyMesh = new THREE.Mesh(bodyGeom, matLib.coinMotor);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Stepped Top Lid Rim
  const rimGeom = new THREE.CylinderGeometry(4.6, 5.0, 0.4, 32);
  const rimMesh = new THREE.Mesh(rimGeom, matLib.coinMotor);
  rimMesh.position.y = 1.4;
  group.add(rimMesh);

  // Central Vibration Dimple
  const dimpleGeom = new THREE.CylinderGeometry(1.6, 1.6, 0.2, 24);
  const dimple = new THREE.Mesh(dimpleGeom, matLib.stainlessSteel);
  dimple.position.y = 1.65;
  group.add(dimple);

  // Black Damping Sponge Adhesive Backing Pad
  const padGeom = new THREE.CylinderGeometry(4.8, 4.8, 0.4, 24);
  const padMesh = new THREE.Mesh(padGeom, matLib.icBlack);
  padMesh.position.y = -1.55;
  group.add(padMesh);

  // Red and Blue Twisted Flexible Silicone Leads with Strain Relief Collar
  const collarGeom = new THREE.BoxGeometry(1.5, 1.2, 2.4);
  const collar = new THREE.Mesh(collarGeom, matLib.icBlack);
  collar.position.set(4.8, 0, 0);
  group.add(collar);

  const curveRed = new THREE.CatmullRomCurve3([
    new THREE.Vector3(5.5, 0, 0.6),
    new THREE.Vector3(9.0, 1.5, 2.5),
    new THREE.Vector3(13.0, 2.0, 4.5),
  ]);
  const leadRed = new THREE.Mesh(new THREE.TubeGeometry(curveRed, 14, 0.38, 8, false), matLib.wireRed);

  const curveBlue = new THREE.CatmullRomCurve3([
    new THREE.Vector3(5.5, 0, -0.6),
    new THREE.Vector3(9.0, 1.5, 1.0),
    new THREE.Vector3(13.0, 2.0, 3.0),
  ]);
  const leadBlue = new THREE.Mesh(new THREE.TubeGeometry(curveBlue, 14, 0.38, 8, false), matLib.wireBlue);

  group.add(leadRed, leadBlue);
  return group;
}

// ---------------------------------------------------------------------------
// 12. WS2812B ADDRESSABLE RGB LED: 5 x 5 x 1.6 mm SMD 5050
// ---------------------------------------------------------------------------
export function buildWs2812bLed(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'rgb_led';

  // 5050 White High-Temp Plastic Carrier (5.0 × 5.0 × 1.6 mm) with pin 1 notch
  const bodyShape = createRoundedRectShape(5.0, 5.0, 0.6);
  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, { depth: 1.5, bevelEnabled: false });
  bodyGeom.rotateX(Math.PI / 2);

  const bodyMesh = new THREE.Mesh(bodyGeom, matLib.rgbLedBody);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Pin 1 Corner Notch Chamfer
  const notchGeom = new THREE.BoxGeometry(0.8, 0.5, 0.8);
  const notch = new THREE.Mesh(notchGeom, matLib.icBlack);
  notch.position.set(-2.2, 0.6, -2.2);
  group.add(notch);

  // Clear Optical Potting Dome
  const domeGeom = new THREE.CylinderGeometry(1.8, 1.8, 0.6, 24);
  const domeMesh = new THREE.Mesh(domeGeom, matLib.opticalLens);
  domeMesh.position.y = 0.8;
  domeMesh.renderOrder = 2;
  group.add(domeMesh);

  // Active Emissive Core Die with Wire Bonds
  const coreGeom = new THREE.BoxGeometry(1.2, 0.25, 1.2);
  const coreMesh = new THREE.Mesh(coreGeom, matLib.rgbLedEmitter);
  coreMesh.position.y = 0.65;
  group.add(coreMesh);

  // 4 Corner Gold/Tin Solder Contacts
  const padGeom = new THREE.BoxGeometry(1.1, 0.35, 1.3);
  const padPositions = [
    [-2.0, -0.65, -1.8],
    [ 2.0, -0.65, -1.8],
    [-2.0, -0.65,  1.8],
    [ 2.0, -0.65,  1.8],
  ];
  padPositions.forEach(([px, py, pz]) => {
    const pad = new THREE.Mesh(padGeom, matLib.solderSilver);
    pad.position.set(px, py, pz);
    group.add(pad);
  });

  return group;
}

// ---------------------------------------------------------------------------
// 13. MOTOR DRIVER CIRCUIT: 2N2222 Transistor + 1N4007 Diode + Resistors
// ---------------------------------------------------------------------------
export function buildMotorDriver(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'motor_driver';

  // Miniature Perfboard Carrier: 14 × 10 × 1.6 mm
  const pcbGeom = new THREE.BoxGeometry(14, 1.6, 10);
  const pcbMesh = new THREE.Mesh(pcbGeom, matLib.blackPcb);
  pcbMesh.castShadow = true;
  group.add(pcbMesh);

  // Doughnut Copper Solder Pads Array
  for (let x = -5; x <= 5; x += 2.5) {
    for (let z = -3; z <= 3; z += 2.5) {
      const pad = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.85, 10), matLib.goldContacts);
      pad.rotateX(Math.PI / 2);
      pad.position.set(x, 0.81, z);
      group.add(pad);
    }
  }

  // 2N2222 NPN Transistor in authentic TO-92 package (D-shaped cylinder)
  const to92Shape = new THREE.Shape();
  to92Shape.absarc(0, 0, 2.2, -Math.PI * 0.75, Math.PI * 0.75, false);
  to92Shape.lineTo(-1.5, -1.5);
  to92Shape.closePath();

  const to92Geom = new THREE.ExtrudeGeometry(to92Shape, { depth: 4.8, bevelEnabled: true, bevelSize: 0.2, bevelSegments: 2 });
  to92Geom.rotateZ(Math.PI / 2);
  to92Geom.translate(-3.0, 3.2, 0);

  const to92 = new THREE.Mesh(to92Geom, matLib.icBlack);
  to92.castShadow = true;

  // 3 Bent Silver Transistor Leads (Emitter, Base, Collector)
  [-1.0, 0, 1.0].forEach((lz) => {
    const leadGeom = new THREE.CylinderGeometry(0.22, 0.22, 2.4, 8);
    const lead = new THREE.Mesh(leadGeom, matLib.solderSilver);
    lead.position.set(-3.0, 1.8, lz);
    group.add(lead);
  });
  group.add(to92);

  // 1N4007 Axial Flyback Diode (DO-41 Black Cylinder with Silver Cathode Stripe)
  const diodeBodyGeom = new THREE.CylinderGeometry(1.2, 1.2, 4.4, 16);
  diodeBodyGeom.rotateZ(Math.PI / 2);
  const diodeBody = new THREE.Mesh(diodeBodyGeom, matLib.icBlack);
  diodeBody.position.set(3.0, 2.2, 1.5);
  diodeBody.castShadow = true;

  // Silver cathode polarity band
  const bandGeom = new THREE.CylinderGeometry(1.25, 1.25, 0.8, 16);
  bandGeom.rotateZ(Math.PI / 2);
  const band = new THREE.Mesh(bandGeom, matLib.solderSilver);
  band.position.set(4.5, 2.2, 1.5);
  group.add(diodeBody, band);

  // Axial Copper Leads on Diode
  const diodeLeadCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, 0.8, 1.5),
    new THREE.Vector3(0.8, 2.2, 1.5),
    new THREE.Vector3(5.2, 2.2, 1.5),
    new THREE.Vector3(5.5, 0.8, 1.5),
  ]);
  const diodeLeads = new THREE.Mesh(new THREE.TubeGeometry(diodeLeadCurve, 12, 0.25, 6, false), matLib.wireCopper);
  group.add(diodeLeads);

  // 1kΩ Axial Resistor (Beige body with genuine color code rings: Brown-Black-Red-Gold)
  const resGeom = new THREE.CylinderGeometry(0.85, 0.85, 3.6, 12);
  resGeom.rotateZ(Math.PI / 2);
  const resBody = new THREE.Mesh(resGeom, matLib.resistorBeige);
  resBody.position.set(3.0, 2.0, -2.5);

  // 4 Color Code Rings
  const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.35, 12), matLib.wireCopper); // Brown
  ring1.rotateZ(Math.PI / 2);
  ring1.position.set(2.0, 2.0, -2.5);
  const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.35, 12), matLib.wireBlack);  // Black
  ring2.rotateZ(Math.PI / 2);
  ring2.position.set(2.6, 2.0, -2.5);
  const ring3 = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.35, 12), matLib.wireRed);    // Red
  ring3.rotateZ(Math.PI / 2);
  ring3.position.set(3.2, 2.0, -2.5);
  const ring4 = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.35, 12), matLib.goldContacts); // Gold
  ring4.rotateZ(Math.PI / 2);
  ring4.position.set(4.0, 2.0, -2.5);

  group.add(resBody, ring1, ring2, ring3, ring4);

  return group;
}

// ---------------------------------------------------------------------------
// 14. MAX30102 OPTICAL PULSE SENSOR MODULE: 15 x 15 x 3 mm
// ---------------------------------------------------------------------------
export function buildMax30102(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'max30102_sensor';

  // Deep Crimson Breakout PCB: 15 × 15 × 1.6 mm with mounting holes
  const pcbShape = createRoundedRectShape(15, 15, 1.2);
  const pcbGeom = new THREE.ExtrudeGeometry(pcbShape, { depth: 1.6, bevelEnabled: false });
  pcbGeom.rotateX(Math.PI / 2);

  const pcbMesh = new THREE.Mesh(pcbGeom, matLib.redPcb);
  pcbMesh.castShadow = true;
  group.add(pcbMesh);

  // MAX30102 Optical Sensor Package (5.6 × 3.3 × 1.55 mm)
  // Positioned on the underside, facing downward toward the transparent lens
  const pkgGeom = new THREE.BoxGeometry(5.6, 1.5, 3.3);
  const pkgMesh = new THREE.Mesh(pkgGeom, matLib.icBlack);
  pkgMesh.position.set(0, -1.5, 0);

  // Recessed Optical Glass Window
  const glassGeom = new THREE.BoxGeometry(4.8, 0.2, 2.6);
  const glassMesh = new THREE.Mesh(glassGeom, matLib.opticalLens);
  glassMesh.position.set(0, -2.2, 0);
  glassMesh.renderOrder = 2;

  // Dual Micro Emitter/Photodetector Cavities (660nm Red LED & 880nm IR LED)
  const apertureGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.35, 16);
  const redAperture = new THREE.Mesh(apertureGeom, matLib.wireRed);
  redAperture.position.set(-1.4, -2.1, 0);
  const irAperture = new THREE.Mesh(apertureGeom, matLib.icBlack);
  irAperture.position.set(1.4, -2.1, 0);

  group.add(pkgMesh, glassMesh, redAperture, irAperture);

  // I2C Pin Header Pads (VCC, GND, SCL, SDA, INT) on top edge
  for (let p = -5; p <= 5; p += 2.5) {
    const pad = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.8, 12), matLib.goldContacts);
    pad.rotateX(Math.PI / 2);
    pad.position.set(p, 0.82, 5.5);
    group.add(pad);
  }

  // Decoupling Capacitors (0603)
  const cap1 = createSmdPassive(1.6, 0.8, 0.7, true, matLib);
  cap1.position.set(-3.5, 1.15, -2);
  const cap2 = createSmdPassive(1.6, 0.8, 0.7, true, matLib);
  cap2.position.set(3.5, 1.15, -2);
  group.add(cap1, cap2);

  return group;
}

// ---------------------------------------------------------------------------
// 15. GROVE GSR / EDA SIGNAL CONDITIONING MODULE: 24 x 20 x 5 mm
// ---------------------------------------------------------------------------
export function buildGroveGsr(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'grove_gsr_module';

  // Black Soldermask PCB: 24 × 20 × 1.6 mm
  const pcbShape = createRoundedRectShape(24, 20, 1.2);
  const pcbGeom = new THREE.ExtrudeGeometry(pcbShape, { depth: 1.6, bevelEnabled: false });
  pcbGeom.rotateX(Math.PI / 2);

  const pcbMesh = new THREE.Mesh(pcbGeom, matLib.blackPcb);
  pcbMesh.castShadow = true;
  group.add(pcbMesh);

  // LM324 Quad Operational Amplifier in SOIC-14 Package
  const opamp = createSopIc(8.6, 3.9, 1.4, 7, matLib);
  opamp.position.set(-3.0, 1.5, 3.0);
  group.add(opamp);

  // Bourns 3296W Style Cermet Multi-Turn Trimmer Potentiometer (Blue Casing)
  const potGeom = new THREE.BoxGeometry(4.8, 5.0, 4.8);
  const potMesh = new THREE.Mesh(potGeom, matLib.trimmerBlue);
  potMesh.position.set(6.5, 3.3, -3.5);
  potMesh.castShadow = true;

  // Brass Slotted Adjustment Screw on Potentiometer Top
  const screwGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 16);
  const screwMesh = new THREE.Mesh(screwGeom, matLib.brassNut);
  screwMesh.position.set(6.5, 5.9, -3.5);

  const slotGeom = new THREE.BoxGeometry(0.3, 0.35, 1.8);
  const slot = new THREE.Mesh(slotGeom, matLib.icBlack);
  slot.position.set(6.5, 6.1, -3.5);
  group.add(potMesh, screwMesh, slot);

  // 4-Pin Latching Grove Connector Housing
  const connGeom = new THREE.BoxGeometry(4.2, 5.5, 10.0);
  const connMesh = new THREE.Mesh(connGeom, matLib.jstPlastic);
  connMesh.position.set(-9.5, 3.5, 0);

  // Locking Ramp on Connector
  const rampGeom = new THREE.BoxGeometry(1.2, 1.5, 4.0);
  const ramp = new THREE.Mesh(rampGeom, matLib.jstPlastic);
  ramp.position.set(-11.5, 4.5, 0);
  group.add(connMesh, ramp);

  // Dual Connection Wires leading to the skin electrodes
  const wire1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(8.0, 0.8, 2.0),
    new THREE.Vector3(12.0, -1.5, 0.0),
    new THREE.Vector3(13.0, -3.5, 0.0),
  ]);
  const w1Mesh = new THREE.Mesh(new THREE.TubeGeometry(wire1, 12, 0.35, 6, false), matLib.wireYellow);

  const wire2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(8.0, 0.8, -2.0),
    new THREE.Vector3(0.0, -1.5, -4.0),
    new THREE.Vector3(-13.0, -3.5, 0.0),
  ]);
  const w2Mesh = new THREE.Mesh(new THREE.TubeGeometry(wire2, 16, 0.35, 6, false), matLib.wireGreen);

  group.add(w1Mesh, w2Mesh);
  return group;
}

// ---------------------------------------------------------------------------
// 16. MAX30205 HUMAN BODY TEMPERATURE SENSOR: 15 x 15 x 2.5 mm
// ---------------------------------------------------------------------------
export function buildMax30205(matLib: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'max30205_sensor';

  // Blue PCB Board: 15 × 15 × 1.6 mm
  const pcbShape = createRoundedRectShape(15, 15, 1.0);
  const pcbGeom = new THREE.ExtrudeGeometry(pcbShape, { depth: 1.6, bevelEnabled: false });
  pcbGeom.rotateX(Math.PI / 2);

  const pcbMesh = new THREE.Mesh(pcbGeom, matLib.bluePcb);
  pcbMesh.castShadow = true;
  group.add(pcbMesh);

  // TDFN-8 IC Package on Underside
  const icGeom = new THREE.BoxGeometry(3.0, 0.8, 3.0);
  const icMesh = new THREE.Mesh(icGeom, matLib.icBlack);
  icMesh.position.set(0, -1.2, 0);

  // Exposed Gold Thermal Conduction Plane facing wrist skin directly
  const thermalGeom = new THREE.BoxGeometry(2.4, 0.25, 2.4);
  const thermalMesh = new THREE.Mesh(thermalGeom, matLib.goldContacts);
  thermalMesh.position.set(0, -1.65, 0);

  group.add(icMesh, thermalMesh);

  // I2C Pin Header Pads on Top
  for (let p = -4.5; p <= 4.5; p += 2.25) {
    const pad = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.75, 12), matLib.goldContacts);
    pad.rotateX(Math.PI / 2);
    pad.position.set(p, 0.82, -5.5);
    group.add(pad);
  }

  // SMT 0603 Decoupling Capacitor
  const cap = createSmdPassive(1.6, 0.8, 0.7, true, matLib);
  cap.position.set(0, 1.15, 4.0);
  group.add(cap);

  return group;
}
