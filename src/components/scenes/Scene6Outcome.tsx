import React from 'react';
import { PARENTAL_TOP_STRAND, PARENTAL_BOTTOM_STRAND, MMR_MISMATCH_INDEX } from '../../simulation/dnaModel';
import { CalloutPin, COLORS, PolarityTag } from '../MolecularPrimitives';

interface SceneProps {
  subStepIndex: number;
  progress: number;
  showLabels: boolean;
  highlightedId: string | null;
  onSelectFocus: (id: string) => void;
  onLaunchMMR?: () => void;
}

export const Scene6Outcome: React.FC<SceneProps> = ({
  subStepIndex,
  showLabels,
  highlightedId,
  onSelectFocus,
  onLaunchMMR,
}) => {
  const showMismatchCheck = subStepIndex >= 1;
  const startX = 148;
  const stepX = 62;

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-full select-none"
      role="img"
      aria-label="Scene 6: Semiconservative replication outcome producing two daughter DNA duplexes"
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
        Semiconservative Replication Outcome
      </text>
      <text
        x={32}
        y={56}
        fill="#475569"
        fontFamily="DM Sans, sans-serif"
        fontSize={12}
      >
        Each daughter DNA molecule conserves one original parental strand paired with one newly synthesized strand
      </text>

      {/* Duplex A (Top) */}
      <g transform="translate(0, 92)">
        <rect
          x={42}
          y={0}
          width={836}
          height={146}
          rx={12}
          fill="#F8FAFC"
          stroke={highlightedId === 'parental-daughter-1' ? '#1D4ED8' : '#E2E8F0'}
          strokeWidth={highlightedId === 'parental-daughter-1' ? 2 : 1.25}
        />
        <text x={60} y={24} fontSize={13} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#0F172A">
          Daughter DNA Molecule A
        </text>
        <text x={860} y={24} textAnchor="end" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#059669">
          100% COMPLEMENTARY
        </text>

        {/* Parental Top Strand */}
        <line x1={120} y1={52} x2={796} y2={52} stroke={COLORS.parental} strokeWidth={5.5} strokeLinecap="round" />
        <PolarityTag x={94} y={52} label="5'" color={COLORS.parental} />
        <PolarityTag x={822} y={52} label="3'" color={COLORS.parental} />

        {/* Newly Synthesized Bottom Strand */}
        <line x1={120} y1={116} x2={796} y2={116} stroke={COLORS.newStrand} strokeWidth={5.5} strokeLinecap="round" />
        <PolarityTag x={94} y={116} label="3'" color={COLORS.newStrand} />
        <PolarityTag x={822} y={116} label="5'" color={COLORS.newStrand} />

        {PARENTAL_TOP_STRAND.map((topB, i) => {
          const botB = PARENTAL_BOTTOM_STRAND[i];
          const x = startX + i * stepX;
          return (
            <g key={i}>
              <rect x={x - 12} y={56} width={24} height={20} rx={4} fill="#DBEAFE" stroke="#2563EB" strokeWidth={1.2} />
              <text x={x} y={66} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#1E3A8A">{topB}</text>
              <line x1={x} y1={77} x2={x} y2={91} stroke="#94A3B8" strokeDasharray="2 2" />
              <rect x={x - 12} y={92} width={24} height={20} rx={4} fill="#D1FAE5" stroke="#059669" strokeWidth={1.2} />
              <text x={x} y={102} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#064E3B">{botB}</text>
            </g>
          );
        })}

        <CalloutPin
          anchorX={210}
          anchorY={52}
          labelX={310}
          labelY={22}
          text="Parental strand"
          accent="cobalt"
          visible={showLabels}
        />
        <CalloutPin
          anchorX={644}
          anchorY={116}
          labelX={644}
          labelY={138}
          text="Newly synthesized strand"
          accent="emerald"
          visible={showLabels}
        />
      </g>

      {/* Duplex B (Bottom) */}
      <g transform="translate(0, 260)">
        <rect
          x={42}
          y={0}
          width={836}
          height={156}
          rx={12}
          fill={showMismatchCheck ? '#FEF2F2' : '#F8FAFC'}
          stroke={
            showMismatchCheck
              ? '#DC2626'
              : highlightedId === 'parental-daughter-2'
                ? '#1D4ED8'
                : '#E2E8F0'
          }
          strokeWidth={showMismatchCheck || highlightedId === 'parental-daughter-2' ? 2 : 1.25}
        />
        <text x={60} y={24} fontSize={13} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#0F172A">
          Daughter DNA Molecule B
        </text>
        <text
          x={860}
          y={24}
          textAnchor="end"
          fontSize={11}
          fontFamily="IBM Plex Mono, monospace"
          fontWeight={600}
          fill={showMismatchCheck ? '#DC2626' : '#059669'}
        >
          {showMismatchCheck ? '▲ G–T REPLICATION MISMATCH DETECTED' : '100% COMPLEMENTARY'}
        </text>

        {/* Newly Synthesized Top Strand */}
        <line x1={120} y1={54} x2={796} y2={54} stroke={COLORS.newStrand} strokeWidth={5.5} strokeLinecap="round" />
        <PolarityTag x={94} y={54} label="5'" color={COLORS.newStrand} />
        <PolarityTag x={822} y={54} label="3'" color={COLORS.newStrand} />

        {/* Parental Bottom Strand */}
        <line x1={120} y1={118} x2={796} y2={118} stroke={COLORS.parental} strokeWidth={5.5} strokeLinecap="round" />
        <PolarityTag x={94} y={118} label="3'" color={COLORS.parental} />
        <PolarityTag x={822} y={118} label="5'" color={COLORS.parental} />

        {PARENTAL_TOP_STRAND.map((topB, i) => {
          const botB = PARENTAL_BOTTOM_STRAND[i];
          const isMismatch = showMismatchCheck && i === MMR_MISMATCH_INDEX;
          const x = startX + i * stepX;
          // At MMR_MISMATCH_INDEX (7), parental top is G and bottom is C; if we flip so parental is G on top/bottom:
          // Here let's show parental bottom has G at index 8? Wait: at index 7 PARENTAL_TOP_STRAND[7] = 'G', PARENTAL_BOTTOM_STRAND[7] = 'C'.
          // Let's keep Molecule B with Parental Top = G at index 7 and New Bottom = T (mismatch) OR New Top = T opposite Parental Bottom = G at index 3!
          // Let's check index 3: PARENTAL_BOTTOM_STRAND[3] = 'G', PARENTAL_TOP_STRAND[3] = 'C'.
          // Even clearer: keep the same polarity as MMR stage: Parental Top (5'->3') has G at index 7, New Bottom has T at index 7!
          const displayTop = isMismatch ? 'T' : topB;
          // Wait: in Molecule B, let's check which strand is Parental. If Top is New and Bottom is Parental:
          // At index 3, PARENTAL_BOTTOM_STRAND[3] === 'G' and PARENTAL_TOP_STRAND[3] === 'C'.
          // If New Top misincorporates T opposite Parental Bottom G at index 3, it's a true G–T mismatch on Molecule B!
          const mismatchAt3 = showMismatchCheck && i === 3;
          const shownTop = mismatchAt3 ? 'T' : topB;

          return (
            <g key={i}>
              <rect
                x={x - 12}
                y={mismatchAt3 ? 52 : 58}
                width={24}
                height={20}
                rx={4}
                fill={mismatchAt3 ? '#FEE2E2' : '#D1FAE5'}
                stroke={mismatchAt3 ? '#DC2626' : '#059669'}
                strokeWidth={mismatchAt3 ? 2 : 1.2}
              />
              <text
                x={x}
                y={mismatchAt3 ? 62 : 68}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontFamily="IBM Plex Mono, monospace"
                fontWeight={mismatchAt3 ? 700 : 600}
                fill={mismatchAt3 ? '#991B1B' : '#064E3B'}
              >
                {shownTop}
              </text>
              {mismatchAt3 ? (
                <path d={`M ${x - 6} 79 L ${x + 6} 89 M ${x + 6} 79 L ${x - 6} 89`} stroke="#DC2626" strokeWidth={2} />
              ) : (
                <line x1={x} y1={79} x2={x} y2={93} stroke="#94A3B8" strokeDasharray="2 2" />
              )}
              <rect x={x - 12} y={94} width={24} height={20} rx={4} fill="#DBEAFE" stroke="#2563EB" strokeWidth={1.2} />
              <text x={x} y={104} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#1E3A8A">
                {botB}
              </text>
            </g>
          );
        })}

        <CalloutPin
          anchorX={582}
          anchorY={54}
          labelX={582}
          labelY={22}
          text="Newly synthesized strand"
          accent="emerald"
          visible={showLabels}
        />
        <CalloutPin
          anchorX={210}
          anchorY={118}
          labelX={210}
          labelY={144}
          text="Parental strand"
          accent="cobalt"
          visible={showLabels}
        />

        {showMismatchCheck && (
          <g
            transform="translate(334, 144)"
            onClick={() => (onLaunchMMR ? onLaunchMMR() : onSelectFocus('mmr-handoff'))}
            className="cursor-pointer"
          >
            <rect x={0} y={-13} width={272} height={26} rx={6} fill="#DC2626" />
            <text x={136} y={0} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontFamily="DM Sans, sans-serif" fontWeight={700} fill="#FFFFFF">
              Launch Mismatch Repair (MMR) on G–T Error →
            </text>
          </g>
        )}
      </g>

      {/* Bottom Legend */}
      <g transform="translate(42, 436)">
        <rect x={0} y={0} width={836} height={42} rx={8} fill="#F8FAFC" stroke="#E2E8F0" />
        <line x1={20} y1={21} x2={52} y2={21} stroke={COLORS.parental} strokeWidth={5} strokeLinecap="round" />
        <text x={62} y={25} fontSize={12} fontFamily="DM Sans, sans-serif" fontWeight={600} fill="#1E3A8A">
          Parental Strand (Conserved Original Template)
        </text>
        <line x1={380} y1={21} x2={412} y2={21} stroke={COLORS.newStrand} strokeWidth={5} strokeLinecap="round" />
        <text x={422} y={25} fontSize={12} fontFamily="DM Sans, sans-serif" fontWeight={600} fill="#065F46">
          Newly Synthesized Strand (5&apos;→3&apos; Daughter Copy)
        </text>
      </g>
    </svg>
  );
};
