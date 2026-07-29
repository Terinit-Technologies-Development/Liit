import { semanticColors, colorPrimitives } from "../tokens/colors";
import { typographyTokens, fontFamilies } from "../tokens/typography";
import { spacingTokens } from "../tokens/spacing";
import { radiiTokens } from "../tokens/radii";
import { motionTokens } from "../tokens/motion";
import { layoutTokens } from "../tokens/layout";

export const theme = {
  colors: semanticColors,
  colorPrimitives,
  typography: typographyTokens,
  fonts: fontFamilies,
  spacing: spacingTokens,
  radii: radiiTokens,
  motion: motionTokens,
  layout: layoutTokens,
};

export type Theme = typeof theme;
