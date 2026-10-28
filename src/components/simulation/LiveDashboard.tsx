import React, { useEffect, useRef } from 'react';
import {
  Activity,
  AlertCircle,
  BatteryCharging,
  CheckCircle2,
  Flame,
  Heart,
  HelpCircle,
  Info,
  Radio,
  Sliders,
  Sparkles,
  Thermometer,
  Vibrate,
  Wind,
  Zap,
} from 'lucide-react';
import { DecisionEvaluationResult } from '../../simulation/decisionEngine';
import { PersonalBaseline, PhysiologicalSample, SimulationState } from '../../types/simulation';

interface LiveDashboardProps {
  currentSample: PhysiologicalSample | null;
  history: PhysiologicalSample[];
  baseline: PersonalBaseline;
  evaluation: DecisionEvaluationResult;
  simTime: number;
  timeScale: number;
  isPaused: boolean;
  onOpenBreathingModal: () => void;
  onOpenEventLog: () => void;
  onTogglePlayPause: () => void;
  onSetContactOverride: (val: number | null) => void;
  contactOverride: number | null;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  currentSample,
  history,
  baseline,
  evaluation,
  simTime,
  timeScale,
  isPaused,
  onOpenBreathingModal,
  onOpenEventLog,
  onTogglePlayPause,
  onSetContactOverride,
  contactOverride,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render High-Performance Canvas for Telemetry Waves (PPG, GSR, IMU, Temp)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Dark grid background
    ctx.fillStyle = '#090d14';
    ctx.fillRect(0, 0, width, height);

    // Section heights: 4 horizontal tracks
    // Track 1: PPG (top, 34% height)
    // Track 2: GSR (24% height)
    // Track 3: IMU Accel (22% height)
    // Track 4: Temp (20% height)
    const t1H = height * 0.34;
    const t2H = height * 0.24;
    const t3H = height * 0.22;
    const t4H = height * 0.20;

    const y0 = 0;
    const y1 = t1H;
    const y2 = t1H + t2H;
    const y3 = t1H + t2H + t3H;

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    [y1, y2, y3].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // Time slice for history
    const count = history.length;
    const stepX = width / Math.max(1, count - 1);

