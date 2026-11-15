import React from 'react';
import {
  PARENTAL_TOP_STRAND,
  PARENTAL_BOTTOM_STRAND,
  getHydrogenBondCount,
} from '../../simulation/dnaModel';
import {
  CalloutPin,
  COLORS,
  HydrogenBonds,
  NucleotideBlock,
  PolarityTag,
} from '../MolecularPrimitives';

interface SceneProps {
  subStepIndex: number;
  progress: number;
  showLabels: boolean;
  highlightedId: string | null;
  onSelectFocus: (id: string) => void;
}

export const Scene2BasePairing: React.FC<SceneProps> = ({
  subStepIndex,
  showLabels,
  highlightedId,
  onSelectFocus,
}) => {
  const startX = 140;
  const stepX = 64;
  const topBackboneY = 172;
  const bottomBackboneY = 328;

  const filterMode: 'all' | 'AT' | 'GC' =
    subStepIndex === 1 ? 'AT' : subStepIndex === 2 ? 'GC' : 'all';

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-full select-none"
      role="img"
      aria-label="Scene 2: Normal DNA complementary base pairing with 5'-ATGCCATGACT-3' and 3'-TACGGTACTGA-5'"
    >
      <rect width="920" height="500" fill="#FFFFFF" />

      {/* Top Header Strip */}
      <text
        x={32}
        y={36}
        fill="#0F172A"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight={700}
        fontSize={15}
      >
        Parental DNA Duplex · Exact Sequence &amp; Antiparallel Polarity
      </text>
      <text
        x={32}
        y={56}
        fill="#475569"
        fontFamily="IBM Plex Mono, monospace"
        fontSize={12}
      >
        Top: 5&apos;-A T G C C A T G A C T-3&apos;   ·   Bottom: 3&apos;-T A C G G T A C T G A-5&apos;
      </text>

      {/* Antiparallel Direction Arrows */}
      <g>
        {/* Top 5' -> 3' arrow */}
        <line
          x1={115}
          y1={124}
          x2={805}
          y2={124}
          stroke={highlightedId === 'antiparallel' ? '#0284C7' : '#1D4ED8'}
          strokeWidth={highlightedId === 'antiparallel' ? 2.5 : 1.75}
        />
        <polygon
          points="800,119 812,124 800,129"
          fill={highlightedId === 'antiparallel' ? '#0284C7' : '#1D4ED8'}
        />
        <text
          x={460}
          y={114}
          textAnchor="middle"
          fill="#1E3A8A"
          fontFamily="IBM Plex Mono, monospace"
          fontWeight={600}
          fontSize={11.5}
        >
          5&apos; → 3&apos; Direction (Parental Top Strand)
        </text>

        {/* Bottom 3' <- 5' arrow */}
        <line
          x1={115}
          y1={376}
          x2={805}
          y2={376}
          stroke={highlightedId === 'antiparallel' ? '#0284C7' : '#1D4ED8'}
          strokeWidth={highlightedId === 'antiparallel' ? 2.5 : 1.75}
        />
        <polygon
          points="120,371 108,376 120,381"
          fill={highlightedId === 'antiparallel' ? '#0284C7' : '#1D4ED8'}
        />
        <text
          x={460}
          y={396}
          textAnchor="middle"
          fill="#1E3A8A"
          fontFamily="IBM Plex Mono, monospace"
          fontWeight={600}
          fontSize={11.5}
        >
          3&apos; ← 5&apos; Antiparallel Orientation (Parental Bottom Strand)
        </text>
      </g>

      {/* Sugar-Phosphate Backbones */}
      <line
        x1={108}
        y1={topBackboneY}
        x2={812}
        y2={topBackboneY}
        stroke={highlightedId === 'backbone' ? '#0284C7' : COLORS.parental}
        strokeWidth={highlightedId === 'backbone' ? 9 : 7}
        strokeLinecap="round"
      />
      <line
        x1={108}
        y1={bottomBackboneY}
        x2={812}
        y2={bottomBackboneY}
        stroke={highlightedId === 'backbone' ? '#0284C7' : COLORS.parental}
        strokeWidth={highlightedId === 'backbone' ? 9 : 7}
        strokeLinecap="round"
      />

      {/* 5' and 3' End Badges */}
      <PolarityTag x={86} y={topBackboneY} label="5'" color={highlightedId === 'ends' ? '#0284C7' : COLORS.parental} />
      <PolarityTag x={834} y={topBackboneY} label="3'" color={highlightedId === 'ends' ? '#0284C7' : COLORS.parental} />
      <PolarityTag x={86} y={bottomBackboneY} label="3'" color={highlightedId === 'ends' ? '#0284C7' : COLORS.parental} />
      <PolarityTag x={834} y={bottomBackboneY} label="5'" color={highlightedId === 'ends' ? '#0284C7' : COLORS.parental} />

      {/* 11 Base Pairs + Sugar Pentagons + Phosphate Dots + Hydrogen Bonds */}
      {PARENTAL_TOP_STRAND.map((topBase, i) => {
        const bottomBase = PARENTAL_BOTTOM_STRAND[i];
        const x = startX + i * stepX;
        const bonds = getHydrogenBondCount(topBase, bottomBase);
        const isAT = topBase === 'A' || topBase === 'T';
        const isGC = topBase === 'G' || topBase === 'C';
        const dimmed =
          (filterMode === 'AT' && !isAT) || (filterMode === 'GC' && !isGC);

        const topH = topBase === 'A' || topBase === 'G' ? 46 : 36;
        const botH = bottomBase === 'A' || bottomBase === 'G' ? 46 : 36;

        return (
          <g key={i}>
            {/* Sugar & Phosphate nodes on backbone */}
            <circle cx={x - 24} cy={topBackboneY} r={5} fill="#FFFFFF" stroke={COLORS.parental} strokeWidth={2} />
            <rect x={x - 6} y={topBackboneY - 6} width={12} height={12} rx={2} fill="#DBEAFE" stroke={COLORS.parental} strokeWidth={1.5} />

            <circle cx={x - 24} cy={bottomBackboneY} r={5} fill="#FFFFFF" stroke={COLORS.parental} strokeWidth={2} />
            <rect x={x - 6} y={bottomBackboneY - 6} width={12} height={12} rx={2} fill="#DBEAFE" stroke={COLORS.parental} strokeWidth={1.5} />

            {/* Top Base */}
            <NucleotideBlock
              x={x}
              y={topBackboneY + 7}
              base={topBase}
              direction="down"
              height={topH}
              dimmed={dimmed}
              onClick={() => onSelectFocus('bases')}
            />

            {/* Hydrogen Bonds */}
            <g opacity={dimmed ? 0.2 : 1}>
              <HydrogenBonds
                x={x}
                y1={topBackboneY + 7 + topH + 3}
                y2={bottomBackboneY - 7 - botH - 3}
                count={bonds}
                highlighted={
                  (filterMode === 'AT' && isAT) ||
                  (filterMode === 'GC' && isGC) ||
                  highlightedId === 'at-pair' ||
                  highlightedId === 'gc-pair'
                }
              />
            </g>

            {/* Bottom Base */}
            <NucleotideBlock
              x={x}
              y={bottomBackboneY - 7}
              base={bottomBase}
              direction="up"
              height={botH}
              dimmed={dimmed}
              onClick={() => onSelectFocus('bases')}
            />

            {/* Position index */}
            <text
              x={x}
              y={352}
              textAnchor="middle"
              fontSize={10}
              fontFamily="IBM Plex Mono, monospace"
              fill="#94A3B8"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Required Labels via non-overlapping CalloutPins */}
      <CalloutPin
        anchorX={204}
        anchorY={topBackboneY}
        labelX={200}
        labelY={86}
        text="Sugar-phosphate backbone"
        accent="cobalt"
        visible={showLabels}
        highlighted={highlightedId === 'backbone'}
        onSelect={() => onSelectFocus('backbone')}
      />

      <CalloutPin
        anchorX={524}
        anchorY={198}
        labelX={524}
        labelY={86}
        text="Nitrogenous bases"
        subtext="A=T (2 H-bonds) · G≡C (3 H-bonds)"
        accent="slate"
        visible={showLabels}
        highlighted={highlightedId === 'bases'}
        onSelect={() => onSelectFocus('bases')}
      />

      <CalloutPin
        anchorX={834}
        anchorY={topBackboneY}
        labelX={790}
        labelY={86}
        text="5' and 3' ends"
        accent="cobalt"
        visible={showLabels}
        highlighted={highlightedId === 'ends'}
        onSelect={() => onSelectFocus('ends')}
      />

      <CalloutPin
        anchorX={140}
        anchorY={bottomBackboneY}
        labelX={160}
        labelY={442}
        text="Parental strands"
        accent="cobalt"
        visible={showLabels}
        highlighted={highlightedId === 'parental'}
        onSelect={() => onSelectFocus('parental')}
      />

      <CalloutPin
        anchorX={460}
        anchorY={376}
        labelX={460}
        labelY={442}
        text="Antiparallel orientation"
        subtext="Opposite 5'→3' and 3'←5' directions"
        accent="slate"
        visible={showLabels}
        highlighted={highlightedId === 'antiparallel'}
        onSelect={() => onSelectFocus('antiparallel')}
      />

      {/* Compact Bond Legend */}
      <g transform="translate(650, 426)">
        <rect x={0} y={0} width={236} height={44} rx={8} fill="#F8FAFC" stroke="#E2E8F0" />
        <text x={14} y={18} fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#1E3A8A">
          A = T : 2 hydrogen bonds
        </text>
        <text x={14} y={34} fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#065F46">
          G ≡ C : 3 hydrogen bonds
        </text>
      </g>
    </svg>
  );
};
