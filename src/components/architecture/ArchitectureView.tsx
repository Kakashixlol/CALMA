import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Cpu,
  Eye,
  Layers,
  Radio,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SYSTEM_ARCHITECTURE_PIPELINE } from '../../data/architectureData';
import { ArchitectureNode } from '../../types/simulation';

interface ArchitectureViewProps {
  onHighlightHardware: (componentIds: string[]) => void;
  onFocusComponent: (componentId: string) => void;
  onClose: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  onHighlightHardware,
  onFocusComponent,
  onClose,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(SYSTEM_ARCHITECTURE_PIPELINE[0].id);

  const selectedNode =
    SYSTEM_ARCHITECTURE_PIPELINE.find((n) => n.id === selectedNodeId) ||
    SYSTEM_ARCHITECTURE_PIPELINE[0];

  const handleSelectNode = (node: ArchitectureNode) => {
    setSelectedNodeId(node.id);
    onHighlightHardware(node.hardwareComponents);
  };

  const getStageBadgeColor = (stage: ArchitectureNode['stage']) => {
    switch (stage) {
      case 'input':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'acquisition':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'processing':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'decision':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'actuation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'output':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/20 text-slate-300 border-slate-700/30';
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 font-sans select-none">
      {/* Title & Instructions */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            System Architecture & Physiological Signal Pipeline
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Click any stage to highlight its physical 3D CAD components
        </span>
      </div>

      {/* Horizontal / Grid Flowchart of the 9 Pipeline Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-1.5">
        {SYSTEM_ARCHITECTURE_PIPELINE.map((node, idx) => {
          const isSelected = node.id === selectedNodeId;
          return (
            <button
              key={node.id}
              onClick={() => handleSelectNode(node)}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition relative shadow-sm group ${
                isSelected
                  ? 'bg-slate-800/95 border-teal-500 ring-1 ring-teal-500/50'
                  : 'bg-slate-900/70 border-slate-800/90 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  0{idx + 1}
                </span>
                <span
                  className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${getStageBadgeColor(
                    node.stage
                  )}`}
                >
                  {node.stage}
                </span>
              </div>

              <span
                className={`text-xs font-bold leading-tight ${
                  isSelected ? 'text-teal-300' : 'text-slate-200 group-hover:text-white'
                }`}
              >
                {node.label.replace(/^\d+\.\s*/, '')}
              </span>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{node.hardwareComponents.length} CAD parts</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Inspector */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-5">
        {/* Left column: Architecture Specifications */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{selectedNode.label}</span>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-bold ${getStageBadgeColor(
                  selectedNode.stage
                )}`}
              >
                Stage: {selectedNode.stage}
              </span>
            </div>

            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              Status: Operational (50 Hz)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {selectedNode.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                Data Input
              </span>
              <span className="text-slate-200 font-mono text-[11px] leading-tight">
                {selectedNode.sampleInput}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                Processed Output
              </span>
              <span className="text-teal-300 font-mono text-[11px] leading-tight">
                {selectedNode.sampleOutput}
              </span>
            </div>
          </div>

          {/* Algorithm & Engineering Design Note */}
          <div className="bg-teal-950/30 border border-teal-800/40 rounded-lg p-2.5 text-xs text-teal-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Engineering & Algorithm Design:</span>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                {selectedNode.algorithmNote}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Physical CAD Hardware Cross-Reference */}
        <div className="md:w-72 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Associated Physical Parts
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
              {selectedNode.hardwareComponents.map((partId) => (
                <div
                  key={partId}
                  className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <span className="font-mono text-slate-300 text-[11px]">
                    {partId.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => onFocusComponent(partId)}
                    title="Focus 3D Camera on this part"
                    className="p-1 text-slate-400 hover:text-teal-400 rounded hover:bg-slate-800"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onHighlightHardware(selectedNode.hardwareComponents)}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow transition flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Highlight All in 3D Viewport</span>
          </button>
        </div>
      </div>
    </div>
  );
};
