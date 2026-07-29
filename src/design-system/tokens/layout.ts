/**
 * Layout & Interaction Bounds Tokens
 */

export const layoutTokens = {
  minTouchTarget: 44, // Accessibility requirement
  controlHeightSm: 36,
  controlHeightMd: 44,
  controlHeightLg: 52,

  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  screenGutter: 16,
  maxContentWidth: 600, // Web container constraint

  zIndex: {
    base: 0,
    card: 1,
    header: 10,
    overlay: 100,
    modal: 200,
    toast: 300,
  },
} as const;
