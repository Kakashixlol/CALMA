import React, { useEffect, useState } from 'react';
import { CheckCircle2, Heart, Vibrate, Wind, X } from 'lucide-react';

interface BreathingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHR: number;
  onHapticPulse?: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingSessionModal: React.FC<BreathingSessionModalProps> = ({
  isOpen,
  onClose,
  currentHR,
  onHapticPulse,
}) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cycleCount, setCycleCount] = useState(1);
  const [simulatedDropHR, setSimulatedDropHR] = useState(currentHR);

  const onHapticPulseRef = React.useRef(onHapticPulse);
  onHapticPulseRef.current = onHapticPulse;

  // Initialize and run cycle ONLY when modal is actively open
  useEffect(() => {
    if (!isOpen) return;

    setPhase('inhale');
    setSecondsRemaining(4);
    setCycleCount(1);
    setSimulatedDropHR(currentHR);

    let activePhase: BreathPhase = 'inhale';
    let secLeft = 4;
    let cycles = 1;

    const interval = setInterval(() => {
      secLeft -= 1;
      if (secLeft <= 0) {
        if (activePhase === 'inhale') {
          activePhase = 'hold';
          secLeft = 7;
        } else if (activePhase === 'hold') {
          activePhase = 'exhale';
          secLeft = 8;
        } else {
          activePhase = 'inhale';
          secLeft = 4;
          cycles += 1;
          setCycleCount(cycles);
          setSimulatedDropHR((hr) => Math.max(68, hr - 3));
          onHapticPulseRef.current?.();
        }
        setPhase(activePhase);
      }
      setSecondsRemaining(secLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Scale factor for the animated breathing circle (0.4 to 1.0)
  const getCircleScale = () => {
    if (phase === 'inhale') {
      const prog = (4 - secondsRemaining) / 4;
      return 0.6 + prog * 0.4; // expands from 0.6 to 1.0
    } else if (phase === 'hold') {
      return 1.0; // stays full
    } else {
      const prog = (8 - secondsRemaining) / 8;
      return 1.0 - prog * 0.4; // contracts from 1.0 to 0.6
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'text-cyan-400 border-cyan-400/50 bg-cyan-950/40';
      case 'hold':
        return 'text-amber-300 border-amber-400/50 bg-amber-950/40';
      case 'exhale':
        return 'text-teal-400 border-teal-400/50 bg-teal-950/40';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in quietly through the nose...';
      case 'hold':
        return 'Hold breath gently and relax shoulders...';
      case 'exhale':
        return 'Exhale completely with gentle whoosh...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center gap-6 text-center select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <Wind className="w-4 h-4" />
            <span>CALMA Bio-Feedback Interventon</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            4-7-8 Guided Relaxation
          </h2>
          <span className="text-xs text-slate-400">
            Cycle {cycleCount} · Parasympathetic Down-Regulation
          </span>
        </div>

        {/* Dynamic Breathing Sphere Visualizer */}
        <div className="relative w-56 h-56 flex items-center justify-center my-2">
          {/* Subtle Outer Glow Rings */}
          <div
            className="absolute rounded-full border border-teal-500/20 transition-all duration-1000 ease-in-out"
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${getCircleScale() * 1.15})`,
              opacity: 0.35,
            }}
          />

          {/* Active Breathing Bubble */}
          <div
            className={`w-44 h-44 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition-all duration-1000 ease-in-out backdrop-blur-md ${getPhaseColor()}`}
            style={{
              transform: `scale(${getCircleScale()})`,
            }}
          >
            <span className="text-xs font-mono uppercase tracking-widest font-bold">
              {phase}
            </span>
            <span className="text-5xl font-extrabold font-mono tracking-tighter my-1">
              {secondsRemaining}
            </span>
            <span className="text-[10px] text-slate-400">seconds</span>
          </div>
        </div>

        {/* Instruction Subtitle */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 max-w-xs text-xs text-slate-300">
          <p className="font-medium text-white">{getPhaseInstruction()}</p>
        </div>

        {/* Telemetry Response Trend (Autonomic recovery) */}
        <div className="w-full flex items-center justify-between bg-slate-950/90 border border-slate-800/80 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-mono">Heart Rate Recovery</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {Math.round(simulatedDropHR)} BPM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Vibrate className="w-3.5 h-3.5" />
            <span>Pulsing Wrist Coin Motor</span>
          </div>
        </div>

        {/* Finish / Dismiss */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          End Guided Session & Return
        </button>
      </div>
    </div>
  );
};
