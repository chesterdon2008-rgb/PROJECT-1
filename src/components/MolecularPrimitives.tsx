import React from 'react';
import type { Base } from '../simulation/dnaModel';
import { isPurine } from '../simulation/dnaModel';

export const COLORS = {
  parental: '#1D4ED8',
  parentalLight: '#DBEAFE',
  newStrand: '#059669',
  newStrandLight: '#D1FAE5',
  rnaPrimer: '#D97706',
  rnaPrimerLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  ink: '#0F172A',
  muted: '#475569',
  border: '#CBD5E1',
  surface: '#FFFFFF',
  canvas: '#F8FAFC',
};

export function getBaseStyle(base: Base, isError = false, isRna = false) {
  if (isError) {
    return {
      fill: '#FEE2E2',
      stroke: '#DC2626',
      text: '#7F1D1D',
    };
  }
  if (isRna && base === 'U') {
    return {
      fill: '#FFEDD5',
      stroke: '#EA580C',
      text: '#7C2D12',
    };
  }
  switch (base) {
    case 'A':
      return { fill: '#DBEAFE', stroke: '#2563EB', text: '#1E3A8A' };
    case 'T':
      return { fill: '#FEF3C7', stroke: '#D97706', text: '#78350F' };
    case 'G':
      return { fill: '#D1FAE5', stroke: '#059669', text: '#064E3B' };
    case 'C':
      return { fill: '#E0E7FF', stroke: '#4F46E5', text: '#312E81' };
    case 'U':
      return { fill: '#FFEDD5', stroke: '#EA580C', text: '#7C2D12' };
  }
}

interface NucleotideBlockProps {
  x: number;
  y: number;
  base: Base;
  direction: 'down' | 'up';
  width?: number;
  height?: number;
  isError?: boolean;
  isRna?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}

/**
 * Renders a structurally accurate nitrogenous base block:
 * - Purines (A, G) are slightly taller than pyrimidines (T, C, U) to preserve constant helix width
 * - A/T use pointed complementary tips; G/C use stepped/squared tips to visualize pairing specificity
 */
export const NucleotideBlock: React.FC<NucleotideBlockProps> = ({
  x,
  y,
  base,
  direction,
  width = 34,
  height,
  isError = false,
  isRna = false,
  dimmed = false,
  onClick,
}) => {
  const purine = isPurine(base);
  const blockH = height ?? (purine ? 44 : 34);
  const halfW = width / 2;
  const style = getBaseStyle(base, isError, isRna);

  const sign = direction === 'down' ? 1 : -1;
  const tipY = y + sign * blockH;
  const shoulderY = y + sign * (blockH - 8);

  // Shape tip: A/T pointed wedge, G/C flat-stepped key
  let d: string;
  if (base === 'A' || base === 'T' || base === 'U') {
    if (base === 'A') {
      // Pointed outward
      d = `M ${x - halfW} ${y} L ${x + halfW} ${y} L ${x + halfW} ${shoulderY} L ${x} ${tipY} L ${x - halfW} ${shoulderY} Z`;
    } else {
      // Indented notch
      const notchY = y + sign * (blockH - 12);
      d = `M ${x - halfW} ${y} L ${x + halfW} ${y} L ${x + halfW} ${tipY} L ${x} ${notchY} L ${x - halfW} ${tipY} Z`;
    }
  } else {
    if (base === 'G') {
      // Rounded convex key
      d = `M ${x - halfW} ${y} L ${x + halfW} ${y} L ${x + halfW} ${shoulderY} Q ${x} ${tipY + sign * 4} ${x - halfW} ${shoulderY} Z`;
    } else {
      // Concave socket
      const innerY = y + sign * (blockH - 10);
      d = `M ${x - halfW} ${y} L ${x + halfW} ${y} L ${x + halfW} ${tipY} Q ${x} ${innerY} ${x - halfW} ${tipY} Z`;
    }
  }

  const labelY = y + sign * (blockH * 0.48);

  return (
    <g
      opacity={dimmed ? 0.25 : 1}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : undefined}
      style={{ transition: 'opacity 200ms ease, transform 250ms ease' }}
    >
      <path
        d={d}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={isError ? 2.2 : 1.5}
      />
      <text
        x={x}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={style.text}
        fontFamily="IBM Plex Mono, monospace"
        fontWeight={600}
        fontSize={14}
      >
        {base}
      </text>
    </g>
  );
};

interface HydrogenBondsProps {
  x: number;
  y1: number;
  y2: number;
  count: 2 | 3 | 0;
  highlighted?: boolean;
  isMismatch?: boolean;
}

