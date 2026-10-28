import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  FastForward,
  Play,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import { DEFAULT_SCENARIOS } from '../../simulation/signalEngine';
import { ScenarioConfig, ScenarioId } from '../../types/simulation';

interface ScenarioControlPanelProps {
  activeScenarioId: ScenarioId;
  activeScenario: ScenarioConfig;
  onSelectScenario: (id: ScenarioId, customConfig?: Partial<ScenarioConfig>) => void;
  isPaused: boolean;
  onTogglePlayPause: () => void;
  onRestart: () => void;
  timeScale: number;
  onSetTimeScale: (scale: number) => void;
  contactOverride: number | null;
  onSetContactOverride: (val: number | null) => void;
}

export const ScenarioControlPanel: React.FC<ScenarioControlPanelProps> = ({
  activeScenarioId,
  activeScenario,
  onSelectScenario,
  isPaused,
  onTogglePlayPause,
  onRestart,
  timeScale,
  onSetTimeScale,
  contactOverride,
  onSetContactOverride,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customHR, setCustomHR] = useState(105);
  const [customGSR, setCustomGSR] = useState(6.5);
  const [customMotion, setCustomMotion] = useState<'stationary' | 'fidgeting' | 'walking' | 'running'>('stationary');
  const [customContact, setCustomContact] = useState(95);

  const scenarioList = Object.values(DEFAULT_SCENARIOS);

  const handleApplyCustom = () => {
    onSelectScenario('custom', {
      initialHeartRate: 72,
      targetHeartRate: customHR,
      initialGsr: 2.8,
      targetGsr: customGSR,
      motionProfile: customMotion,
      contactQuality: customContact,
    });
    setShowCustomModal(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-3 font-sans select-none backdrop-blur-md">
      {/* Header & Scenario Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Physiological Scenario
          </span>
        </div>

        {/* Scenario Selector Dropdown */}
        <div className="relative flex-1 max-w-sm">
          <select
            value={activeScenarioId}
            onChange={(e) => {
              const id = e.target.value as ScenarioId;
              if (id === 'custom') {
                setShowCustomModal(true);
              } else {
                onSelectScenario(id);
              }
            }}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
          >
            {scenarioList.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Scenario Description */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-300">
        <p className="leading-snug">{activeScenario.shortDesc}</p>
      </div>

      {/* Playback Controls & Speed Multipliers */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/60">
        {/* Play/Pause & Restart */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlayPause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 flex items-center justify-center gap-0.5">
                  <span className="w-1 h-3 bg-current rounded-sm"></span>
                  <span className="w-1 h-3 bg-current rounded-sm"></span>
                </span>
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            title="Restart Scenario from 0s"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 px-1 text-[10px] uppercase font-sans">Speed:</span>
          {[0.5, 1.0, 2.0, 5.0].map((rate) => (
            <button
              key={rate}
              onClick={() => onSetTimeScale(rate)}
              className={`px-2 py-0.5 rounded transition ${
                timeScale === rate
                  ? 'bg-teal-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Strap Tension / Skin Contact Override Slider */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-medium">Strap Contact:</span>
          <input
            type="range"
            min="20"
            max="100"
            value={contactOverride ?? activeScenario.contactQuality}
            onChange={(e) => onSetContactOverride(Number(e.target.value))}
            className="w-18 accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
            {contactOverride ?? activeScenario.contactQuality}%
          </span>
          {contactOverride !== null && (
            <button
              onClick={() => onSetContactOverride(null)}
              className="text-[9px] text-amber-400 hover:underline"
              title="Reset contact quality to scenario preset"
            >
              Auto
            </button>
          )}
        </div>
      </div>

      {/* Custom Scenario Builder Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                Configure Custom Physiological Scenario
              </span>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">
                  Target Heart Rate: <b className="text-teal-400 font-mono">{customHR} BPM</b>
                </label>
                <input
                  type="range"
                  min="55"
                  max="145"
                  value={customHR}
                  onChange={(e) => setCustomHR(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Target GSR Conductance: <b className="text-amber-400 font-mono">{customGSR.toFixed(1)} µS</b>
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="10.0"
                  step="0.1"
                  value={customGSR}
                  onChange={(e) => setCustomGSR(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">IMU Physical Motion State</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['stationary', 'fidgeting', 'walking', 'running'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCustomMotion(m)}
                      className={`py-1.5 rounded text-[11px] capitalize font-medium transition ${
                        customMotion === m
                          ? 'bg-teal-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Initial Skin Contact Quality: <b className="text-cyan-400 font-mono">{customContact}%</b>
                </label>
                <input
                  type="range"
                  min="25"
                  max="100"
                  value={customContact}
                  onChange={(e) => setCustomContact(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow"
              >
                Apply & Start Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
