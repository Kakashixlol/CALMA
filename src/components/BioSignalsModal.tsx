import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Heart, 
  Zap, 
  Thermometer, 
  Compass, 
  AlertTriangle, 
  Play, 
  Pause, 
  Wind, 
  Footprints,
  ShieldAlert,
  Info
} from 'lucide-react';
import { BioSignalsState } from '../types/cad';

interface BioSignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerHaptic: () => void;
  onSetLedColor: (hex: string, intensity?: number) => void;
}

export const BioSignalsModal: React.FC<BioSignalsModalProps> = ({
  isOpen,
  onClose,
  onTriggerHaptic,
  onSetLedColor,
}) => {
  const [state, setState] = useState<BioSignalsState>({
    heartRate: 74,
    gsrValue: 3.2,
    skinTemp: 36.3,
    motionLevel: 'low',
    stressScore: 24,
    stressState: 'Stable',
    hapticActive: false,
    ledColor: '#00f0d0', // Calm Teal
    motionRejectionActive: false,
  });

  const [simMode, setSimMode] = useState<'normal' | 'stress' | 'exercise' | 'calm'>('normal');

  // Sync LED color to 3D model on state change
  useEffect(() => {
    if (isOpen) {
      onSetLedColor(state.ledColor, 2.2);
    }
  }, [state.ledColor, isOpen]);

  // Periodic waveform simulation
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setState((prev) => {
        let hr = prev.heartRate;
        let gsr = prev.gsrValue;
        let temp = prev.skinTemp;
        let score = prev.stressScore;
        let led = prev.ledColor;
        let motion = prev.motionLevel;
        let motionRejection = prev.motionRejectionActive;
        let stressState = prev.stressState;

        if (simMode === 'normal') {
          // Subtle normal physiological fluctuation
          hr = 72 + Math.sin(Date.now() / 1500) * 3;
          gsr = 3.0 + Math.cos(Date.now() / 2500) * 0.3;
          temp = 36.3 + Math.sin(Date.now() / 5000) * 0.1;
          score = 22;
          stressState = 'Stable';
          led = '#00f0d0'; // Teal
          motion = 'low';
          motionRejection = false;
        } else if (simMode === 'stress') {
          // Elevated stress response at rest
          hr = 104 + Math.sin(Date.now() / 1000) * 5;
          gsr = 6.4 + Math.cos(Date.now() / 1800) * 0.6;
          temp = 35.1 + Math.sin(Date.now() / 4000) * 0.1; // Vasoconstriction cooling
          score = 78;
          stressState = 'High Stress';
          led = '#ef4444'; // Red
          motion = 'low';
          motionRejection = false;
        } else if (simMode === 'exercise') {
          // Physical activity: High HR, high motion -> motion rejection prevents false alarm
          hr = 126 + Math.sin(Date.now() / 800) * 8;
          gsr = 5.2 + Math.cos(Date.now() / 1500) * 0.4;
          temp = 36.8;
          score = 18; // suppressed!
          stressState = 'Stable';
          led = '#3b82f6'; // Blue
          motion = 'high';
          motionRejection = true;
        } else if (simMode === 'calm') {
          // 4-7-8 Breathing intervention recovery
          hr = 66 + Math.sin(Date.now() / 3000) * 2;
          gsr = 2.4 + Math.cos(Date.now() / 4000) * 0.2;
          temp = 36.5;
          score = 14;
          stressState = 'Calming Intervention';
          led = '#06b6d4'; // Soft Breathing Cyan
          motion = 'low';
          motionRejection = false;
        }

        return {
          ...prev,
          heartRate: parseFloat(hr.toFixed(0)),
          gsrValue: parseFloat(gsr.toFixed(1)),
          skinTemp: parseFloat(temp.toFixed(1)),
          stressScore: score,
          stressState,
          ledColor: led,
          motionLevel: motion,
          motionRejectionActive: motionRejection,
        };
      });
    }, 800);

    return () => clearInterval(interval);
  }, [simMode, isOpen]);

  const handleSimulateNormal = () => {
    setSimMode('normal');
  };

  const handleSimulateStress = () => {
    setSimMode('stress');
    onTriggerHaptic();
  };

  const handleSimulateExercise = () => {
    setSimMode('exercise');
  };

  const handleSimulateCalm = () => {
    setSimMode('calm');
    onTriggerHaptic();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Activity size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">CALMA Live Biosignals &amp; Stress Demo</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                  Simulated Telemetry
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Illustrates 4-channel sensor fusion and breathing-synchronised haptic feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Top Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            state.stressState === 'High Stress'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              : state.stressState === 'Calming Intervention'
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
              : 'bg-teal-500/10 border-teal-500/40 text-teal-300'
          }`}>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                Current Wellness State
              </span>
              <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{state.stressState}</span>
                {state.motionRejectionActive && (
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    Motion Rejection Active
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                Stress Index
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {state.stressScore}<span className="text-xs text-slate-400 font-normal">/100</span>
              </span>
            </div>
          </div>

          {/* 4 Sensor Channel Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Heart Rate (PPG) */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono">Pulse (PPG)</span>
                <Heart size={14} className="text-rose-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {state.heartRate} <span className="text-xs text-slate-400 font-normal">BPM</span>
              </div>
              <div className="text-[10px] text-slate-500">MAX30102 Optical</div>
            </div>

            {/* 2. GSR / EDA */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono">Sweat (EDA)</span>
                <Zap size={14} className="text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {state.gsrValue} <span className="text-xs text-slate-400 font-normal">µS</span>
              </div>
              <div className="text-[10px] text-slate-500">Grove GSR Dual Disc</div>
            </div>

            {/* 3. Skin Temp */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono">Skin Temp</span>
                <Thermometer size={14} className="text-teal-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {state.skinTemp} <span className="text-xs text-slate-400 font-normal">°C</span>
              </div>
              <div className="text-[10px] text-slate-500">MAX30205 Clinical</div>
            </div>

            {/* 4. Motion IMU */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-mono">IMU Motion</span>
                <Compass size={14} className="text-indigo-400" />
              </div>
              <div className="text-base font-bold text-white font-mono capitalize pt-1">
                {state.motionLevel}
              </div>
              <div className="text-[10px] text-slate-500">MPU6050 6-Axis</div>
            </div>
          </div>

          {/* Hardware Actuation Sync Info */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Band Actuator Telemetry (Zone A)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">WS2812B RGB Indicator</span>
                  <span className="font-mono text-white font-medium">Color: {state.ledColor}</span>
                </div>
                <div 
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: state.ledColor }}
                />
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Coin Motor (Haptic PWM)</span>
                  <span className="font-mono text-white font-medium">
                    {simMode === 'stress' || simMode === 'calm' ? 'Synchronised Pulse (Active)' : 'Standby (0%)'}
                  </span>
                </div>
                <button
                  onClick={onTriggerHaptic}
                  className="px-2 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 text-[10px] font-medium"
                >
                  Test Haptic
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Scenarios */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Trigger Real-Time Demo Scenarios
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleSimulateNormal}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  simMode === 'normal'
                    ? 'bg-teal-500/20 border-teal-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="font-medium text-xs">1. Rest &amp; Stable</div>
                <div className="text-[10px] text-slate-400 mt-1">Normal baseline, teal LED</div>
              </button>

              <button
                onClick={handleSimulateStress}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  simMode === 'stress'
                    ? 'bg-rose-500/20 border-rose-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="font-medium text-xs">2. Stress Spike</div>
                <div className="text-[10px] text-slate-400 mt-1">Raised pulse &amp; EDA, red LED</div>
              </button>

              <button
                onClick={handleSimulateExercise}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  simMode === 'exercise'
                    ? 'bg-blue-500/20 border-blue-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="font-medium text-xs">3. Running / Motion</div>
                <div className="text-[10px] text-slate-400 mt-1">Motion rejection filters false alarm</div>
              </button>

              <button
                onClick={handleSimulateCalm}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  simMode === 'calm'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="font-medium text-xs">4. Calm Intervention</div>
                <div className="text-[10px] text-slate-400 mt-1">4-7-8 breathing haptics</div>
              </button>
            </div>
          </div>

          {/* Medical Guidance Disclaimer */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-200/90 leading-relaxed flex items-start gap-2">
            <Info size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong>IMPORTANT DISCLAIMER (From Engineering Report Page 12):</strong> CALMA is an educational and guidance wellness simulator. It is not an approved medical diagnostic device and does not diagnose, treat, or prevent any medical condition.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
