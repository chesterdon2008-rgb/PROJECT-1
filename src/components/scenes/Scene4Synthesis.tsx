import React from 'react';
import { PARENTAL_BOTTOM_STRAND, getComplementaryBase } from '../../simulation/dnaModel';
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

export const Scene4Synthesis: React.FC<SceneProps> = ({
  subStepIndex,
  progress,
  showLabels,
  highlightedId,
  onSelectFocus,
}) => {
  // Template strand runs 3' -> 5' left to right: 3'-T A C G G T A C T G A-5'
  // New strand is synthesized 5' -> 3' left to right:
  // Indices 0..2 = RNA primer (A, U, G) laid by Primase
  // Indices 3..10 = Newly synthesized DNA (C, C, A, T, G, A, C, T) extended by DNA Polymerase
  const startX = 135;
  const stepX = 64;
  const templateY = 326;
  const newY = 178;

  // How many bases are synthesized so far
  const activeCount =
    subStepIndex === 0
      ? Math.max(1, Math.min(3, Math.round(1 + progress * 2)))
      : Math.max(4, Math.min(11, Math.round(4 + progress * 7)));

  const polIndex = Math.min(10, Math.max(3, activeCount - 1));
  const polX = startX + polIndex * stepX;

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-full select-none"
      role="img"
      aria-label="Scene 4: Primase synthesizing RNA primer and DNA Polymerase extending 5' to 3'"
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
        Primer Formation &amp; 5&apos; → 3&apos; DNA Synthesis
      </text>
      <text
        x={32}
        y={56}
        fill="#475569"
        fontFamily="DM Sans, sans-serif"
        fontSize={12}
      >
        DNA polymerase reads template 3&apos;→5&apos; and extends from the RNA primer&apos;s 3&apos;-OH strictly 5&apos;→3&apos;
      </text>

      {/* Directional Polarity Banner Arrows */}
      <g>
        <line
          x1={130}
          y1={122}
          x2={790}
          y2={122}
          stroke={highlightedId === 'direction' ? '#0284C7' : COLORS.newStrand}
          strokeWidth={highlightedId === 'direction' ? 2.6 : 2}
        />
        <polygon points="785,117 798,122 785,127" fill={highlightedId === 'direction' ? '#0284C7' : COLORS.newStrand} />
        <text
          x={460}
          y={110}
          textAnchor="middle"
          fill="#065F46"
          fontFamily="IBM Plex Mono, monospace"
          fontWeight={600}
          fontSize={11.5}
        >
          New strand synthesized 5&apos; → 3&apos; (adding dNTPs to free 3&apos;-OH)
        </text>
      </g>

      {/* Template Strand (3' -> 5' left to right) */}
      <line
        x1={105}
        y1={templateY}
        x2={815}
        y2={templateY}
        stroke={highlightedId === 'template' ? '#0284C7' : COLORS.parental}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <PolarityTag x={82} y={templateY} label="3'" color={COLORS.parental} />
      <PolarityTag x={838} y={templateY} label="5'" color={COLORS.parental} />

      <text
        x={460}
        y={394}
        textAnchor="middle"
        fill="#1E3A8A"
        fontFamily="IBM Plex Mono, monospace"
        fontWeight={600}
        fontSize={11.5}
      >
        DNA polymerase reads Template Strand in 3&apos; → 5&apos; direction
      </text>

      {/* Growing RNA Primer + New DNA Backbone */}
      {activeCount >= 1 && (
        <line
          x1={startX - 24}
          y1={newY}
          x2={startX + (Math.min(3, activeCount) - 1) * stepX + 20}
          y2={newY}
          stroke={COLORS.rnaPrimer}
          strokeWidth={7}
          strokeLinecap="round"
        />
      )}
      {activeCount > 3 && (
        <line
          x1={startX + 2 * stepX + 20}
          y1={newY}
          x2={startX + (activeCount - 1) * stepX + 18}
          y2={newY}
          stroke={COLORS.newStrand}
          strokeWidth={7}
          strokeLinecap="round"
        />
      )}

      {activeCount >= 1 && <PolarityTag x={82} y={newY} label="5'" color={COLORS.rnaPrimer} />}
      {activeCount >= 1 && (
        <PolarityTag
          x={startX + (activeCount - 1) * stepX + 42}
          y={newY}
          label="3'"
          color={activeCount > 3 ? COLORS.newStrand : COLORS.rnaPrimer}
        />
      )}

      {/* Template & Synthesized Bases */}
      {PARENTAL_BOTTOM_STRAND.map((tBase, i) => {
        const x = startX + i * stepX;
        const isPrimer = i < 3;
        const synthesized = i < activeCount;
        const newBase = getComplementaryBase(tBase, isPrimer);
        const hCount = newBase === 'G' || newBase === 'C' ? 3 : 2;

        return (
          <g key={i}>
            {/* Template base */}
            <NucleotideBlock
              x={x}
              y={templateY - 7}
              base={tBase}
              direction="up"
              onClick={() => onSelectFocus('template')}
            />

            {/* Synthesized base + H-bonds */}
            {synthesized && (
              <g>
                <NucleotideBlock
                  x={x}
                  y={newY + 7}
                  base={newBase}
                  direction="down"
                  isRna={isPrimer}
                  onClick={() => onSelectFocus(isPrimer ? 'rna-primer' : 'new-strand')}
                />
                <HydrogenBonds
                  x={x}
                  y1={newY + 52}
                  y2={templateY - 52}
                  count={hCount}
                />
              </g>
            )}
          </g>
        );
      })}

      {/* Primase Enzyme (visible on primer step or subtly anchored at primer site) */}
      <g
        transform={`translate(${startX + 64}, 252)`}
        opacity={subStepIndex === 0 ? 1 : 0.35}
        onClick={() => onSelectFocus('primase')}
        className="cursor-pointer"
        style={{ transition: 'opacity 250ms ease' }}
      >
        <rect
          x={-48}
          y={-28}
          width={96}
          height={56}
          rx={24}
          fill="#FEF3C7"
          stroke={highlightedId === 'primase' ? '#B45309' : '#D97706'}
          strokeWidth={highlightedId === 'primase' ? 2.8 : 2}
        />
        <text x={0} y={-4} textAnchor="middle" fontSize={12} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#92400E">
          Primase
        </text>
        <text x={0} y={12} textAnchor="middle" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fill="#B45309">
          lays RNA primer
        </text>
      </g>

      {/* DNA Polymerase Enzyme Clamp (active during DNA extension) */}
      {subStepIndex >= 1 && (
        <g
          transform={`translate(${polX}, 252)`}
          onClick={() => onSelectFocus('dna-pol')}
          className="cursor-pointer"
          style={{ transition: 'transform 220ms ease' }}
        >
          <path
            d="M -46 -34 C -56 -34, -56 34, -46 34 L 38 34 C 54 34, 54 -34, 38 -34 Z"
            fill="#ECFDF5"
            fillOpacity={0.92}
            stroke={highlightedId === 'dna-pol' ? '#047857' : '#059669'}
            strokeWidth={highlightedId === 'dna-pol' ? 3 : 2.2}
          />
          <text x={-2} y={-6} textAnchor="middle" fontSize={12} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#064E3B">
            DNA Pol
          </text>
          <text x={-2} y={10} textAnchor="middle" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fill="#059669">
            5&apos; → 3&apos; ext.
          </text>
        </g>
      )}

      {/* Required Labels */}
      <CalloutPin
        anchorX={startX + 64}
        anchorY={178}
        labelX={170}
        labelY={82}
        text="RNA primer"
        subtext="5'-A U G-3' (free 3'-OH)"
        accent="amber"
        visible={showLabels}
        highlighted={highlightedId === 'rna-primer'}
        onSelect={() => onSelectFocus('rna-primer')}
      />

      <CalloutPin
        anchorX={startX + 64}
        anchorY={280}
        labelX={160}
        labelY={446}
        text="Primase"
        subtext="Initiates primer synthesis"
        accent="amber"
        visible={showLabels}
        highlighted={highlightedId === 'primase'}
        onSelect={() => onSelectFocus('primase')}
      />

      <CalloutPin
        anchorX={startX + 5 * stepX}
        anchorY={178}
        labelX={500}
        labelY={82}
        text="Newly synthesized strand"
        subtext="5' to 3' direction"
        accent="emerald"
        visible={showLabels}
        highlighted={highlightedId === 'new-strand' || highlightedId === 'direction'}
        onSelect={() => onSelectFocus('new-strand')}
      />

      <CalloutPin
        anchorX={polX}
        anchorY={286}
        labelX={480}
        labelY={446}
        text="DNA polymerase"
        subtext="Extends from primer 5'→3'"
        accent="emerald"
        visible={showLabels && subStepIndex >= 1}
        highlighted={highlightedId === 'dna-pol'}
        onSelect={() => onSelectFocus('dna-pol')}
      />

      <CalloutPin
        anchorX={750}
        anchorY={templateY}
        labelX={765}
        labelY={446}
        text="Template strand"
        subtext="Read 3'→5'"
        accent="cobalt"
        visible={showLabels}
        highlighted={highlightedId === 'template'}
        onSelect={() => onSelectFocus('template')}
      />
    </svg>
  );
};
