import React, { useState } from 'react';
import { 
  Sliders, 
  Camera, 
  Eye, 
  Scissors, 
  Ruler, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { CameraPreset, ViewDisplayMode } from '../types/cad';

interface BottomControlDockProps {
  explodeAmount: number;
  onExplodeChange: (val: number) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  currentPreset: CameraPreset;
  viewMode: ViewDisplayMode;
  onSelectViewMode: (mode: ViewDisplayMode) => void;
  showDimensions: boolean;
  onToggleDimensions: () => void;
  onAssembleAll: () => void;
  onExplodeAll: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  explodeAmount,
  onExplodeChange,
  onSelectCameraPreset,
  currentPreset,
  viewMode,
  onSelectViewMode,
  showDimensions,
  onToggleDimensions,
  onAssembleAll,
  onExplodeAll,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'explode' | 'camera' | 'display'>('explode');

  const cameraPresets: { id: CameraPreset; label: string }[] = [
    { id: 'assembled', label: 'Assembled' },
    { id: 'top', label: 'Top Lid' },
    { id: 'bottom', label: 'Sensors (Bottom)' },
    { id: 'electronics', label: 'Zone A Electronics' },
    { id: 'exploded', label: 'Exploded View' },
    { id: 'closeup', label: 'Optical Close-Up' },
    { id: 'isometric', label: 'Isometric' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[min(940px,94vw)] flex flex-col items-center select-none pointer-events-auto">
      {/* Collapse/Expand Toggle Tab */}
      <button
        onClick={() => setIsCollapsed(prev => !prev)}
        className="px-3.5 py-1 text-[11px] font-medium text-slate-400 hover:text-teal-400 bg-slate-900/95 border-t border-x border-slate-700/80 rounded-t-lg shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-colors"
      >
        {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        <span>{isCollapsed ? 'Show CAD Controls' : 'Hide Controls'}</span>
      </button>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 backdrop-blur-md flex flex-col gap-2.5 text-slate-200 text-xs w-full">
          {/* Top Sub-Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('explode')}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 ${
                  activeTab === 'explode'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Sliders size={13} />
                <span>Exploded Assembly</span>
              </button>

              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Camera size={13} />
                <span>Camera Angles</span>
              </button>

              <button
                onClick={() => setActiveTab('display')}
                className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 ${
                  activeTab === 'display'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers size={13} />
                <span>Inspection Modes</span>
              </button>
            </div>

            {/* Quick View Mode Pills */}
            <div className="hidden sm:flex items-center gap-1 text-[11px]">
              <button
                onClick={() => onSelectViewMode('solid')}
                className={`px-2 py-0.8 rounded-md transition-colors ${
                  viewMode === 'solid' ? 'bg-slate-800 text-teal-400 font-medium' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => onSelectViewMode('xray')}
                className={`px-2 py-0.8 rounded-md transition-colors ${
                  viewMode === 'xray' ? 'bg-slate-800 text-teal-400 font-medium' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                X-Ray
              </button>
              <button
                onClick={() => onSelectViewMode('section')}
                className={`px-2 py-0.8 rounded-md transition-colors ${
                  viewMode === 'section' ? 'bg-slate-800 text-teal-400 font-medium' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Section Cut
              </button>
            </div>
          </div>

          {/* Tab 1: Exploded View Slider */}
          {activeTab === 'explode' && (
            <div className="flex flex-col sm:flex-row items-center gap-3 px-2 py-1">
              <button
                onClick={onAssembleAll}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 shrink-0 transition-colors"
                title="Assemble All (0%)"
              >
                Assemble (0%)
              </button>

              <div className="flex-1 flex items-center gap-3 w-full">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Explode Amount:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(explodeAmount * 100)}
                  onChange={(e) => onExplodeChange(parseFloat(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <span className="text-xs font-mono text-teal-400 font-semibold w-10 text-right">
                  {Math.round(explodeAmount * 100)}%
                </span>
              </div>

              <button
                onClick={onExplodeAll}
                className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-medium border border-teal-500/40 shrink-0 transition-colors"
                title="Explode All Components (100%)"
              >
                Explode (100%)
              </button>
            </div>
          )}

          {/* Tab 2: Camera Presets */}
          {activeTab === 'camera' && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 custom-scrollbar">
              {cameraPresets.map((p) => {
                const isActive = currentPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectCameraPreset(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-teal-500/25 border border-teal-500/50 text-teal-300'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 3: Inspection Modes & Annotations */}
          {activeTab === 'display' && (
            <div className="flex items-center justify-between gap-3 px-2 py-1 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Surface Mode:</span>
                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                  <button
                    onClick={() => onSelectViewMode('solid')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'solid' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Solid CAD
                  </button>
                  <button
                    onClick={() => onSelectViewMode('xray')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'xray' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    X-Ray Enclosure
                  </button>
                  <button
                    onClick={() => onSelectViewMode('section')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'section' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Section Cut
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleDimensions}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    showDimensions
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                  }`}
                >
                  <Ruler size={13} />
                  <span>3D CAD Dimensions</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
