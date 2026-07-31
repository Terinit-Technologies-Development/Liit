import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { AppButton } from "../../../src/components/ui/AppButton";
import { theme } from "../../../src/design-system/theme";
import { useContentPosts } from "../../../src/hooks/creator/useCreatorQueries";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { Icon } from "../../../src/design-system/icons/Icon";
import { CreatorContentPost } from "../../../src/domain/creator";

function ContentPostRow({ post }: { post: CreatorContentPost }) {
  return (
    <View style={styles.postRow}>
      <View>
        <AppText variant="body">{post.title}</AppText>
        <AppText variant="caption" color="textMuted">
          {post.views} views • {post.likes} likes
        </AppText>
      </View>
      <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
    </View>
  );
}

export default function CreatorToolsScreen() {
  const { data: posts } = useContentPosts();

  return (
    <Screen style={styles.container}>
      <AppHeader title="Tools" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Go Live Card */}
        <View style={styles.liveCard}>
          <View style={styles.liveHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <AppText
                variant="caption"
                style={{ color: "white", fontWeight: "bold" }}
              >
                LIVE
              </AppText>
            </View>
          </View>
          <AppText variant="heading" style={{ marginBottom: theme.spacing.md }}>
            Broadcast to your audience
          </AppText>
          <AppButton
            label="Start Broadcasting [PROTOTYPE]"
            onPress={() =>
              Alert.alert("Go Live", "Broadcasting not available in prototype.")
            }
          />
        </View>

        {/* Content Posts Section */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Recent Content
        </AppText>
        {posts?.length ? (
          posts.map((post) => <ContentPostRow key={post.id} post={post} />)
        ) : (
          <EmptyState
            title="No content"
            description="You haven't posted any content yet."
            icon="search"
          />
        )}

        {/* Scheduled Announcements Section */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Announcements
        </AppText>
        <EmptyState
          title="No scheduled announcements"
          description="Keep your fans in the loop."
          icon="search"
        />

        {/* New Campaign Button */}
        <View style={{ marginTop: theme.spacing.xxxl }}>
          <AppButton
            label="New Campaign"
            variant="secondary"
            onPress={() =>
              Alert.alert("New Campaign", "Campaign management coming soon.")
            }
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
    padding: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  liveHeader: { flexDirection: "row", marginBottom: theme.spacing.md },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.statusDanger,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "white" },
  sectionTitle: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  postRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
});
