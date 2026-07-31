import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";
import { CreatorEventSummary } from "../../domain/creator";
import { EventStatusPill } from "./EventStatusPill";
import { formatCurrency } from "../../utils/format";
import { Icon } from "../../design-system/icons/Icon";

interface EventCreatorRowProps {
  event: CreatorEventSummary;
  onPress: () => void;
}

export function EventCreatorRow({ event, onPress }: EventCreatorRowProps) {
  const isDraft = event.status === "draft";

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.headerRow}>
        <AppText variant="heading" color="textPrimary" style={styles.title}>
          {event.title}
        </AppText>
        <EventStatusPill status={event.status} />
      </View>

      <AppText variant="caption" color="textMuted" style={styles.subtitle}>
        {new Date(event.startDate).toLocaleDateString()} • {event.venueName}
      </AppText>

      {!isDraft && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="tickets" size="sm" color={theme.colors.textMuted} />
            <AppText
              variant="label"
              color="textPrimary"
              style={styles.statText}
            >
              {event.ticketsSold} / {event.totalCapacity}
            </AppText>
          </View>
          <View style={styles.stat}>
            <Icon name="dashboard" size="sm" color={theme.colors.textMuted} />
            <AppText
              variant="label"
              color="textPrimary"
              style={styles.statText}
            >
              {formatCurrency(event.grossRevenueMinor, event.currency)}
            </AppText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.xs,
  },
  title: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  subtitle: {
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: theme.spacing.xs,
  },
});
