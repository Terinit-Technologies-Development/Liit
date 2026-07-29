import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { SurfaceCard } from "../../src/components/ui/Card";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { StatusPill } from "../../src/components/ui/StatusPill";
import { Icon } from "../../src/design-system/icons/Icon";
import { useAppStore } from "../../src/state/useAppStore";
import { useToast } from "../../src/hooks/useToast";
import { ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

export default function ModeSwitchModal() {
  const router = useRouter();
  const { activeMode, setMode } = useAppStore();
  const { showToast } = useToast();

  const handleSelectConsumer = () => {
    setMode("consumer");
    showToast(
      "Switched to Consumer Mode",
      "Navigating to event discovery feed.",
      "info",
    );
    router.replace(ROUTES.consumer.feed);
  };

  const handleSelectCreator = () => {
    setMode("creator");
    showToast(
      "Switched to Creator Mode",
      "Navigating to host dashboard.",
      "info",
    );
    router.replace(ROUTES.creator.dashboard);
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Operating Mode Switcher</AppText>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Close mode switcher modal"
          hitSlop={8}
        >
          <Icon name="close" size="sm" color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <AppText variant="display" style={styles.title}>
          Choose Your LIIT Experience
        </AppText>
        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          LIIT seamlessly transitions between event attendee discovery and event
          creator publishing under your single identity.
        </AppText>

        {/* Consumer Card */}
        <Pressable onPress={handleSelectConsumer}>
          <SurfaceCard
            style={[
              styles.modeCard,
              activeMode === "consumer" && styles.modeCardActive,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Icon
                name="sparkles"
                size="md"
                color={theme.colors.accentStart}
              />
              <View style={styles.cardTitleContainer}>
                <AppText variant="heading">Consumer Mode</AppText>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  Discovery, social coordination, tickets & wallet
                </AppText>
              </View>
              {activeMode === "consumer" ? (
                <StatusPill label="ACTIVE" type="live" />
              ) : null}
            </View>

            <View style={styles.featureList}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                • Explore Johannesburg events & venues
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                • Purchase and present QR ticket passes
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                • Follow hosts and coordinate with circle
              </AppText>
            </View>
          </SurfaceCard>
        </Pressable>

        {/* Creator Card */}
        <Pressable onPress={handleSelectCreator}>
          <SurfaceCard
            style={[
              styles.modeCard,
              activeMode === "creator" && styles.modeCardActive,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Icon name="calendar" size="md" color={theme.colors.purple400} />
              <View style={styles.cardTitleContainer}>
                <AppText variant="heading">Creator Mode</AppText>
                <AppText variant="caption" color={theme.colors.purple400}>
                  Event publishing, analytics, tickets & payouts
                </AppText>
              </View>
              {activeMode === "creator" ? (
                <StatusPill label="ACTIVE" type="verified" />
              ) : null}
            </View>

            <View style={styles.featureList}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                • Host dashboard & ZAR ticket sales metrics
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                • Event builder & ticket tier configuration
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                • Attendee check-in scanner & payouts
              </AppText>
            </View>
          </SurfaceCard>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <GradientButton
          label={`Switch to ${activeMode === "consumer" ? "Creator" : "Consumer"} Mode`}
          onPress={
            activeMode === "consumer"
              ? handleSelectCreator
              : handleSelectConsumer
          }
          fullWidth
        />
        <SecondaryButton
          label="Done"
          onPress={() => router.back()}
          fullWidth
          style={styles.doneBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xxs,
  },
  subtitle: {
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  modeCard: {
    gap: theme.spacing.md,
  },
  modeCardActive: {
    borderColor: theme.colors.accentStart,
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  featureList: {
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
  },
  footer: {
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  doneBtn: {
    marginTop: theme.spacing.xxs,
  },
});
