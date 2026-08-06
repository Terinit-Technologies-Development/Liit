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

export default function EventPreview() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const { data: projection } = useCreatorEvent(eventId);
  const event = projection?.event;

  const sampleTiers: TicketTier[] = [
    {
      id: "tier-1",
      name: "Early Bird Pass",
      priceMinor: event?.startingPriceMinor || 25000,
      currency: "ZAR",
      remaining: 100,
      state: "available",
      maxPerOrder: 4,
    },
    {
      id: "tier-2",
      name: "General Admission",
      priceMinor: (event?.startingPriceMinor || 25000) + 10000,
      currency: "ZAR",
      remaining: 150,
      state: "available",
      maxPerOrder: 4,
    },
  ];

  return (
    <Screen style={styles.container} testID="creator-preview-screen">
      {/* Header & Preview Mode Warning Banner */}
      <AppHeader title="Event Preview" />
      <View style={styles.previewBanner}>
        <Icon name="info" size="xs" color="#fff" />
        <AppText variant="label" style={styles.bannerText}>
          PREVIEW MODE — Unsaved Draft
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {event ? (
          <>
            <EventHero
              event={event}
              onBack={() => router.back()}
              isSaved={false}
              onToggleSaved={() => {}}
              onShare={() => {}}
              onReport={() => {}}
            />

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

            <View style={styles.sectionMargin}>
              <AppText variant="heading" style={{ marginBottom: theme.spacing.sm }}>
                Ticket Tiers (Preview)
              </AppText>
              <TicketTierPreview
                tiers={sampleTiers}
                selectedTierId={null}
                onSelectTier={() => {}}
              />
            </View>
          </>
        ) : (
          <View style={styles.loadingArea}>
            <AppText variant="body" color="textMuted">
              Loading draft preview...
            </AppText>
          </View>
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
  metaPadding: { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.md },
  sectionMargin: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  loadingArea: {
    padding: theme.spacing.xxl,
    alignItems: "center",
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
});
