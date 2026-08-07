import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useRouter, Href } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { AppButton } from "../../../src/components/ui/AppButton";
import { Chip } from "../../../src/components/ui/Chip";
import { Icon } from "../../../src/design-system/icons/Icon";
import { theme } from "../../../src/design-system/theme";
import {
  useCreatorProfile,
  useCreatorStats,
  useActiveEventProgress,
  usePriorityAlerts,
  usePayoutsOverview,
  useCreatorNotifications,
  creatorKeys,
} from "../../../src/hooks/creator/useCreatorQueries";
import {
  CreatorStatCard,
  PayoutSummaryCard,
} from "../../../src/components/creator";
import { routeBuilders } from "../../../src/navigation/routes";
import { formatCurrency } from "../../../src/utils/format";
import { EmptyState } from "../../../src/components/feedback/EmptyState";

export default function CreatorDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [period, setPeriod] = useState<"30d" | "7d" | "all">("30d");

  const { data: profile } = useCreatorProfile();
  const { data: stats } = useCreatorStats(period);
  const { data: activeEvents } = useActiveEventProgress();
  const { data: alerts } = usePriorityAlerts();
  const { data: payouts } = usePayoutsOverview();
  const { data: notifications } = useCreatorNotifications();

  const unreadNotifCount = (notifications || []).filter(
    (n) => !n.isRead,
  ).length;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: creatorKeys.all });
    setIsRefreshing(false);
  };

  return (
    <Screen style={styles.container} testID="creator-dashboard-screen">
      <AppHeader
        title="Creator Dashboard"
        showBack={false}
        rightElement={
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push(routeBuilders.creatorNotifications())}
            hitSlop={8}
            accessibilityLabel="Notifications"
          >
            <Icon name="bell" size="sm" color={theme.colors.textPrimary} />
            {unreadNotifCount > 0 && (
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>
                  {unreadNotifCount}
                </AppText>
              </View>
            )}
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accentStart}
          />
        }
      >
        {/* Profile Identity & Primary Action Header */}
        <View style={styles.headerCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Icon name="profile" size="md" color={theme.colors.accentStart} />
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <AppText variant="heading" color="textPrimary">
                  {profile?.brandName || "Groove Co. Johannesburg"}
                </AppText>
                {profile?.isVerified && (
                  <Icon name="check" size="xs" color={theme.colors.success} />
                )}
              </View>
              <AppText variant="caption" color="textMuted">
                {profile?.contactEmail || "events@grooveco.co.za"} • SAST Jozi
              </AppText>
            </View>
          </View>

          <AppButton
            label="+ Create New Event"
            variant="primary"
            onPress={() => router.push(routeBuilders.creatorCreate())}
            style={{ marginTop: theme.spacing.md }}
          />
        </View>

        {/* Priority Alerts */}
        {alerts && alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {alerts.map((alert) => (
              <Pressable
                key={alert.id}
                style={[
                  styles.alertCard,
                  alert.severity === "urgent"
                    ? styles.alertUrgent
                    : styles.alertInfo,
                ]}
                onPress={() => {
                  if (alert.targetRoute) {
                    router.push(alert.targetRoute as Href);
                  }
                }}
              >
                <Icon
                  name={alert.severity === "urgent" ? "warning" : "info"}
                  size="sm"
                  color={
                    alert.severity === "urgent"
                      ? theme.colors.warning
                      : theme.colors.accentEnd
                  }
                />
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color="textPrimary">
                    {alert.message}
                  </AppText>
                  {alert.actionText && (
                    <AppText
                      variant="caption"
                      color="accentStart"
                      style={{ marginTop: 2, fontWeight: "bold" }}
                    >
                      {alert.actionText} →
                    </AppText>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Performance Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="heading" color="textPrimary">
              Performance Stats
            </AppText>
            <View style={styles.periodRow}>
              {(["7d", "30d", "all"] as const).map((p) => (
                <Chip
                  key={p}
                  label={p.toUpperCase()}
                  selected={period === p}
                  onPress={() => setPeriod(p)}
                />
              ))}
            </View>
          </View>

          {stats && (
            <View style={styles.statsGrid}>
              <CreatorStatCard
                label="Page Views"
                value={stats.totalViews.toLocaleString()}
                trend={stats.viewsTrend}
              />
              <CreatorStatCard
                label="Tickets Sold"
                value={stats.ticketsSold.toLocaleString()}
                trend={stats.ticketsTrend}
              />
              <CreatorStatCard
                label="Gross Revenue"
                value={formatCurrency(stats.grossRevenueMinor, "ZAR")}
                trend={stats.revenueTrend}
              />
              <CreatorStatCard
                label="New Followers"
                value={stats.newFollowers.toLocaleString()}
                trend={stats.followersTrend}
              />
            </View>
          )}
        </View>

        {/* Active Events Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="heading" color="textPrimary">
              Active Events Sales Progress
            </AppText>
            <Pressable onPress={() => router.push(routeBuilders.events())}>
              <AppText variant="caption" color="accentStart">
                View All →
              </AppText>
            </Pressable>
          </View>

          {activeEvents && activeEvents.length > 0 ? (
            activeEvents.map((evt) => {
              const progressPct = Math.min(
                Math.round((evt.ticketsSold / evt.totalCapacity) * 100),
                100,
              );
              return (
                <Pressable
                  key={evt.eventId}
                  style={styles.activeEventCard}
                  onPress={() =>
                    router.push(routeBuilders.creatorEventOpsHub(evt.eventId))
                  }
                >
                  <View style={styles.eventTitleRow}>
                    <AppText
                      variant="heading"
                      color="textPrimary"
                      style={{ flex: 1 }}
                    >
                      {evt.title}
                    </AppText>
                    <AppText variant="caption" color="accentEnd">
                      {formatCurrency(evt.revenueMinor, "ZAR")}
                    </AppText>
                  </View>

                  <View style={styles.salesSubRow}>
                    <AppText variant="caption" color="textMuted">
                      {evt.ticketsSold} / {evt.totalCapacity} Sold (
                      {progressPct}%)
                    </AppText>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPct}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.eventActionRow}>
                    <AppText variant="caption" color="accentStart">
                      Event Operations Hub →
                    </AppText>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <EmptyState
              title="No Active Event Sales"
              description="Publish an event to track real-time ticket sales."
            />
          )}
        </View>

        {/* Payouts Overview */}
        {payouts && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="heading" color="textPrimary">
                Payouts Overview
              </AppText>
              <Pressable
                onPress={() => router.push(routeBuilders.creatorPayouts())}
              >
                <AppText variant="caption" color="accentStart">
                  Full Payout History →
                </AppText>
              </Pressable>
            </View>
            <PayoutSummaryCard overview={payouts} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl * 2,
  },
  iconBtn: { position: "relative", padding: theme.spacing.xs },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: theme.colors.destructive,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "bold" },
  headerCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.lg,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(149, 145, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertsContainer: { marginBottom: theme.spacing.lg },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
    borderWidth: 1,
  },
  alertUrgent: {
    backgroundColor: "rgba(255, 170, 0, 0.1)",
    borderColor: theme.colors.warning,
  },
  alertInfo: {
    backgroundColor: "rgba(193, 128, 255, 0.1)",
    borderColor: theme.colors.accentEnd,
  },
  section: { marginBottom: theme.spacing.xl },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  periodRow: { flexDirection: "row", gap: theme.spacing.xs },
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
  eventTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  salesSubRow: { marginBottom: theme.spacing.xs },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: theme.spacing.xs,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.accentStart,
    borderRadius: 3,
  },
  eventActionRow: { marginTop: theme.spacing.xs, alignItems: "flex-end" },
});
