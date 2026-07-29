import React, { useState } from "react";
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
import { ProductMode } from "../../src/domain/identity";
import { ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

export default function ModeSwitchModal() {
  const router = useRouter();
  const { activeMode, setMode } = useAppStore();
  const { showToast } = useToast();

  // Local selection state - does NOT mutate global store until explicit confirmation
  const [selectedMode, setSelectedMode] = useState<ProductMode>(activeMode);

  const handleConfirmSwitch = () => {
    setMode(selectedMode);
    if (selectedMode === "consumer") {
      showToast(
        "Switched to Consumer Mode",
        "Navigating to event discovery feed.",
        "info",
      );
      router.replace(ROUTES.consumer.feed);
    } else {
      showToast(
        "Switched to Creator Mode",
        "Navigating to host dashboard.",
        "info",
      );
      router.replace(ROUTES.creator.dashboard);
    }
  };

  const handleCancel = () => {
    // Preserve original activeMode without mutating
    router.back();
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Operating Mode Switcher</AppText>
        <Pressable
          onPress={handleCancel}
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
          Select a mode below and tap confirm. Closing this modal preserves your
          active mode.
        </AppText>

        {/* Consumer Card */}
        <Pressable onPress={() => setSelectedMode("consumer")}>
          <SurfaceCard
            style={[
              styles.modeCard,
              selectedMode === "consumer" && styles.modeCardSelected,
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
              {selectedMode === "consumer" ? (
                <StatusPill
                  label={activeMode === "consumer" ? "ACTIVE" : "SELECTED"}
                  type="live"
                />
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
        <Pressable onPress={() => setSelectedMode("creator")}>
          <SurfaceCard
            style={[
              styles.modeCard,
              selectedMode === "creator" && styles.modeCardSelected,
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
              {selectedMode === "creator" ? (
                <StatusPill
                  label={activeMode === "creator" ? "ACTIVE" : "SELECTED"}
                  type="verified"
                />
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
          label={`Confirm ${selectedMode === "consumer" ? "Consumer" : "Creator"} Mode`}
          onPress={handleConfirmSwitch}
          fullWidth
        />
        <SecondaryButton
          label="Cancel (Keep Current Mode)"
          onPress={handleCancel}
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
  modeCardSelected: {
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
