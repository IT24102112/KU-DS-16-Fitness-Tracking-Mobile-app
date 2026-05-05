import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Ellipse, Line, Path, G } from 'react-native-svg';

// Equipment colour map
const EQUIP_COLORS = {
  barbell:          { bg: '#1E3A5F', accent: '#60A5FA', dark: '#93C5FD' },
  dumbbell:         { bg: '#1A2F1A', accent: '#4ADE80', dark: '#86EFAC' },
  kettlebell:       { bg: '#2D1A3E', accent: '#C084FC', dark: '#D8B4FE' },
  'resistance band':{ bg: '#2D2006', accent: '#FCD34D', dark: '#FDE68A' },
  'cable machine':  { bg: '#1A2030', accent: '#818CF8', dark: '#A5B4FC' },
  bodyweight:       { bg: '#1A2D2A', accent: '#34D399', dark: '#6EE7B7' },
  'pull-up bar':    { bg: '#2D1F1A', accent: '#FB923C', dark: '#FDBA74' },
  bench:            { bg: '#1A2030', accent: '#38BDF8', dark: '#7DD3FC' },
  treadmill:        { bg: '#1A1A2E', accent: '#F472B6', dark: '#F9A8D4' },
  'rowing machine': { bg: '#1A2D2D', accent: '#2DD4BF', dark: '#5EEAD4' },
  other:            { bg: '#252525', accent: '#94A3B8', dark: '#CBD5E1' },
};

// ── Individual equipment SVG illustrations ──────────────────────────────────

function BarbellSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Rect x="5" y="34" width="14" height="12" rx="3" fill={color} opacity="0.9" />
      <Rect x="8" y="30" width="8" height="20" rx="2" fill={color} />
      <Rect x="16" y="38" width="48" height="4" rx="2" fill={color} opacity="0.7" />
      <Rect x="61" y="34" width="14" height="12" rx="3" fill={color} opacity="0.9" />
      <Rect x="64" y="30" width="8" height="20" rx="2" fill={color} />
    </Svg>
  );
}

function DumbbellSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Rect x="8" y="30" width="16" height="20" rx="4" fill={color} opacity="0.9" />
      <Rect x="20" y="37" width="40" height="6" rx="3" fill={color} opacity="0.7" />
      <Rect x="56" y="30" width="16" height="20" rx="4" fill={color} opacity="0.9" />
      <Rect x="12" y="35" width="8" height="10" rx="2" fill={color} />
      <Rect x="60" y="35" width="8" height="10" rx="2" fill={color} />
    </Svg>
  );
}

function KettlebellSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path d="M40 12 C30 12 24 18 24 25 C18 25 14 29 14 35 L14 55 C14 62 20 68 28 68 L52 68 C60 68 66 62 66 55 L66 35 C66 29 62 25 56 25 C56 18 50 12 40 12 Z" fill={color} opacity="0.85" />
      <Path d="M32 22 C32 17 36 14 40 14 C44 14 48 17 48 22" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <Ellipse cx="40" cy="50" rx="18" ry="14" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
    </Svg>
  );
}

function ResistanceBandSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path d="M15 40 Q20 20 40 20 Q60 20 65 40 Q60 60 40 60 Q20 60 15 40 Z" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      <Path d="M22 28 Q40 15 58 28" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <Path d="M22 52 Q40 65 58 52" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

function BodyweightSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx="40" cy="18" r="8" fill={color} opacity="0.9" />
      <Path d="M40 26 L40 50" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <Path d="M40 36 L24 44" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <Path d="M40 36 L56 44" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <Path d="M40 50 L28 66" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <Path d="M40 50 L52 66" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function PullUpBarSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Rect x="8" y="18" width="64" height="8" rx="4" fill={color} opacity="0.9" />
      <Rect x="10" y="26" width="6" height="40" rx="3" fill={color} opacity="0.6" />
      <Rect x="64" y="26" width="6" height="40" rx="3" fill={color} opacity="0.6" />
      <Path d="M32 26 C32 26 28 38 28 48 C28 52 30 54 32 54 C34 54 36 52 36 50" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
      <Path d="M48 26 C48 26 52 38 52 48 C52 52 50 54 48 54 C46 54 44 52 44 50" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
    </Svg>
  );
}

function BenchSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Rect x="10" y="32" width="60" height="14" rx="6" fill={color} opacity="0.9" />
      <Rect x="14" y="46" width="8" height="22" rx="3" fill={color} opacity="0.7" />
      <Rect x="58" y="46" width="8" height="22" rx="3" fill={color} opacity="0.7" />
      <Rect x="18" y="62" width="14" height="5" rx="2" fill={color} opacity="0.5" />
      <Rect x="48" y="62" width="14" height="5" rx="2" fill={color} opacity="0.5" />
    </Svg>
  );
}

function TreadmillSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Rect x="12" y="44" width="56" height="10" rx="5" fill={color} opacity="0.9" />
      <Rect x="28" y="18" width="6" height="26" rx="3" fill={color} opacity="0.7" />
      <Rect x="46" y="18" width="6" height="26" rx="3" fill={color} opacity="0.7" />
      <Rect x="22" y="16" width="36" height="6" rx="3" fill={color} opacity="0.5" />
      <Rect x="14" y="52" width="8" height="16" rx="3" fill={color} opacity="0.6" />
      <Rect x="58" y="52" width="8" height="16" rx="3" fill={color} opacity="0.6" />
    </Svg>
  );
}

function GenericSVG({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx="40" cy="40" r="26" fill="none" stroke={color} strokeWidth="5" opacity="0.7" />
      <Path d="M40 20 L40 40 L54 40" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.9" />
    </Svg>
  );
}

const SVG_MAP = {
  barbell: BarbellSVG,
  dumbbell: DumbbellSVG,
  kettlebell: KettlebellSVG,
  'resistance band': ResistanceBandSVG,
  bodyweight: BodyweightSVG,
  'pull-up bar': PullUpBarSVG,
  bench: BenchSVG,
  treadmill: TreadmillSVG,
};

export function EquipmentImage({ equipment, size = 60, style }) {
  const colors = EQUIP_COLORS[equipment] || EQUIP_COLORS.other;
  const SvgComp = SVG_MAP[equipment] || GenericSVG;

  return (
    <View style={[{
      width: size + 16, height: size + 16,
      borderRadius: (size + 16) / 2,
      backgroundColor: colors.bg,
      justifyContent: 'center', alignItems: 'center',
    }, style]}>
      <SvgComp size={size} color={colors.accent} />
    </View>
  );
}

export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'forearms', 'core', 'glutes', 'quadriceps', 'hamstrings',
  'calves', 'full body', 'cardio',
];

export const EQUIPMENT_LIST = [
  'barbell', 'dumbbell', 'kettlebell', 'resistance band',
  'cable machine', 'bodyweight', 'pull-up bar',
  'bench', 'treadmill', 'rowing machine', 'other',
];

export const MUSCLE_ICONS = {
  chest: '🫁', back: '🔙', shoulders: '💆', biceps: '💪',
  triceps: '🦾', forearms: '🖐️', core: '⭕', glutes: '🍑',
  quadriceps: '🦵', hamstrings: '🦵', calves: '🦶',
  'full body': '🏃', cardio: '❤️',
};

export const EQUIP_COLORS_EXPORT = EQUIP_COLORS;
