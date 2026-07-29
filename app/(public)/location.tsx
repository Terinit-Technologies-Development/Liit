import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { SurfaceCard } from "../../src/components/ui/Card";
import { Icon } from "../../src/design-system/icons/Icon";
import { useSessionStore } from "../../src/state/useSessionStore";
import { ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

const CITIES = ["Johannesburg", "Cape Town", "Durban", "Pretoria"];

export default function LocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const isEditingFromSettings = params.returnTo === "settings";

  const { selectedCity, setSelectedCity, setLocationGranted } =
    useSessionStore();
  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  const handleRequestLocation = () => {
    setPermissionState("granted");
    setLocationGranted(true);
    setSelectedCity("Johannesburg");
  };

  const handleSimulateDenied = () => {
    setPermissionState("denied");
    setLocationGranted(false);
  };

  const handleContinue = () => {
    if (isEditingFromSettings) {
      router.replace(ROUTES.consumer.settings);
    } else {
      router.push(ROUTES.public.interests);
    }
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.container}>
      <AppHeader title="Location Setup" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        <AppText variant="display" style={styles.title}>
          Where are you discovering events?
        </AppText>
        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          LIIT matches nightlife, underground gigs, and social gatherings near
          your location.
        </AppText>

        {/* Permission status card */}
        <SurfaceCard style={styles.permissionCard}>
          <View style={styles.permissionRow}>
            <View style={styles.iconCircle}>
              <Icon
                name={permissionState === "denied" ? "alert" : "location"}
                size="md"
                color={
                  permissionState === "denied"
                    ? theme.colors.statusDanger
                    : theme.colors.accentStart
                }
              />
            </View>
            <View style={styles.permissionText}>
              <AppText variant="bodyStrong">
                {permissionState === "granted"
                  ? "Location Access Enabled"
                  : permissionState === "denied"
                    ? "Location Access Denied"
                    : "Device Location Services"}
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                {permissionState === "granted"
                  ? "Automatically syncing nearby Johannesburg venues"
                  : permissionState === "denied"
                    ? "Permission restricted. Please select your city manually below."
                    : "Grant location permission for distance & map filtering"}
              </AppText>
            </View>
          </View>

          {permissionState === "prompt" ? (
            <View style={styles.actionButtonsRow}>
              <GradientButton
                label="Use My Location"
                onPress={handleRequestLocation}
                leftIcon="location"
                fullWidth
              />
              <SecondaryButton
                label="Simulate Denied Permission"
                onPress={handleSimulateDenied}
                fullWidth
                style={styles.deniedSimBtn}
              />
            </View>
          ) : null}
        </SurfaceCard>

        {/* Manual City Selection */}
        <View style={styles.citySection}>
          <AppText variant="heading" style={styles.sectionTitle}>
            Choose City Manually
          </AppText>

          <View style={styles.cityGrid}>
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <Pressable
                  key={city}
                  onPress={() => setSelectedCity(city)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${city}`}
                  style={({ pressed }) => [
                    styles.cityChip,
                    isSelected && styles.cityChipSelected,
                    pressed && styles.cityChipPressed,
                  ]}
                >
                  <Icon
                    name={city === "Johannesburg" ? "sparkles" : "location"}
                    size="sm"
                    color={
                      isSelected
                        ? theme.colors.textInverse
                        : theme.colors.textSecondary
                    }
                  />
                  <AppText
                    variant="button"
                    color={
                      isSelected
                        ? theme.colors.textInverse
                        : theme.colors.textPrimary
                    }
                  >
                    {city}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <GradientButton
          label={
            isEditingFromSettings ? "Save & Return to Settings" : "Continue"
          }
          onPress={handleContinue}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  permissionCard: {
    marginBottom: theme.spacing.xl,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionText: {
    flex: 1,
  },
  actionButtonsRow: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  deniedSimBtn: {
    marginTop: theme.spacing.xxs,
  },
  citySection: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  cityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  cityChipSelected: {
    backgroundColor: theme.colors.accentStart,
    borderColor: theme.colors.accentStart,
  },
  cityChipPressed: {
    opacity: 0.85,
  },
  footer: {
    paddingBottom: theme.spacing.md,
  },
});
