import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Tag,
} from 'lucide-react';

interface PlaybackBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  canPrev: boolean;
  canNext: boolean;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  currentStepLabel: string;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  isPlaying,
  onTogglePlay,
  onPrevStep,
  onNextStep,
  onReset,
  canPrev,
  canNext,
  speed,
  onChangeSpeed,
  showLabels,
  onToggleLabels,
  currentStepLabel,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/70">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevStep}
          disabled={!canPrev}
          aria-label="Previous step"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1D4ED8] text-white text-sm font-medium hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          disabled={!canNext}
          aria-label="Next step"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label="Reset current scene"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="text-xs font-mono tabular-nums text-slate-600 hidden sm:block truncate max-w-[260px]">
        {currentStepLabel}
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center p-0.5 rounded-lg bg-slate-200/70"
          role="group"
          aria-label="Playback speed"
        >
          {[0.5, 1, 1.5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangeSpeed(s)}
              className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md transition-colors whitespace-nowrap shrink-0 ${
                speed === s
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleLabels}
          aria-pressed={showLabels}
          className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            showLabels
              ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A]'
              : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Labels: {showLabels ? 'On' : 'Off'}</span>
        </button>
      </div>
    </div>
  );
};
