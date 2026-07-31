import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { theme } from "../../../src/design-system/theme";
import { useCreatorEvents } from "../../../src/hooks/creator/useCreatorQueries";
import { EventCreatorRow } from "../../../src/components/creator";
import { EventStatus } from "../../../src/domain/creator";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { Chip } from "../../../src/components/ui/Chip";
import { routeBuilders } from "../../../src/navigation/routes";

const STATUS_FILTERS: { label: string; value: EventStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Live", value: "live" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function CreatorEvents() {
  const router = useRouter();
  const { data: events, isLoading, refetch } = useCreatorEvents();
  const [filter, setFilter] = useState<EventStatus | "all">("all");

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (filter === "all") return events;
    return events.filter((e) => e.status === filter);
  }, [events, filter]);

  return (
    <Screen style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader title="Events" showBack={false} />

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {STATUS_FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                selected={filter === f.value}
                onPress={() => setFilter(f.value)}
              />
            ))}
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={theme.colors.accentStart}
            />
          }
        >
          {filteredEvents.length > 0
            ? filteredEvents.map((evt) => (
                <EventCreatorRow
                  key={evt.eventId}
                  event={evt}
                  onPress={() =>
                    router.push(routeBuilders.creatorEventOpsHub(evt.eventId))
                  }
                />
              ))
            : !isLoading && (
                <EmptyState
                  title="No Events Found"
                  description={
                    filter === "all"
                      ? "Create your first event."
                      : `No ${filter} events found.`
                  }
                  icon="events"
                />
              )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  safeArea: {
    flex: 1,
  },
  filterContainer: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 2,
  },
});
