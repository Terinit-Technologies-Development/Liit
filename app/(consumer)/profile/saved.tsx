import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { EventCard } from "../../../src/components/discovery/EventCard";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { useDiscoveryStore } from "../../../src/state/useDiscoveryStore";
import { useSaveFollowActions } from "../../../src/hooks/useSaveFollowActions";
import { useDemoNowIso } from "../../../src/hooks/useDemoNowIso";
import { useSessionStore } from "../../../src/state/useSessionStore";
import { useEventsByIdsQuery } from "../../../src/hooks/events/useEventDetailQuery";
import { routeBuilders } from "../../../src/navigation/routes";
import { theme } from "../../../src/design-system/theme";

export default function SavedEventsScreen() {
  const router = useRouter();
  const { status } = useSessionStore();
  const savedEventIds = useDiscoveryStore((state) => state.savedEventIds);
  const { toggleSaved } = useSaveFollowActions();
  const nowIso = useDemoNowIso();
  const eventsQuery = useEventsByIdsQuery(savedEventIds);

  const savedEvents = eventsQuery.data ?? [];

  return (
    <Screen safeAreaEdges={["top"]} style={styles.container}>
      <AppHeader title="Saved Events" showBack onBack={() => router.back()} />

      {status === "guest" ? (
        <EmptyState
          title="No Saved Events"
          description="Sign in to save events to your personal bookmark list."
          actionLabel="Sign In"
          onAction={() => router.push("/(public)/sign-in")}
          icon="heart"
        />
      ) : savedEventIds.length === 0 ? (
        <EmptyState
          title="Your Saved List is Empty"
          description="Tap the heart icon on any event card to save it to your bookmarks for quick access."
          actionLabel="Explore Nearby Events"
          onAction={() => router.push("/(consumer)/explore")}
          icon="heart"
        />
      ) : (
        <FlatList
          data={savedEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            eventsQuery.isLoading ? (
              <View style={styles.loading}>
                <EmptyState
                  title="Loading saved events..."
                  description="Fetching your bookmarked events."
                  icon="heart"
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <EventCard
                event={item}
                variant="standard"
                nowIso={nowIso}
                isSaved
                onPress={() => router.push(routeBuilders.eventDetail(item.id))}
                onSave={() => toggleSaved(item.id)}
              />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
  },
  list: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  cardWrap: {
    marginBottom: theme.spacing.md,
  },
  loading: {
    paddingTop: theme.spacing.xl,
  },
});