    // 1. Draw PPG Pulse Waveform (Green/Teal)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const sample = history[i];
      const x = i * stepX;
      // ppgRaw is 0 to 1
      const ppgNorm = Math.max(0, Math.min(1, sample.ppgRaw));
      const y = y1 - 4 - ppgNorm * (t1H - 12);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Draw GSR Electrodermal Activity (Amber/Orange)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const sample = history[i];
      const x = i * stepX;
      // GSR ranges approx 1.0 to 10.0 µS
      const gsrNorm = Math.max(0, Math.min(1, (sample.gsrConductance - 1.0) / 9.0));
      const y = y2 - 4 - gsrNorm * (t2H - 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 3. Draw IMU Vector Magnitude (Cyan/Blue)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const sample = history[i];
      const x = i * stepX;
      // Accel ranges approx 0 to 2.5 g
      const accelNorm = Math.max(0, Math.min(1, sample.accelMagnitude / 2.5));
      const y = y3 - 4 - accelNorm * (t3H - 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 4. Draw Skin Temperature (Rose/Coral)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const sample = history[i];
      const x = i * stepX;
      // Temp ranges 34.0 to 38.0 °C
      const tempNorm = Math.max(0, Math.min(1, (sample.skinTemp - 34.0) / 4.0));
      const y = height - 4 - tempNorm * (t4H - 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulsing current time indicator line at right edge
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(width - 1, 0);
    ctx.lineTo(width - 1, height);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [history]);

  if (!currentSample) {
    return (
      <div className="flex items-center justify-center p-6 text-slate-400 font-mono text-xs">
        Initializing physiological telemetry stream...
      </div>
    );
  }

  // State formatting helpers
  const getStateColor = (state: SimulationState) => {
    switch (state) {
      case 'BASELINE_STABLE':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'POSSIBLE_STRESS_PATTERN':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40 animate-pulse';
      case 'MOTION_ARTIFACT':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
      case 'CALMING_INTERVENTION':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-950/40';
      case 'POOR_SENSOR_CONTACT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'RECOVERY':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      default:
        return 'bg-slate-700/20 text-slate-300 border-slate-700/40';
    }
  };

  const hrElevation = Math.round(currentSample.heartRate - baseline.restingHeartRate);
  const gsrDelta = (currentSample.gsrConductance - baseline.restingGsr).toFixed(2);

  return (
    <div className="w-full flex flex-col gap-3 font-sans select-none">
      {/* 1. Device Hardware & Connectivity Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-lg text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>ESP32 BLE: LINKED</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <BatteryCharging className="w-3.5 h-3.5 text-teal-400" />
            <span>88% (TP4056 Regulated)</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: evaluation.ledColor }}
            />
            <span>RGB: {evaluation.ledMode.toUpperCase()}</span>
          </div>
          {evaluation.hapticActive && (
            <div className="flex items-center gap-1 text-cyan-400 font-mono text-[11px] bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
              <Vibrate className="w-3 h-3 animate-spin" />
              <span>ERM HAPTIC ACTIVE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
          <span>Clock: {simTime.toFixed(1)}s ({timeScale}x)</span>
          <button
            onClick={onTogglePlayPause}
            className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition ${
              isPaused
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Heart Rate Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Pulse (PPG)
            </span>
            <span className="font-mono text-[10px] text-slate-500">MAX30102</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {Math.round(currentSample.heartRate)}
              <span className="text-xs font-normal text-slate-400 ml-1">BPM</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                hrElevation > 15
                  ? 'bg-rose-500/20 text-rose-400'
                  : hrElevation < -5
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {hrElevation >= 0 ? `+${hrElevation}` : hrElevation} base
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Baseline: {baseline.restingHeartRate} BPM
          </div>
        </div>

        {/* GSR Skin Conductance Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              GSR (EDA)
            </span>
            <span className="font-mono text-[10px] text-slate-500">Grove GSR</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {currentSample.gsrConductance.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">µS</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                Number(gsrDelta) > 1.5
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {Number(gsrDelta) >= 0 ? `+${gsrDelta}` : gsrDelta} µS
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Electrodermal tone: {currentSample.gsrConductance > 5.0 ? 'Aroused' : 'Normal'}
          </div>
        </div>

        {/* IMU Motion Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Motion (IMU)
            </span>
            <span className="font-mono text-[10px] text-slate-500">MPU-6050</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {currentSample.accelMagnitude.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">g</span>
            </span>
            <span
              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                evaluation.motionRejectionActive
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {currentSample.motionState}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {evaluation.motionRejectionActive ? 'Rejection filter ON' : 'Below 0.35g threshold'}
          </div>
        </div>

        {/* Skin Temperature Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              Skin Temp
            </span>
            <span className="font-mono text-[10px] text-slate-500">MAX30205</span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {currentSample.skinTemp.toFixed(1)}
              <span className="text-xs font-normal text-slate-400 ml-1">°C</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
              ±0.1°C Accurate
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Contact: {currentSample.contactQuality}%
          </div>
        </div>
      </div>

      {/* 3. Multi-Channel Synchronized Canvas Telemetry */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Synchronized Multi-Modal Waveforms
            </span>
            <span className="text-[10px] font-mono text-slate-500">50 Hz Continuous Buffer</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-1 bg-emerald-500 rounded-sm"></span>
              PPG Pulse
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-1 bg-amber-500 rounded-sm"></span>
              GSR (µS)
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-1 bg-cyan-500 rounded-sm"></span>
              IMU (g)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-1 bg-rose-500 rounded-sm"></span>
              Temp (°C)
            </span>
          </div>
        </div>

        {/* High performance 2D waveform viewport */}
        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-800 bg-[#090d14]">
          <canvas
            ref={canvasRef}
            width={640}
            height={144}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* 4. Transparent Decision Engine Evaluation Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Transparent Decision Engine
            </span>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border tracking-wide ${getStateColor(
                evaluation.state
              )}`}
            >
              {evaluation.state.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stress Index Pill */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
              <span className="text-[11px] text-slate-400">Stress Index:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  evaluation.stressScore > 65
                    ? 'text-rose-400'
                    : evaluation.stressScore > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {evaluation.stressScore}/100
              </span>
            </div>

            <button
              onClick={onOpenEventLog}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              Event Log
            </button>
          </div>
        </div>

        {/* Natural Language Explanation Box */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs leading-relaxed text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-white">Rule-Based Reasoning:</span>
            <p className="text-slate-300 font-sans">{evaluation.explanation}</p>
          </div>
        </div>

        {/* Action Triggers & Breathing Recommendation */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              IMU Motion Rejection: <b className="text-slate-200">{evaluation.motionRejectionActive ? 'Triggered' : 'Inactive'}</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              Contact Quality: <b className="text-slate-200">{currentSample.contactQuality}%</b>
            </span>
          </div>

          <button
            onClick={onOpenBreathingModal}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg shadow-md transition"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Launch 4-7-8 Breathing Guide</span>
          </button>
        </div>
      </div>

      {/* 5. Scientific & Medical Transparency Badge */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-lg px-3 py-2 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            <b>Simulated Telemetry:</b> Model demonstrates sensor fusion & biofeedback principles. Not an FDA/CE medical diagnostic device.
          </span>
        </span>
        <span className="font-mono text-slate-600">Firmware v2.4 (Simulated)</span>
      </div>
    </div>
  );
};
