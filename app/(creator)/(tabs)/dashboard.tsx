import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { theme } from "../../../src/design-system/theme";
import {
  useCreatorProfile,
  useCreatorStats,
  useActiveEventProgress,
  usePriorityAlerts,
  usePayoutsOverview,
} from "../../../src/hooks/creator/useCreatorQueries";
import {
  CreatorStatCard,
  PayoutSummaryCard,
} from "../../../src/components/creator";
import { useRouter } from "expo-router";
import { ROUTES } from "../../../src/navigation/routes";
import { Pressable } from "react-native";
import { formatCurrency } from "../../../src/utils/format";
import { EmptyState } from "../../../src/components/feedback/EmptyState";

export default function CreatorDashboard() {
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useCreatorProfile();
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useCreatorStats();
  const { data: activeEvents, isLoading: isActiveEventsLoading } =
    useActiveEventProgress();
  const { data: alerts, isLoading: isAlertsLoading } = usePriorityAlerts();
  const { data: payouts, isLoading: isPayoutsLoading } = usePayoutsOverview();

  const isLoading =
    isProfileLoading ||
    isStatsLoading ||
    isActiveEventsLoading ||
    isAlertsLoading ||
    isPayoutsLoading;

  return (
    <Screen style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader title="Dashboard" showBack={false} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetchStats}
              tintColor={theme.colors.accentStart}
            />
          }
        >
          {profile && (
            <View style={styles.header}>
              <AppText
                variant="heading"
                color="textPrimary"
                style={styles.sectionTitle}
              >
                Hello, {profile.brandName}
              </AppText>
            </View>
          )}

          {alerts && alerts.length > 0 && (
            <View style={styles.alertsContainer}>
              {alerts.map((alert) => (
                <View key={alert.id} style={styles.alertBox}>
                  <AppText
                    variant="label"
                    color="warning"
                    style={styles.alertText}
                  >
                    {alert.message}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {stats && (
            <View style={styles.section}>
              <AppText
                variant="heading"
                color="textPrimary"
                style={styles.sectionTitle}
              >
                Performance ({stats.period})
              </AppText>
              <View style={styles.statsGrid}>
                <CreatorStatCard
                  label="Views"
                  value={stats.totalViews.toLocaleString()}
                  trend={stats.viewsTrend}
                />
                <CreatorStatCard
                  label="Tickets"
                  value={stats.ticketsSold.toLocaleString()}
                  trend={stats.ticketsTrend}
                />
                <CreatorStatCard
                  label="Revenue"
                  value={formatCurrency(stats.grossRevenueMinor, "ZAR")}
                  trend={stats.revenueTrend}
                />
                <CreatorStatCard
                  label="Followers"
                  value={stats.newFollowers.toLocaleString()}
                  trend={stats.followersTrend}
                />
              </View>
            </View>
          )}

          {activeEvents && activeEvents.length > 0 && (
            <View style={styles.section}>
              <AppText
                variant="heading"
                color="textPrimary"
                style={styles.sectionTitle}
              >
                Active Events
              </AppText>
              {activeEvents.map((evt) => (
                <View key={evt.eventId} style={styles.activeEventCard}>
                  <AppText variant="heading" color="textPrimary">
                    {evt.title}
                  </AppText>
                  <AppText variant="body" color="textMuted">
                    {evt.ticketsSold} / {evt.totalCapacity} Sold •{" "}
                    {formatCurrency(evt.revenueMinor, "ZAR")}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {payouts && (
            <View style={styles.section}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing.md,
                }}
              >
                <AppText variant="heading" color="textPrimary">
                  Payouts Overview
                </AppText>
                <Pressable
                  onPress={() => router.push(ROUTES.creator.payouts as any)}
                >
                  <AppText variant="caption" color="primary">
                    View all payouts
                  </AppText>
                </Pressable>
              </View>
              <PayoutSummaryCard overview={payouts} />
            </View>
          )}

          {!isLoading && !stats && !activeEvents && (
            <EmptyState
              title="No Data Yet"
              description="Publish your first event to see stats."
              icon="dashboard"
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 2,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  alertsContainer: {
    marginBottom: theme.spacing.lg,
  },
  alertBox: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.warning,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  alertText: {
    textAlign: "center",
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  activeEventCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
});
