import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { SceneDefinition } from '../simulation/dnaModel';

interface ConceptDeckProps {
  scene: SceneDefinition;
  subStepIndex: number;
  onSelectSubStep: (index: number) => void;
  highlightedId: string | null;
  onHighlightId: (id: string | null) => void;
  onGoToNextScene: () => void;
  onGoToMMR: () => void;
  hasNextScene: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  structure: 'Structure',
  enzyme: 'Enzyme',
  strand: 'Strand',
  repair: 'MMR Mechanism',
};

export const ConceptDeck: React.FC<ConceptDeckProps> = ({
  scene,
  subStepIndex,
  onSelectSubStep,
  highlightedId,
  onHighlightId,
  onGoToNextScene,
  onGoToMMR,
  hasNextScene,
}) => {
  const activeSubStep = scene.subSteps[subStepIndex] ?? scene.subSteps[0];

  return (
    <aside
      aria-label="Concept and enzyme inspector"
      className="flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-4 sm:p-5 gap-4 lg:max-h-[612px] lg:overflow-y-auto"
    >
      <div className="space-y-5">
        {/* Scene Heading */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <div className="text-xs font-medium text-[#1D4ED8] tracking-normal">
            {scene.kicker}
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {scene.title}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {scene.description}
          </p>
        </div>

        {/* Interactive Stage Steps */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Stage Progression</span>
            <span className="font-mono tabular-nums">
              Step {subStepIndex + 1} / {scene.subSteps.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {scene.subSteps.map((step, idx) => {
              const active = idx === subStepIndex;
              const completed = idx < subStepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectSubStep(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    active
                      ? 'border-[#1D4ED8] bg-[#EFF6FF]/70 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">{step.label}</span>
                    {completed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    )}
                  </div>
                  {active && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {step.summary}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Click-to-Highlight Molecular Glossary */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Key Components (Click to Highlight)</span>
            {highlightedId && (
              <button
                type="button"
                onClick={() => onHighlightId(null)}
                className="text-[#1D4ED8] hover:underline font-medium"
              >
                Clear focus
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {scene.annotations.map((item) => {
              const isFocused =
                highlightedId === item.id ||
                activeSubStep.focusIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onHighlightId(highlightedId === item.id ? null : item.id)
                  }
                  onMouseEnter={() => onHighlightId(item.id)}
                  onMouseLeave={() => onHighlightId(null)}
                  className={`w-full text-left px-3 py-2.5 transition-colors ${
                    highlightedId === item.id
                      ? 'bg-[#EFF6FF]'
                      : isFocused
                        ? 'bg-slate-50'
                        : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      {item.term}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      {CATEGORY_LABEL[item.category]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 leading-snug">
                    {item.role}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Next Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {scene.id !== 'mmr' ? (
          <>
            <button
              type="button"
              onClick={onGoToMMR}
              className="text-xs font-medium text-[#DC2626] hover:underline whitespace-nowrap shrink-0"
            >
              Jump to MMR Target
            </button>
            {hasNextScene && (
              <button
                type="button"
                onClick={onGoToNextScene}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Next Scene</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-[#059669]">MMR Complete:</span>{' '}
            Restored G≡C base pair prevents permanent mutation.
          </div>
        )}
      </div>
    </aside>
  );
};
