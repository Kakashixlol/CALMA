import {
  PersonalBaseline,
  PhysiologicalSample,
  ScenarioConfig,
  ScenarioId,
  SimulationState,
} from '../types/simulation';

export const DEFAULT_SCENARIOS: Record<ScenarioId, ScenarioConfig> = {
  resting: {
    id: 'resting',
    name: '1. Resting & Baseline Stable',
    shortDesc: 'Calm resting state at desk. Low motion, baseline pulse and skin conductance.',
    durationSec: 60,
    initialHeartRate: 72,
    targetHeartRate: 74,
    initialGsr: 2.8,
    targetGsr: 3.0,
    motionProfile: 'stationary',
    contactQuality: 98,
    autoCalmingTrigger: false,
  },
  stress_episode: {
    id: 'stress_episode',
    name: '2. Acute Stress Episode (At Rest)',
    shortDesc: 'Mental stress spike while stationary (e.g. studying, tight deadline). Elevated HR & EDA trigger haptics.',
    durationSec: 90,
    initialHeartRate: 74,
    targetHeartRate: 108,
    initialGsr: 3.1,
    targetGsr: 7.2,
    motionProfile: 'stationary',
    contactQuality: 96,
    autoCalmingTrigger: true,
  },
  exercise_motion: {
    id: 'exercise_motion',
    name: '3. Physical Activity & Motion Rejection',
    shortDesc: 'Brisk walking / stairs. High heart rate with elevated IMU motion. Motion rejection prevents false alarm.',
    durationSec: 60,
    initialHeartRate: 85,
    targetHeartRate: 128,
    initialGsr: 4.8,
    targetGsr: 5.6,
    motionProfile: 'walking',
    contactQuality: 92,
    autoCalmingTrigger: false,
  },
  poor_contact: {
    id: 'poor_contact',
    name: '4. Poor Skin Contact / Loose Strap',
    shortDesc: 'Band shifted or strap loose. Signal quality degrades, contact alert appears, preventing false alarm.',
    durationSec: 45,
    initialHeartRate: 74,
    targetHeartRate: 82,
    initialGsr: 2.5,
    targetGsr: 1.2,
    motionProfile: 'fidgeting',
    contactQuality: 32,
    autoCalmingTrigger: false,
  },
  calming_recovery: {
    id: 'calming_recovery',
    name: '5. Guided Breathing Recovery (4-7-8)',
    shortDesc: 'Post-intervention guided breathing session. Autonomic down-regulation brings HR & EDA back to baseline.',
    durationSec: 75,
    initialHeartRate: 102,
    targetHeartRate: 68,
    initialGsr: 6.8,
    targetGsr: 2.6,
    motionProfile: 'stationary',
    contactQuality: 98,
    autoCalmingTrigger: false,
  },
  mixed_signals: {
    id: 'mixed_signals',
    name: '6. Mixed Signals & Ambiguous State',
    shortDesc: 'Caffeine or emotional excitement. EDA elevated but heart rate remains stable. Decision engine notes uncertainty.',
    durationSec: 60,
    initialHeartRate: 75,
    targetHeartRate: 77,
    initialGsr: 3.2,
    targetGsr: 6.5,
    motionProfile: 'fidgeting',
    contactQuality: 94,
    autoCalmingTrigger: false,
  },
  custom: {
    id: 'custom',
    name: '7. Custom Scenario Builder',
    shortDesc: 'Manually configure all physiological inputs and simulation dynamics.',
    durationSec: 90,
    initialHeartRate: 75,
    targetHeartRate: 95,
    initialGsr: 3.2,
    targetGsr: 5.5,
    motionProfile: 'stationary',
    contactQuality: 95,
    autoCalmingTrigger: true,
  },
};

export class PhysiologicalSignalEngine {
  private simTime: number = 0; // simulated seconds
  private activeScenario: ScenarioConfig;
  private scenarioElapsed: number = 0;
  private timeScale: number = 1.0;
  private isPaused: boolean = false;

