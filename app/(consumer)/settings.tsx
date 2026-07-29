import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { SurfaceCard } from "../../src/components/ui/Card";
import { PrototypeBadge } from "../../src/components/ui/PrototypeBadge";
import { Icon, SemanticIconName } from "../../src/design-system/icons/Icon";
import { useSessionStore } from "../../src/state/useSessionStore";
import { useToast } from "../../src/hooks/useToast";
import { ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

interface SettingRow {
  id: string;
  label: string;
  icon: SemanticIconName;
  description: string;
  actionType?: "nav" | "toast" | "signout";
}

const SETTING_GROUPS: { groupName: string; rows: SettingRow[] }[] = [
  {
    groupName: "Account & Security",
    rows: [
      {
        id: "account",
        label: "Account Information",
        icon: "profile",
        description: "Manage display profile, email and phone",
        actionType: "toast",
      },
      {
        id: "privacy",
        label: "Privacy & Visibility",
        icon: "settings",
        description: "Activity visibility and friend requests",
        actionType: "toast",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: "sparkles",
        description: "Push, email and SMS notifications",
        actionType: "toast",
      },
    ],
  },
  {
    groupName: "Preferences",
    rows: [
      {
        id: "location",
        label: "Location Services",
        icon: "location",
        description: "Manage city selection and GPS permission",
        actionType: "nav",
      },
      {
        id: "blocked",
        label: "Blocked Users",
        icon: "close",
        description: "Manage blocked profiles and accounts",
        actionType: "toast",
      },
    ],
  },
  {
    groupName: "Support & Prototype",
    rows: [
      {
        id: "help",
        label: "Help & Support",
        icon: "heart",
        description: "FAQ, feedback and contact",
        actionType: "toast",
      },
      {
        id: "info",
        label: "Prototype Information",
        icon: "sparkles",
        description: "Build v1.0.0 • Midnight Kinetic Expo 57",
        actionType: "toast",
      },
      {
        id: "signout",
        label: "Sign Out",
        icon: "close",
        description: "Reset active session to guest mode",
        actionType: "signout",
      },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, status, selectedCity } = useSessionStore();
  const { showToast } = useToast();

  const handleRowPress = (row: SettingRow) => {
    if (row.actionType === "signout") {
      signOut();
      showToast("Signed Out", "Returned to guest session state.", "info");
      router.replace(ROUTES.public.welcome);
    } else if (row.id === "location") {
      router.push(ROUTES.public.location);
    } else {
      showToast(
        row.label,
        `${row.label} settings are simulated in prototype mode.`,
        "info",
      );
    }
  };

  return (
    <Screen safeAreaEdges={["top"]} style={styles.container}>
      <AppHeader title="Settings" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <AppText variant="display">Preferences</AppText>
          <PrototypeBadge label="PROTOTYPE SETTINGS" />
        </View>

        <SurfaceCard style={styles.statusSummaryCard}>
          <View style={styles.summaryRow}>
            <Icon name="profile" size="md" color={theme.colors.accentStart} />
            <View style={styles.summaryText}>
              <AppText variant="bodyStrong">
                Session Status: {status.toUpperCase()}
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                Active Location: {selectedCity} • Currency: ZAR
              </AppText>
            </View>
          </View>
        </SurfaceCard>

        {SETTING_GROUPS.map((group) => (
          <View key={group.groupName} style={styles.groupSection}>
            <AppText variant="heading" style={styles.groupTitle}>
              {group.groupName}
            </AppText>

            <SurfaceCard style={styles.groupCard}>
              {group.rows.map((row, idx) => (
                <Pressable
                  key={row.id}
                  onPress={() => handleRowPress(row)}
                  accessibilityRole="button"
                  accessibilityLabel={row.label}
                  style={({ pressed }) => [
                    styles.rowItem,
                    idx > 0 && styles.rowBorder,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Icon
                    name={row.icon}
                    size="sm"
                    color={
                      row.id === "signout"
                        ? theme.colors.statusDanger
                        : theme.colors.textPrimary
                    }
                  />
                  <View style={styles.rowTextContainer}>
                    <AppText
                      variant="bodyStrong"
                      color={
                        row.id === "signout"
                          ? theme.colors.statusDanger
                          : theme.colors.textPrimary
                      }
                    >
                      {row.label}
                    </AppText>
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      {row.description}
                    </AppText>
                  </View>
                  <Icon
                    name="chevronRight"
                    size="sm"
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              ))}
            </SurfaceCard>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
  },
  scrollContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  statusSummaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  summaryText: {
    flex: 1,
  },
  groupSection: {
    marginBottom: theme.spacing.lg,
  },
  groupTitle: {
    marginBottom: theme.spacing.sm,
  },
  groupCard: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  rowPressed: {
    opacity: 0.8,
  },
  rowTextContainer: {
    flex: 1,
  },
});
