import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppText } from "../../../src/components/ui/AppText";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { Skeleton } from "../../../src/components/feedback/Skeleton";
import { EventHero } from "../../../src/components/events/EventHero";
import { EventMetadataGrid } from "../../../src/components/events/EventMetadataGrid";
import { ExpandableDescription } from "../../../src/components/events/ExpandableDescription";
import { HostSummaryCard } from "../../../src/components/events/HostSummaryCard";
import { LineupRail } from "../../../src/components/events/LineupRail";
import { TicketTierPreview } from "../../../src/components/events/TicketTierPreview";
import { AttendeeProof } from "../../../src/components/events/AttendeeProof";
import { EventPostPreviewList } from "../../../src/components/events/EventPostPreview";
import { RelatedEventRail } from "../../../src/components/events/RelatedEventRail";
import { StickyActionBar } from "../../../src/components/events/StickyActionBar";
import { StatusPill } from "../../../src/components/ui/StatusPill";
import {
  useEventDetailQuery,
  useRelatedEventsQuery,
} from "../../../src/hooks/events/useEventDetailQuery";
import { useDiscoveryStore } from "../../../src/state/useDiscoveryStore";
import {
  EventConversionModel,
  getEventConversionModel,
} from "../../../src/domain/event-detail/conversion-model";
import { TicketTier } from "../../../src/domain/event-detail";
import { routeBuilders, ROUTES } from "../../../src/navigation/routes";
import { showToast } from "../../../src/components/ui/Toast";
import { getEventDisplayStatus } from "../../../src/domain/discovery/event-presentation";
import { DEMO_NOW_ISO } from "../../../src/fixtures/discovery";
import { theme } from "../../../src/design-system/theme";

function normaliseRouteId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }
  return null;
}

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = normaliseRouteId(params.eventId);

  const detailQuery = useEventDetailQuery(eventId);
  const relatedQuery = useRelatedEventsQuery(eventId);

  const savedEventIds = useDiscoveryStore((state) => state.savedEventIds);
  const toggleSavedEvent = useDiscoveryStore((state) => state.toggleSavedEvent);

  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  if (!eventId) {
    return (
      <Screen style={styles.screen}>
        <EmptyState
          title="Event not found"
          description="The requested event link is invalid."
          actionLabel="Return to Explore"
          onAction={() => router.replace(ROUTES.consumer.explore)}
        />
      </Screen>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <Screen style={styles.screen}>
        <Skeleton width="100%" height={320} />
        <View style={styles.skeletonContent}>
          <Skeleton width="60%" height={28} />
          <Skeleton width="100%" height={120} />
          <Skeleton width="100%" height={80} />
        </View>
      </Screen>
    );
  }

  if (detailQuery.isError) {
    return (
      <Screen style={styles.screen}>
        <ErrorState
          title="Event details did not load"
          description="Unable to fetch event information."
          actionLabel="Retry"
          onAction={() => detailQuery.refetch()}
        />
      </Screen>
    );
  }

  const detail = detailQuery.data;

  if (!detail) {
    return (
      <Screen style={styles.screen}>
        <EmptyState
          title="Event not found"
          description="This event is unavailable in the current LIIT fixture set."
          actionLabel="Return to Explore"
          onAction={() => router.replace(ROUTES.consumer.explore)}
        />
      </Screen>
    );
  }

  const conversion = getEventConversionModel(detail);
  const selectedTier =
    detail.ticketTiers.find((t: TicketTier) => t.id === selectedTierId) ??
    detail.ticketTiers[0];

  const displayStatus = getEventDisplayStatus(detail.event, DEMO_NOW_ISO);

  const handlePrimaryAction = (model: EventConversionModel) => {
    switch (model.mode) {
      case "paid":
        showToast(
          "Ticket selection",
          "Ticket checkout arrives in a later LIIT instruction.",
          "info",
        );
        return;

      case "free_registration":
        showToast(
          "Registration simulated",
          "Your prototype registration is confirmed locally.",
          "success",
        );
        return;

      case "waitlist":
        showToast(
          "Waitlist joined",
          "This waitlist is a local prototype simulation.",
          "success",
        );
        return;

      case "none":
        return;
    }
  };

  return (
    <Screen safeAreaEdges={[]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <EventHero
          event={detail.event}
          onBack={() => router.back()}
          isSaved={savedEventIds.includes(detail.event.id)}
          onToggleSaved={() => toggleSavedEvent(detail.event.id)}
          onShare={() => router.push(routeBuilders.eventShare(detail.event.id))}
          onReport={() =>
            router.push(
              routeBuilders.reportTarget({
                kind: "event",
                id: detail.event.id,
              }),
            )
          }
        />

        <View style={styles.titleSection}>
          <View style={styles.statusRow}>
            <StatusPill status={displayStatus} size="sm" />
            <AppText variant="caption" color={theme.colors.textMuted}>
              {detail.event.venue.suburb}, {detail.event.venue.city}
            </AppText>
          </View>
          <AppText variant="display" style={styles.title}>
            {detail.event.title}
          </AppText>
        </View>

        <EventMetadataGrid event={detail.event} />

        <ExpandableDescription text={detail.longDescription} />

        <HostSummaryCard
          host={detail.event.host}
          onPress={() =>
            router.push(routeBuilders.hostProfile(detail.event.host.id))
          }
        />

        {detail.modules.lineup ? <LineupRail members={detail.lineup} /> : null}

        {detail.modules.ticketTiers ? (
          <TicketTierPreview
            tiers={detail.ticketTiers}
            selectedTierId={selectedTierId ?? detail.ticketTiers[0]?.id ?? null}
            onSelectTier={setSelectedTierId}
          />
        ) : null}

        {detail.modules.attendeeProof ? (
          <AttendeeProof
            imageKeys={detail.attendeeAvatarKeys}
            count={detail.attendeeCount}
          />
        ) : null}

        {detail.modules.eventPosts ? (
          <EventPostPreviewList posts={detail.posts} />
        ) : null}

        {detail.modules.relatedEvents ? (
          <RelatedEventRail
            events={relatedQuery.data ?? []}
            onPressEvent={(relatedEventId) =>
              router.push(routeBuilders.eventDetail(relatedEventId))
            }
          />
        ) : null}
      </ScrollView>

      <StickyActionBar
        conversion={conversion}
        selectedTier={selectedTier}
        onPrimaryAction={handlePrimaryAction}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    paddingBottom: 110,
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  skeletonContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  titleSection: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  title: {
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
});
