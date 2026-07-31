import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { DiscoveryHeader } from "../../src/components/navigation/DiscoveryHeader";
import { SegmentedControl } from "../../src/components/ui/SegmentedControl";
import { ErrorState } from "../../src/components/ui/ErrorState";
import {
  EventCard,
  EventCardSkeleton,
} from "../../src/components/discovery/EventCard";
import { CreatorPostCard } from "../../src/components/discovery/CreatorPostCard";
import { LiveContentPlaceholderCard } from "../../src/components/discovery/LiveContentPlaceholderCard";
import { StoryRing } from "../../src/components/discovery/StoryRing";
import { useFeedQuery } from "../../src/hooks/discovery/useFeedQuery";
import { useNotificationsQuery } from "../../src/hooks/discovery/useNotificationsQuery";
import { useConversationsQuery } from "../../src/hooks/social/useSocialQueries";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { useAppStore } from "../../src/state/useAppStore";
import { useToast } from "../../src/hooks/useToast";
import { DEMO_NOW_ISO, discoveryHosts } from "../../src/fixtures/discovery";
import { routeBuilders, ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

export default function FeedScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { feedMode, setFeedMode } = useDiscoveryStore();
  const scenario = useAppStore((state) => state.scenario);
  const feedQuery = useFeedQuery(feedMode);
  const notifQuery = useNotificationsQuery("all");

  const unreadCount = (notifQuery.data ?? []).filter(
    (n) => n.readState === "unread",
  ).length;

  const handleEventPress = (eventId: string) => {
    router.push(routeBuilders.eventDetail(eventId));
  };

  const handleHostPress = (hostId: string) => {
    router.push(routeBuilders.hostProfile(hostId));
  };

  const inboxQuery = useConversationsQuery();
  const unreadInboxCount = (inboxQuery.data ?? []).reduce(
    (total, conv) => total + conv.unreadCount,
    0,
  );
  const feedItems = feedQuery.data?.items ?? [];

  return (
    <Screen safeAreaEdges={["top"]} style={styles.screen}>
      <DiscoveryHeader
        city="Johannesburg"
        unreadCount={unreadCount}
        unreadInboxCount={unreadInboxCount}
        onSearch={() => router.push(ROUTES.consumer.search as any)}
        onNotifications={() =>
          router.push(ROUTES.consumer.notifications as any)
        }
        onInbox={() => router.push(routeBuilders.inbox())}
      />

      {scenario === "offline" ? (
        <View style={styles.offlineBanner}>
          <AppText variant="caption" color="#000" style={styles.offlineText}>
            ⚡ Offline state — viewing cached Johannesburg discovery fixtures.
          </AppText>
        </View>
      ) : null}

      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerModules}>
            {/* Story Rail */}
            <View style={styles.storiesContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={discoveryHosts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.storyListContent}
                renderItem={({ item, index }) => (
                  <StoryRing
                    item={{
                      id: item.id,
                      name: item.name,
                      avatarKey: item.avatarImageKey ?? "hostGrooveCo",
                      hasUnseen: index % 2 === 0,
                    }}
                    onPress={() => handleHostPress(item.id)}
                  />
                )}
              />
            </View>

            {/* Mode Switcher */}
            <View style={styles.modeRow}>
              <SegmentedControl
                value={feedMode}
                onChange={setFeedMode}
                accessibilityLabel="Feed view mode"
                options={[
                  {
                    value: "live_recent",
                    label: "Live & Recent",
                    testID: "feed-mode-live-recent",
                  },
                  {
                    value: "upcoming",
                    label: "Upcoming",
                    testID: "feed-mode-upcoming",
                  },
                ]}
              />
            </View>

            <SectionHeader
              title={
                feedMode === "live_recent"
                  ? "Live & Recent Pulse"
                  : "Upcoming Events"
              }
              subtitle="Johannesburg, Gauteng"
            />
          </View>
        }
        ListEmptyComponent={
          feedQuery.isLoading ? (
            <View style={styles.skeletonContainer}>
              <EventCardSkeleton />
              <EventCardSkeleton />
            </View>
          ) : feedQuery.isError ? (
            <ErrorState
              title="The city pulse did not load"
              description="Try the discovery fixtures again."
              actionLabel="Retry"
              onAction={() => feedQuery.refetch()}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <AppText variant="heading">The city is quiet</AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Try Upcoming events or adjust the prototype scenario.
              </AppText>
            </View>
          )
        }
        renderItem={({ item, index }) => {
          switch (item.kind) {
            case "event":
              return (
                <View style={styles.cardContainer}>
                  <EventCard
                    event={item.event}
                    variant={index === 0 ? "featured" : "standard"}
                    nowIso={DEMO_NOW_ISO}
                    attendeeCount={item.attendeeCount}
                    attendeeAvatarKeys={item.attendeeAvatarKeys}
                    onPress={() => handleEventPress(item.event.id)}
                  />
                </View>
              );

            case "creator_post":
              return (
                <View style={styles.cardContainer}>
                  <CreatorPostCard
                    entry={item}
                    onPressHost={() => handleHostPress(item.host.id)}
                    onReact={() =>
                      showToast(
                        "Reaction added",
                        "Post reactions are simulated locally.",
                        "success",
                      )
                    }
                    onComment={() =>
                      showToast(
                        "Comments",
                        "Comment threads arrive in a later LIIT instruction.",
                        "info",
                      )
                    }
                  />
                </View>
              );

            case "live_placeholder":
              return (
                <View style={styles.cardContainer}>
                  <LiveContentPlaceholderCard
                    entry={item}
                    onPress={() =>
                      showToast(
                        "Prototype live content",
                        "No real stream is connected.",
                        "info",
                      )
                    }
                  />
                </View>
              );

            default:
              return null;
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  offlineBanner: {
    backgroundColor: theme.colors.accentStart,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },
  offlineText: {
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
  },
  headerModules: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  storiesContainer: {
    paddingVertical: theme.spacing.xs,
  },
  storyListContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modeRow: {
    paddingHorizontal: theme.spacing.lg,
  },
  cardContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  skeletonContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
});
