import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppText } from "../../../src/components/ui/AppText";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { SurfaceCard } from "../../../src/components/ui/Card";
import { StatusPill } from "../../../src/components/ui/StatusPill";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { mockEvents } from "../../../src/fixtures";
import { useSessionStore } from "../../../src/state/useSessionStore";
import { theme } from "../../../src/design-system/theme";

export default function SavedEventsScreen() {
  const router = useRouter();
  const { status } = useSessionStore();
  const savedEvents = mockEvents;

  return (
    <Screen safeAreaEdges={["top"]} style={styles.container}>
      <AppHeader title="Saved Events" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="display" style={styles.title}>
          Bookmarked Gigs & Parties
        </AppText>

        {status === "guest" ? (
          <EmptyState
            title="No Saved Events"
            description="Sign in to save events to your personal bookmark list."
            actionLabel="Sign In"
            onAction={() => router.push("/(public)/sign-in")}
            icon="heart"
          />
        ) : (
          <View style={styles.list}>
            {savedEvents.map((evt) => (
              <SurfaceCard key={evt.id} style={styles.card}>
                <StatusPill
                  label={evt.status}
                  type={evt.status === "live" ? "live" : "verified"}
                />
                <AppText variant="heading" style={styles.eventTitle}>
                  {evt.title}
                </AppText>
                <AppText variant="label" color={theme.colors.textSecondary}>
                  {evt.venue.name} • {evt.venue.suburb}
                </AppText>
                <AppText
                  variant="caption"
                  color={theme.colors.accentStart}
                  style={styles.price}
                >
                  {new Date(evt.occurrence.startTime).toLocaleDateString(
                    "en-ZA",
                    { month: "short", day: "numeric" },
                  )}{" "}
                  • R{evt.startingPriceMinor / 100} ZAR
                </AppText>
              </SurfaceCard>
            ))}
          </View>
        )}
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
    gap: theme.spacing.xs,
  },
  eventTitle: {
    marginTop: theme.spacing.xxs,
  },
  price: {
    marginTop: theme.spacing.xxs,
  },
});
