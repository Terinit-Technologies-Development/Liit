/**
 * Corner Radii Tokens
 * Recommended principles: major cards 24-32px radius, controls & chips pill or highly rounded.
 */

export const radiiTokens = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24, // Card radius baseline
  xxl: 32, // Large expressive cards
  full: 9999, // Pill / Avatar
} as const;

export type RadiiTokenKey = keyof typeof radiiTokens;
