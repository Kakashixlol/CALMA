import React, { useState, useRef, useCallback, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { AssemblyTree } from './components/AssemblyTree';
import { ComponentInspector } from './components/ComponentInspector';
import { BottomControlDock } from './components/BottomControlDock';
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { BioSignalsModal } from './components/BioSignalsModal';
import { ReportDocModal } from './components/ReportDocModal';
import { LiveDashboard } from './components/simulation/LiveDashboard';
import { ScenarioControlPanel } from './components/simulation/ScenarioControlPanel';
import { BreathingSessionModal } from './components/simulation/BreathingSessionModal';
import { EventLogPanel } from './components/simulation/EventLogPanel';
import { ArchitectureView } from './components/architecture/ArchitectureView';
import { GuidedDemoController } from './components/guided/GuidedDemoController';

import { CALMA_COMPONENTS } from './data/componentsData';
import { CameraPreset, ViewDisplayMode } from './types/cad';
import {
  DecisionLogEntry,
  GuidedStep,
  OperationalMode,
  PhysiologicalSample,
  ScenarioConfig,
  ScenarioId,
  SimulationState,
} from './types/simulation';
import { PhysiologicalSignalEngine, DEFAULT_SCENARIOS } from './simulation/signalEngine';
import { DecisionEvaluationResult, TransparentDecisionEngine } from './simulation/decisionEngine';

export default function App() {
  const viewportRef = useRef<Viewport3DHandle>(null);

  // Operational Mode State (Mode A, B, C, D)
  const [operationalMode, setOperationalMode] = useState<OperationalMode>('explorer');

  // Layout state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isPresentation, setIsPresentation] = useState(false);
  const [isWornMode, setIsWornMode] = useState(false);

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
    CALMA_COMPONENTS.forEach((c) => map.set(c.id, true));
    return map;
  });

  // Modals & Panels
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [isEventLogOpen, setIsEventLogOpen] = useState(false);

  // Guided Demo Tour State
  const [guidedStepIndex, setGuidedStepIndex] = useState(0);

  // ==========================================
  // Physiological Simulation Engine Instance
  // ==========================================
  const signalEngineRef = useRef<PhysiologicalSignalEngine>(new PhysiologicalSignalEngine('resting'));
  const decisionEngineRef = useRef<TransparentDecisionEngine>(new TransparentDecisionEngine());

  const [currentSample, setCurrentSample] = useState<PhysiologicalSample | null>(null);
  const [history, setHistory] = useState<PhysiologicalSample[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogEntry[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('resting');
  const [activeScenarioConfig, setActiveScenarioConfig] = useState<ScenarioConfig>(DEFAULT_SCENARIOS.resting);
  const [isSimPaused, setIsSimPaused] = useState(false);
  const [simTimeScale, setSimTimeScale] = useState(1.0);
  const [simClock, setSimClock] = useState(0);
  const [contactOverride, setContactOverride] = useState<number | null>(null);

  const [currentEvaluation, setCurrentEvaluation] = useState<DecisionEvaluationResult>({
    state: 'BASELINE_STABLE',
    stressScore: 20,
    explanation: 'System initialized. Resting physiological parameters within normal limits.',
    motionRejectionActive: false,
    hapticActive: false,
    ledColor: '#00f0d0',
    ledMode: 'solid',
    activeHardwareIds: ['esp32_board', 'max30102_sensor', 'grove_gsr_module'],
  });

  // Track previous state for logging state transitions
  const lastStateRef = useRef<SimulationState>('INITIALIZING');
  const isBreathingModalOpenRef = useRef(isBreathingModalOpen);
  isBreathingModalOpenRef.current = isBreathingModalOpen;

  // Simulation tick loop (runs at ~20 FPS with empty deps to avoid restarts)
  useEffect(() => {
    const engine = signalEngineRef.current;
    const decisionEngine = decisionEngineRef.current;

    const interval = setInterval(() => {
      // 50ms real time interval
      const sample = engine.tick(0.05);
      const evalResult = decisionEngine.evaluate(sample, engine.baseline, isBreathingModalOpenRef.current);

      setCurrentSample(sample);
      setCurrentEvaluation((prev) => {
        if (
          prev.state === evalResult.state &&
          prev.stressScore === evalResult.stressScore &&
          prev.ledColor === evalResult.ledColor &&
          prev.ledMode === evalResult.ledMode &&
          prev.hapticActive === evalResult.hapticActive &&
          prev.explanation === evalResult.explanation
        ) {
          return prev;
        }
        return evalResult;
      });
      setSimClock(sample.timestamp);

      // Update 3D model LED & haptics
      viewportRef.current?.setLedMode(evalResult.ledMode, evalResult.ledColor);
      if (evalResult.hapticActive && Math.random() < 0.1) {
        viewportRef.current?.triggerHapticVibration();
      }

      // Append to ring buffer history (max 80 samples for snappy smooth telemetry chart)
      setHistory((prev) => {
        const next = [...prev, sample];
        return next.length > 80 ? next.slice(next.length - 80) : next;
      });

      // Check for state transitions to log
      if (evalResult.state !== lastStateRef.current) {
        lastStateRef.current = evalResult.state;
        const newLog: DecisionLogEntry = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: sample.timestamp,
          category:
            evalResult.state === 'CALMING_INTERVENTION'
              ? 'intervention'
              : evalResult.state === 'MOTION_ARTIFACT'
              ? 'decision'
              : evalResult.state === 'POOR_SENSOR_CONTACT'
              ? 'sensor'
              : 'decision',
          state: evalResult.state,
          title: `State Transition: ${evalResult.state.replace(/_/g, ' ')}`,
          explanation: evalResult.explanation,
          metrics: {
            hr: Math.round(sample.heartRate),
            gsr: sample.gsrConductance,
            motion: sample.accelMagnitude,
            contact: sample.contactQuality,
          },
        };

        setDecisionLogs((prev) => [newLog, ...prev.slice(0, 199)]);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Handle Scenario Selection
  const handleSelectScenario = useCallback((id: ScenarioId, customConfig?: Partial<ScenarioConfig>) => {
    setActiveScenarioId(id);
    signalEngineRef.current.resetToScenario(id, customConfig);
    setActiveScenarioConfig(signalEngineRef.current.getActiveScenario());
  }, []);

  const handleTogglePlayPauseSim = useCallback(() => {
    const next = !isSimPaused;
    setIsSimPaused(next);
    signalEngineRef.current.setPaused(next);
  }, [isSimPaused]);

  const handleRestartSim = useCallback(() => {
    signalEngineRef.current.resetToScenario(activeScenarioId);
    setHistory([]);
  }, [activeScenarioId]);

  const handleSetTimeScale = useCallback((scale: number) => {
    setSimTimeScale(scale);
    signalEngineRef.current.setTimeScale(scale);
  }, []);

  const handleSetContactOverride = useCallback((val: number | null) => {
    setContactOverride(val);
    signalEngineRef.current.setContactQualityOverride(val);
  }, []);

  // 3D Scene Handlers
  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedId((prev) => (prev === id ? prev : id));
    viewportRef.current?.selectComponent(id);
    if (id && !showRightPanel) {
      setShowRightPanel(true);
    }
  }, [showRightPanel]);

  const handleHoverComponent = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setVisibilityMap((prev) => {
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
    setVisibilityMap((prev) => {
      const next = new Map(prev);
      CALMA_COMPONENTS.forEach((c) => next.set(c.id, true));
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
    setShowDimensions((prev) => {
      const next = !prev;
      viewportRef.current?.toggleDimensions(next);
      return next;
    });
  }, []);

  const handleTogglePresentation = useCallback(() => {
    setIsPresentation((prev) => {
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

  const handleToggleWornMode = useCallback(() => {
    setIsWornMode((prev) => {
      const next = !prev;
      viewportRef.current?.setWornMode(next);
      if (next) {
        // If worn on wrist, adjust camera angle
        viewportRef.current?.setCameraPreset('worn_forearm');
      } else {
        viewportRef.current?.setCameraPreset('assembled');
      }
      return next;
    });
  }, []);

  const handleHighlightHardware = useCallback((componentIds: string[]) => {
    viewportRef.current?.highlightComponents(componentIds);
  }, []);

  // Guided Step Application
  const handleApplyGuidedStep = useCallback((step: GuidedStep) => {
    if (step.cameraPreset) {
      handleSelectCameraPreset(step.cameraPreset as CameraPreset);
    }
    if (step.wornMode !== undefined) {
      setIsWornMode(step.wornMode);
      viewportRef.current?.setWornMode(step.wornMode);
    }
    if (step.explodeAmount !== undefined) {
      handleExplodeChange(step.explodeAmount);
    }
    if (step.viewMode) {
      handleSelectViewMode(step.viewMode);
    }
    if (step.highlightedComponents && step.highlightedComponents.length > 0) {
      viewportRef.current?.highlightComponents(step.highlightedComponents);
    } else {
      viewportRef.current?.clearMultiHighlights();
    }
    if (step.scenarioToTrigger) {
      handleSelectScenario(step.scenarioToTrigger);
    }
  }, [handleSelectCameraPreset, handleExplodeChange, handleSelectViewMode, handleSelectScenario]);

  const selectedComponentData = selectedId
    ? CALMA_COMPONENTS.find((c) => c.id === selectedId) || null
    : null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Top Header Bar with Mode Switcher & Worn Toggle */}
      <HeaderBar
        currentMode={operationalMode}
        onSelectMode={(mode) => {
          setOperationalMode(mode);
          if (mode === 'simulation' || mode === 'guided') {
            setIsWornMode(true);
            viewportRef.current?.setWornMode(true);
          } else if (mode === 'explorer') {
            viewportRef.current?.clearMultiHighlights();
          }
        }}
        isWornMode={isWornMode}
        onToggleWornMode={handleToggleWornMode}
        onResetView={handleResetView}
        onTogglePresentation={handleTogglePresentation}
        isPresentation={isPresentation}
        onTakeScreenshot={handleTakeScreenshot}
        onOpenDocModal={() => setIsDocModalOpen(true)}
        showLeftPanel={showLeftPanel}
        setShowLeftPanel={setShowLeftPanel}
        showRightPanel={showRightPanel}
        setShowRightPanel={setShowRightPanel}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Panel: In Mode A it's the AssemblyTree; In Mode B it's the Scenario Control Panel */}
        {showLeftPanel && operationalMode === 'explorer' && (
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

        {/* Central 3D Interactive Viewport with Mode-Specific Floating Overlays */}
        <main className="flex-1 relative h-full flex flex-col overflow-hidden">
          {/* Central 3D Viewport */}
          <div className="flex-1 relative w-full h-full">
            <Viewport3D
              ref={viewportRef}
              onSelectComponent={handleSelectComponent}
              onHoverComponent={handleHoverComponent}
              hoveredId={hoveredId}
              selectedId={selectedId}
              showDimensions={showDimensions}
            />

            {/* Mode A: CAD Explorer Bottom Dock */}
            {operationalMode === 'explorer' && (
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
            )}

            {/* Mode C: Architecture Floating Flowchart Drawer */}
            {operationalMode === 'architecture' && (
              <div className="absolute bottom-3 left-3 right-3 z-20 max-h-[48vh] overflow-y-auto">
                <ArchitectureView
                  onHighlightHardware={handleHighlightHardware}
                  onFocusComponent={handleFocusComponent}
                  onClose={() => setOperationalMode('explorer')}
                />
              </div>
            )}

            {/* Mode D: Guided Tour Floating Controller */}
            {operationalMode === 'guided' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
                <GuidedDemoController
                  currentStepIndex={guidedStepIndex}
                  onSetStepIndex={setGuidedStepIndex}
                  onApplyStep={handleApplyGuidedStep}
                  onClose={() => setOperationalMode('explorer')}
                />
              </div>
            )}
          </div>

          {/* Mode B: Digital Twin Simulation Dashboard & Scenario Controls */}
          {operationalMode === 'simulation' && (
            <div className="z-20 bg-slate-950/95 border-t border-slate-800 p-3 max-h-[50vh] overflow-y-auto flex flex-col gap-3 shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                  <LiveDashboard
                    currentSample={currentSample}
                    history={history}
                    baseline={signalEngineRef.current.baseline}
                    evaluation={currentEvaluation}
                    simTime={simClock}
                    timeScale={simTimeScale}
                    isPaused={isSimPaused}
                    onOpenBreathingModal={() => setIsBreathingModalOpen(true)}
                    onOpenEventLog={() => setIsEventLogOpen(true)}
                    onTogglePlayPause={handleTogglePlayPauseSim}
                    onSetContactOverride={handleSetContactOverride}
                    contactOverride={contactOverride}
                  />
                </div>
                <div className="lg:col-span-1">
                  <ScenarioControlPanel
                    activeScenarioId={activeScenarioId}
                    activeScenario={activeScenarioConfig}
                    onSelectScenario={handleSelectScenario}
                    isPaused={isSimPaused}
                    onTogglePlayPause={handleTogglePlayPauseSim}
                    onRestart={handleRestartSim}
                    timeScale={simTimeScale}
                    onSetTimeScale={handleSetTimeScale}
                    contactOverride={contactOverride}
                    onSetContactOverride={handleSetContactOverride}
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Component Inspector Panel (Visible in Mode A or whenever component is selected) */}
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

      {/* 4-7-8 Breathing Guide Modal */}
      {isBreathingModalOpen && (
        <BreathingSessionModal
          isOpen={isBreathingModalOpen}
          onClose={() => setIsBreathingModalOpen(false)}
          currentHR={currentSample ? currentSample.heartRate : 74}
          onHapticPulse={handleTriggerHaptic}
        />
      )}

      {/* Decision Engine & Telemetry Event Log Modal */}
      {isEventLogOpen && (
        <EventLogPanel
          isOpen={isEventLogOpen}
          onClose={() => setIsEventLogOpen(false)}
          logs={decisionLogs}
          onClearLogs={() => setDecisionLogs([])}
        />
      )}

      {/* SolidWorks CAD Design Report Documentation Modal */}
      {isDocModalOpen && (
        <ReportDocModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
        />
      )}

      {/* BioSignals Modal if opened */}
      {isBioModalOpen && (
        <BioSignalsModal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
          onTriggerHaptic={handleTriggerHaptic}
          onSetLedColor={handleSetLedColor}
        />
      )}
    </div>
  );
}
