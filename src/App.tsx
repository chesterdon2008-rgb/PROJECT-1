import React, { useEffect, useRef, useState } from 'react';
import { SCENES, type SceneId } from './simulation/dnaModel';
import { Scene1Intro } from './components/scenes/Scene1Intro';
import { Scene2BasePairing } from './components/scenes/Scene2BasePairing';
import { Scene3Unwinding } from './components/scenes/Scene3Unwinding';
import { Scene4Synthesis } from './components/scenes/Scene4Synthesis';
import { Scene5LeadingLagging } from './components/scenes/Scene5LeadingLagging';
import { Scene6Outcome } from './components/scenes/Scene6Outcome';
import { Scene7MMR } from './components/scenes/Scene7MMR';
import { ConceptDeck } from './components/ConceptDeck';
import { PlaybackBar } from './components/PlaybackBar';

export default function App() {
  const [sceneIndex, setSceneIndex] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('scene');
    if (requested) {
      const idx = SCENES.findIndex((s) => s.id === requested);
      if (idx >= 0) return idx;
    }
    if (params.get('autostart') === '1') {
      return 6; // Jump directly to Target MMR if autostart=1? Or Scene 1
    }
    return 0;
  });

  const [subStepIndex, setSubStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const currentScene = SCENES[sceneIndex];
  const subStepCount = currentScene.subSteps.length;

  // Animation loop when playing
  const lastTimeRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    let rafId = 0;
    const stepDurationMs = 3200 / speed;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setProgress((prev) => {
        const next = prev + dt / stepDurationMs;
        if (next >= 1) {
          // Advance sub-step or next scene
          if (subStepIndex < subStepCount - 1) {
            setSubStepIndex((s) => s + 1);
            return 0;
          } else if (sceneIndex < SCENES.length - 1) {
            setSceneIndex((sc) => sc + 1);
            setSubStepIndex(0);
            setHighlightedId(null);
            return 0;
          } else {
            setIsPlaying(false);
            return 1;
          }
        }
        return next;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, speed, subStepIndex, subStepCount, sceneIndex]);

  const selectScene = (id: SceneId) => {
    const idx = SCENES.findIndex((s) => s.id === id);
    if (idx >= 0) {
      setSceneIndex(idx);
      setSubStepIndex(0);
      setProgress(0);
      setHighlightedId(null);
    }
  };

  const handleSelectSubStep = (idx: number) => {
    setSubStepIndex(idx);
    setProgress(0.45);
    setHighlightedId(null);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (subStepIndex > 0) {
      setSubStepIndex((s) => s - 1);
      setProgress(0);
    } else if (sceneIndex > 0) {
      const prevScene = SCENES[sceneIndex - 1];
      setSceneIndex((sc) => sc - 1);
      setSubStepIndex(prevScene.subSteps.length - 1);
      setProgress(0);
      setHighlightedId(null);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (subStepIndex < subStepCount - 1) {
      setSubStepIndex((s) => s + 1);
      setProgress(0);
    } else if (sceneIndex < SCENES.length - 1) {
      setSceneIndex((sc) => sc + 1);
      setSubStepIndex(0);
      setProgress(0);
      setHighlightedId(null);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSubStepIndex(0);
    setProgress(0);
    setHighlightedId(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStep();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const canPrev = sceneIndex > 0 || subStepIndex > 0;
  const canNext =
    sceneIndex < SCENES.length - 1 || subStepIndex < subStepCount - 1;

  const renderStage = () => {
    const commonProps = {
      subStepIndex,
      progress,
      showLabels,
      highlightedId,
      onSelectFocus: (id: string) =>
        setHighlightedId((prev) => (prev === id ? null : id)),
    };

    switch (currentScene.id) {
      case 'scene1':
        return <Scene1Intro {...commonProps} />;
      case 'scene2':
        return <Scene2BasePairing {...commonProps} />;
      case 'scene3':
        return <Scene3Unwinding {...commonProps} />;
      case 'scene4':
        return <Scene4Synthesis {...commonProps} />;
      case 'scene5':
        return <Scene5LeadingLagging {...commonProps} />;
      case 'scene6':
        return (
          <Scene6Outcome
            {...commonProps}
            onLaunchMMR={() => selectScene('mmr')}
          />
        );
      case 'mmr':
        return <Scene7MMR {...commonProps} />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]"
      data-active-scene={currentScene.id}
      data-active-substep={subStepIndex}
    >
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#simulation-stage"
            className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
          >
            HelixLab
          </a>

          <nav
            aria-label="Curriculum sections"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => selectScene('scene1')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentScene.id === 'scene1' ? 'text-[#1D4ED8] font-semibold' : ''
              }`}
            >
              Introduction
            </button>
            <button
              type="button"
              onClick={() => selectScene('scene2')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentScene.id === 'scene2' ? 'text-[#1D4ED8] font-semibold' : ''
              }`}
            >
              Base Pairing
            </button>
            <button
              type="button"
              onClick={() => selectScene('scene3')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                ['scene3', 'scene4', 'scene5', 'scene6'].includes(currentScene.id)
                  ? 'text-[#1D4ED8] font-semibold'
                  : ''
              }`}
            >
              Replication Fork
            </button>
            <button
              type="button"
              onClick={() => selectScene('mmr')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentScene.id === 'mmr' ? 'text-[#DC2626] font-semibold' : ''
              }`}
            >
              Mismatch Repair
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0"
            >
              {isPlaying ? 'Pause Simulation' : 'Start Simulation'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main
        id="simulation-stage"
        className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Scene Selector Rail */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Simulation scenes"
            className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto"
          >
            {SCENES.map((scene) => {
              const isActive = scene.id === currentScene.id;
              const isMMR = scene.id === 'mmr';
              return (
                <button
                  key={scene.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectScene(scene.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? isMMR
                        ? 'bg-[#DC2626] text-white shadow-xs font-semibold'
                        : 'bg-white text-slate-900 shadow-xs font-semibold'
                      : isMMR
                        ? 'text-[#991B1B] hover:bg-white/60'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {scene.shortTitle}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2 whitespace-nowrap shrink-0">
            <span>Topic: Mismatch Repair (MMR)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">G–T Mismatch Correction</span>
          </div>
        </div>

        {/* Two-Zone Sandbox Split: Stage (Left) + Concept & Enzyme Deck (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_370px] gap-5 items-stretch">
          <section
            aria-label="Molecular simulation stage"
            className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <div
              data-testid="molecular-stage"
              className="relative w-full aspect-[920/500] bg-white"
            >
              {renderStage()}
            </div>

            <PlaybackBar
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              onReset={handleReset}
              canPrev={canPrev}
              canNext={canNext}
              speed={speed}
              onChangeSpeed={setSpeed}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels((l) => !l)}
              currentStepLabel={
                currentScene.subSteps[subStepIndex]?.label ?? ''
              }
            />
          </section>

          <ConceptDeck
            scene={currentScene}
            subStepIndex={subStepIndex}
            onSelectSubStep={handleSelectSubStep}
            highlightedId={highlightedId}
            onHighlightId={setHighlightedId}
            onGoToNextScene={() => {
              if (sceneIndex < SCENES.length - 1) {
                setSceneIndex((sc) => sc + 1);
                setSubStepIndex(0);
                setProgress(0);
                setHighlightedId(null);
              }
            }}
            onGoToMMR={() => selectScene('mmr')}
            hasNextScene={sceneIndex < SCENES.length - 1}
          />
        </div>
      </main>
    </div>
  );
}
