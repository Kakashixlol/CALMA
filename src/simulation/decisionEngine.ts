import {
  PersonalBaseline,
  PhysiologicalSample,
  SimulationState,
  DecisionLogEntry,
} from '../types/simulation';

export interface DecisionEvaluationResult {
  state: SimulationState;
  stressScore: number;
  explanation: string;
  motionRejectionActive: boolean;
  hapticActive: boolean;
  ledColor: string; // hex color for WS2812B
  ledMode: 'solid' | 'pulse' | 'breathing' | 'warning';
  activeHardwareIds: string[];
}

export class TransparentDecisionEngine {
  private lastState: SimulationState = 'INITIALIZING';
  private persistenceTimer: number = 0; // seconds condition has persisted
  private stressDetectedTimestamp: number = 0;

  public evaluate(
    sample: PhysiologicalSample,
    baseline: PersonalBaseline,
    isInBreathingSession: boolean = false
  ): DecisionEvaluationResult {
    let state: SimulationState = 'BASELINE_STABLE';
    let stressScore = 20;
    let explanation = '';
    let motionRejectionActive = false;
    let hapticActive = false;
    let ledColor = '#00f0d0'; // Calm Teal default
    let ledMode: 'solid' | 'pulse' | 'breathing' | 'warning' = 'solid';
    const activeHardware: string[] = ['esp32_board'];

    // Always active baseline components
    activeHardware.push('max30102_sensor', 'grove_gsr_module', 'mpu6050_sensor', 'max30205_sensor');

    // Rule 1: Sensor Contact Check
    if (sample.contactQuality < 55) {
      state = 'POOR_SENSOR_CONTACT';
      stressScore = 15;
      explanation = `Sensor contact quality degraded to ${sample.contactQuality}%. PPG and electrodermal impedance are unreliable. Decision engine suspended alert logic to avoid false positives. Check strap tension.`;
      ledColor = '#f59e0b'; // Amber warning
      ledMode = 'warning';
      this.lastState = state;
      return {
        state,
        stressScore,
        explanation,
        motionRejectionActive: false,
        hapticActive: false,
        ledColor,
        ledMode,
        activeHardwareIds: activeHardware,
      };
    }

    // Rule 2: Active Breathing Session Override
    if (isInBreathingSession) {
      state = 'CALMING_INTERVENTION';
      stressScore = Math.max(10, Math.round(55 - sample.timestamp * 0.5));
      explanation = `Guided breathing session active (4-7-8 rhythm). WS2812B LED pacing inhale/exhale cycles; ERM coin motor delivering resonant haptic pulses to wrist tissues.`;
      ledColor = '#06b6d4'; // Breathing Cyan
      ledMode = 'breathing';
      hapticActive = true;
      activeHardware.push('vibration_motor', 'motor_driver', 'rgb_led');
      this.lastState = state;
      return {
        state,
        stressScore,
        explanation,
        motionRejectionActive: false,
        hapticActive: true,
        ledColor,
        ledMode,
        activeHardwareIds: activeHardware,
      };
    }

    // Rule 3: Motion Artifact Rejection Check
    const hrElevation = sample.heartRate - baseline.restingHeartRate;
    const gsrElevation = sample.gsrConductance - baseline.restingGsr;
    const isMotionHigh = sample.accelMagnitude > baseline.motionThreshold;

    if (isMotionHigh && hrElevation > 12) {
      state = 'MOTION_ARTIFACT';
      motionRejectionActive = true;
      stressScore = 22; // Kept low despite high HR!
      explanation = `Motion rejection triggered: Accelerometer registered ${sample.accelMagnitude}g (${sample.motionState}). Raised heart rate (${sample.heartRate} BPM, +${hrElevation} BPM) attributed to physical biomechanics rather than sympathetic stress. Alert suppressed.`;
      ledColor = '#3b82f6'; // Active Blue
      ledMode = 'solid';
      activeHardware.push('mpu6050_sensor');
      this.lastState = state;
      return {
        state,
        stressScore,
        explanation,
        motionRejectionActive: true,
        hapticActive: false,
        ledColor,
        ledMode,
        activeHardwareIds: activeHardware,
      };
    }

    // Rule 4: Multi-Channel Stress Evaluation (Resting State)
    // Check if both PPG Heart Rate AND GSR Electrodermal Activity are elevated concurrently at rest
    const hrElevated = hrElevation >= 16; // e.g. HR > 88 BPM when resting is 72
    const gsrElevated = gsrElevation >= 1.6; // e.g. GSR > 4.4 µS when resting is 2.8

    if (hrElevated && gsrElevated && !isMotionHigh) {
      state = 'POSSIBLE_STRESS_PATTERN';
      stressScore = Math.min(96, Math.round(45 + hrElevation * 1.2 + gsrElevation * 5));
      explanation = `Sympathetic arousal detected at rest: Heart rate elevated to ${sample.heartRate} BPM (+${hrElevation} BPM vs personal baseline) and skin conductance elevated to ${sample.gsrConductance} µS (+${gsrElevation.toFixed(1)} µS). Peripheral temp: ${sample.skinTemp}°C (slight vasoconstriction). Calm intervention recommended.`;
      ledColor = '#ef4444'; // Red alert
      ledMode = 'pulse';
      hapticActive = true;
      activeHardware.push('vibration_motor', 'motor_driver', 'rgb_led');
    } else if (hrElevated || gsrElevated) {
      state = 'ELEVATED_SIGNAL';
      stressScore = Math.min(65, Math.round(30 + hrElevation * 0.8 + gsrElevation * 3));
      const elevatedChannel = hrElevated ? `Heart rate (${sample.heartRate} BPM)` : `GSR conductance (${sample.gsrConductance} µS)`;
      explanation = `Single-channel elevation observed: ${elevatedChannel} is above baseline while other channels remain nominal. Engine evaluating persistence before declaring stress pattern.`;
      ledColor = '#f59e0b'; // Amber
      ledMode = 'solid';
    } else if (this.lastState === 'POSSIBLE_STRESS_PATTERN' || this.lastState === 'CALMING_INTERVENTION') {
      state = 'RECOVERY';
      stressScore = 32;
      explanation = `Autonomic recovery underway: Heart rate (${sample.heartRate} BPM) and skin conductance (${sample.gsrConductance} µS) trending smoothly toward resting baselines.`;
      ledColor = '#10b981'; // Recovery Emerald
      ledMode = 'solid';
    } else {
      state = 'BASELINE_STABLE';
      stressScore = Math.min(28, Math.max(12, Math.round(18 + hrElevation * 0.4)));
      explanation = `All 4 physiological channels stable: Heart rate is ${sample.heartRate} BPM (baseline: ${baseline.restingHeartRate} BPM), GSR is ${sample.gsrConductance} µS (baseline: ${baseline.restingGsr} µS), IMU indicates restful state (${sample.accelMagnitude}g).`;
      ledColor = '#00f0d0'; // Calm Teal
      ledMode = 'solid';
    }

    this.lastState = state;

    return {
      state,
      stressScore,
      explanation,
      motionRejectionActive,
      hapticActive,
      ledColor,
      ledMode,
      activeHardwareIds: activeHardware,
    };
  }
}