  // Personal Baseline
  public baseline: PersonalBaseline = {
    restingHeartRate: 72,
    restingGsr: 2.8,
    restingTemp: 36.3,
    motionThreshold: 0.35,
    calibrated: true,
    calibrationProgress: 100,
  };

  // Live state tracking
  private currentHeartRate: number = 72;
  private currentGsr: number = 2.8;
  private currentTemp: number = 36.3;
  private currentMotionMag: number = 0.08;
  private currentContactQuality: number = 98;
  private currentStressScore: number = 20;

  // Manual Contact Quality Override
  private contactQualityOverride: number | null = null;

  constructor(initialScenario: ScenarioId = 'resting') {
    this.activeScenario = { ...DEFAULT_SCENARIOS[initialScenario] };
    this.resetToScenario(initialScenario);
  }

  public resetToScenario(scenarioId: ScenarioId, customConfig?: Partial<ScenarioConfig>) {
    const base = DEFAULT_SCENARIOS[scenarioId] || DEFAULT_SCENARIOS.resting;
    this.activeScenario = { ...base, ...customConfig };
    this.scenarioElapsed = 0;
    this.currentHeartRate = this.activeScenario.initialHeartRate;
    this.currentGsr = this.activeScenario.initialGsr;
    this.currentContactQuality = this.contactQualityOverride ?? this.activeScenario.contactQuality;
    this.currentTemp = 36.3;
  }

