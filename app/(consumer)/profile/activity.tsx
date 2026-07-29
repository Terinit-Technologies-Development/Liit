import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppText } from "../../../src/components/ui/AppText";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { SurfaceCard } from "../../../src/components/ui/Card";
import { Icon } from "../../../src/design-system/icons/Icon";
import { theme } from "../../../src/design-system/theme";

const ACTIVITIES = [
  {
    id: "1",
    title: "RSVPed to Subterranean Afro-Tech Night",
    date: "Today at 14:20",
    icon: "sparkles" as const,
  },
  {
    id: "2",
    title: "Saved Rooftop Amapiano Sundowners",
    date: "Yesterday at 20:15",
    icon: "heart" as const,
  },
  {
    id: "3",
    title: "Purchased General Pass for Deep House Underground JHB",
    date: "25 Jul 2026",
    icon: "check" as const,
  },
  {
    id: "4",
    title: "Followed DJ Kwaito Soul",
    date: "20 Jul 2026",
    icon: "profile" as const,
  },
  {
    id: "5",
    title: "Checked in at Rosebank Vinyl Lounge",
    date: "18 Jul 2026",
    icon: "location" as const,
  },
];

export default function ActivityScreen() {
  const router = useRouter();

  return (
    <Screen safeAreaEdges={["top"]} style={styles.container}>
      <AppHeader
        title="Activity History"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="display" style={styles.title}>
          Recent Activity
        </AppText>

        <View style={styles.list}>
          {ACTIVITIES.map((act) => (
            <SurfaceCard key={act.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Icon
                    name={act.icon}
                    size="sm"
                    color={theme.colors.accentStart}
                  />
                </View>
                <View style={styles.textContainer}>
                  <AppText variant="bodyStrong">{act.title}</AppText>
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    {act.date}
                  </AppText>
                </View>
              </View>
            </SurfaceCard>
          ))}
        </View>
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
    paddingBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.lg,
  },
  list: {
    gap: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
});
