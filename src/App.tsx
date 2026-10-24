import React, { useState, useRef, useCallback } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { AssemblyTree } from './components/AssemblyTree';
import { ComponentInspector } from './components/ComponentInspector';
import { BottomControlDock } from './components/BottomControlDock';
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { BioSignalsModal } from './components/BioSignalsModal';
import { ReportDocModal } from './components/ReportDocModal';
import { CALMA_COMPONENTS } from './data/componentsData';
import { CameraPreset, ViewDisplayMode } from './types/cad';

export default function App() {
  const viewportRef = useRef<Viewport3DHandle>(null);

  // Layout state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isPresentation, setIsPresentation] = useState(false);

  // 3D Scene State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isolatedId, setIsolatedId] = useState<string | null>(null);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [currentCameraPreset, setCurrentCameraPreset] = useState<CameraPreset>('assembled');
  const [viewMode, setViewMode] = useState<ViewDisplayMode>('solid');
  const [showDimensions, setShowDimensions] = useState(false);

  // Component Visibility tracking
  const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    CALMA_COMPONENTS.forEach(c => map.set(c.id, true));
    return map;
  });

  // Modals
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Handlers
  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedId(id);
    viewportRef.current?.selectComponent(id);
    if (id && !showRightPanel) {
      setShowRightPanel(true);
    }
  }, [showRightPanel]);

  const handleHoverComponent = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setVisibilityMap(prev => {
      const next = new Map(prev);
      const current = next.get(id) ?? true;
      next.set(id, !current);
      viewportRef.current?.setVisibility(id, !current);
      return next;
    });
  }, []);

  const handleIsolateComponent = useCallback((id: string | null) => {
    setIsolatedId(id);
    viewportRef.current?.isolateComponent(id);
    if (id) {
      setSelectedId(id);
    }
  }, []);

  const handleResetAllVisibility = useCallback(() => {
    setIsolatedId(null);
    setSelectedId(null);
    setVisibilityMap(prev => {
      const next = new Map(prev);
      CALMA_COMPONENTS.forEach(c => next.set(c.id, true));
      return next;
    });
    viewportRef.current?.resetAllVisibility();
  }, []);

  const handleExplodeChange = useCallback((amount: number) => {
    setExplodeAmount(amount);
    viewportRef.current?.setExplodeAmount(amount);
  }, []);

  const handleSelectCameraPreset = useCallback((preset: CameraPreset) => {
    setCurrentCameraPreset(preset);
    viewportRef.current?.setCameraPreset(preset);
  }, []);

  const handleSelectViewMode = useCallback((mode: ViewDisplayMode) => {
    setViewMode(mode);
    viewportRef.current?.setViewMode(mode);
  }, []);

  const handleToggleDimensions = useCallback(() => {
    setShowDimensions(prev => {
      const next = !prev;
      viewportRef.current?.toggleDimensions(next);
      return next;
    });
  }, []);

  const handleTogglePresentation = useCallback(() => {
    setIsPresentation(prev => {
      const next = !prev;
      viewportRef.current?.togglePresentationMode(next);
      return next;
    });
  }, []);

  const handleResetView = useCallback(() => {
    setCurrentCameraPreset('assembled');
    viewportRef.current?.setCameraPreset('assembled');
  }, []);

  const handleFocusComponent = useCallback((id: string) => {
    viewportRef.current?.focusOnComponent(id);
  }, []);

  const handleTakeScreenshot = useCallback(() => {
    const dataUrl = viewportRef.current?.captureScreenshot();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `CALMA_CAD_Assembly_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const handleTriggerHaptic = useCallback(() => {
    viewportRef.current?.triggerHapticVibration();
  }, []);

  const handleSetLedColor = useCallback((hex: string, intensity?: number) => {
    viewportRef.current?.setLedState(hex, intensity);
  }, []);

  const selectedComponentData = selectedId 
    ? CALMA_COMPONENTS.find(c => c.id === selectedId) || null 
    : null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Top Navigation Bar */}
      <HeaderBar
        onResetView={handleResetView}
        onTogglePresentation={handleTogglePresentation}
        isPresentation={isPresentation}
        onTakeScreenshot={handleTakeScreenshot}
        onOpenBioModal={() => setIsBioModalOpen(true)}
        onOpenDocModal={() => setIsDocModalOpen(true)}
        showLeftPanel={showLeftPanel}
        setShowLeftPanel={setShowLeftPanel}
        showRightPanel={showRightPanel}
        setShowRightPanel={setShowRightPanel}
      />

      {/* Main CAD Workspace Layout */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Assembly Feature Tree Panel */}
        {showLeftPanel && (
          <AssemblyTree
            selectedId={selectedId}
            onSelectComponent={handleSelectComponent}
            visibilityMap={visibilityMap}
            onToggleVisibility={handleToggleVisibility}
            isolatedId={isolatedId}
            onIsolateComponent={handleIsolateComponent}
            onResetAllVisibility={handleResetAllVisibility}
          />
        )}

        {/* Central 3D Interactive Viewport */}
        <main className="flex-1 relative h-full">
          <Viewport3D
            ref={viewportRef}
            onSelectComponent={handleSelectComponent}
            onHoverComponent={handleHoverComponent}
            hoveredId={hoveredId}
            selectedId={selectedId}
            showDimensions={showDimensions}
          />

          {/* Bottom Dock for Exploded View, Camera Presets, and Surface Modes */}
          <BottomControlDock
            explodeAmount={explodeAmount}
            onExplodeChange={handleExplodeChange}
            onSelectCameraPreset={handleSelectCameraPreset}
            currentPreset={currentCameraPreset}
            viewMode={viewMode}
            onSelectViewMode={handleSelectViewMode}
            showDimensions={showDimensions}
            onToggleDimensions={handleToggleDimensions}
            onAssembleAll={() => handleExplodeChange(0)}
            onExplodeAll={() => handleExplodeChange(1)}
          />
        </main>

        {/* Right Component Property Inspector Panel */}
        {showRightPanel && (
          <ComponentInspector
            selectedComponent={selectedComponentData}
            onClose={() => handleSelectComponent(null)}
            onFocusComponent={handleFocusComponent}
            onIsolateComponent={handleIsolateComponent}
            isIsolated={isolatedId === selectedId}
            isVisible={selectedId ? (visibilityMap.get(selectedId) ?? true) : true}
            onToggleVisibility={handleToggleVisibility}
            onSelectComponent={handleSelectComponent}
          />
        )}
      </div>

      {/* Bio-Signals & Stress Intervention Interactive Modal */}
      <BioSignalsModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        onTriggerHaptic={handleTriggerHaptic}
        onSetLedColor={handleSetLedColor}
      />

      {/* SolidWorks CAD Design Report Documentation Modal */}
      <ReportDocModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
}
