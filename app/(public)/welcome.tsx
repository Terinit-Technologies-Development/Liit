import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { GlassSurface } from "../../src/components/ui/GlassSurface";
import { PrototypeBadge } from "../../src/components/ui/PrototypeBadge";
import { useSessionStore } from "../../src/state/useSessionStore";
import { ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

const STEPS = [
  {
    title: "Pulse of Nightlife & Culture",
    subtitle:
      "Discover exclusive events, curated DJ sets, rooftop pop-ups, and secret venues across Johannesburg.",
    tag: "DISCOVER",
  },
  {
    title: "Real-Time Social Coordination",
    subtitle:
      "See where your circle is going, split tables, coordinate arrival times, and double-dot event RSVPs.",
    tag: "CONNECT",
  },
  {
    title: "Instant Ticket Ownership",
    subtitle:
      "Secure verified access passes with dynamic QR entry, contactless check-in, and transfer privileges.",
    tag: "EXPERIENCE",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const setGuestMode = useSessionStore((s) => s.setGuestMode);

  const currentStep = STEPS[activeStep];

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      router.push(ROUTES.public.location);
    }
  };

  const handleGuest = () => {
    setGuestMode();
    router.push(ROUTES.public.location);
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.container}>
      <View style={styles.topRow}>
        {/* Double-dot brand motif */}
        <View style={styles.doubleDotMotif}>
          <View style={[styles.dot, styles.dotPrimary]} />
          <View style={[styles.dot, styles.dotSecondary]} />
        </View>
        <PrototypeBadge label="LIIT PROTOTYPE" />
      </View>

      <View style={styles.heroGlowContainer}>
        <View style={styles.heroGlow} />
      </View>

      <View style={styles.centerContent}>
        <GlassSurface radius="largeCard" padding="xl" style={styles.glassCard}>
          <View style={styles.stepTag}>
            <AppText variant="label" color={theme.colors.accentStart}>
              {currentStep.tag}
            </AppText>
          </View>

          <AppText variant="display" style={styles.titleText}>
            {currentStep.title}
          </AppText>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.subtitleText}
          >
            {currentStep.subtitle}
          </AppText>

          {/* Stepper dots */}
          <View style={styles.stepperRow}>
            {STEPS.map((_, idx) => (
              <Pressable
                key={idx}
                onPress={() => setActiveStep(idx)}
                accessibilityLabel={`Go to step ${idx + 1}`}
                style={[
                  styles.stepperDot,
                  idx === activeStep && styles.stepperDotActive,
                ]}
              />
            ))}
          </View>
        </GlassSurface>
      </View>

      <View style={styles.footerActions}>
        <GradientButton
          label={activeStep === STEPS.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          fullWidth
        />
        <SecondaryButton
          label="Continue as Guest"
          onPress={handleGuest}
          fullWidth
          style={styles.guestButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
  },
  doubleDotMotif: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: theme.radii.full,
  },
  dotPrimary: {
    backgroundColor: theme.colors.accentStart,
  },
  dotSecondary: {
    backgroundColor: theme.colors.accentEnd,
  },
  heroGlowContainer: {
    position: "absolute",
    top: "25%",
    left: "10%",
    right: "10%",
    alignItems: "center",
  },
  heroGlow: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.heroGlowBg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    marginVertical: theme.spacing.xl,
  },
  glassCard: {
    borderWidth: 1,
    borderColor: theme.colors.ghostBorder,
  },
  stepTag: {
    marginBottom: theme.spacing.sm,
  },
  titleText: {
    marginBottom: theme.spacing.md,
    lineHeight: 38,
  },
  subtitleText: {
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  stepperDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.midnight700,
  },
  stepperDotActive: {
    width: 24,
    backgroundColor: theme.colors.accentStart,
  },
  footerActions: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  guestButton: {
    marginTop: theme.spacing.xxs,
  },
});
