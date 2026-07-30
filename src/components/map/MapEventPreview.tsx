import React from "react";
import { StyleSheet, View } from "react-native";
import { Event } from "../../domain/events";
import { Card } from "../ui/Card";
import { AppText } from "../ui/AppText";
import { AppImage } from "../ui/AppImage";
import { IconButton } from "../ui/IconButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import { StatusPill } from "../ui/StatusPill";
import { PriceLabel } from "../discovery/PriceLabel";
import { getImageSource } from "../../assets/image-registry";
import { getEventDisplayStatus } from "../../domain/discovery/event-presentation";
import { formatDate } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface MapEventPreviewProps {
  event: Event;
  distanceKm: number;
  nowIso: string;
  isSaved: boolean;
  onToggleSaved(): void;
  onViewDetails(): void;
  onDismiss(): void;
}

export function MapEventPreview({
  event,
  distanceKm,
  nowIso,
  isSaved,
  onToggleSaved,
  onViewDetails,
  onDismiss,
}: MapEventPreviewProps) {
  const displayStatus = getEventDisplayStatus(event, nowIso);
  const formattedDate = formatDate(event.occurrence.startTime);

  return (
    <View style={styles.container} testID="map-event-preview">
      <Card radius="xl" padding="md" style={styles.card}>
        <View style={styles.headerRow}>
          <AppImage
            source={getImageSource(event.heroImageKey)}
            style={styles.thumbnail}
            accessibilityLabel={`${event.title} thumbnail`}
          />

          <View style={styles.infoCol}>
            <View style={styles.statusRow}>
              <StatusPill status={displayStatus} size="sm" />
              <AppText variant="caption" color={theme.colors.textMuted}>
                {distanceKm.toFixed(1)} km away
              </AppText>
            </View>

            <AppText
              variant="subheading"
              numberOfLines={1}
              style={styles.title}
            >
              {event.title}
            </AppText>

            <AppText
              variant="caption"
              color={theme.colors.textSecondary}
              numberOfLines={1}
            >
              📍 {event.venue.name}, {event.venue.suburb}
            </AppText>

            <AppText variant="caption" color={theme.colors.textMuted}>
              🗓️ {formattedDate}
            </AppText>

            <PriceLabel
              amountMinor={event.startingPriceMinor}
              currency={event.currency}
            />
          </View>

          <IconButton
            icon="close"
            accessibilityLabel="Dismiss event preview"
            onPress={onDismiss}
            variant="surface"
            size="sm"
          />
        </View>

        <View style={styles.actionsRow}>
          <IconButton
            icon={isSaved ? "bookmarkFilled" : "bookmark"}
            accessibilityLabel={isSaved ? "Remove from saved" : "Save event"}
            onPress={onToggleSaved}
            variant="surface"
            size="md"
          />

          <SecondaryButton
            testID="map-preview-view-details"
            label="View Details"
            onPress={onViewDetails}
            style={styles.viewBtn}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: theme.spacing.lg,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 20,
  },
  card: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    gap: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.md,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  title: {
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  viewBtn: {
    flex: 1,
  },
});
