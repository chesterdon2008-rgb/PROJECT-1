import React from 'react';
import {
  getHydrogenBondCount,
  getMMRStateForPhase,
  MMR_MISMATCH_INDEX,
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

export const Scene7MMR: React.FC<SceneProps> = ({
  subStepIndex,
  showLabels,
  highlightedId,
  onSelectFocus,
}) => {
  const mmr = getMMRStateForPhase(subStepIndex);
  const startX = 136;
  const stepX = 64;
  const topY = 172;
  const botY = 332;
  const mismatchX = startX + MMR_MISMATCH_INDEX * stepX; // index 7 -> x = 584

  const phaseTitles = [
    'Step 1 · Replication Error (G–T Mismatch)',
    'Step 2 · Mismatch Recognition (MutS)',
    'Step 3 · New Strand Discrimination & Nicking (MutL / MutH)',
    'Step 4 · Excision of Incorrect Segment (Exonuclease)',
    'Step 5 · Resynthesis 5′→3′ (DNA Polymerase)',
    'Step 6 · Ligation & Restored Helix (DNA Ligase)',
  ];

  // Determine whether the mismatch distortion bulge is currently present
  const hasMismatchBulge =
    mmr.phase === 'replication_error' ||
    mmr.phase === 'mismatch_recognition' ||
    mmr.phase === 'strand_correction';

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-full select-none"
      role="img"
      aria-label="Mismatch Repair (MMR) pathway: error, recognition, strand correction, excision, resynthesis, and ligation"
    >
      <rect width="920" height="500" fill="#FFFFFF" />

      {/* Title & Current MMR Phase Indicator */}
      <text
        x={32}
        y={36}
        fill="#0F172A"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight={700}
        fontSize={15}
      >
        Mismatch Repair (MMR) · {phaseTitles[mmr.phaseIndex]}
      </text>
      <text
        x={32}
        y={56}
        fill="#475569"
        fontFamily="IBM Plex Mono, monospace"
        fontSize={11.5}
      >
        Flow: Error (G–T) → Recognition (MutS) → New Strand Correction (MutL/MutH) → Excision → Resynthesis → Ligation
      </text>

      {/* Top Strand: PARENTAL TEMPLATE (methylated, protected) */}
      <line
        x1={104}
        y1={topY}
        x2={816}
        y2={topY}
        stroke={COLORS.parental}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <PolarityTag x={82} y={topY} label="5'" color={COLORS.parental} />
      <PolarityTag x={838} y={topY} label="3'" color={COLORS.parental} />

      {/* Methylation Tags (-CH3) on Parental Strand to explain strand discrimination */}
      {[2, 6, 9].map((idx) => {
        const mx = startX + idx * stepX;
        return (
          <g key={`meth-${idx}`} opacity={mmr.phaseIndex >= 2 ? 1 : 0.45}>
            <line x1={mx} y1={topY - 4} x2={mx} y2={topY - 22} stroke="#1D4ED8" strokeWidth={1.6} />
            <rect x={mx - 17} y={topY - 38} width={34} height={17} rx={4} fill="#EFF6FF" stroke="#1D4ED8" strokeWidth={1.2} />
            <text x={mx} y={topY - 29.5} textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#1E3A8A">
              CH₃
            </text>
          </g>
        );
      })}
      <text
        x={104}
        y={122}
        fontSize={11}
        fontFamily="DM Sans, sans-serif"
        fontWeight={600}
        fill="#1E3A8A"
      >
        Parental Strand (Methylated · Protected Template)
      </text>

      {/* Bottom Strand: NEWLY SYNTHESIZED STRAND (unmethylated, targeted for repair) */}
      {(() => {
        // Handle backbone rendering across nick / excision gap
        if (mmr.phase === 'excision') {
          // Left segment up to index 4, gap across indices 5..8, right segment from index 9
          const gapLeft = startX + 4 * stepX + 18;
          const gapRight = startX + 9 * stepX - 18;
          return (
            <g>
              <line x1={104} y1={botY} x2={gapLeft} y2={botY} stroke={COLORS.newStrand} strokeWidth={7} strokeLinecap="round" />
              <line x1={gapRight} y1={botY} x2={816} y2={botY} stroke={COLORS.newStrand} strokeWidth={7} strokeLinecap="round" />
              {/* Dashed outline indicating excised gap */}
              <line x1={gapLeft + 4} y1={botY} x2={gapRight - 4} y2={botY} stroke="#CBD5E1" strokeWidth={3} strokeDasharray="6 6" />
            </g>
          );
        }

        if (mmr.nickIndex !== null && !mmr.isLigated) {
          const nickX = startX + mmr.nickIndex * stepX + 28;
          return (
            <g>
              <line x1={104} y1={botY} x2={nickX - 7} y2={botY} stroke={COLORS.newStrand} strokeWidth={7} strokeLinecap="round" />
              <line x1={nickX + 7} y1={botY} x2={816} y2={botY} stroke={COLORS.newStrand} strokeWidth={7} strokeLinecap="round" />
              {/* Backbone nick marker */}
              <line x1={nickX} y1={botY - 11} x2={nickX} y2={botY + 11} stroke="#DC2626" strokeWidth={2.4} />
              <text
                x={nickX}
                y={botY + 26}
                textAnchor="middle"
                fontSize={10.5}
                fontFamily="IBM Plex Mono, monospace"
                fontWeight={600}
                fill="#DC2626"
              >
                Nick in new strand
              </text>
            </g>
          );
        }

        // Continuous or distorted mismatch wobble backbone
        if (hasMismatchBulge) {
          return (
            <path
              d={`M 104 ${botY} L ${mismatchX - 46} ${botY} Q ${mismatchX} ${botY + 28} ${mismatchX + 46} ${botY} L 816 ${botY}`}
              fill="none"
              stroke={COLORS.newStrand}
              strokeWidth={7}
              strokeLinecap="round"
            />
          );
        }

        return (
          <line
            x1={104}
            y1={botY}
            x2={816}
            y2={botY}
            stroke={COLORS.newStrand}
            strokeWidth={7}
            strokeLinecap="round"
          />
        );
      })()}

      <PolarityTag x={82} y={botY} label="3'" color={COLORS.newStrand} />
      <PolarityTag x={838} y={botY} label="5'" color={COLORS.newStrand} />
      <text
        x={104}
        y={386}
        fontSize={11}
        fontFamily="DM Sans, sans-serif"
        fontWeight={600}
        fill="#065F46"
      >
        Newly Synthesized Strand (Unmethylated · Corrected by MMR)
      </text>

      {/* Render All 11 Nucleotide Positions */}
      {mmr.parentalStrand.map((pBase, i) => {
        const dBase = mmr.daughterStrand[i];
        const x = startX + i * stepX;
        const isMismatchSite = i === MMR_MISMATCH_INDEX && dBase === 'T';
        const isNewlyRepaired = i === MMR_MISMATCH_INDEX && dBase === 'C' && mmr.phaseIndex >= 4;
        const yOffsetBulge = isMismatchSite && hasMismatchBulge ? 14 : 0;

        const topH = pBase === 'A' || pBase === 'G' ? 44 : 34;
        const botH = dBase ? (dBase === 'A' || dBase === 'G' ? 44 : 34) : 0;
        const hCount = dBase ? getHydrogenBondCount(pBase, dBase) : 0;

        return (
          <g key={i}>
            {/* Parental base */}
            <NucleotideBlock
              x={x}
              y={topY + 7}
              base={pBase}
              direction="down"
              height={topH}
            />

            {/* Daughter base & hydrogen bonds (unless excised) */}
            {dBase !== null && (
              <g>
                <HydrogenBonds
                  x={x}
                  y1={topY + 7 + topH + 3}
                  y2={botY + yOffsetBulge - 7 - botH - 3}
                  count={hCount}
                  isMismatch={isMismatchSite}
                  highlighted={isNewlyRepaired}
                />
                <NucleotideBlock
                  x={x}
                  y={botY + yOffsetBulge - 7}
                  base={dBase}
                  direction="up"
                  height={botH}
                  isError={isMismatchSite}
                  onClick={() => onSelectFocus('gt-mismatch')}
                />
              </g>
            )}

            {/* Highlight ring around repaired C on steps 4-5 */}
            {isNewlyRepaired && (
              <rect
                x={x - 21}
                y={botY - 7 - botH - 4}
                width={42}
                height={botH + 8}
                rx={6}
                fill="none"
                stroke="#059669"
                strokeWidth={2}
                strokeDasharray="3 2"
              />
            )}
          </g>
        );
      })}

      {/* ENZYME COMPLEXES PER MMR PHASE */}

      {/* MutS Clamp on Mismatch (Phases 1 & 2) */}
      {mmr.mutSBound && (
        <g
          transform={`translate(${mismatchX}, 252)`}
          onClick={() => onSelectFocus('muts')}
          className="cursor-pointer"
        >
          <rect
            x={-54}
            y={-48}
            width={108}
            height={96}
            rx={22}
            fill="#FEF3C7"
            fillOpacity={0.86}
            stroke={highlightedId === 'muts' ? '#B45309' : '#D97706'}
            strokeWidth={highlightedId === 'muts' ? 3 : 2.2}
          />
          <text x={0} y={-8} textAnchor="middle" fontSize={13} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#92400E">
            MutS
          </text>
          <text x={0} y={10} textAnchor="middle" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fill="#B45309">
            binds G–T bulge
          </text>
        </g>
      )}

      {/* MutL + MutH Strand Correction Complex (Phase 2) */}
      {mmr.mutLRecruited && (
        <g>
          {/* MutL bridge */}
          <g
            transform={`translate(${startX + 5.5 * stepX}, 252)`}
            onClick={() => onSelectFocus('mutl')}
            className="cursor-pointer"
          >
            <rect
              x={-44}
              y={-28}
              width={88}
              height={56}
              rx={16}
              fill="#DBEAFE"
              fillOpacity={0.94}
              stroke={highlightedId === 'mutl' ? '#1D4ED8' : '#2563EB'}
              strokeWidth={2}
            />
            <text x={0} y={-4} textAnchor="middle" fontSize={12} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#1E3A8A">
              MutL
            </text>
            <text x={0} y={11} textAnchor="middle" fontSize={9} fontFamily="IBM Plex Mono, monospace" fill="#1D4ED8">
              bridge
            </text>
          </g>

          {/* MutH endonuclease nicking new strand at index 4 */}
          <g
            transform={`translate(${startX + 4 * stepX + 28}, 332)`}
            onClick={() => onSelectFocus('mutl')}
            className="cursor-pointer"
          >
            <polygon
              points="0,-24 28,0 0,24 -28,0"
              fill="#FEE2E2"
              stroke="#DC2626"
              strokeWidth={2}
            />
            <text x={0} y={1} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#991B1B">
              MutH
            </text>
          </g>
        </g>
      )}

      {/* Exonuclease Digesting Incorrect New Segment (Phase 3) */}
      {mmr.exonucleaseActive && (
        <g
          transform={`translate(${startX + 6.5 * stepX}, 318)`}
          onClick={() => onSelectFocus('exonuclease')}
          className="cursor-pointer"
        >
          <path
            d="M -64 -26 L 52 -26 A 26 26 0 1 1 52 26 L -64 26 L -40 0 Z"
            fill="#FFEDD5"
            fillOpacity={0.95}
            stroke={highlightedId === 'exonuclease' ? '#C2410C' : '#EA580C'}
            strokeWidth={2.2}
          />
          <text x={-4} y={-4} textAnchor="middle" fontSize={11.5} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#7C2D12">
            Exonuclease
          </text>
          <text x={-4} y={12} textAnchor="middle" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fill="#C2410C">
            excises T segment →
          </text>
        </g>
      )}

      {/* DNA Polymerase Resynthesizing 5'->3' (Phase 4) */}
      {mmr.polymeraseActive && (
        <g
          transform={`translate(${mismatchX}, 256)`}
          onClick={() => onSelectFocus('mmr-pol')}
          className="cursor-pointer"
        >
          <rect
            x={-58}
            y={-32}
            width={116}
            height={64}
            rx={20}
            fill="#ECFDF5"
            fillOpacity={0.94}
            stroke={highlightedId === 'mmr-pol' ? '#047857' : '#059669'}
            strokeWidth={2.2}
          />
          <text x={0} y={-6} textAnchor="middle" fontSize={12} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#064E3B">
            DNA Pol
          </text>
          <text x={0} y={11} textAnchor="middle" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fill="#059669">
            inserts C (5&apos;→3&apos;)
          </text>
        </g>
      )}

      {/* DNA Ligase Sealing Final Nick (Phase 5) */}
      {mmr.ligaseActive && (
        <g
          transform={`translate(${startX + 8 * stepX + 28}, 332)`}
          onClick={() => onSelectFocus('mmr-ligase')}
          className="cursor-pointer"
        >
          <ellipse
            cx={0}
            cy={0}
            rx={56}
            ry={24}
            fill="#E0E7FF"
            fillOpacity={0.96}
            stroke={highlightedId === 'mmr-ligase' ? '#3730A3' : '#4F46E5'}
            strokeWidth={2.2}
          />
          <text x={0} y={-2} textAnchor="middle" fontSize={11.5} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#312E81">
            DNA Ligase
          </text>
          <text x={0} y={12} textAnchor="middle" fontSize={9} fontFamily="IBM Plex Mono, monospace" fill="#4338CA">
            nick sealed
          </text>
        </g>
      )}

      {/* Contextual Callout Pins */}
      {hasMismatchBulge && (
        <CalloutPin
          anchorX={mismatchX}
          anchorY={botY + 14}
          labelX={640}
          labelY={442}
          text="G–T Mismatch (Replication Error)"
          subtext="Misincorporated T on new strand"
          accent="crimson"
          visible={showLabels}
          highlighted={highlightedId === 'gt-mismatch'}
          onSelect={() => onSelectFocus('gt-mismatch')}
        />
      )}

      {mmr.phase === 'mismatch_recognition' && (
        <CalloutPin
          anchorX={mismatchX}
          anchorY={204}
          labelX={584}
          labelY={96}
          text="MutS Recognition"
          subtext="Detects helix backbone distortion"
          accent="amber"
          visible={showLabels}
          highlighted={highlightedId === 'muts'}
          onSelect={() => onSelectFocus('muts')}
        />
      )}

      {mmr.phase === 'strand_correction' && (
        <CalloutPin
          anchorX={startX + 4 * stepX + 28}
          anchorY={356}
          labelX={360}
          labelY={442}
          text="MutL / MutH New-Strand Nick"
          subtext="Parent CH₃ intact · New strand targeted"
          accent="cobalt"
          visible={showLabels}
          highlighted={highlightedId === 'mutl'}
          onSelect={() => onSelectFocus('mutl')}
        />
      )}

      {mmr.phase === 'excision' && (
        <CalloutPin
          anchorX={startX + 6.5 * stepX}
          anchorY={344}
          labelX={550}
          labelY={442}
          text="Exonuclease Excision"
          subtext="Removes erroneous T-containing stretch"
          accent="amber"
          visible={showLabels}
          highlighted={highlightedId === 'exonuclease'}
          onSelect={() => onSelectFocus('exonuclease')}
        />
      )}

      {mmr.phase === 'resynthesis' && (
        <CalloutPin
          anchorX={mismatchX}
          anchorY={224}
          labelX={584}
          labelY={96}
          text="DNA Polymerase Resynthesis"
          subtext="Inserts C opposite G (5'→3')"
          accent="emerald"
          visible={showLabels}
          highlighted={highlightedId === 'mmr-pol'}
          onSelect={() => onSelectFocus('mmr-pol')}
        />
      )}

      {mmr.phase === 'ligation' && (
        <CalloutPin
          anchorX={startX + 8 * stepX + 28}
          anchorY={356}
          labelX={660}
          labelY={442}
          text="DNA Ligase Seals Nick"
          subtext="Restores canonical G≡C duplex"
          accent="cobalt"
          visible={showLabels}
          highlighted={highlightedId === 'mmr-ligase'}
          onSelect={() => onSelectFocus('mmr-ligase')}
        />
      )}
    </svg>
  );
};
