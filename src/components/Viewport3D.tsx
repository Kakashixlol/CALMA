import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { CalmaSceneManager } from '../three/CalmaScene';
import { CameraPreset, ViewDisplayMode } from '../types/cad';

export interface Viewport3DHandle {
  setExplodeAmount: (amount: number) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setViewMode: (mode: ViewDisplayMode) => void;
  selectComponent: (id: string | null) => void;
  focusOnComponent: (id: string) => void;
  setVisibility: (id: string, visible: boolean) => void;
  isolateComponent: (id: string | null) => void;
  resetAllVisibility: () => void;
  toggleDimensions: (show?: boolean) => boolean;
  togglePresentationMode: (active?: boolean) => boolean;
  triggerHapticVibration: () => void;
  setLedState: (hex: string, intensity?: number) => void;
  setLedMode: (mode: 'solid' | 'pulse' | 'breathing' | 'warning', colorHex?: string) => void;
  setWornMode: (worn: boolean) => void;
  getWornMode: () => boolean;
  highlightComponents: (ids: string[]) => void;
  clearMultiHighlights: () => void;
  captureScreenshot: () => string;
}

interface Viewport3DProps {
  onSelectComponent: (id: string | null) => void;
  onHoverComponent: (id: string | null) => void;
  hoveredId: string | null;
  selectedId: string | null;
  showDimensions: boolean;
}

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(({
  onSelectComponent,
  onHoverComponent,
  hoveredId,
  selectedId,
  showDimensions,
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<CalmaSceneManager | null>(null);

  // Store latest callbacks in refs to avoid recreating the Three.js scene
  const onSelectRef = useRef(onSelectComponent);
  onSelectRef.current = onSelectComponent;

  const onHoverRef = useRef(onHoverComponent);
  onHoverRef.current = onHoverComponent;

  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new CalmaSceneManager(mountRef.current, {
      onSelectComponent: (id) => onSelectRef.current(id),
      onHoverComponent: (id) => onHoverRef.current(id),
    });

    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    setExplodeAmount: (amount: number) => {
      sceneManagerRef.current?.setExplodeAmount(amount);
    },
    setCameraPreset: (preset: CameraPreset) => {
      sceneManagerRef.current?.setCameraPreset(preset);
    },
    setViewMode: (mode: ViewDisplayMode) => {
      sceneManagerRef.current?.setViewMode(mode);
    },
    selectComponent: (id: string | null) => {
      sceneManagerRef.current?.selectComponent(id, false);
    },
    focusOnComponent: (id: string) => {
      sceneManagerRef.current?.focusOnComponent(id);
    },
    setVisibility: (id: string, visible: boolean) => {
      sceneManagerRef.current?.setVisibility(id, visible);
    },
    isolateComponent: (id: string | null) => {
      sceneManagerRef.current?.isolateComponent(id);
    },
    resetAllVisibility: () => {
      sceneManagerRef.current?.resetAllVisibility();
    },
    toggleDimensions: (show?: boolean) => {
      return sceneManagerRef.current?.toggleDimensions(show) ?? false;
    },
    togglePresentationMode: (active?: boolean) => {
      return sceneManagerRef.current?.togglePresentationMode(active) ?? false;
    },
    triggerHapticVibration: () => {
      sceneManagerRef.current?.triggerHapticVibration();
    },
    setLedState: (hex: string, intensity?: number) => {
      sceneManagerRef.current?.setLedState(hex, intensity);
    },
    setLedMode: (mode: 'solid' | 'pulse' | 'breathing' | 'warning', colorHex?: string) => {
      sceneManagerRef.current?.setLedMode(mode, colorHex);
    },
    setWornMode: (worn: boolean) => {
      sceneManagerRef.current?.setWornMode(worn);
    },
    getWornMode: () => {
      return sceneManagerRef.current?.getWornMode() ?? false;
    },
    highlightComponents: (ids: string[]) => {
      sceneManagerRef.current?.highlightComponents(ids);
    },
    clearMultiHighlights: () => {
      sceneManagerRef.current?.clearMultiHighlights();
    },
    captureScreenshot: () => {
      return sceneManagerRef.current?.captureScreenshot() || '';
    },
  }));

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Viewport Floating Overlay Indicators */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="text-[11px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-md backdrop-blur-sm shadow">
          {hoveredId ? (
            <span className="text-teal-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              Hover: {hoveredId.replace(/_/g, ' ')}
            </span>
          ) : (
            <span className="text-slate-500">Orbit: Left-drag · Zoom: Scroll · Pan: Right-drag</span>
          )}
        </div>

        {showDimensions && (
          <div className="text-[10px] font-mono text-teal-300 bg-teal-950/70 border border-teal-800/80 px-2.5 py-1 rounded-md backdrop-blur-sm shadow flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>CAD Dimensions active (60×35×18mm Enclosure)</span>
          </div>
        )}
      </div>

      {/* Axis Gizmo / Orientation Badge */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-md p-1.5 px-2.5 backdrop-blur-sm text-[10px] font-mono text-slate-400 shadow">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">X: 60mm</span>
            <span className="text-emerald-400 font-bold">Y: 18mm</span>
            <span className="text-blue-400 font-bold">Z: 35mm</span>
          </div>
        </div>
      </div>
    </div>
  );
});