  public setTimeScale(scale: number) {
    this.timeScale = Math.max(0.1, Math.min(10.0, scale));
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public getPaused(): boolean {
    return this.isPaused;
  }

  public setContactQualityOverride(val: number | null) {
    this.contactQualityOverride = val;
    if (val !== null) {
      this.currentContactQuality = val;
    } else {
      this.currentContactQuality = this.activeScenario.contactQuality;
    }
  }

  public getContactQualityOverride(): number | null {
    return this.contactQualityOverride;
  }

  public getActiveScenario(): ScenarioConfig {
    return this.activeScenario;
  }

  public getSimTime(): number {
    return this.simTime;
  }

  public getScenarioElapsed(): number {
    return this.scenarioElapsed;
  }

  /**
   * Advances the simulation clock by deltaRealSeconds * timeScale
   */
  public tick(deltaRealSeconds: number): PhysiologicalSample {
    if (!this.isPaused) {
      const dt = deltaRealSeconds * this.timeScale;
      this.simTime += dt;
      this.scenarioElapsed += dt;

      // Calculate scenario progression factor (0.0 to 1.0)
      const prog = Math.min(1.0, this.scenarioElapsed / Math.max(1, this.activeScenario.durationSec));

      // 1. Target interpolation
      const targetHR = THREE_Math_lerp(this.activeScenario.initialHeartRate, this.activeScenario.targetHeartRate, prog);
      const targetGSR = THREE_Math_lerp(this.activeScenario.initialGsr, this.activeScenario.targetGsr, prog);

      // Smooth lag toward target (simulate physiological inertia)
      this.currentHeartRate += (targetHR - this.currentHeartRate) * Math.min(1.0, dt * 0.4);
      this.currentGsr += (targetGSR - this.currentGsr) * Math.min(1.0, dt * 0.3);

      // 2. Motion profile computation
      let baseMotion = 0.05;
      let motionState: PhysiologicalSample['motionState'] = 'stationary';

      if (this.activeScenario.motionProfile === 'stationary') {
        baseMotion = 0.04 + Math.sin(this.simTime * 0.5) * 0.02;
        motionState = 'stationary';
      } else if (this.activeScenario.motionProfile === 'fidgeting') {
        baseMotion = 0.18 + Math.sin(this.simTime * 2.2) * 0.12;
        motionState = 'fidgeting';
      } else if (this.activeScenario.motionProfile === 'walking') {
        // Rhythmic walking cadence ~1.8 Hz
        baseMotion = 0.85 + Math.abs(Math.sin(this.simTime * Math.PI * 1.8)) * 0.65;
        motionState = 'walking';
      } else if (this.activeScenario.motionProfile === 'running') {
        baseMotion = 1.8 + Math.abs(Math.sin(this.simTime * Math.PI * 2.6)) * 1.2;
        motionState = 'running';
      }

      this.currentMotionMag = baseMotion;

      // 3. Temperature modulation
      // Vasoconstriction under stress: slight temperature drop
      if (this.activeScenario.id === 'stress_episode') {
        this.currentTemp = 36.3 - prog * 1.1; // down to ~35.2°C
      } else if (this.activeScenario.id === 'calming_recovery') {
        this.currentTemp = 35.3 + prog * 0.9; // warms back to ~36.2°C
      } else if (this.activeScenario.id === 'exercise_motion') {
        this.currentTemp = 36.3 + prog * 0.5; // slight thermal elevation
      } else {
        this.currentTemp = 36.3 + Math.sin(this.simTime * 0.1) * 0.05;
      }

      // 4. Contact Quality
      const baseContact = this.contactQualityOverride ?? this.activeScenario.contactQuality;
      // Add slight contact noise if motion is high
      this.currentContactQuality = Math.max(5, Math.min(100, baseContact - baseMotion * 8));
    }

    // 5. Physiological Micro-Oscillations & RSA (Respiratory Sinus Arrhythmia)
    // Breathing cycle ~0.25 Hz (4 seconds)
    const rsa = Math.sin(this.simTime * Math.PI * 0.5) * 1.8;
    // Micro EDA phasic fluctuations
    const phasic = Math.max(0, Math.sin(this.simTime * 0.8) * Math.cos(this.simTime * 0.3) * 0.35);

    // Final noisy values
    const finalHR = Math.round(this.currentHeartRate + rsa);
    const finalGSR = parseFloat((this.currentGsr + phasic).toFixed(2));
    const finalTemp = parseFloat(this.currentTemp.toFixed(1));

    // Normalized synthetic photoplethysmogram (PPG) pulse waveform
    // Systolic rise and dicrotic notch based on instantaneous HR
    const beatPeriod = 60 / Math.max(40, finalHR);
    const phaseInBeat = (this.simTime % beatPeriod) / beatPeriod; // 0 to 1
    let ppgWave = 0;
    if (phaseInBeat < 0.25) {
      // Rapid systolic rise
      ppgWave = Math.sin((phaseInBeat / 0.25) * (Math.PI / 2));
    } else if (phaseInBeat < 0.45) {
      // Dicrotic notch dip
      ppgWave = 0.65 + Math.cos(((phaseInBeat - 0.25) / 0.2) * Math.PI) * 0.35;
    } else {
      // Diastolic decay
      ppgWave = 0.3 * Math.exp(-((phaseInBeat - 0.45) / 0.55) * 3);
    }

    // Add motion artifact noise to PPG if motion > 0.4g or contact < 60%
    if (this.currentMotionMag > 0.4 || this.currentContactQuality < 60) {
      const noise = (Math.sin(this.simTime * 14) + Math.cos(this.simTime * 23)) * 0.35;
      ppgWave = Math.max(0, Math.min(1, ppgWave + noise));
    }

    return {
      timestamp: parseFloat(this.simTime.toFixed(2)),
      heartRate: finalHR,
      ppgRaw: parseFloat(ppgWave.toFixed(3)),
      gsrConductance: finalGSR,
      skinTemp: finalTemp,
      accelMagnitude: parseFloat(this.currentMotionMag.toFixed(2)),
      motionState: this.activeScenario.motionProfile,
      contactQuality: Math.round(this.currentContactQuality),
      stressScore: this.currentStressScore,
      state: 'BASELINE_STABLE', // Calculated by DecisionEngine
    };
  }
}

function THREE_Math_lerp(x: number, y: number, t: number): number {
  return (1 - t) * x + t * y;
}
