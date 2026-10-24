import React from 'react';
import { 
  Box, 
  Camera, 
  FileText, 
  Activity, 
  Maximize2, 
  RotateCcw, 
  PanelLeftClose, 
  PanelRightClose,
  Sparkles
} from 'lucide-react';

interface HeaderBarProps {
  onResetView: () => void;
  onTogglePresentation: () => void;
  isPresentation: boolean;
  onTakeScreenshot: () => void;
  onOpenBioModal: () => void;
  onOpenDocModal: () => void;
  showLeftPanel: boolean;
  setShowLeftPanel: (v: boolean | ((prev: boolean) => boolean)) => void;
  showRightPanel: boolean;
  setShowRightPanel: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onResetView,
  onTogglePresentation,
  isPresentation,
  onTakeScreenshot,
  onOpenBioModal,
  onOpenDocModal,
  showLeftPanel,
  setShowLeftPanel,
  showRightPanel,
  setShowRightPanel,
}) => {
  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between text-slate-200 select-none z-30 shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowLeftPanel(prev => !prev)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showLeftPanel 
              ? 'bg-slate-800 border-slate-700 text-teal-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Assembly Tree"
        >
          <PanelLeftClose size={16} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm tracking-wider shadow-inner">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wide text-white">CALMA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[10px]">
                3D CAD SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              SolidWorks CAD &amp; Hardware Assembly Explorer
            </p>
          </div>
        </div>
      </div>

      {/* Middle Specs Pill */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-slate-950/60 border border-slate-800/80 rounded-full px-3.5 py-1 text-slate-400">
        <span className="text-slate-300">Design Envelope:</span>
        <span className="text-teal-400 font-semibold">60 × 35 × 18 mm</span>
        <span className="text-slate-600">|</span>
        <span>Units: <strong className="text-slate-300">mm</strong></span>
        <span className="text-slate-600">|</span>
        <span>Parts: <strong className="text-slate-300">14 Component Nodes</strong></span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenBioModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 transition-all shadow-sm"
          title="Open Bio-Signals & Stress Intervention Simulator"
        >
          <Activity size={14} className="text-teal-400" />
          <span className="hidden md:inline">Live Demo</span>
        </button>

        <button
          onClick={onOpenDocModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 transition-colors"
          title="View SolidWorks Design Report & Assembly Guide"
        >
          <FileText size={14} className="text-slate-400" />
          <span className="hidden md:inline">CAD Report</span>
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
          onClick={() => setShowRightPanel(prev => !prev)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showRightPanel 
              ? 'bg-slate-800 border-slate-700 text-teal-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Component Inspector"
        >
          <PanelRightClose size={16} />
        </button>
      </div>
    </header>
  );
};
