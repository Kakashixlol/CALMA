import * as THREE from 'three';
import { MaterialLibrary } from './materials';

/**
 * Procedural Anatomical Human Forearm, Wrist, and Hand
 * Crafted specifically for the CALMA dorsal wrist wear position.
 */
export function buildVirtualWristModel(matLib: MaterialLibrary): THREE.Group {
  const wristGroup = new THREE.Group();
  wristGroup.name = 'virtual_wrist_model';

  // Skin PBR Material
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd29d7e),
    roughness: 0.62,
    metalness: 0.04,
  });

  // 1. Forearm to Wrist Extruded Loft Mesh along Z axis
  // Forearm extends back toward -Z, wrist is around Z=0, hand extends toward +Z
  // Cross section ellipses at key anatomical stations:
  // Z = -160 (Proximal Forearm): 72 mm wide × 56 mm thick
  // Z = -80  (Mid Forearm):      65 mm wide × 48 mm thick
  // Z = -20  (Distal Wrist):     55 mm wide × 35 mm thick
  // Z = 0    (Dorsal Watch Bed): 54 mm wide × 34 mm thick
  // Z = 35   (Carpal / Heel):    62 mm wide × 32 mm thick
  // Z = 80   (Metacarpal Palm):  72 mm wide × 26 mm thick
  // Z = 120  (Knuckles):         68 mm wide × 20 mm thick

  const stations = [
    { z: -160, rx: 36, ry: 28, cy: -18 },
    { z: -120, rx: 34, ry: 26, cy: -17 },
    { z: -80,  rx: 31, ry: 23, cy: -16 },
    { z: -40,  rx: 28, ry: 19, cy: -15 },
    { z: -15,  rx: 27, ry: 17, cy: -14.5 },
    { z: 0,    rx: 26.5, ry: 16.5, cy: -14 }, // Under CALMA watch bed
    { z: 20,   rx: 27, ry: 16.5, cy: -14 },
    { z: 45,   rx: 31, ry: 15.5, cy: -14.5 }, // Heel of hand
    { z: 75,   rx: 36, ry: 14,   cy: -15 },   // Mid Palm
    { z: 110,  rx: 34, ry: 11,   cy: -16 },   // Knuckles / MCP joints
    { z: 135,  rx: 28, ry: 8,    cy: -17 },   // Finger block proximal
  ];

  const radialSegments = 32;
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  stations.forEach((st, sIdx) => {
    for (let r = 0; r < radialSegments; r++) {
      const angle = (r / radialSegments) * Math.PI * 2;
      // Slight anatomical shaping (dorsal side is slightly flatter than palmar side)
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const flatMod = sinA > 0 ? 0.92 : 1.08; // slightly flatter top (dorsal)

      const x = cosA * st.rx;
      const y = sinA * st.ry * flatMod + st.cy;
      const z = st.z;

      vertices.push(x, y, z);
      uvs.push(r / radialSegments, sIdx / (stations.length - 1));
    }
  });

  // Generate quad indices
  for (let s = 0; s < stations.length - 1; s++) {
    for (let r = 0; r < radialSegments; r++) {
      const nextR = (r + 1) % radialSegments;
      const current = s * radialSegments + r;
      const next = s * radialSegments + nextR;
      const above = (s + 1) * radialSegments + r;
      const aboveNext = (s + 1) * radialSegments + nextR;

      indices.push(current, next, above);
      indices.push(next, aboveNext, above);
    }
  }

  // End cap on forearm
  const forearmCenterIdx = vertices.length / 3;
  const firstSt = stations[0];
  vertices.push(0, firstSt.cy, firstSt.z);
  uvs.push(0.5, 0);
  for (let r = 0; r < radialSegments; r++) {
    const nextR = (r + 1) % radialSegments;
    indices.push(forearmCenterIdx, r, nextR);
  }

  // End cap on hand tip
  const handCenterIdx = vertices.length / 3;
  const lastSt = stations[stations.length - 1];
  vertices.push(0, lastSt.cy, lastSt.z);
  uvs.push(0.5, 1);
  const lastRowStart = (stations.length - 1) * radialSegments;
  for (let r = 0; r < radialSegments; r++) {
    const nextR = (r + 1) % radialSegments;
    indices.push(handCenterIdx, lastRowStart + nextR, lastRowStart + r);
  }

  const armGeom = new THREE.BufferGeometry();
  armGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  armGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  armGeom.setIndex(indices);
  armGeom.computeVertexNormals();

  const armMesh = new THREE.Mesh(armGeom, skinMaterial);
  armMesh.castShadow = true;
  armMesh.receiveShadow = true;
  wristGroup.add(armMesh);

  // 2. Thumb Eminence (Thenar) Anatomical Bud
  const thumbGeom = new THREE.CapsuleGeometry(7, 24, 16, 24);
  thumbGeom.rotateZ(-Math.PI / 4);
  thumbGeom.rotateY(-Math.PI / 6);
  const thumbMesh = new THREE.Mesh(thumbGeom, skinMaterial);
  thumbMesh.position.set(-36, -18, 65);
  thumbMesh.castShadow = true;
  wristGroup.add(thumbMesh);

  // 3. Sensor Skin-Contact Interface Visualizer
  // Subtle glowing rings on the skin contact plane where MAX30102 PPG and GSR electrodes touch
  const contactGroup = new THREE.Group();
  contactGroup.name = 'sensor_skin_contacts';

  // PPG Optical Optical Window Skin Impression
  const ppgRingGeom = new THREE.RingGeometry(6, 8.5, 24);
  ppgRingGeom.rotateX(-Math.PI / 2);
  const ppgRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f0d0,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ppgRing = new THREE.Mesh(ppgRingGeom, ppgRingMat);
  ppgRing.position.set(0, 1.2, 0);
  contactGroup.add(ppgRing);

  // GSR Electrodes Skin Impression Contacts
  const gsrContactGeom = new THREE.RingGeometry(4.2, 5.8, 20);
  gsrContactGeom.rotateX(-Math.PI / 2);
  const gsrMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const gsrLeft = new THREE.Mesh(gsrContactGeom, gsrMat);
  gsrLeft.position.set(-13, 1.2, 0);
  const gsrRight = new THREE.Mesh(gsrContactGeom, gsrMat);
  gsrRight.position.set(13, 1.2, 0);
  contactGroup.add(gsrLeft, gsrRight);

  // Skin temperature contact pad impression
  const tempContactGeom = new THREE.PlaneGeometry(5, 5);
  tempContactGeom.rotateX(-Math.PI / 2);
  const tempMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const tempPad = new THREE.Mesh(tempContactGeom, tempMat);
  tempPad.position.set(-12, 1.2, 0);
  contactGroup.add(tempPad);

  wristGroup.add(contactGroup);

  // Align wrist so dorsal top surface sits perfectly underneath CALMA at Y = -9.8mm
  wristGroup.position.set(0, -11.0, 0);

  return wristGroup;
}
