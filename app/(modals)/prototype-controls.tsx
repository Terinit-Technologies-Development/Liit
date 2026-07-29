import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Stack } from "../../src/components/ui/Stack";
import { Row } from "../../src/components/ui/Row";
import { Divider } from "../../src/components/ui/Divider";
import { IconButton } from "../../src/components/ui/IconButton";
import { useAppStore, PrototypeScenario } from "../../src/state/useAppStore";
import { useSessionStore } from "../../src/state/useSessionStore";
import { envConfig } from "../../src/config/env";
import { mockUser } from "../../src/fixtures";
import { theme } from "../../src/design-system/theme";

export default function PrototypeControlsScreen() {
  const router = useRouter();
  const {
    activeMode,
    scenario,
    hasCompletedOnboarding,
    setActiveMode,
    setScenario,
    setOnboardingCompleted,
    resetPrototype,
  } = useAppStore();

  const resetSession = useSessionStore((s) => s.resetSession);

  const handleModeSwitch = (mode: "consumer" | "creator") => {
    setActiveMode(mode);
    if (mode === "creator") {
      router.replace("/(creator)/dashboard");
    } else {
      router.replace("/(consumer)/feed");
    }
  };

  const handleResetAll = () => {
    resetPrototype();
    resetSession();
  };

  const scenarios: { key: PrototypeScenario; label: string }[] = [
    { key: "normal", label: "Normal" },
    { key: "sold_out", label: "Sold Out Events" },
    { key: "offline", label: "Offline State" },
    { key: "payment_decline", label: "Payment Decline" },
    { key: "live_event", label: "Live Event Active" },
  ];

  return (
    <Screen scrollable>
      <Row justify="space-between" align="center" style={styles.topRow}>
        <AppText variant="heading">Prototype Controls</AppText>
        <IconButton
          icon="close"
          onPress={() => router.back()}
          accessibilityLabel="Close controls"
          variant="surface"
          size="sm"
        />
      </Row>

      <Stack gap="lg" style={styles.content}>
        {/* Mode Switcher */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Active Operating Mode</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Switch between Consumer and Creator views using the same identity.
            </AppText>
            <Row gap="sm">
              <Chip
                label="Consumer Mode"
                selected={activeMode === "consumer"}
                onPress={() => handleModeSwitch("consumer")}
              />
              <Chip
                label="Creator Mode"
                selected={activeMode === "creator"}
                onPress={() => handleModeSwitch("creator")}
              />
            </Row>
          </Stack>
        </Card>

        {/* Prototype Scenario Controls */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">
              Deterministic Scenario Overrides
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Test deterministic UI states across screens.
            </AppText>
            <Row gap="xs" wrap>
              {scenarios.map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  selected={scenario === item.key}
                  onPress={() => setScenario(item.key)}
                />
              ))}
            </Row>
          </Stack>
        </Card>

        {/* Onboarding State */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Onboarding State</AppText>
            <Row justify="space-between" align="center">
              <AppText variant="body" color={theme.colors.textSecondary}>
                Status: {hasCompletedOnboarding ? "Completed" : "Incomplete"}
              </AppText>
              <Chip
                label={
                  hasCompletedOnboarding
                    ? "Reset Onboarding"
                    : "Complete Onboarding"
                }
                onPress={() => setOnboardingCompleted(!hasCompletedOnboarding)}
              />
            </Row>
          </Stack>
        </Card>

        {/* Active Identity Info */}
        <Card radius="xl" padding="lg">
          <Stack gap="xs">
            <AppText variant="subheading">Active Fixture Identity</AppText>
            <AppText variant="body">
              {mockUser.profile.displayName} (@{mockUser.profile.handle})
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Email: {mockUser.email} • ID: {mockUser.id}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Location: {mockUser.profile.city}, {mockUser.profile.country}
            </AppText>
          </Stack>
        </Card>

        {/* Environment & Build Info */}
        <Card radius="xl" padding="lg">
          <Stack gap="xs">
            <AppText variant="subheading">App & Environment Info</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              App Name: {envConfig.appName} ({envConfig.appVersion})
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Environment: {envConfig.environment} • Latency:{" "}
              {envConfig.mockApiLatencyMs}ms
            </AppText>
          </Stack>
        </Card>

        {/* Component Preview Navigation */}
        <AppButton
          label="Open Component Preview Library"
          onPress={() => router.push("/(modals)/component-preview")}
          variant="secondary"
          leftIcon="sparkles"
          fullWidth
        />

        <Divider />

        {/* Reset Prototype */}
        <AppButton
          label="Reset All Prototype State"
          onPress={handleResetAll}
          variant="danger"
          fullWidth
        />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingVertical: theme.spacing.md,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
  },
});
