import React from 'react';
import { CalloutPin, COLORS, PolarityTag } from '../MolecularPrimitives';
import { PARENTAL_TOP_STRAND, PARENTAL_BOTTOM_STRAND } from '../../simulation/dnaModel';

interface SceneProps {
  subStepIndex: number;
  progress: number;
  showLabels: boolean;
  highlightedId: string | null;
  onSelectFocus: (id: string) => void;
}

export const Scene3Unwinding: React.FC<SceneProps> = ({
  subStepIndex,
  progress,
  showLabels,
  highlightedId,
  onSelectFocus,
}) => {
  // Fork advances slightly with progress (0..1)
  const forkShift = progress * 34;
  const forkX = 435 + forkShift;
  const ssbVisible = subStepIndex >= 2 || progress > 0.35;
  const topoActive = subStepIndex >= 1 || progress > 0.15;

  // Exposed unpaired bases on left (indices 0..5), paired ahead on right (indices 6..10)
  const splitX = forkX;

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-full select-none"
      role="img"
      aria-label="Scene 3: Initiation and DNA unwinding at the Y-shaped replication fork"
    >
      <rect width="920" height="500" fill="#FFFFFF" />

      <text
        x={32}
        y={36}
        fill="#0F172A"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight={700}
        fontSize={15}
      >
        Initiation &amp; Y-Shaped Replication Fork Unwinding
      </text>
      <text
        x={32}
        y={56}
        fill="#475569"
        fontFamily="DM Sans, sans-serif"
        fontSize={12}
      >
        Helicase unzips hydrogen bonds · Topoisomerase relieves supercoiling · SSBs stabilize single strands
      </text>

      {/* Replication Fork Region Bracket */}
      <path
        d={`M ${forkX - 110} 118 Q ${forkX - 25} 145 ${forkX + 20} 214 L ${forkX + 20} 296 Q ${forkX - 25} 365 ${forkX - 110} 392`}
        fill="#F1F5F9"
        fillOpacity={0.55}
        stroke={highlightedId === 'fork' ? '#0284C7' : '#CBD5E1'}
        strokeWidth={highlightedId === 'fork' ? 2 : 1}
        strokeDasharray="6 4"
      />

      {/* Y-Shaped Parental DNA Strands */}
      {/* Upper Parental Strand: 3' (left) to 5' (right) or 5'->3' */}
      <path
        d={`M 70 132 L 260 132 C 345 132, ${forkX - 35} 218, ${forkX + 18} 218 L 835 218`}
        fill="none"
        stroke={COLORS.parental}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Lower Parental Strand */}
      <path
        d={`M 70 378 L 260 378 C 345 378, ${forkX - 35} 292, ${forkX + 18} 292 L 835 292`}
        fill="none"
        stroke={COLORS.parental}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* Positive Supercoiling Wave Ahead of Fork (Right Side) */}
      <g opacity={topoActive ? 1 : 0.75}>
        <path
          d="M 655 218 C 682 190, 712 318, 742 218 C 765 190, 795 318, 825 255"
          fill="none"
          stroke="#1D4ED8"
          strokeWidth={2.5}
          strokeDasharray="4 4"
          opacity={0.45}
        />
      </g>

      {/* Exposed Unpaired Bases on Separated Arms */}
      {[0, 1, 2, 3, 4].map((idx) => {
        const bx = 115 + idx * 52;
        const topBase = PARENTAL_TOP_STRAND[idx];
        const botBase = PARENTAL_BOTTOM_STRAND[idx];
        const armProgress = Math.max(0, (bx - 260) / (forkX - 260));
        const topY = bx <= 260 ? 132 : 132 + armProgress * 70;
        const botY = bx <= 260 ? 378 : 378 - armProgress * 70;

        return (
          <g key={`exp-${idx}`}>
            <rect x={bx - 12} y={topY + 4} width={24} height={22} rx={4} fill="#DBEAFE" stroke="#2563EB" strokeWidth={1.3} />
            <text x={bx} y={topY + 15} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#1E3A8A">
              {topBase}
            </text>

            <rect x={bx - 12} y={botY - 26} width={24} height={22} rx={4} fill="#DBEAFE" stroke="#2563EB" strokeWidth={1.3} />
            <text x={bx} y={botY - 15} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#1E3A8A">
              {botBase}
            </text>
          </g>
        );
      })}

      {/* Intact Paired Bases Ahead of Helicase (Right Side) */}
      {[6, 7, 8, 9, 10].map((idx) => {
        const bx = splitX + 65 + (idx - 6) * 56;
        if (bx > 815) return null;
        const topBase = PARENTAL_TOP_STRAND[idx];
        const botBase = PARENTAL_BOTTOM_STRAND[idx];

        return (
          <g key={`paired-${idx}`}>
            <rect x={bx - 12} y={222} width={24} height={22} rx={4} fill="#DBEAFE" stroke="#2563EB" strokeWidth={1.3} />
            <text x={bx} y={233} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#1E3A8A">
              {topBase}
            </text>
            <line x1={bx} y1={245} x2={bx} y2={265} stroke="#64748B" strokeWidth={1.5} strokeDasharray="2.5 2.5" />
            <rect x={bx - 12} y={266} width={24} height={22} rx={4} fill="#E0E7FF" stroke="#4F46E5" strokeWidth={1.3} />
            <text x={bx} y={277} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#312E81">
              {botBase}
            </text>
          </g>
        );
      })}

      {/* Single-Stranded Binding Proteins (SSBs) */}
      <g opacity={ssbVisible ? 1 : 0.25} style={{ transition: 'opacity 250ms ease' }}>
        {[140, 196, 252].map((sx, i) => (
          <g key={`ssb-top-${i}`}>
            <circle
              cx={sx}
              cy={118}
              r={14}
              fill="#FDE68A"
              stroke={highlightedId === 'ssb' ? '#B45309' : '#D97706'}
              strokeWidth={highlightedId === 'ssb' ? 2.4 : 1.5}
            />
            <text
              x={sx}
              y={118}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={9}
              fontFamily="IBM Plex Mono, monospace"
              fontWeight={600}
              fill="#78350F"
            >
              SSB
            </text>

            <circle
              cx={sx}
              cy={392}
              r={14}
              fill="#FDE68A"
              stroke={highlightedId === 'ssb' ? '#B45309' : '#D97706'}
              strokeWidth={highlightedId === 'ssb' ? 2.4 : 1.5}
            />
            <text
              x={sx}
              y={392}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={9}
              fontFamily="IBM Plex Mono, monospace"
              fontWeight={600}
              fill="#78350F"
            >
              SSB
            </text>
          </g>
        ))}
      </g>

      {/* Helicase Hexamer Wedge at Replication Fork Apex */}
      <g
        transform={`translate(${forkX}, 255)`}
        onClick={() => onSelectFocus('helicase')}
        className="cursor-pointer"
      >
        <polygon
          points="-32,-38 24,-24 38,0 24,24 -32,38 -16,0"
          fill="#CCFBF1"
          stroke={highlightedId === 'helicase' ? '#0F766E' : '#0D9488'}
          strokeWidth={highlightedId === 'helicase' ? 3 : 2}
        />
        <text
          x={2}
          y={-3}
          textAnchor="middle"
          fontSize={11}
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight={700}
          fill="#115E59"
        >
          Helicase
        </text>
        <text
          x={2}
          y={11}
          textAnchor="middle"
          fontSize={9}
          fontFamily="IBM Plex Mono, monospace"
          fill="#0F766E"
        >
          unwinds →
        </text>
      </g>

      {/* Topoisomerase / DNA Gyrase Ahead of the Fork */}
      <g
        transform="translate(736, 255)"
        opacity={topoActive ? 1 : 0.4}
        onClick={() => onSelectFocus('topoisomerase')}
        className="cursor-pointer"
        style={{ transition: 'opacity 250ms ease' }}
      >
        <ellipse
          cx={0}
          cy={0}
          rx={44}
          ry={54}
          fill="#EDE9FE"
          fillOpacity={0.92}
          stroke={highlightedId === 'topoisomerase' ? '#6D28D9' : '#7C3AED'}
          strokeWidth={highlightedId === 'topoisomerase' ? 3 : 2}
        />
        <text
          x={0}
          y={-8}
          textAnchor="middle"
          fontSize={10.5}
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight={700}
          fill="#4C1D95"
        >
          Topoisomerase
        </text>
        <text
          x={0}
          y={7}
          textAnchor="middle"
          fontSize={9.5}
          fontFamily="DM Sans, sans-serif"
          fill="#5B21B6"
        >
          (DNA Gyrase)
        </text>
        <text
          x={0}
          y={22}
          textAnchor="middle"
          fontSize={8.5}
          fontFamily="IBM Plex Mono, monospace"
          fill="#6D28D9"
        >
          relieves strain
        </text>
      </g>

      {/* Polarity Tags */}
      <PolarityTag x={48} y={132} label="5'" />
      <PolarityTag x={858} y={218} label="3'" />
      <PolarityTag x={48} y={378} label="3'" />
      <PolarityTag x={858} y={292} label="5'" />

      {/* Callout Labels */}
      <CalloutPin
        anchorX={196}
        anchorY={104}
        labelX={185}
        labelY={82}
        text="Single-stranded binding proteins (SSBs)"
        subtext="Prevent premature reannealing"
        accent="amber"
        visible={showLabels}
        highlighted={highlightedId === 'ssb'}
        onSelect={() => onSelectFocus('ssb')}
      />

      <CalloutPin
        anchorX={forkX - 6}
        anchorY={218}
        labelX={445}
        labelY={120}
        text="Helicase"
        subtext="Breaks hydrogen bonds"
        accent="emerald"
        visible={showLabels}
        highlighted={highlightedId === 'helicase'}
        onSelect={() => onSelectFocus('helicase')}
      />

      <CalloutPin
        anchorX={736}
        anchorY={200}
        labelX={736}
        labelY={104}
        text="Topoisomerase / DNA Gyrase"
        subtext="Reduces torsional strain & supercoiling"
        accent="slate"
        visible={showLabels}
        highlighted={highlightedId === 'topoisomerase'}
        onSelect={() => onSelectFocus('topoisomerase')}
      />

      <CalloutPin
        anchorX={forkX - 50}
        anchorY={355}
        labelX={460}
        labelY={436}
        text="Replication fork (Y-shaped region)"
        subtext="Zone where parental DNA unwinds into templates"
        accent="cobalt"
        visible={showLabels}
        highlighted={highlightedId === 'fork'}
        onSelect={() => onSelectFocus('fork')}
      />
    </svg>
  );
};
