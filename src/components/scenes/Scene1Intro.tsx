import React from 'react';
import { CalloutPin, COLORS, PolarityTag } from '../MolecularPrimitives';
import { evaluateErrorVsMutation } from '../../simulation/dnaModel';

interface SceneProps {
  subStepIndex: number;
  progress: number;
  showLabels: boolean;
  highlightedId: string | null;
  onSelectFocus: (id: string) => void;
}

export const Scene1Intro: React.FC<SceneProps> = ({
  subStepIndex,
  showLabels,
  highlightedId,
  onSelectFocus,
}) => {
  const showError = subStepIndex >= 1;
  const showPermanent = subStepIndex >= 2;
  const mutationOutcome = evaluateErrorVsMutation(!showPermanent);

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-full select-none"
      role="img"
      aria-label="Scene 1: Normal DNA inside a cell comparing replication error and permanent mutation"
    >
      {/* Subtle coordinate grid */}
      <defs>
        <pattern id="lab-grid-1" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#F1F5F9" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="920" height="500" fill="#FFFFFF" />
      <rect width="920" height="500" fill="url(#lab-grid-1)" />

      {/* Left Zone: Cell & Nucleus with Normal Double-Stranded DNA */}
      <g transform="translate(30, 34)">
        <rect
          x={0}
          y={0}
          width={380}
          height={432}
          rx={16}
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth={1.5}
        />
        <text
          x={20}
          y={28}
          fill="#0F172A"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight={700}
          fontSize={14}
        >
          Cellular Context
        </text>
        <text
          x={20}
          y={46}
          fill="#475569"
          fontFamily="DM Sans, sans-serif"
          fontSize={12}
        >
          Double-stranded genomic DNA inside the nucleus
        </text>

        {/* Outer Cell Membrane */}
        <ellipse
          cx={190}
          cy={246}
          rx={156}
          ry={156}
          fill="#EFF6FF"
          fillOpacity={0.5}
          stroke="#94A3B8"
          strokeWidth={2}
        />
        <text
          x={190}
          y={114}
          textAnchor="middle"
          fill="#475569"
          fontFamily="DM Sans, sans-serif"
          fontWeight={600}
          fontSize={11.5}
        >
          Cell Membrane &amp; Cytoplasm
        </text>

        {/* Nuclear Envelope */}
        <ellipse
          cx={190}
          cy={256}
          rx={118}
          ry={108}
          fill="#FFFFFF"
          stroke={highlightedId === 'nucleus' ? '#1D4ED8' : '#3B82F6'}
          strokeWidth={highlightedId === 'nucleus' ? 2.5 : 1.75}
          strokeDasharray="10 4"
        />
        <text
          x={190}
          y={174}
          textAnchor="middle"
          fill="#1E3A8A"
          fontFamily="DM Sans, sans-serif"
          fontWeight={600}
          fontSize={12}
        >
          Nucleus
        </text>

        {/* Normal Double-Stranded DNA Helix Schematic */}
        <g transform="translate(86, 214)">
          {/* Rungs */}
          {[22, 46, 70, 94, 118, 142, 166, 190].map((rx, idx) => {
            const pair = idx % 2 === 0 ? ['G', 'C'] : ['A', 'T'];
            const phase = Math.sin((idx / 7) * Math.PI * 2) * 14;
            return (
              <g key={rx}>
                <line
                  x1={rx}
                  y1={42 - phase}
                  x2={rx}
                  y2={42 + phase}
                  stroke="#94A3B8"
                  strokeWidth={2}
                />
                <circle cx={rx} cy={42 - phase} r={6} fill="#DBEAFE" stroke="#1D4ED8" strokeWidth={1.2} />
                <circle cx={rx} cy={42 + phase} r={6} fill="#D1FAE5" stroke="#059669" strokeWidth={1.2} />
                <text
                  x={rx}
                  y={42 - phase}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={7.5}
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight={600}
                  fill="#1E3A8A"
                >
                  {pair[0]}
                </text>
                <text
                  x={rx}
                  y={42 + phase}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={7.5}
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight={600}
                  fill="#065F46"
                >
                  {pair[1]}
                </text>
              </g>
            );
          })}

          {/* Sinusoidal double helix curves */}
          <path
            d="M 8 42 C 40 12, 75 12, 106 42 C 138 72, 172 72, 204 42"
            fill="none"
            stroke={COLORS.parental}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <path
            d="M 8 42 C 40 72, 75 72, 106 42 C 138 12, 172 12, 204 42"
            fill="none"
            stroke={COLORS.parental}
            strokeWidth={3.5}
            strokeOpacity={0.75}
            strokeLinecap="round"
          />
          <PolarityTag x={-6} y={42} label="5'" />
          <PolarityTag x={218} y={42} label="3'" />
        </g>

        <CalloutPin
          anchorX={190}
          anchorY={292}
          labelX={190}
          labelY={338}
          text="Normal dsDNA Duplex"
          subtext="Complementary G≡C and A=T pairs"
          accent="cobalt"
          visible={showLabels}
          highlighted={highlightedId === 'normal-dna'}
          onSelect={() => onSelectFocus('nucleus')}
        />
      </g>

      {/* Right Zone: Replication Error vs. Permanent Mutation */}
      <g transform="translate(432, 34)">
        <rect
          x={0}
          y={0}
          width={458}
          height={432}
          rx={16}
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth={1.5}
        />
        <text
          x={22}
          y={28}
          fill="#0F172A"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight={700}
          fontSize={14}
        >
          Replication Error vs. Permanent Mutation
        </text>
        <text
          x={22}
          y={46}
          fill="#475569"
          fontFamily="DM Sans, sans-serif"
          fontSize={12}
        >
          Why Mismatch Repair (MMR) timing determines genetic fate
        </text>

        {/* Panel A: Replication Error (Repairable) */}
        <g
          transform="translate(22, 68)"
          opacity={showError ? 1 : 0.45}
          style={{ transition: 'opacity 250ms ease' }}
        >
          <rect
            x={0}
            y={0}
            width={414}
            height={158}
            rx={10}
            fill={showError && !showPermanent ? '#FEF2F2' : '#F8FAFC'}
            stroke={
              highlightedId === 'replication-error' || (showError && !showPermanent)
                ? '#DC2626'
                : '#CBD5E1'
            }
            strokeWidth={highlightedId === 'replication-error' ? 2 : 1.25}
          />
          <text
            x={16}
            y={24}
            fill="#991B1B"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight={700}
            fontSize={13}
          >
            1. Replication Error (Still Repairable)
          </text>
          <text
            x={398}
            y={24}
            textAnchor="end"
            fill="#059669"
            fontFamily="IBM Plex Mono, monospace"
            fontWeight={600}
            fontSize={11}
          >
            MMR CAN FIX THIS
          </text>

          {/* Mini duplex showing G-T mismatch */}
          <g transform="translate(28, 52)">
            {/* Parental Top */}
            <line x1={0} y1={14} x2={340} y2={14} stroke={COLORS.parental} strokeWidth={4} strokeLinecap="round" />
            <text x={-14} y={18} fontSize={10.5} fontFamily="IBM Plex Mono, monospace" fill={COLORS.parental} fontWeight={600}>5&apos;</text>
            <text x={348} y={18} fontSize={10.5} fontFamily="IBM Plex Mono, monospace" fill={COLORS.parental} fontWeight={600}>3&apos;</text>

            {/* New Bottom */}
            <line x1={0} y1={62} x2={340} y2={62} stroke={COLORS.newStrand} strokeWidth={4} strokeLinecap="round" />
            <text x={-14} y={66} fontSize={10.5} fontFamily="IBM Plex Mono, monospace" fill={COLORS.newStrand} fontWeight={600}>3&apos;</text>
            <text x={348} y={66} fontSize={10.5} fontFamily="IBM Plex Mono, monospace" fill={COLORS.newStrand} fontWeight={600}>5&apos;</text>

            {[
              { x: 40, t: 'A', b: 'T', err: false },
              { x: 105, t: 'T', b: 'A', err: false },
              { x: 170, t: 'G', b: 'T', err: true },
              { x: 235, t: 'C', b: 'G', err: false },
              { x: 300, t: 'A', b: 'T', err: false },
            ].map((item, i) => (
              <g key={i}>
                <rect
                  x={item.x - 13}
                  y={16}
                  width={26}
                  height={18}
                  rx={4}
                  fill="#DBEAFE"
                  stroke="#2563EB"
                  strokeWidth={1.2}
                />
                <text
                  x={item.x}
                  y={25}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight={600}
                  fill="#1E3A8A"
                >
                  {item.t}
                </text>

                <rect
                  x={item.x - 13}
                  y={item.err ? 44 : 42}
                  width={26}
                  height={18}
                  rx={4}
                  fill={item.err ? '#FEE2E2' : '#D1FAE5'}
                  stroke={item.err ? '#DC2626' : '#059669'}
                  strokeWidth={item.err ? 2 : 1.2}
                />
                <text
                  x={item.x}
                  y={item.err ? 53 : 51}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight={700}
                  fill={item.err ? '#991B1B' : '#065F46'}
                >
                  {item.b}
                </text>
                {item.err ? (
                  <g>
                    <path
                      d={`M ${item.x - 5} 35 L ${item.x + 5} 43 M ${item.x + 5} 35 L ${item.x - 5} 43`}
                      stroke="#DC2626"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                    <text
                      x={item.x}
                      y={77}
                      textAnchor="middle"
                      fontSize={9.5}
                      fontFamily="IBM Plex Mono, monospace"
                      fontWeight={700}
                      fill="#DC2626"
                    >
                      G–T Wobble
                    </text>
                  </g>
                ) : (
                  <line x1={item.x} y1={34} x2={item.x} y2={42} stroke="#94A3B8" strokeDasharray="2 2" />
                )}
              </g>
            ))}
          </g>

          <text
            x={16}
            y={146}
            fill="#334155"
            fontFamily="DM Sans, sans-serif"
            fontSize={11.5}
          >
            Incorrect T pairs with parental G; MMR can still restore C.
          </text>
        </g>

        {/* Flow Connector */}
        <g transform="translate(218, 232)">
          <line x1={0} y1={0} x2={0} y2={20} stroke="#64748B" strokeWidth={1.8} />
          <polygon points="-5,16 5,16 0,23" fill="#64748B" />
          <text
            x={14}
            y={14}
            fill="#64748B"
            fontFamily="DM Sans, sans-serif"
            fontWeight={600}
            fontSize={11}
          >
            If unrepaired → 2nd Replication Cycle
          </text>
        </g>

        {/* Panel B: Permanent Mutation */}
        <g
          transform="translate(22, 260)"
          opacity={showPermanent ? 1 : 0.45}
          style={{ transition: 'opacity 250ms ease' }}
        >
          <rect
            x={0}
            y={0}
            width={414}
            height={152}
            rx={10}
            fill={showPermanent ? '#FFFBEB' : '#F8FAFC'}
            stroke={
              highlightedId === 'permanent-mutation' || showPermanent
                ? '#D97706'
                : '#CBD5E1'
            }
            strokeWidth={highlightedId === 'permanent-mutation' ? 2 : 1.25}
          />
          <text
            x={16}
            y={24}
            fill="#92400E"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight={700}
            fontSize={13}
          >
            2. Permanent Mutation (Inherited)
          </text>
          <text
            x={398}
            y={24}
            textAnchor="end"
            fill="#B45309"
            fontFamily="IBM Plex Mono, monospace"
            fontWeight={600}
            fontSize={11}
          >
            NO MISMATCH LEFT
          </text>

          {/* Two daughter duplexes after cycle 2 */}
          <g transform="translate(24, 44)">
            {/* Wild-type daughter */}
            <text x={0} y={14} fontSize={11} fontFamily="DM Sans, sans-serif" fontWeight={600} fill="#1E3A8A">
              From parental G:
            </text>
            <rect x={125} y={2} width={22} height={18} rx={4} fill="#D1FAE5" stroke="#059669" />
            <text x={136} y={11} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600}>{mutationOutcome.cycle1DuplexA[0]}</text>
            <text x={152} y={14} fontSize={11} fontFamily="IBM Plex Mono, monospace" fill="#475569">—</text>
            <rect x={162} y={2} width={22} height={18} rx={4} fill="#E0E7FF" stroke="#4F46E5" />
            <text x={173} y={11} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600}>{mutationOutcome.cycle1DuplexA[1]}</text>
            <text x={198} y={14} fontSize={11} fontFamily="DM Sans, sans-serif" fill="#059669" fontWeight={600}>
              Wild-type (G≡C)
            </text>

            {/* Mutated daughter */}
            <text x={0} y={48} fontSize={11} fontFamily="DM Sans, sans-serif" fontWeight={600} fill="#92400E">
              From unfixed T:
            </text>
            <rect x={125} y={36} width={22} height={18} rx={4} fill="#DBEAFE" stroke="#2563EB" />
            <text x={136} y={45} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={700}>
              {showPermanent ? mutationOutcome.cycle2MutantDuplex[0] : 'A'}
            </text>
            <text x={152} y={48} fontSize={11} fontFamily="IBM Plex Mono, monospace" fill="#475569">—</text>
            <rect x={162} y={36} width={22} height={18} rx={4} fill="#FEF3C7" stroke="#D97706" strokeWidth={1.8} />
            <text x={173} y={45} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={700}>
              {showPermanent ? mutationOutcome.cycle2MutantDuplex[1] : 'T'}
            </text>
            <text x={198} y={48} fontSize={11} fontFamily="DM Sans, sans-serif" fill="#B45309" fontWeight={700}>
              Fixed Mutation (G≡C → A=T)
            </text>
          </g>

          <text
            x={16}
            y={124}
            fill="#334155"
            fontFamily="DM Sans, sans-serif"
            fontSize={11.5}
          >
            A=T is a valid Watson–Crick pair—MMR can no longer detect an error.
          </text>
          <text
            x={16}
            y={140}
            fill="#334155"
            fontFamily="DM Sans, sans-serif"
            fontSize={11.5}
          >
            All future daughter cells inherit this changed DNA sequence.
          </text>
        </g>
      </g>
    </svg>
  );
};
