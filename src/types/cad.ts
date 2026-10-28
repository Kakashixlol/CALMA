export type FunctionalZone = 'Zone A (Upper Electronics)' | 'Zone B (Wrist-Facing Sensing)' | 'Enclosure & Strap';

export interface ComponentData {
  id: string;
  name: string;
  shortName: string;
  category: 'structural' | 'sensor' | 'microcontroller' | 'power' | 'actuator' | 'passive';
  zone: FunctionalZone;
  dimensions: {
    length: number; // mm
    width: number;  // mm
    height: number; // mm
    note?: string;
  };
  material: string;
  fixingMethod: string;
  clearance: string;
  solidWorksFeatures?: string[];
  electricalPin?: {
    signal: string;
    esp32Pin: string;
    note: string;
  };
  functionDescription: string;
  designNotes: string;
  assembledPosition: [number, number, number]; // mm
  explodedPosition: [number, number, number];  // mm
  rotation?: [number, number, number];        // radians
}

export type CameraPreset = 
  | 'assembled'
  | 'top'
  | 'bottom'
  | 'electronics'
  | 'exploded'
  | 'closeup'
  | 'front'
  | 'right'
  | 'isometric'
  | 'worn_closeup'
  | 'worn_forearm';

export type ViewDisplayMode = 'solid' | 'xray' | 'section';

export interface BioSignalsState {
  heartRate: number;      // BPM (e.g. 74)
  gsrValue: number;       // µS (e.g. 3.2)
  skinTemp: number;       // °C (e.g. 36.3)
  motionLevel: 'low' | 'moderate' | 'high'; // IMU activity
  stressScore: number;    // 0-100
  stressState: 'Stable' | 'Elevated' | 'High Stress' | 'Calming Intervention';
  hapticActive: boolean;
  ledColor: string;       // hex
  motionRejectionActive: boolean;
}
