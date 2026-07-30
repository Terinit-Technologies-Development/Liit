/**
 * Midnight Kinetic Semantic & Primitive Color Palette
 * Harmonised with Refined Dark creator theme.
 */

export const colorPrimitives = {
  midnight950: "#0F0D16", // Primary dark canvas
  midnight900: "#161420", // Recessed surface
  midnight850: "#1D1A27", // Card surface
  midnight800: "#211E2A", // Primary surface
  midnight750: "#272431", // Elevated surface
  midnight700: "#322E3E", // Ghost border / divider
  midnight600: "#464154", // Border strong

  lavender50: "#F5EEFC", // Text primary
  lavender100: "#E8DCF5", // Text high contrast
  lavender300: "#B5AEC4", // Text secondary (muted lavender-grey)
  lavender500: "#807A92", // Text muted / placeholder

  violet400: "#9591FF", // Accent start
  purple400: "#C180FF", // Accent end
  violet500: "#7C75FF", // Accent solid
  violet600: "#645BFF", // Accent pressed

  pink500: "#FF4D7D", // Live / Warm Pink
  emerald400: "#34D399", // Success
  amber400: "#FBBF24", // Warning
  red400: "#F87171", // Destructive / Error

  black: "#000000",
  white: "#FFFFFF",
  transparent: "transparent",
};

export const semanticColors = {
  canvas: colorPrimitives.midnight950,
  recessed: colorPrimitives.midnight900,
  surfacePrimary: colorPrimitives.midnight800,
  surfaceElevated: colorPrimitives.midnight750,
  surfaceCard: colorPrimitives.midnight850,
  surfaceRecessed: colorPrimitives.midnight900,
  glass: "rgba(39, 36, 49, 0.72)",

  borderSubtle: "rgba(181, 174, 196, 0.12)",
  ghostBorder: "rgba(181, 174, 196, 0.15)",
  borderStrong: colorPrimitives.midnight600,
  borderFocus: colorPrimitives.violet400,

  textPrimary: colorPrimitives.lavender50,
  textSecondary: colorPrimitives.lavender300,
  textMuted: colorPrimitives.lavender500,
  textInverse: colorPrimitives.midnight950,

  accentStart: colorPrimitives.violet400,
  accentEnd: colorPrimitives.purple400,
  accentSolid: colorPrimitives.violet500,
  accentPressed: colorPrimitives.violet600,

  live: colorPrimitives.pink500,
  statusLive: colorPrimitives.pink500,
  success: colorPrimitives.emerald400,
  statusSuccess: colorPrimitives.emerald400,
  warning: colorPrimitives.amber400,
  statusWarning: colorPrimitives.amber400,
  destructive: colorPrimitives.red400,
  statusDanger: colorPrimitives.red400,

  interactiveDisabled: "rgba(245, 238, 252, 0.25)",
  interactivePressed: "rgba(149, 145, 255, 0.15)",

  overlayBackdrop: "rgba(15, 13, 22, 0.85)",
  divider: "rgba(181, 174, 196, 0.12)",
  skeletonBase: "rgba(33, 30, 42, 0.8)",
  skeletonHighlight: "rgba(39, 36, 49, 0.9)",

  // Semantic Badge & Glow Tokens
  purple: colorPrimitives.purple400,
  purpleBadgeBg: "rgba(193, 128, 255, 0.12)",
  purpleBadgeBorder: "rgba(193, 128, 255, 0.30)",
  pinkBadgeBg: "rgba(255, 77, 125, 0.15)",
  violetBadgeBg: "rgba(149, 145, 255, 0.15)",
  emeraldBadgeBg: "rgba(52, 211, 153, 0.15)",
  amberBadgeBg: "rgba(251, 191, 36, 0.15)",
  amberBadgeBorder: "rgba(251, 191, 36, 0.30)",
  heroGlowBg: "rgba(149, 145, 255, 0.15)",

  // Direct Primitive Exits
  purple400: colorPrimitives.purple400,
  amber400: colorPrimitives.amber400,
  emerald400: colorPrimitives.emerald400,
  pink500: colorPrimitives.pink500,
  midnight700: colorPrimitives.midnight700,
};

export type SemanticColors = typeof semanticColors;
