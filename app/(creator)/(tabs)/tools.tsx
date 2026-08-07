import React from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { AppButton } from "../../../src/components/ui/AppButton";
import { Icon } from "../../../src/design-system/icons/Icon";
import { theme } from "../../../src/design-system/theme";
import { useContentPosts } from "../../../src/hooks/creator/useCreatorQueries";
import { routeBuilders } from "../../../src/navigation/routes";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { CreatorContentPost } from "../../../src/domain/creator";

function ContentPostRow({ post }: { post: CreatorContentPost }) {
  return (
    <View style={styles.postRow}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant="label" color="textPrimary">
            {post.title}
          </AppText>
          <View style={styles.stateBadge}>
            <AppText variant="caption" style={styles.stateBadgeText}>
              {post.state.toUpperCase()}
            </AppText>
          </View>
        </View>

        {post.eventTitle && (
          <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
            {post.eventTitle}
          </AppText>
        )}

        <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
          {post.views} views • {post.likes} reactions
        </AppText>
      </View>

      <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
    </View>
  );
}

export default function CreatorToolsScreen() {
  const router = useRouter();
  const { data: posts } = useContentPosts();

  const handleStartBroadcast = () => {
    Alert.alert(
      "Live Broadcast Unavailable",
      "Live broadcasting features are unavailable in this advanced prototype.",
    );
  };

  const handleNewCampaign = () => {
    Alert.alert(
      "New Campaign [PROTOTYPE]",
      "Campaign management simulation initiated.",
    );
  };

  return (
    <Screen style={styles.container} testID="creator-tools-screen">
      <AppHeader title="Creator Tools & Content" showBack={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Live Broadcast Section */}
        <View style={styles.liveCard}>
          <View style={styles.liveHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <AppText variant="caption" style={styles.liveBadgeText}>
                LIVE BROADCAST
              </AppText>
            </View>
          </View>

          <AppText
            variant="heading"
            color="textPrimary"
            style={{ marginBottom: 6 }}
          >
            Real-Time Stream & Stage Broadcast
          </AppText>

          <AppText
            variant="caption"
            color="textMuted"
            style={{ marginBottom: theme.spacing.md }}
          >
            Live broadcasting is unavailable in this prototype.
          </AppText>

          <AppButton
            label="Start Live Broadcast [PROTOTYPE]"
            variant="secondary"
            onPress={handleStartBroadcast}
          />
        </View>

        {/* Content & Announcements Feed */}
        <View style={styles.sectionHeaderRow}>
          <AppText variant="heading" color="textPrimary">
            Recent Content & Stories
          </AppText>
          <Pressable
            onPress={() =>
              router.push(
                routeBuilders.creatorEventContent("evt-midnight-grooves"),
              )
            }
          >
            <AppText variant="caption" color="accentStart">
              Manage Content →
            </AppText>
          </Pressable>
        </View>

        {posts && posts.length > 0 ? (
          posts.map((post) => <ContentPostRow key={post.id} post={post} />)
        ) : (
          <EmptyState
            title="No Content Published"
            description="Post lineup announcements and stories for your attendees."
          />
        )}

        {/* New Campaign Action */}
        <View style={{ marginTop: theme.spacing.xl }}>
          <AppButton
            label="+ New Announcement / Campaign [PROTOTYPE]"
            variant="primary"
            onPress={handleNewCampaign}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  liveCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.xl,
  },
  liveHeader: { flexDirection: "row", marginBottom: theme.spacing.sm },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.destructive,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    gap: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF" },
  liveBadgeText: { color: "#FFF", fontWeight: "bold", fontSize: 10 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  postRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  stateBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stateBadgeText: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: "bold",
  },
});
