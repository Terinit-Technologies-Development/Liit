/**
 * Typography Tokens
 * Plus Jakarta Sans as primary body/heading font.
 * Syne as optional display font for creator showcase/hero titles.
 */

export const fontFamilies = {
  primaryRegular: "PlusJakartaSans-Regular",
  primaryMedium: "PlusJakartaSans-Medium",
  primarySemiBold: "PlusJakartaSans-SemiBold",
  primaryBold: "PlusJakartaSans-Bold",
  displayBold: "Syne-Bold",
  displayExtraBold: "Syne-ExtraBold",
};

export const typographyTokens = {
  display: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: fontFamilies.primaryBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  heading: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  subheading: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fontFamilies.primaryRegular,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodyStrong: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilies.primaryRegular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fontFamilies.primaryMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  button: {
    fontFamily: fontFamilies.primarySemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  metric: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
} as const;

export type TypographyTokenKey = keyof typeof typographyTokens;
