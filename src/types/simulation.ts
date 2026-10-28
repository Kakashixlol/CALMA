export type OperationalMode = 'explorer' | 'simulation' | 'architecture' | 'guided';

export type SimulationState =
  | 'INITIALIZING'
  | 'CALIBRATING'
  | 'BASELINE_STABLE'
  | 'ELEVATED_SIGNAL'
  | 'MOTION_ARTIFACT'
  | 'POSSIBLE_STRESS_PATTERN'
  | 'CALMING_INTERVENTION'
  | 'RECOVERY'
  | 'POOR_SENSOR_CONTACT'
  | 'INSUFFICIENT_DATA';

export interface PhysiologicalSample {
  timestamp: number; // in seconds
  heartRate: number; // BPM
  ppgRaw: number; // normalized pulse wave 0-1
  gsrConductance: number; // µS
  skinTemp: number; // °C
  accelMagnitude: number; // g
  motionState: 'stationary' | 'fidgeting' | 'walking' | 'running';
  contactQuality: number; // 0 to 100%
  stressScore: number; // 0 to 100
  state: SimulationState;
}

export interface PersonalBaseline {
  restingHeartRate: number; // e.g. 72 BPM
  restingGsr: number; // e.g. 2.8 µS
  restingTemp: number; // e.g. 36.3 °C
  motionThreshold: number; // e.g. 0.35 g
  calibrated: boolean;
  calibrationProgress: number; // 0 to 100%
}

export type ScenarioId =
  | 'resting'
  | 'stress_episode'
  | 'exercise_motion'
  | 'poor_contact'
  | 'calming_recovery'
  | 'mixed_signals'
  | 'custom';

export interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  shortDesc: string;
  durationSec: number;
  initialHeartRate: number;
  targetHeartRate: number;
  initialGsr: number;
  targetGsr: number;
  motionProfile: 'stationary' | 'fidgeting' | 'walking' | 'running';
  contactQuality: number;
  autoCalmingTrigger: boolean;
}

export interface DecisionLogEntry {
  id: string;
  timestamp: number; // seconds
  category: 'sensor' | 'decision' | 'intervention' | 'hardware' | 'error';
  state: SimulationState;
  title: string;
  explanation: string;
  metrics: {
    hr: number;
    gsr: number;
    motion: number;
    contact: number;
  };
}

export interface ArchitectureNode {
  id: string;
  label: string;
  stage: 'input' | 'acquisition' | 'processing' | 'decision' | 'actuation' | 'output';
  description: string;
  hardwareComponents: string[];
  sampleInput: string;
  sampleOutput: string;
  algorithmNote: string;
  status: 'active' | 'standby' | 'filtering' | 'bypassed';
}

export interface GuidedStep {
  step: number;
  title: string;
  subtitle: string;
  cameraPreset: string;
  wornMode: boolean;
  explodeAmount: number;
  viewMode: 'solid' | 'xray' | 'section';
  highlightedComponents: string[];
  scenarioToTrigger?: ScenarioId;
  narrativeText: string;
  durationSeconds: number;
}
