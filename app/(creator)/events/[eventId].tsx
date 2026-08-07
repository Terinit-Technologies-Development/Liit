import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { EventStatusPill } from "../../../src/components/creator/EventStatusPill";
import { Icon } from "../../../src/design-system/icons/Icon";
import { theme } from "../../../src/design-system/theme";
import { routeBuilders } from "../../../src/navigation/routes";
import { useCreatorEvent } from "../../../src/hooks/creator/useCreatorQueries";
import { formatCurrency } from "../../../src/utils/format";
import { EmptyState } from "../../../src/components/feedback/EmptyState";

export default function EventOpsHub() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const { data: projection, isLoading, error } = useCreatorEvent(eventId);

  if (isLoading) {
    return (
      <Screen style={styles.container}>
        <AppHeader title="Event Operations" />
        <View style={styles.loadingArea}>
          <ActivityIndicator color={theme.colors.accentStart} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: 8 }}>
            Loading event operations...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error || !projection) {
    return (
      <Screen style={styles.container}>
        <AppHeader title="Event Not Found" />
        <EmptyState
          title="Event Operations Unavailable"
          description={`Unable to load operations for event ID "${eventId}".`}
          actionLabel="Return to Events"
          onAction={() => router.replace(routeBuilders.events())}
        />
      </Screen>
    );
  }

  const {
    event,
    operationalStatus,
    ticketsSold,
    totalCapacity,
    grossRevenueMinor,
    checkedInCount,
  } = projection;

  const navItems = [
    {
      title: "Analytics & Performance",
      subtitle: "Page views, sales progression & conversion",
      icon: "dashboard" as const,
      onPress: () => router.push(routeBuilders.creatorEventAnalytics(eventId)),
    },
    {
      title: "Guest Roster & Check-In",
      subtitle: `${checkedInCount} checked in • Roster & CSV export`,
      icon: "tickets" as const,
      onPress: () => router.push(routeBuilders.creatorEventGuests(eventId)),
    },
    {
      title: "Content & Announcements",
      subtitle: "Set times, pinned posts & story updates",
      icon: "feed" as const,
      onPress: () => router.push(routeBuilders.creatorEventContent(eventId)),
    },
    {
      title: "Edit Event & Tiers",
      subtitle: "Schedule, venue details & pricing tiers",
      icon: "create" as const,
      onPress: () => router.push(routeBuilders.creatorEventEdit(eventId)),
    },
    {
      title: "Preview Event (Consumer Mode)",
      subtitle: "Inspect exact layout attendees see",
      icon: "explore" as const,
      onPress: () => router.push(routeBuilders.creatorEventPreview(eventId)),
    },
    {
      title: "Event Notifications",
      subtitle: "Ticket sale alerts & attendee messages",
      icon: "bell" as const,
      onPress: () => router.push(routeBuilders.creatorNotifications()),
    },
  ];

  return (
    <Screen style={styles.container} testID="creator-ops-hub-screen">
      <AppHeader title={event.title} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Overview Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="heading" color="textPrimary">
                {event.title}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {new Date(event.occurrence.startTime).toLocaleDateString()} •{" "}
                {event.venue.name}
              </AppText>
            </View>
            <EventStatusPill status={operationalStatus} />
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <AppText variant="caption" color="textMuted">
                Tickets Sold
              </AppText>
              <AppText variant="label" color="textPrimary">
                {ticketsSold} / {totalCapacity}
              </AppText>
            </View>
            <View style={styles.metricCol}>
              <AppText variant="caption" color="textMuted">
                Gross Revenue
              </AppText>
              <AppText variant="label" color="success">
                {formatCurrency(grossRevenueMinor, event.currency)}
              </AppText>
            </View>
            <View style={styles.metricCol}>
              <AppText variant="caption" color="textMuted">
                Checked-In
              </AppText>
              <AppText variant="label" color="accentEnd">
                {checkedInCount} Attendees
              </AppText>
            </View>
          </View>
        </View>

        {/* Operations Hub Navigation Menu */}
        <AppText
          variant="heading"
          color="textPrimary"
          style={styles.sectionTitle}
        >
          Operations Hub
        </AppText>

        <View style={styles.menuList}>
          {navItems.map((item, idx) => (
            <Pressable key={idx} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.iconCircle}>
                <Icon
                  name={item.icon}
                  size="sm"
                  color={theme.colors.accentStart}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label" color="textPrimary">
                  {item.title}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {item.subtitle}
                </AppText>
              </View>
              <Icon
                name="chevronRight"
                size="sm"
                color={theme.colors.textMuted}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  loadingArea: { padding: theme.spacing.xxl, alignItems: "center" },
  headerCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  metricCol: { flex: 1 },
  sectionTitle: { marginBottom: theme.spacing.md },
  menuList: { gap: theme.spacing.xs },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(149, 145, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
});
