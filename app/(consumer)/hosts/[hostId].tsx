import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { Skeleton } from "../../../src/components/feedback/Skeleton";
import { HostIdentityHeader } from "../../../src/components/hosts/HostIdentityHeader";
import { HostMetrics } from "../../../src/components/hosts/HostMetrics";
import { HostBio } from "../../../src/components/hosts/HostBio";
import { PastHighlightRail } from "../../../src/components/hosts/PastHighlightRail";
import { RelatedEventRail } from "../../../src/components/events/RelatedEventRail";
import {
  useHostUpcomingEventsQuery,
  usePublicHostQuery,
} from "../../../src/hooks/hosts/usePublicHostQuery";
import { useDiscoveryStore } from "../../../src/state/useDiscoveryStore";
import { useSaveFollowActions } from "../../../src/hooks/useSaveFollowActions";
import { routeBuilders, ROUTES } from "../../../src/navigation/routes";
import { theme } from "../../../src/design-system/theme";
import { mockSocialRepository } from "../../../src/repositories/mock/MockSocialRepository";

function normaliseRouteId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }
  return null;
}

export default function PublicHostProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hostId?: string | string[] }>();
  const hostId = normaliseRouteId(params.hostId);

  const profileQuery = usePublicHostQuery(hostId);
  const upcomingEventsQuery = useHostUpcomingEventsQuery(hostId);

  const followedHostIds = useDiscoveryStore((state) => state.followedHostIds);
  const { toggleFollow } = useSaveFollowActions();

  if (!hostId) {
    return (
      <Screen style={styles.screen}>
        <EmptyState
          title="Host not found"
          description="The requested host link is invalid."
          actionLabel="Return to Explore"
          onAction={() => router.replace(ROUTES.consumer.explore)}
        />
      </Screen>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <Screen style={styles.screen}>
        <Skeleton width="100%" height={220} />
        <View style={styles.skeletonContent}>
          <Skeleton width="50%" height={28} />
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={100} />
        </View>
      </Screen>
    );
  }

  if (profileQuery.isError) {
    return (
      <Screen style={styles.screen}>
        <ErrorState
          title="Host profile did not load"
          description="Unable to fetch host information."
          actionLabel="Retry"
          onAction={() => profileQuery.refetch()}
        />
      </Screen>
    );
  }

  const profile = profileQuery.data;

  if (!profile) {
    return (
      <Screen style={styles.screen}>
        <EmptyState
          title="Host not found"
          description="This public profile is unavailable in the current fixture set."
          actionLabel="Return to Explore"
          onAction={() => router.replace(ROUTES.consumer.explore)}
        />
      </Screen>
    );
  }

  const followed = followedHostIds.includes(profile.host.id);
  const upcomingEvents = upcomingEventsQuery.data ?? [];

  const handleMessage = async () => {
    // Preserve the canonical host identity; scope the inquiry to the host's
    // first upcoming event when one exists.
    const conversation = await mockSocialRepository.getOrCreateInquiryContext({
      hostId: profile.host.id,
      eventId: upcomingEvents[0]?.id,
    });
    router.push(routeBuilders.inquiryThread(conversation.id));
  };

  return (
    <Screen safeAreaEdges={[]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <HostIdentityHeader
          profile={profile}
          followed={followed}
          onBack={() => router.back()}
          onToggleFollow={() => toggleFollow(profile.host.id)}
          onMessage={handleMessage}
          onOpenMenu={() =>
            router.push(
              routeBuilders.reportTarget({
                kind: "host",
                id: profile.host.id,
              }),
            )
          }
        />

        <View style={styles.bodyContent}>
          <HostMetrics metrics={profile.metrics} />

          <HostBio text={profile.bio} />

          {upcomingEvents.length > 0 ? (
            <RelatedEventRail
              title="Upcoming Events"
              events={upcomingEvents}
              onPressEvent={(eventId) =>
                router.push(routeBuilders.eventDetail(eventId))
              }
            />
          ) : (
            <EmptyState
              title="No upcoming events"
              description={`${profile.host.name} has no upcoming LIIT fixtures yet.`}
            />
          )}

          <PastHighlightRail items={profile.pastHighlights} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  bodyContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  skeletonContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});