export const HydrogenBonds: React.FC<HydrogenBondsProps> = ({
  x,
  y1,
  y2,
  count,
  highlighted = false,
  isMismatch = false,
}) => {
  if (isMismatch || count === 0) {
    // Render a crimson clash/wobble indicator instead of clean hydrogen bonds
    const midY = (y1 + y2) / 2;
    return (
      <g>
        <path
          d={`M ${x - 8} ${midY - 5} L ${x + 8} ${midY + 5} M ${x + 8} ${midY - 5} L ${x - 8} ${midY + 5}`}
          stroke="#DC2626"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </g>
    );
  }

  const offsets = count === 3 ? [-7, 0, 7] : [-4.5, 4.5];
  return (
    <g>
      {offsets.map((dx, i) => (
        <line
          key={i}
          x1={x + dx}
          y1={y1}
          x2={x + dx}
          y2={y2}
          stroke={highlighted ? '#0284C7' : '#64748B'}
          strokeWidth={highlighted ? 2.2 : 1.5}
          strokeDasharray="3 3"
        />
      ))}
    </g>
  );
};

interface CalloutPinProps {
  anchorX: number;
  anchorY: number;
  labelX: number;
  labelY: number;
  text: string;
  subtext?: string;
  align?: 'left' | 'center' | 'right';
  accent?: 'cobalt' | 'emerald' | 'amber' | 'crimson' | 'slate';
  visible?: boolean;
  highlighted?: boolean;
  onSelect?: () => void;
}

const ACCENT_MAP = {
  cobalt: { stroke: '#1D4ED8', bg: '#EFF6FF', text: '#1E3A8A' },
  emerald: { stroke: '#059669', bg: '#ECFDF5', text: '#065F46' },
  amber: { stroke: '#D97706', bg: '#FFFBEB', text: '#92400E' },
  crimson: { stroke: '#DC2626', bg: '#FEF2F2', text: '#991B1B' },
  slate: { stroke: '#475569', bg: '#FFFFFF', text: '#0F172A' },
};

export const CalloutPin: React.FC<CalloutPinProps> = ({
  anchorX,
  anchorY,
  labelX,
  labelY,
  text,
  subtext,
  align = 'center',
  accent = 'slate',
  visible = true,
  highlighted = false,
  onSelect,
}) => {
  if (!visible) return null;
  const palette = ACCENT_MAP[accent];
  const textW = Math.max(text.length * 7.5, (subtext?.length ?? 0) * 6.85) + 28;
  const boxH = subtext ? 40 : 28;

  let boxX = labelX - textW / 2;
  if (align === 'left') boxX = labelX;
  if (align === 'right') boxX = labelX - textW;
  const boxY = labelY - boxH / 2;

  // Closest point on box edge to anchor
  const lineTargetX = Math.max(boxX, Math.min(boxX + textW, anchorX));
  const lineTargetY = anchorY < boxY ? boxY : anchorY > boxY + boxH ? boxY + boxH : labelY;

  return (
    <g
      onClick={onSelect}
      className={onSelect ? 'cursor-pointer' : undefined}
      style={{ transition: 'opacity 180ms ease' }}
    >
      <line
        x1={anchorX}
        y1={anchorY}
        x2={lineTargetX}
        y2={lineTargetY}
        stroke={highlighted ? palette.stroke : '#94A3B8'}
        strokeWidth={highlighted ? 2 : 1.3}
      />
      <circle
        cx={anchorX}
        cy={anchorY}
        r={highlighted ? 4.5 : 3.5}
        fill={palette.stroke}
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />
      <rect
        x={boxX}
        y={boxY}
        width={textW}
        height={boxH}
        rx={6}
        fill={highlighted ? palette.bg : '#FFFFFF'}
        stroke={highlighted ? palette.stroke : '#CBD5E1'}
        strokeWidth={highlighted ? 2 : 1}
      />
      <text
        x={boxX + textW / 2}
        y={subtext ? boxY + 13 : boxY + boxH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={palette.text}
        fontFamily="DM Sans, sans-serif"
        fontWeight={600}
        fontSize={12}
      >
        {text}
      </text>
      {subtext && (
        <text
          x={boxX + textW / 2}
          y={boxY + 28}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#475569"
          fontFamily="IBM Plex Mono, monospace"
          fontWeight={500}
          fontSize={10.5}
        >
          {subtext}
        </text>
      )}
    </g>
  );
};

interface PolarityTagProps {
  x: number;
  y: number;
  label: "5'" | "3'";
  color?: string;
}

export const PolarityTag: React.FC<PolarityTagProps> = ({
  x,
  y,
  label,
  color = COLORS.parental,
}) => (
  <g>
    <rect
      x={x - 13}
      y={y - 11}
      width={26}
      height={22}
      rx={4}
      fill="#FFFFFF"
      stroke={color}
      strokeWidth={1.5}
    />
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill={color}
      fontFamily="IBM Plex Mono, monospace"
      fontWeight={600}
      fontSize={12}
    >
      {label}
    </text>
  </g>
);
