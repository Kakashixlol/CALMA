import React from 'react';
import { 
  Info, 
  Ruler, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Eye, 
  EyeOff, 
  Focus, 
  Crosshair, 
  X,
  FileCode,
  Tag
} from 'lucide-react';
import { ComponentData } from '../types/cad';
import { CALMA_COMPONENTS } from '../data/componentsData';

interface ComponentInspectorProps {
  selectedComponent: ComponentData | null;
  onClose: () => void;
  onFocusComponent: (id: string) => void;
  onIsolateComponent: (id: string | null) => void;
  isIsolated: boolean;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  onSelectComponent: (id: string) => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  selectedComponent,
  onClose,
  onFocusComponent,
  onIsolateComponent,
  isIsolated,
  isVisible,
  onToggleVisibility,
  onSelectComponent,
}) => {
  if (!selectedComponent) {
    return (
      <div className="w-84 h-full bg-slate-900/95 border-l border-slate-800/80 flex flex-col select-none text-slate-200 text-xs z-20 shrink-0">
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <Info size={15} className="text-teal-400" />
            <span>Product Overview &amp; Specifications</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-slate-300">
          {/* Concept Card */}
          <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">CALMA Band</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                Prototype v1.0.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Wearable stress-awareness and bio-feedback bracelet. Monitors optical pulse (PPG), electrodermal activity (GSR/EDA), 6-axis motion (IMU), and skin temperature to detect early stress patterns and deliver synchronised calming haptic intervention.
            </p>
          </div>

          {/* Envelope Specs */}
          <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler size={13} className="text-teal-400" />
              <span>CAD Envelope &amp; Clearances</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Housing Envelope</span>
                <span className="text-teal-300 font-mono font-medium">60 × 35 × 18 mm</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Wall Thickness</span>
                <span className="text-teal-300 font-mono font-medium">2.0 mm (ABS/PETG)</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Wrist Strap</span>
                <span className="text-slate-300 font-mono">220 × 22 × 2 mm</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Lid Step Clearance</span>
                <span className="text-slate-300 font-mono">0.2 mm edge gap</span>
              </div>
            </div>
          </div>

          {/* Quick Component Directory */}
          <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-teal-400" />
              <span>Click a Component to Inspect</span>
            </h4>
            <div className="space-y-1">
              {CALMA_COMPONENTS.slice(0, 7).map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectComponent(c.id)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/60 text-[11px] text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{c.shortName}</span>
                  <span className="text-[10px] text-teal-400/80 font-mono shrink-0">
                    {c.dimensions.length}×{c.dimensions.width}mm
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl text-[11px] text-slate-400 leading-relaxed">
            <span className="text-teal-400 font-medium block mb-1">Tip: Interactive Raycasting</span>
            Hover and click any component directly inside the 3D viewport to inspect its CAD features, dimensions, material, and electrical pin assignments.
          </div>
        </div>
      </div>
    );
  }

  const { dimensions, electricalPin, solidWorksFeatures } = selectedComponent;

  return (
    <div className="w-84 h-full bg-slate-900/95 border-l border-slate-800/80 flex flex-col select-none text-slate-200 text-xs z-20 shrink-0">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2 font-medium text-slate-300 truncate pr-2">
          <Tag size={14} className="text-teal-400 shrink-0" />
          <span className="truncate">{selectedComponent.shortName} Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Close Inspector"
        >
          <X size={15} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-slate-300">
        {/* Title & Zone Badge */}
        <div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono">
            {selectedComponent.zone}
          </span>
          <h3 className="text-sm font-semibold text-white mt-1.5 leading-snug">
            {selectedComponent.name}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => onFocusComponent(selectedComponent.id)}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-medium transition-colors"
            title="Focus and frame camera on this component"
          >
            <Crosshair size={13} />
            <span>Focus</span>
          </button>

          <button
            onClick={() => onIsolateComponent(isIsolated ? null : selectedComponent.id)}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-colors ${
              isIsolated 
                ? 'bg-teal-500/30 border-teal-500/60 text-teal-200' 
                : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
            title="Isolate component in viewport"
          >
            <Focus size={13} />
            <span>{isIsolated ? 'Restore' : 'Isolate'}</span>
          </button>

          <button
            onClick={() => onToggleVisibility(selectedComponent.id)}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-colors ${
              isVisible 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
            title="Toggle component visibility"
          >
            {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{isVisible ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        {/* Dimensions Card */}
        <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5 space-y-2">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Ruler size={13} className="text-teal-400" />
            <span>Reference Dimensions</span>
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Length (X)</span>
              <span className="font-mono text-white text-xs font-semibold">{dimensions.length} mm</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Width (Z)</span>
              <span className="font-mono text-white text-xs font-semibold">{dimensions.width} mm</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Height (Y)</span>
              <span className="font-mono text-white text-xs font-semibold">{dimensions.height} mm</span>
            </div>
          </div>
          {dimensions.note && (
            <p className="text-[10px] text-slate-500 font-mono pt-1">
              Note: {dimensions.note}
            </p>
          )}
        </div>

        {/* Engineering Material & Fixing */}
        <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5 space-y-2">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-teal-400" />
            <span>Material &amp; Mechanical Fix</span>
          </h4>
          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Material Specification</span>
              <span className="text-slate-200 font-medium">{selectedComponent.material}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Fixing / Mounting Method</span>
              <span className="text-slate-300">{selectedComponent.fixingMethod}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Clearance &amp; Tolerance</span>
              <span className="text-teal-400/90 font-mono">{selectedComponent.clearance}</span>
            </div>
          </div>
        </div>

        {/* Electrical Pinout (if applicable) */}
        {electricalPin && (
          <div className="bg-slate-950/40 border border-teal-500/30 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={13} className="text-teal-400" />
              <span>Electrical Pin Connection</span>
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Signal:</span>
                <span className="font-mono text-white font-medium">{electricalPin.signal}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">ESP32 Pin:</span>
                <span className="font-mono text-teal-300 font-semibold">{electricalPin.esp32Pin}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal pt-1">
                {electricalPin.note}
              </p>
            </div>
          </div>
        )}

        {/* SolidWorks CAD Feature Tree */}
        {solidWorksFeatures && solidWorksFeatures.length > 0 && (
          <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode size={13} className="text-teal-400" />
              <span>SolidWorks Feature Tree</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {solidWorksFeatures.map((feat, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Function & Design Notes */}
        <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3.5 space-y-2 text-[11px] leading-relaxed">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Functional Description
          </h4>
          <p className="text-slate-300">{selectedComponent.functionDescription}</p>

          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pt-2">
            Engineering Design Notes
          </h4>
          <p className="text-slate-400 italic">{selectedComponent.designNotes}</p>
        </div>
      </div>
    </div>
  );
};
