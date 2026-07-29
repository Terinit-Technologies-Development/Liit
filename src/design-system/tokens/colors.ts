/**
 * Midnight Kinetic Semantic & Primitive Color Palette
 * Provisional LIIT design system foundation.
 */

export const colorPrimitives = {
  midnight950: "#0F0D16", // Primary dark canvas
  midnight900: "#161420", // Surface recessed
  midnight850: "#1D1A27", // Card surface
  midnight800: "#211E2A", // Surface primary
  midnight750: "#272431", // Surface elevated
  midnight700: "#322E3E", // Divider / border soft
  midnight600: "#464154", // Border strong

  lavender50: "#F5EEFC", // Text primary
  lavender100: "#E8DCF5", // Text high contrast
  lavender300: "#B5AEC4", // Text secondary (muted lavender-grey)
  lavender500: "#807A92", // Text muted / placeholder

  violet400: "#9591FF", // Accent start
  purple400: "#C180FF", // Accent end
  violet500: "#7C75FF", // Accent solid
  violet600: "#645BFF", // Accent pressed

  pink500: "#FF4D7D", // Status live / energetic badge
  emerald400: "#34D399", // Status success
  amber400: "#FBBF24", // Status warning
  red400: "#F87171", // Status danger / error

  black: "#000000",
  white: "#FFFFFF",
  transparent: "transparent",
};

export const semanticColors = {
  canvas: colorPrimitives.midnight950,
  surfaceRecessed: colorPrimitives.midnight900,
  surfacePrimary: colorPrimitives.midnight800,
  surfaceElevated: colorPrimitives.midnight750,
  surfaceCard: colorPrimitives.midnight850,

  borderSubtle: colorPrimitives.midnight700,
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

  statusLive: colorPrimitives.pink500,
  statusSuccess: colorPrimitives.emerald400,
  statusWarning: colorPrimitives.amber400,
  statusDanger: colorPrimitives.red400,

  interactiveDisabled: "rgba(245, 238, 252, 0.25)",
  interactivePressed: "rgba(149, 145, 255, 0.15)",

  overlayBackdrop: "rgba(15, 13, 22, 0.82)",
  divider: "rgba(181, 174, 196, 0.12)",
  skeletonBase: "rgba(33, 30, 42, 0.8)",
  skeletonHighlight: "rgba(39, 36, 49, 0.9)",
};

export type SemanticColors = typeof semanticColors;
