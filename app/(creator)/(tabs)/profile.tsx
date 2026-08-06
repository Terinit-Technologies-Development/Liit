import React from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { theme } from "../../../src/design-system/theme";
import { useCreatorProfile } from "../../../src/hooks/creator/useCreatorQueries";
import { ROUTES, routeBuilders } from "../../../src/navigation/routes";
import { Icon } from "../../../src/design-system/icons/Icon";
import { useSessionStore } from "../../../src/state/useSessionStore";

export default function CreatorProfileScreen() {
  const router = useRouter();
  const sessionUser = useSessionStore((s) => s.user);
  const { data: creatorProfile } = useCreatorProfile();

  const handleSwitchToConsumer = () => {
    router.replace(ROUTES.consumer.feed as any);
  };

  return (
    <Screen style={styles.container} testID="creator-profile-screen">
      <AppHeader title="Creator Profile" showBack={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Icon name="profile" size="lg" color={theme.colors.accentStart} />
          </View>

          <View style={styles.titleBadgeRow}>
            <AppText variant="heading" color="textPrimary">
              {creatorProfile?.brandName || "Groove Co. Johannesburg"}
            </AppText>
            {creatorProfile?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name="check" size="xs" color="#FFF" />
                <AppText variant="caption" style={styles.verifiedText}>
                  VERIFIED CREATOR
                </AppText>
              </View>
            )}
          </View>

          <AppText variant="body" color="textMuted" style={styles.bioText}>
            {creatorProfile?.bio ||
              "Curating premier deep house, electronic music & rooftop nightlife experiences in Jozi."}
          </AppText>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <AppText variant="heading" color="textPrimary">
                {creatorProfile?.followersCount?.toLocaleString() || "3,200"}
              </AppText>
              <AppText variant="caption" color="textMuted">
                Followers
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <AppText variant="heading" color="textPrimary">
                {creatorProfile?.totalEventsHosted || "18"}
              </AppText>
              <AppText variant="caption" color="textMuted">
                Hosted Events
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <AppText variant="heading" color="textPrimary">
                {creatorProfile?.rating || "4.9"} ★
              </AppText>
              <AppText variant="caption" color="textMuted">
                Creator Rating
              </AppText>
            </View>
          </View>
        </View>

        {/* Operational Entries */}
        <AppText
          variant="heading"
          color="textPrimary"
          style={styles.sectionTitle}
        >
          Creator Management
        </AppText>

        <Pressable
          style={styles.row}
          onPress={() =>
            router.push(routeBuilders.creatorVerification() as any)
          }
        >
          <View style={styles.rowLeft}>
            <Icon name="check" size="sm" color={theme.colors.success} />
            <AppText variant="body" color="textPrimary">
              Verification & KYC Checklist
            </AppText>
          </View>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.row}
          onPress={() => router.push(ROUTES.creator.payouts as any)}
        >
          <View style={styles.rowLeft}>
            <Icon name="card" size="sm" color={theme.colors.accentStart} />
            <AppText variant="body" color="textPrimary">
              Payouts & Financial Overview
            </AppText>
          </View>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        {/* Operational Settings */}
        <AppText
          variant="heading"
          color="textPrimary"
          style={styles.sectionTitle}
        >
          Operational Settings
        </AppText>

        <Pressable
          style={styles.row}
          onPress={() =>
            Alert.alert(
              "Edit Creator Profile [PROTOTYPE]",
              "Edit creator bio, social handles, and contact preferences.",
            )
          }
        >
          <View style={styles.rowLeft}>
            <Icon name="create" size="sm" color={theme.colors.textMuted} />
            <AppText variant="body" color="textPrimary">
              Edit Brand Details [PROTOTYPE]
            </AppText>
          </View>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.row}
          onPress={() =>
            Alert.alert(
              "Social Links [PROTOTYPE]",
              "Instagram: @grooveco_jhb\nTikTok: @grooveco_jhb\nWebsite: https://grooveco.co.za",
            )
          }
        >
          <View style={styles.rowLeft}>
            <Icon name="share" size="sm" color={theme.colors.textMuted} />
            <AppText variant="body" color="textPrimary">
              Social Links & Handles
            </AppText>
          </View>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.row}
          onPress={() =>
            router.push(routeBuilders.creatorNotifications() as any)
          }
        >
          <View style={styles.rowLeft}>
            <Icon name="bell" size="sm" color={theme.colors.textMuted} />
            <AppText variant="body" color="textPrimary">
              Creator Notifications
            </AppText>
          </View>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        {/* Mode Switch CTA */}
        <View style={styles.modeSwitchBox}>
          <Pressable
            style={styles.modeSwitchBtn}
            onPress={handleSwitchToConsumer}
          >
            <Icon name="profile" size="sm" color={theme.colors.accentStart} />
            <AppText variant="label" color="accentStart">
              Switch to Consumer Mode
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  headerCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(149, 145, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  titleBadgeRow: {
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  verifiedText: { color: "#FFF", fontSize: 9, fontWeight: "bold" },
  bioText: { textAlign: "center", marginVertical: theme.spacing.sm },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  statCol: { alignItems: "center" },
  statDivider: { width: 1, backgroundColor: theme.colors.borderSubtle },
  sectionTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.xs,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  modeSwitchBox: { marginTop: theme.spacing.xl },
  modeSwitchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(149, 145, 255, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.accentStart,
    gap: theme.spacing.xs,
  },
});
