import React, { useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppButton } from "../../../../src/components/ui/AppButton";
import {
  CreatorStatCard,
  AnalyticsChart,
} from "../../../../src/components/creator";
import { theme } from "../../../../src/design-system/theme";
import {
  useEventAnalytics,
  useCreatorEvent,
} from "../../../../src/hooks/creator/useCreatorQueries";
import { formatCurrency } from "../../../../src/utils/format";
import { EmptyState } from "../../../../src/components/feedback/EmptyState";

export default function EventAnalyticsScreen() {
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useEventAnalytics(eventId);
  const { data: projection, isLoading: isEventLoading } =
    useCreatorEvent(eventId);

  // Capture "now" once via a lazy initializer so the not-started comparison
  // stays pure during render.
  const [nowMs] = useState(() => Date.now());

  if (isLoading || isEventLoading) {
    return (
      <Screen style={styles.container}>
        <AppHeader title="Event Analytics" />
        <View style={styles.loadingArea}>
          <ActivityIndicator color={theme.colors.accentStart} size="large" />
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen style={styles.container}>
        <AppHeader title="Event Analytics" />
        <View style={styles.stateArea}>
          <AppText variant="heading" color="textPrimary">
            Analytics Unavailable
          </AppText>
          <AppText
            variant="caption"
            color="textMuted"
            style={{ marginTop: 4, textAlign: "center" }}
          >
            Simulated failure while loading analytics. Retry to reload.
          </AppText>
          <AppButton
            label="Retry"
            variant="primary"
            onPress={() => refetch()}
            style={{ marginTop: theme.spacing.md }}
            testID="analytics-retry-button"
          />
        </View>
      </Screen>
    );
  }

  if (!projection) {
    return (
      <Screen style={styles.container}>
        <AppHeader title="Event Analytics" />
        <EmptyState
          title="Event Not Found"
          description={`No Event exists for ID "${eventId}". Analytics are only available for real Events.`}
          icon="warning"
        />
      </Screen>
    );
  }

  const notStarted =
    new Date(projection.event.occurrence.startTime).getTime() > nowMs;

  if (!analytics) {
    return (
      <Screen style={styles.container}>
        <AppHeader title="Event Analytics" />
        <EmptyState
          title={notStarted ? "Event Has Not Started" : "No Analytics Yet"}
          description={
            notStarted
              ? `Analytics begin recording when "${projection.event.title}" goes live.`
              : `No sales or view metrics recorded yet for "${projection.event.title}".`
          }
          icon="dashboard"
        />
      </Screen>
    );
  }

  const salesPoints = (analytics.salesOverTime || []).map((s) => ({
    label: s.label,
    value: s.tickets,
    formattedValue: `${s.tickets} tkts (${formatCurrency(s.amountMinor, "ZAR")})`,
  }));

  const checkInPoints = (analytics.checkInProgression || []).map((c) => ({
    label: c.time,
    value: c.count,
    formattedValue: `${c.count} checked in`,
  }));

  return (
    <Screen style={styles.container} testID="creator-analytics-screen">
      <AppHeader title={`Analytics — ${analytics.eventTitle}`} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* KPI Cards */}
        <AppText
          variant="heading"
          color="textPrimary"
          style={styles.sectionTitle}
        >
          Key Performance Indicators
        </AppText>
        <View style={styles.kpiGrid}>
          <CreatorStatCard
            label="Page Views"
            value={analytics.pageViews.toLocaleString()}
            trend={14.2}
          />
          <CreatorStatCard
            label="Tickets Distributed"
            value={analytics.ticketsDistributed.toLocaleString()}
            trend={8.5}
          />
          <CreatorStatCard
            label="Gross Revenue"
            value={formatCurrency(analytics.grossRevenueMinor, "ZAR")}
            trend={12.0}
          />
          <CreatorStatCard
            label="Conversion Rate"
            value={`${analytics.conversionRate}%`}
            trend={2.4}
          />
        </View>

        {/* Sales Over Time Chart */}
        <View style={styles.chartSection}>
          <AppText
            variant="heading"
            color="textPrimary"
            style={styles.sectionTitle}
          >
            Sales Progression
          </AppText>
          <AnalyticsChart
            title="Ticket Sales Over Time"
            data={salesPoints}
            unit="tickets"
            accentColor={theme.colors.accentStart}
          />
        </View>

        {/* Check-In Progression Chart */}
        <View style={styles.chartSection}>
          <AppText
            variant="heading"
            color="textPrimary"
            style={styles.sectionTitle}
          >
            Door Check-In Progression
          </AppText>
          <AnalyticsChart
            title="Attendee Arrival Times (SAST)"
            data={checkInPoints}
            unit="attendees"
            accentColor={theme.colors.success}
          />
        </View>

        {/* Tier Distribution Breakdown Table */}
        <View style={styles.tierSection}>
          <AppText
            variant="heading"
            color="textPrimary"
            style={styles.sectionTitle}
          >
            Ticket Tier Distribution
          </AppText>
          <View style={styles.tierTable}>
            <View style={styles.tableHeaderRow}>
              <AppText variant="caption" color="textMuted" style={{ flex: 2 }}>
                TIER NAME
              </AppText>
              <AppText
                variant="caption"
                color="textMuted"
                style={{ flex: 1, textAlign: "center" }}
              >
                SOLD / CAP
              </AppText>
              <AppText
                variant="caption"
                color="textMuted"
                style={{ flex: 1.5, textAlign: "right" }}
              >
                REVENUE (ZAR)
              </AppText>
            </View>

            {analytics.tierDistribution?.map((tier) => (
              <View key={tier.tierId} style={styles.tableRow}>
                <AppText
                  variant="label"
                  color="textPrimary"
                  style={{ flex: 2 }}
                >
                  {tier.name}
                </AppText>
                <AppText
                  variant="caption"
                  color="textPrimary"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  {tier.sold} / {tier.capacity}
                </AppText>
                <AppText
                  variant="caption"
                  color="success"
                  style={{ flex: 1.5, textAlign: "right" }}
                >
                  {formatCurrency(tier.revenueMinor, "ZAR")}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  loadingArea: { padding: theme.spacing.xxl, alignItems: "center" },
  stateArea: { padding: theme.spacing.xxl, alignItems: "center" },
  sectionTitle: { marginBottom: theme.spacing.sm },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginBottom: theme.spacing.lg,
  },
  chartSection: { marginBottom: theme.spacing.xl },
  tierSection: { marginBottom: theme.spacing.xl },
  tierTable: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.xs,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
});
