import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppButton } from "../../../../src/components/ui/AppButton";
import { EventHero } from "../../../../src/components/events/EventHero";
import { EventMetadataGrid } from "../../../../src/components/events/EventMetadataGrid";
import { ExpandableDescription } from "../../../../src/components/events/ExpandableDescription";
import { HostSummaryCard } from "../../../../src/components/events/HostSummaryCard";
import { TicketTierPreview } from "../../../../src/components/events/TicketTierPreview";
import { Icon } from "../../../../src/design-system/icons/Icon";
import { theme } from "../../../../src/design-system/theme";
import { useCreatorEvent } from "../../../../src/hooks/creator/useCreatorQueries";
import { TicketTier } from "../../../../src/domain/event-detail";
import { formatJohannesburgTime } from "../../../../src/utils/johannesburg";

export default function EventPreview() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-draft-001";

  const { data: projection, isLoading } = useCreatorEvent(eventId);
  const event = projection?.event;

  const showPreviewFeedback = (message: string) => {
    Alert.alert("Event Preview", message);
  };

  const draftTiers: TicketTier[] =
    projection?.eventDraft?.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priceMinor: t.priceMinor,
      currency: "ZAR",
      remaining: t.capacity,
      state: t.availability,
      maxPerOrder: t.maxPerOrder,
    })) || [];

  const isFreeEvent = projection?.eventDraft?.isFree === true;

  return (
    <Screen style={styles.container} testID="creator-preview-screen">
      {/* Header & Preview Mode Warning Banner */}
      <AppHeader title="Event Preview" />
      <View style={styles.previewBanner}>
        <Icon name="info" size="xs" color="#fff" />
        <AppText variant="label" style={styles.bannerText}>
          PREVIEW MODE — Draft Preview
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingArea}>
            <AppText variant="body" color="textMuted">
              Loading draft preview...
            </AppText>
          </View>
        ) : !event ? (
          <View style={styles.loadingArea}>
            <AppText variant="heading" color="textPrimary">
              Draft Not Found
            </AppText>
            <AppText variant="body" color="textMuted" style={{ marginTop: 4 }}>
              No saved draft exists for event ID &quot;{eventId}&quot;. Save the
              Event draft first, then preview again.
            </AppText>
            <AppButton
              label="Return to Edit Form"
              variant="secondary"
              onPress={() => router.back()}
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        ) : (
          <>
            <EventHero
              event={event}
              onBack={() => router.back()}
              isSaved={false}
              onToggleSaved={() =>
                showPreviewFeedback(
                  "Saving is unavailable in Event Preview. Draft events are not part of the Consumer saved-event collection.",
                )
              }
              onShare={() =>
                showPreviewFeedback(
                  "Sharing is disabled in Event Preview. Sharing becomes available once the Event is published.",
                )
              }
              onReport={() =>
                showPreviewFeedback(
                  "Reporting is disabled in Event Preview. Reporting applies to published Consumer events.",
                )
              }
            />

            <View style={styles.metaPadding}>
              <AppText variant="heading" color="textPrimary">
                {event.title}
              </AppText>
              <AppText
                variant="caption"
                color="textMuted"
                style={{ marginTop: 2 }}
              >
                {event.venue.name}, {event.venue.suburb}
              </AppText>
            </View>

            <View style={styles.metaPadding}>
              <EventMetadataGrid event={event} />
            </View>

            <View style={styles.sectionMargin}>
              <HostSummaryCard
                host={event.host}
                onPress={() =>
                  Alert.alert(
                    "Preview Mode",
                    "Host navigation is disabled in preview mode.",
                  )
                }
              />
            </View>

            <View style={styles.sectionMargin}>
              <ExpandableDescription text={event.description} />
            </View>

            {/* Schedule fidelity line */}
            <View style={styles.sectionMargin}>
              <AppText variant="caption" color="textMuted">
                SAST Schedule:{" "}
                {formatJohannesburgTime(event.occurrence.startTime)} →{" "}
                {formatJohannesburgTime(event.occurrence.endTime)}
              </AppText>
            </View>

            <View style={styles.sectionMargin}>
              <AppText
                variant="heading"
                style={{ marginBottom: theme.spacing.sm }}
              >
                {isFreeEvent
                  ? "Registration (Free Event)"
                  : "Ticket Tiers (Preview)"}
              </AppText>
              {isFreeEvent ? (
                <View style={styles.freeCard}>
                  <Icon name="check" size="sm" color={theme.colors.success} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" color="textPrimary">
                      Free Registration
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      This Event is a free registration event. No paid tiers.
                    </AppText>
                  </View>
                </View>
              ) : draftTiers.length > 0 ? (
                <TicketTierPreview
                  tiers={draftTiers}
                  selectedTierId={null}
                  onSelectTier={() =>
                    showPreviewFeedback(
                      "Ticket selection is non-interactive in Preview. Selection applies during Consumer checkout after publishing.",
                    )
                  }
                />
              ) : (
                <AppText variant="caption" color="textMuted">
                  No ticket tiers configured for this draft.
                </AppText>
              )}
            </View>
          </>
        )}

        {/* Action Controls */}
        <View style={styles.actionContainer}>
          <AppButton
            label="Checkout Disabled (Preview Mode)"
            variant="secondary"
            onPress={() =>
              Alert.alert(
                "Preview Mode",
                "Checkout is disabled while previewing an event draft.",
              )
            }
          />

          <AppButton
            label="Return to Edit Form"
            variant="secondary"
            onPress={() => router.back()}
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  previewBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accentStart,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  bannerText: { color: "#FFF", fontWeight: "bold" },
  content: { paddingBottom: theme.spacing.xxxl * 2 },
  metaPadding: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  sectionMargin: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  loadingArea: {
    padding: theme.spacing.xxl,
    alignItems: "center",
  },
  freeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.sm,
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
});
