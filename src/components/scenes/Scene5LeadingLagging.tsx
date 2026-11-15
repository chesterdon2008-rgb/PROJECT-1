import React from 'react';
import { CalloutPin, COLORS, PolarityTag } from '../MolecularPrimitives';

interface SceneProps {
  subStepIndex: number;
  progress: number;
  showLabels: boolean;
  highlightedId: string | null;
  onSelectFocus: (id: string) => void;
}

export const Scene5LeadingLagging: React.FC<SceneProps> = ({
  subStepIndex,
  progress,
  showLabels,
  highlightedId,
  onSelectFocus,
}) => {
  const primersReplaced = subStepIndex >= 1;
  const nicksSealed = subStepIndex >= 2;
  const forkX = 640;

  // Primer color turns from Amber (RNA) to Emerald (DNA) on subStepIndex >= 1
  const primerStroke = primersReplaced ? COLORS.newStrand : COLORS.rnaPrimer;
  const primerLabel = primersReplaced ? 'DNA (primer replaced)' : 'RNA Primer';

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-full select-none"
      role="img"
      aria-label="Scene 5: Simultaneous Leading and Lagging strand synthesis, RNA primer replacement, and DNA ligase nick sealing"
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
        Leading &amp; Lagging Strands at the Same Replication Fork
      </text>
      <text
        x={32}
        y={56}
        fill="#475569"
        fontFamily="DM Sans, sans-serif"
        fontSize={12}
      >
        {subStepIndex === 0 &&
          'Leading strand grows continuously toward the fork; lagging strand forms Okazaki fragments away from it.'}
        {subStepIndex === 1 &&
          'RNA primers are excised and replaced with DNA nucleotides, leaving small sugar-phosphate backbone nicks.'}
        {subStepIndex === 2 &&
          'DNA Ligase seals every nick between Okazaki fragments to yield a continuous daughter strand.'}
      </text>

      {/* Fork Unwound Geometry */}
      {/* Upper Parental Template: 3' (left) -> 5' (right) */}
      <path
        d={`M 75 130 L 470 130 C 545 130, 585 215, ${forkX} 215 L 845 215`}
        fill="none"
        stroke={COLORS.parental}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Lower Parental Template: 5' (left) -> 3' (right) */}
      <path
        d={`M 75 370 L 470 370 C 545 370, 585 285, ${forkX} 285 L 845 285`}
        fill="none"
        stroke={COLORS.parental}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* Base ticks along parental double helix ahead of fork */}
      {[670, 705, 740, 775, 810].map((bx) => (
        <line key={bx} x1={bx} y1={218} x2={bx} y2={282} stroke="#94A3B8" strokeWidth={2} strokeDasharray="3 3" />
      ))}

      {/* Helicase at Fork */}
      <g transform={`translate(${forkX - 18}, 250)`}>
        <polygon
          points="-36,-34 24,-22 40,0 24,22 -36,34 -18,0"
          fill="#CCFBF1"
          stroke="#0D9488"
          strokeWidth={2}
        />
        <text x={4} y={4} textAnchor="middle" fontSize={10.5} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#115E59">
          Helicase
        </text>
      </g>

      {/* LEADING STRAND (Top, continuous 5' -> 3' toward fork) */}
      <g>
        {/* Single primer on left */}
        <line
          x1={92}
          y1={164}
          x2={145}
          y2={164}
          stroke={primerStroke}
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Continuous DNA synthesis toward fork */}
        <line
          x1={147}
          y1={164}
          x2={530 + progress * 18}
          y2={164}
          stroke={COLORS.newStrand}
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Arrowhead showing continuous growth toward fork */}
        <polygon
          points={`${530 + progress * 18},158 ${544 + progress * 18},164 ${530 + progress * 18},170`}
          fill={COLORS.newStrand}
        />

        {/* DNA Pol on Leading Strand */}
        <rect
          x={502 + progress * 18}
          y={144}
          width={56}
          height={40}
          rx={14}
          fill="#ECFDF5"
          fillOpacity={0.92}
          stroke="#059669"
          strokeWidth={1.8}
        />
        <text
          x={530 + progress * 18}
          y={164}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9.5}
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight={700}
          fill="#064E3B"
        >
          DNA Pol
        </text>

        <PolarityTag x={54} y={130} label="3'" color={COLORS.parental} />
        <PolarityTag x={864} y={215} label="5'" color={COLORS.parental} />
        <PolarityTag x={74} y={164} label="5'" color={primerStroke} />
        <PolarityTag x={576 + progress * 18} y={164} label="3'" color={COLORS.newStrand} />
      </g>

      {/* LAGGING STRAND (Bottom, discontinuous Okazaki fragments synthesized 5' -> 3' AWAY from fork) */}
      <g>
        {/* Fragment 1 (Oldest, far left) */}
        <line x1={245} y1={336} x2={212} y2={336} stroke={primerStroke} strokeWidth={6} strokeLinecap="round" />
        <line x1={210} y1={336} x2={98} y2={336} stroke={COLORS.newStrand} strokeWidth={6} strokeLinecap="round" />
        <polygon points="100,330 88,336 100,342" fill={COLORS.newStrand} />

        {/* Nick 1 between Fragment 1 and Fragment 2 */}
        {!nicksSealed ? (
          <g>
            <line x1={250} y1={328} x2={250} y2={344} stroke="#DC2626" strokeWidth={2.2} strokeDasharray="2 2" />
            {subStepIndex === 1 && (
              <text x={250} y={317} textAnchor="middle" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#DC2626">
                nick
              </text>
            )}
          </g>
        ) : (
          <line x1={244} y1={336} x2={258} y2={336} stroke={COLORS.newStrand} strokeWidth={6} strokeLinecap="round" />
        )}

        {/* Fragment 2 (Middle) */}
        <line x1={405} y1={336} x2={372} y2={336} stroke={primerStroke} strokeWidth={6} strokeLinecap="round" />
        <line x1={370} y1={336} x2={256} y2={336} stroke={COLORS.newStrand} strokeWidth={6} strokeLinecap="round" />
        <polygon points="258,330 246,336 258,342" fill={COLORS.newStrand} />

        {/* Nick 2 between Fragment 2 and Fragment 3 */}
        {!nicksSealed ? (
          <g>
            <line x1={410} y1={328} x2={410} y2={344} stroke="#DC2626" strokeWidth={2.2} strokeDasharray="2 2" />
            {subStepIndex === 1 && (
              <text x={410} y={317} textAnchor="middle" fontSize={9.5} fontFamily="IBM Plex Mono, monospace" fontWeight={600} fill="#DC2626">
                nick
              </text>
            )}
          </g>
        ) : (
          <line x1={404} y1={336} x2={418} y2={336} stroke={COLORS.newStrand} strokeWidth={6} strokeLinecap="round" />
        )}

        {/* Fragment 3 (Newest, closest to fork) */}
        <line x1={540} y1={336} x2={508} y2={336} stroke={primerStroke} strokeWidth={6} strokeLinecap="round" />
        <line x1={506} y1={336} x2={416} y2={336} stroke={COLORS.newStrand} strokeWidth={6} strokeLinecap="round" />
        <polygon points="420,330 408,336 420,342" fill={COLORS.newStrand} />

        {/* DNA Pol on Lagging Strand Fragment 3 (moving left, away from fork) */}
        {subStepIndex === 0 && (
          <g transform={`translate(${434 - progress * 14}, 336)`}>
            <rect
              x={-28}
              y={-19}
              width={56}
              height={38}
              rx={14}
              fill="#ECFDF5"
              fillOpacity={0.94}
              stroke="#059669"
              strokeWidth={1.8}
            />
            <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#064E3B">
              DNA Pol
            </text>
          </g>
        )}

        {/* DNA Ligase Sealing Nicks on Substep 2 */}
        {nicksSealed && (
          <g
            transform="translate(330, 336)"
            onClick={() => onSelectFocus('ligase')}
            className="cursor-pointer"
          >
            <ellipse
              cx={0}
              cy={0}
              rx={52}
              ry={22}
              fill="#E0E7FF"
              fillOpacity={0.95}
              stroke={highlightedId === 'ligase' ? '#3730A3' : '#4F46E5'}
              strokeWidth={highlightedId === 'ligase' ? 2.8 : 2}
            />
            <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} fill="#312E81">
              DNA Ligase
            </text>
          </g>
        )}

        <PolarityTag x={54} y={370} label="5'" color={COLORS.parental} />
        <PolarityTag x={864} y={285} label="3'" color={COLORS.parental} />
        <PolarityTag x={558} y={336} label="5'" color={primerStroke} />
        <PolarityTag x={74} y={336} label="3'" color={COLORS.newStrand} />
      </g>

      {/* Required Labels */}
      <CalloutPin
        anchorX={330}
        anchorY={164}
        labelX={330}
        labelY={88}
        text="Leading strand · Continuous synthesis"
        subtext="One primer · 5'→3' toward fork"
        accent="emerald"
        visible={showLabels}
        highlighted={highlightedId === 'leading'}
        onSelect={() => onSelectFocus('leading')}
      />

      <CalloutPin
        anchorX={118}
        anchorY={164}
        labelX={118}
        labelY={88}
        text={primerLabel}
        accent={primersReplaced ? 'emerald' : 'amber'}
        visible={showLabels}
        highlighted={highlightedId === 'primer-replace'}
        onSelect={() => onSelectFocus('primer-replace')}
      />

      <CalloutPin
        anchorX={165}
        anchorY={336}
        labelX={165}
        labelY={436}
        text="Okazaki fragment"
        subtext="Synthesized 5'→3' away from fork"
        accent="emerald"
        visible={showLabels}
        highlighted={highlightedId === 'okazaki' || highlightedId === 'lagging'}
        onSelect={() => onSelectFocus('okazaki')}
      />

      <CalloutPin
        anchorX={524}
        anchorY={336}
        labelX={516}
        labelY={436}
        text={nicksSealed ? 'Nicks sealed by DNA Ligase' : 'Multiple primers (Lagging strand)'}
        subtext={nicksSealed ? 'Continuous phosphodiester backbone' : '1 primer per Okazaki fragment'}
        accent={nicksSealed ? 'cobalt' : 'amber'}
        visible={showLabels}
        highlighted={highlightedId === 'ligase' || highlightedId === 'lagging'}
        onSelect={() => onSelectFocus(nicksSealed ? 'ligase' : 'lagging')}
      />
    </svg>
  );
};
