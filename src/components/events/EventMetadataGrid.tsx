import React from "react";
import { StyleSheet, View } from "react-native";
import { Event } from "../../domain/events";
import { Card } from "../ui/Card";
import { AppText } from "../ui/AppText";
import { Icon } from "../../design-system/icons/Icon";
import { formatCurrency, formatDate } from "../../utils/format";
import { formatJohannesburgTime } from "../../utils/johannesburg";
import { theme } from "../../design-system/theme";

export interface EventMetadataGridProps {
  event: Event;
}

/**
 * Render the wall-clock time as written in the stored timestamp when it
 * carries an explicit SAST offset (Creator drafts). Legacy UTC "Z" consumer
 * timestamps keep the existing device-local formatting.
 */
function formatScheduleTime(iso: string): string {
  if (iso.includes("+02:00")) {
    return formatJohannesburgTime(iso, false);
  }
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function EventMetadataGrid({ event }: EventMetadataGridProps) {
  const dateStr = formatDate(event.occurrence.startTime);
  const timeStr = `${formatScheduleTime(event.occurrence.startTime)} - ${formatScheduleTime(event.occurrence.endTime)}`;
  const priceStr =
    event.startingPriceMinor === 0
      ? "Free Entry"
      : `From ${formatCurrency(event.startingPriceMinor, event.currency)}`;

  return (
    <Card radius="xl" padding="md" style={styles.gridCard}>
      <View style={styles.row}>
        <Icon name="calendar" size="sm" color={theme.colors.accentStart} />
        <View style={styles.col}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Date & Time
          </AppText>
          <AppText variant="body" style={styles.val}>
            {dateStr} • {timeStr}
          </AppText>
        </View>
      </View>

      <View style={styles.row}>
        <Icon name="location" size="sm" color={theme.colors.accentStart} />
        <View style={styles.col}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Location
          </AppText>
          <AppText variant="body" style={styles.val}>
            {event.venue.name}, {event.venue.suburb}
          </AppText>
        </View>
      </View>

      <View style={styles.row}>
        <Icon name="sparkles" size="sm" color={theme.colors.accentStart} />
        <View style={styles.col}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Category & Pricing
          </AppText>
          <AppText variant="body" style={styles.val}>
            {event.category.toUpperCase()} • {priceStr}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  col: {
    flex: 1,
    gap: 2,
  },
  val: {
    fontWeight: "600",
  },
});
