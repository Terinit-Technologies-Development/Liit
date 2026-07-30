export const radiiTokens = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  largeCard: 32,
  pill: 9999,
  full: 9999,
} as const;

export type RadiiTokens = typeof radiiTokens;
