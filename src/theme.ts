export const COLORS = {
  // Backgrounds
  dark: '#0F0F10',
  card: '#1A1A1F',
  cardHigh: '#222228',

  // Brand palette
  pink: '#FF5BA7',
  orange: '#FF8A3D',
  yellow: '#FFCB57',
  green: '#7ED957',
  teal: '#26C6DA',
  purple: '#AA63F2',

  // Text
  white: '#F6F6F6',
  muted: 'rgba(246,246,246,0.50)',
  mutedLight: 'rgba(246,246,246,0.25)',

  // Borders
  border: 'rgba(255,255,255,0.09)',
  borderBright: 'rgba(255,255,255,0.18)',

  // Legacy aliases (keep existing screens compiling)
  roseDark: '#CC3D85',
  roseMid: '#FF5BA7',
  roseLight: '#FF8AB5',
  cream: '#0F0F10',
  peach: '#1A1A1F',
  gold: '#E5A830',
  goldLight: '#FFCB57',
  success: '#7ED957',
  successLight: '#A6E870',
  cardBg: '#1A1A1F',
  shadow: 'rgba(255,91,167,0.25)',
};

export const GRADIENTS = {
  primary: ['#FF5BA7', '#FF8A3D'] as const,
  purplePink: ['#AA63F2', '#FF5BA7'] as const,
  tealGreen: ['#26C6DA', '#7ED957'] as const,
  darkBg: ['#0F0F10', '#16161C'] as const,

  // Legacy
  roseDeep: ['#FF5BA7', '#FF8A3D'] as const,
  warmCream: ['#0F0F10', '#16161C'] as const,
  analyzing: ['#0F0F10', '#0D0D14'] as const,
  gold: ['#FFCB57', '#FF8A3D'] as const,
  success: ['#7ED957', '#26C6DA'] as const,
};

export const RING_COLORS = ['#FF5BA7','#FF8A3D','#FFCB57','#7ED957','#26C6DA','#AA63F2'] as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};
