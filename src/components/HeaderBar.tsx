import React from 'react';
import {
  Activity,
  Box,
  Camera,
  Compass,
  FileText,
  Layers,
  Maximize2,
  PanelLeftClose,
  PanelRightClose,
  RotateCcw,
  Sparkles,
  User,
} from 'lucide-react';
import { OperationalMode } from '../types/simulation';

interface HeaderBarProps {
  currentMode: OperationalMode;
  onSelectMode: (mode: OperationalMode) => void;
  isWornMode: boolean;
  onToggleWornMode: () => void;
  onResetView: () => void;
  onTogglePresentation: () => void;
  isPresentation: boolean;
  onTakeScreenshot: () => void;
  onOpenDocModal: () => void;
  showLeftPanel: boolean;
  setShowLeftPanel: (v: boolean | ((prev: boolean) => boolean)) => void;
  showRightPanel: boolean;
  setShowRightPanel: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentMode,
  onSelectMode,
  isWornMode,
  onToggleWornMode,
  onResetView,
  onTogglePresentation,
  isPresentation,
  onTakeScreenshot,
  onOpenDocModal,
  showLeftPanel,
  setShowLeftPanel,
  showRightPanel,
  setShowRightPanel,
}) => {
  return (
    <header className="h-14 bg-slate-900/95 border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between text-slate-200 select-none z-30 shrink-0 backdrop-blur-md">
      {/* Brand & Left Tree Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setShowLeftPanel((prev) => !prev)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showLeftPanel
              ? 'bg-slate-800 border-slate-700 text-teal-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Assembly Tree / Left Panel"
        >
          <PanelLeftClose size={16} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm tracking-wider shadow-inner">
            C
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-wide text-white">CALMA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono">
                SIMULATOR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              SolidWorks CAD &amp; Physiological Digital Twin
            </p>
          </div>
        </div>
      </div>

      {/* Center: 4-Mode Operational Navigation Pills */}
      <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800/90 shadow-inner">
        <button
          onClick={() => onSelectMode('explorer')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentMode === 'explorer'
              ? 'bg-slate-800 text-teal-300 shadow-sm border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box size={13} className={currentMode === 'explorer' ? 'text-teal-400' : ''} />
          <span className="hidden sm:inline">CAD Explorer</span>
          <span className="sm:hidden">CAD</span>
        </button>

        <button
          onClick={() => onSelectMode('simulation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentMode === 'simulation'
              ? 'bg-slate-800 text-teal-300 shadow-sm border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={13} className={currentMode === 'simulation' ? 'text-teal-400' : ''} />
          <span className="hidden sm:inline">Digital Twin</span>
          <span className="sm:hidden">Twin</span>
        </button>

        <button
          onClick={() => onSelectMode('architecture')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentMode === 'architecture'
              ? 'bg-slate-800 text-teal-300 shadow-sm border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={13} className={currentMode === 'architecture' ? 'text-teal-400' : ''} />
          <span className="hidden sm:inline">Architecture</span>
          <span className="sm:hidden">Pipe</span>
        </button>

        <button
          onClick={() => onSelectMode('guided')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentMode === 'guided'
              ? 'bg-slate-800 text-teal-300 shadow-sm border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={13} className={currentMode === 'guided' ? 'text-teal-400' : ''} />
          <span className="hidden sm:inline">Guided Tour</span>
          <span className="sm:hidden">Tour</span>
        </button>
      </div>

      {/* Right Action Icons & Worn View Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Worn on Wrist Toggle Button */}
        <button
          onClick={onToggleWornMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            isWornMode
              ? 'bg-teal-500/25 border-teal-500/50 text-teal-300 shadow-sm'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
          }`}
          title="Toggle Human Forearm & Wrist View"
        >
          <User size={13} className={isWornMode ? 'text-teal-400' : 'text-slate-400'} />
          <span className="hidden lg:inline">{isWornMode ? 'Worn View (ON)' : 'Wear on Wrist'}</span>
        </button>

        <button
          onClick={onOpenDocModal}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 transition-colors"
          title="View SolidWorks Design Report & Assembly Guide"
        >
          <FileText size={13} className="text-slate-400" />
          <span className="hidden xl:inline">CAD Report</span>
        </button>

        <button
          onClick={onTogglePresentation}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
            isPresentation
              ? 'bg-teal-500/25 border-teal-500/50 text-teal-300'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
          }`}
          title="Toggle Studio Presentation (Auto-rotate)"
        >
          <Maximize2 size={15} />
        </button>

        <button
          onClick={onTakeScreenshot}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 text-xs transition-colors"
          title="Capture High-Res Viewport Image"
        >
          <Camera size={15} />
        </button>

        <button
          onClick={onResetView}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 text-xs transition-colors"
          title="Reset Camera Target"
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={() => setShowRightPanel((prev) => !prev)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showRightPanel
              ? 'bg-slate-800 border-slate-700 text-teal-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Component Inspector / Right Panel"
        >
          <PanelRightClose size={16} />
        </button>
      </div>
    </header>
  );
};
