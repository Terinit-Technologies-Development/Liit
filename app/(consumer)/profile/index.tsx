import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppText } from "../../../src/components/ui/AppText";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { Avatar } from "../../../src/components/ui/Avatar";
import { SurfaceCard } from "../../../src/components/ui/Card";
import { Chip } from "../../../src/components/ui/Chip";
import { StatusPill } from "../../../src/components/ui/StatusPill";
import { SecondaryButton } from "../../../src/components/ui/SecondaryButton";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { Icon } from "../../../src/design-system/icons/Icon";
import { useSessionStore } from "../../../src/state/useSessionStore";
import { useAppStore } from "../../../src/state/useAppStore";
import { useToast } from "../../../src/hooks/useToast";
import {
  mockProfileStats,
  mockIdentityUser,
} from "../../../src/fixtures/identity";
import { mockEvents } from "../../../src/fixtures";
import { formatCurrency, formatDate } from "../../../src/utils/format";
import { ROUTES } from "../../../src/navigation/routes";
import { theme } from "../../../src/design-system/theme";

type SegmentTab = "attended" | "saved" | "activity";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, status } = useSessionStore();
  const { activeMode } = useAppStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SegmentTab>("saved");

  const currentUser = user || mockIdentityUser;
  const isGuest = status === "guest";

  const savedEvents = mockEvents.filter((evt) => evt.isSaved);
  const recentActivities = [
    {
      id: "act_1",
      title: "RSVPed to Subterranean Afro-Tech Night",
      time: "2 hours ago",
      icon: "sparkles" as const,
    },
    {
      id: "act_2",
      title: "Saved Rooftop Amapiano Sundowners",
      time: "Yesterday",
      icon: "heart" as const,
    },
    {
      id: "act_3",
      title: "Attended Deep House Underground JHB",
      time: "3 days ago",
      icon: "calendar" as const,
    },
  ];

  const handleBecomeCreator = () => {
    // Navigates to mode switch modal without mutating activeMode
    router.push(ROUTES.modals.modeSwitch);
  };

  const handleEditProfile = () => {
    showToast(
      "Edit Profile",
      "Profile editing is simulated in prototype mode.",
      "info",
    );
  };

  return (
    <Screen safeAreaEdges={["top"]} style={styles.container}>
      <AppHeader
        title="Consumer Profile"
        rightAction={{
          icon: "settings",
          accessibilityLabel: "Open Settings",
          onPress: () => router.push(ROUTES.consumer.settings),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <SurfaceCard style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <Avatar
              source={currentUser.profile.avatarUrl}
              name={currentUser.profile.displayName}
              size="xl"
            />
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <AppText variant="heading">
                  {currentUser.profile.displayName}
                </AppText>
                {currentUser.creatorCapability.isVerified ? (
                  <Icon
                    name="check"
                    size="sm"
                    color={theme.colors.accentStart}
                  />
                ) : null}
              </View>
              <AppText variant="label" color={theme.colors.textSecondary}>
                @{currentUser.profile.handle} • {currentUser.profile.city}
              </AppText>

              <View style={styles.modeBadgeRow}>
                <StatusPill
                  label={activeMode.toUpperCase()}
                  type={activeMode === "creator" ? "verified" : "live"}
                />
              </View>
            </View>
          </View>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.bioText}
          >
            {currentUser.profile.bio}
          </AppText>

          {/* Stats Summary Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <AppText variant="display" color={theme.colors.accentStart}>
                {isGuest ? 0 : mockProfileStats.attendedCount}
              </AppText>
              <AppText variant="label" color={theme.colors.textMuted}>
                Attended
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <AppText variant="display" color={theme.colors.accentStart}>
                {isGuest ? 0 : mockProfileStats.savedCount}
              </AppText>
              <AppText variant="label" color={theme.colors.textMuted}>
                Saved
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <AppText variant="display" color={theme.colors.accentStart}>
                {isGuest ? 0 : mockProfileStats.followingCount}
              </AppText>
              <AppText variant="label" color={theme.colors.textMuted}>
                Following
              </AppText>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.headerActionRow}>
            <SecondaryButton
              label="Edit Profile"
              onPress={handleEditProfile}
              leftIcon="profile"
              fullWidth
              accessibilityLabel="Edit Profile"
            />
            <SecondaryButton
              label="Settings & Preferences"
              onPress={() => router.push(ROUTES.consumer.settings)}
              leftIcon="settings"
              fullWidth
              accessibilityLabel="Settings and Preferences"
            />
            <Pressable
              testID="profile-open-mode-switch"
              onPress={handleBecomeCreator}
              style={styles.creatorSwitchBanner}
              accessibilityRole="button"
              accessibilityLabel="Switch to Creator Mode"
            >
              <Icon name="sparkles" size="sm" color={theme.colors.purple400} />
              <AppText variant="button" color={theme.colors.purple400}>
                Switch to Creator Mode
              </AppText>
            </Pressable>
          </View>
        </SurfaceCard>

        {/* Segmented Control */}
        <View style={styles.segmentedRow}>
          {(["saved", "activity", "attended"] as SegmentTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Chip
                key={tab}
                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                selected={isActive}
                onPress={() => setActiveTab(tab)}
              />
            );
          })}
        </View>

        {/* Tab Contents */}
        {isGuest ? (
          <EmptyState
            title="Guest Profile Mode"
            description="Sign in to save events, track ticket history, and sync your social calendar across devices."
            actionLabel="Sign In or Register"
            onAction={() => router.push(ROUTES.public.signIn)}
            icon="profile"
          />
        ) : activeTab === "saved" ? (
          <View style={styles.tabSection}>
            {savedEvents.map((evt) => (
              <SurfaceCard key={evt.id} style={styles.eventCard}>
                <View style={styles.eventCardContent}>
                  <View style={styles.eventCardText}>
                    <StatusPill
                      label={evt.status}
                      type={evt.status === "live" ? "live" : "verified"}
                    />
                    <AppText variant="heading" style={styles.eventTitle}>
                      {evt.title}
                    </AppText>
                    <AppText variant="label" color={theme.colors.textSecondary}>
                      {evt.venue.name} • {evt.venue.suburb}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={theme.colors.accentStart}
                      style={styles.eventTime}
                    >
                      {formatDate(evt.occurrence.startTime)} •{" "}
                      {formatCurrency(evt.startingPriceMinor, evt.currency)}
                    </AppText>
                  </View>
                </View>
              </SurfaceCard>
            ))}
            <Pressable
              onPress={() => router.push(ROUTES.consumer.savedEvents)}
              style={styles.viewAllBtn}
            >
              <AppText variant="label" color={theme.colors.accentStart}>
                View All Saved Events →
              </AppText>
            </Pressable>
          </View>
        ) : activeTab === "activity" ? (
          <View style={styles.tabSection}>
            {recentActivities.map((act) => (
              <SurfaceCard key={act.id} style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <Icon
                    name={act.icon}
                    size="sm"
                    color={theme.colors.accentStart}
                  />
                  <View style={styles.activityText}>
                    <AppText variant="bodyStrong">{act.title}</AppText>
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      {act.time}
                    </AppText>
                  </View>
                </View>
              </SurfaceCard>
            ))}
            <Pressable
              onPress={() => router.push(ROUTES.consumer.activity)}
              style={styles.viewAllBtn}
            >
              <AppText variant="label" color={theme.colors.accentStart}>
                View Complete Activity Log →
              </AppText>
            </Pressable>
          </View>
        ) : (
          <EmptyState
            title="No Attended Events Yet"
            description="Events you check into will appear here in your verified ticket history."
            icon="calendar"
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
  },
  scrollContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  profileHeaderCard: {
    marginBottom: theme.spacing.lg,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  identityDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  modeBadgeRow: {
    marginTop: theme.spacing.xs,
  },
  bioText: {
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statBox: {
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.borderSubtle,
  },
  headerActionRow: {
    gap: theme.spacing.sm,
  },
  creatorSwitchBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.purpleBadgeBg,
    borderWidth: 1,
    borderColor: theme.colors.purpleBadgeBorder,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tabSection: {
    gap: theme.spacing.sm,
  },
  eventCard: {
    padding: theme.spacing.md,
  },
  eventCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventCardText: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  eventTitle: {
    marginTop: theme.spacing.xs,
  },
  eventTime: {
    marginTop: theme.spacing.xxs,
  },
  viewAllBtn: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  activityCard: {
    padding: theme.spacing.md,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  activityText: {
    flex: 1,
  },
});
