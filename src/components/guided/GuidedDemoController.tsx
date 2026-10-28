import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { GUIDED_DEMO_STEPS } from '../../data/guidedDemoData';
import { GuidedStep } from '../../types/simulation';

interface GuidedDemoControllerProps {
  currentStepIndex: number;
  onSetStepIndex: (index: number) => void;
  onApplyStep: (step: GuidedStep) => void;
  onClose: () => void;
}

export const GuidedDemoController: React.FC<GuidedDemoControllerProps> = ({
  currentStepIndex,
  onSetStepIndex,
  onApplyStep,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(8);

  const totalSteps = GUIDED_DEMO_STEPS.length;
  const currentStep = GUIDED_DEMO_STEPS[currentStepIndex];

  const onApplyStepRef = React.useRef(onApplyStep);
  onApplyStepRef.current = onApplyStep;

  // When step changes, apply step configuration to the 3D scene
  useEffect(() => {
    if (currentStep) {
      onApplyStepRef.current(currentStep);
      setCountdown(currentStep.durationSeconds);
    }
  }, [currentStepIndex]);

  // Auto-play timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger step advancement outside the state updater
          setTimeout(() => {
            onSetStepIndex((currentStepIndex + 1) % totalSteps);
          }, 0);
          return currentStep.durationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, totalSteps, currentStep.durationSeconds, onSetStepIndex]);

  const handleNext = () => {
    onSetStepIndex((currentStepIndex + 1) % totalSteps);
  };

  const handlePrev = () => {
    onSetStepIndex((currentStepIndex - 1 + totalSteps) % totalSteps);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 font-sans select-none backdrop-blur-md">
      {/* Top Bar: Step Progress & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider font-mono">
            Guided Tour: Step {currentStepIndex + 1} / {totalSteps}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs font-semibold text-white">
            {currentStep.title}
          </span>
        </div>

        {/* Play / Pause / Skip */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {isPlaying ? `Auto-advance: ${countdown}s` : 'Paused'}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
          >
            {isPlaying ? (
              <span className="w-3.5 h-3.5 flex items-center justify-center gap-0.5">
                <span className="w-1 h-3 bg-current rounded-sm"></span>
                <span className="w-1 h-3 bg-current rounded-sm"></span>
              </span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow transition"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden flex">
        {GUIDED_DEMO_STEPS.map((step, idx) => (
          <button
            key={step.step}
            onClick={() => onSetStepIndex(idx)}
            title={step.title}
            className={`h-full flex-1 transition-all ${
              idx === currentStepIndex
                ? 'bg-teal-400'
                : idx < currentStepIndex
                ? 'bg-teal-700'
                : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Narrative Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs">{currentStep.subtitle}</span>
            <span className="text-[10px] font-mono text-slate-500">
              Camera: {currentStep.cameraPreset} · {currentStep.wornMode ? 'Worn Forearm' : 'CAD Bench'}
            </span>
          </div>
          <p className="text-slate-300 font-sans">{currentStep.narrativeText}</p>
        </div>
      </div>
    </div>
  );
};
