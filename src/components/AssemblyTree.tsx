import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Focus, 
  Layers, 
  Search, 
  Cpu, 
  Battery, 
  Zap, 
  Activity, 
  Shield, 
  Radio, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { CALMA_COMPONENTS } from '../data/componentsData';
import { ComponentData, FunctionalZone } from '../types/cad';

interface AssemblyTreeProps {
  selectedId: string | null;
  onSelectComponent: (id: string | null) => void;
  visibilityMap: Map<string, boolean>;
  onToggleVisibility: (id: string) => void;
  isolatedId: string | null;
  onIsolateComponent: (id: string | null) => void;
  onResetAllVisibility: () => void;
}

export const AssemblyTree: React.FC<AssemblyTreeProps> = ({
  selectedId,
  onSelectComponent,
  visibilityMap,
  onToggleVisibility,
  isolatedId,
  onIsolateComponent,
  onResetAllVisibility,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  const zones: FunctionalZone[] = [
    'Enclosure & Strap',
    'Zone A (Upper Electronics)',
    'Zone B (Wrist-Facing Sensing)',
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'microcontroller': return <Cpu size={14} className="text-emerald-400" />;
      case 'power': return <Battery size={14} className="text-amber-400" />;
      case 'sensor': return <Activity size={14} className="text-cyan-400" />;
      case 'actuator': return <Zap size={14} className="text-purple-400" />;
      case 'structural': return <Shield size={14} className="text-slate-400" />;
      default: return <Radio size={14} className="text-indigo-400" />;
    }
  };

  const toggleZoneCollapse = (zone: string) => {
    setCollapsedZones(prev => ({ ...prev, [zone]: !prev[zone] }));
  };

  const filteredComponents = CALMA_COMPONENTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.material.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-slate-900/95 border-r border-slate-800/80 flex flex-col select-none text-slate-200 text-xs z-20 shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <Layers size={15} className="text-teal-400" />
          <span>Assembly Feature Tree</span>
        </div>
        <button
          onClick={onResetAllVisibility}
          className="text-[11px] text-slate-400 hover:text-teal-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="Restore visibility to all components"
        >
          <RotateCcw size={12} />
          <span>Show All</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-slate-800/60 bg-slate-950/20">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search parts, sensors, materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
        {zones.map((zone) => {
          const zoneParts = filteredComponents.filter(c => c.zone === zone);
          if (zoneParts.length === 0) return null;

          const isCollapsed = collapsedZones[zone];

          return (
            <div key={zone} className="border border-slate-800/60 rounded-lg overflow-hidden bg-slate-950/30">
              {/* Zone Header */}
              <button
                onClick={() => toggleZoneCollapse(zone)}
                className="w-full px-2.5 py-2 flex items-center justify-between text-left bg-slate-800/40 hover:bg-slate-800/70 transition-colors text-[11px] font-semibold tracking-wider text-slate-300 uppercase"
              >
                <div className="flex items-center gap-1.5">
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  <span>{zone}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {zoneParts.length}
                </span>
              </button>

              {/* Component Rows */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-800/40">
                  {zoneParts.map((comp) => {
                    const isSelected = selectedId === comp.id;
                    const isVisible = visibilityMap.get(comp.id) ?? true;
                    const isIsolated = isolatedId === comp.id;

                    return (
                      <div
                        key={comp.id}
                        onClick={() => onSelectComponent(isSelected ? null : comp.id)}
                        className={`group px-2.5 py-2 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-500/15 border-l-2 border-teal-400 text-white font-medium'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        } ${!isVisible ? 'opacity-40' : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                          {getCategoryIcon(comp.category)}
                          <div className="truncate">
                            <div className="truncate text-xs">{comp.shortName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {comp.dimensions.length}×{comp.dimensions.width}×{comp.dimensions.height}mm
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Isolate & Eye Visibility */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onIsolateComponent(isIsolated ? null : comp.id)}
                            className={`p-1 rounded hover:bg-slate-700/60 transition-colors ${
                              isIsolated ? 'text-teal-400 bg-teal-500/20' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title={isIsolated ? 'Restore all components' : 'Isolate this component'}
                          >
                            <Focus size={13} />
                          </button>

                          <button
                            onClick={() => onToggleVisibility(comp.id)}
                            className={`p-1 rounded hover:bg-slate-700/60 transition-colors ${
                              isVisible ? 'text-slate-400 hover:text-slate-200' : 'text-rose-400'
                            }`}
                            title={isVisible ? 'Hide component' : 'Show component'}
                          >
                            {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click item to select in 3D</span>
        <span className="font-mono text-teal-400">{filteredComponents.length} Active Nodes</span>
      </div>
    </div>
  );
};
