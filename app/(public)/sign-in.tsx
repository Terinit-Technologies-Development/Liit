import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { FormField } from "../../src/components/forms/FormField";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { SurfaceCard } from "../../src/components/ui/Card";
import { PrototypeBadge } from "../../src/components/ui/PrototypeBadge";
import { Icon } from "../../src/design-system/icons/Icon";
import { useSessionStore } from "../../src/state/useSessionStore";
import { useAppStore } from "../../src/state/useAppStore";
import { ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("thabo@liit.app");
  const [phone, setPhone] = useState("+27 82 555 0199");
  const { setAuthenticatedUser, setGuestMode } = useSessionStore();
  const { completeOnboarding } = useAppStore();

  const handleSimulateSignIn = () => {
    setAuthenticatedUser();
    completeOnboarding();
    router.replace(ROUTES.consumer.feed);
  };

  const handleContinueAsGuest = () => {
    setGuestMode();
    completeOnboarding();
    router.replace(ROUTES.consumer.feed);
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.container}>
      <AppHeader title="Simulated Auth" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <PrototypeBadge label="NO CREDENTIALS TRANSMITTED" />
        </View>

        <AppText variant="display" style={styles.title}>
          Sign in to LIIT
        </AppText>
        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          This is a non-production prototype authentication gate. Pre-populated
          fixture credentials allow full prototype walkthrough.
        </AppText>

        <SurfaceCard style={styles.formCard}>
          <FormField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            label="Mobile Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <View style={styles.infoBox}>
            <Icon name="sparkles" size="sm" color={theme.colors.accentStart} />
            <AppText
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.infoText}
            >
              Signing in unlocks ticket purchases, host chat, saved events, and
              creator tools.
            </AppText>
          </View>
        </SurfaceCard>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label="Simulate Sign In"
          onPress={handleSimulateSignIn}
          fullWidth
        />
        <SecondaryButton
          label="Continue as Guest"
          onPress={handleContinueAsGuest}
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
  },
  scrollContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  badgeRow: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  formCard: {
    gap: theme.spacing.md,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.xs,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  guestButton: {
    marginTop: theme.spacing.xxs,
  },
});
