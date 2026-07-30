import React from "react";
import { StyleSheet, View } from "react-native";
import { EventPostPreview as EventPostPreviewType } from "../../domain/event-detail";
import { Card } from "../ui/Card";
import { AppText } from "../ui/AppText";
import { AppImage } from "../ui/AppImage";
import { StatusPill } from "../ui/StatusPill";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface EventPostPreviewListProps {
  posts: EventPostPreviewType[];
}

export function EventPostPreviewList({ posts }: EventPostPreviewListProps) {
  if (posts.length === 0) return null;

  return (
    <View style={styles.container}>
      <AppText variant="subheading" style={styles.sectionTitle}>
        Host Updates & Live Feed
      </AppText>

      <View style={styles.postsList}>
        {posts.map((post) => (
          <Card key={post.id} radius="xl" padding="md" style={styles.postCard}>
            <View style={styles.headerRow}>
              {post.type === "live_placeholder" ? (
                <StatusPill status="live" size="sm" />
              ) : (
                <StatusPill status="upcoming" size="sm" />
              )}
              <AppText variant="caption" color={theme.colors.textMuted}>
                {new Date(post.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </AppText>
            </View>

            <AppText variant="subheading" style={styles.postTitle}>
              {post.title}
            </AppText>

            <AppText variant="body" color={theme.colors.textSecondary}>
              {post.body}
            </AppText>

            {post.imageKey ? (
              <AppImage
                source={getImageSource(post.imageKey)}
                style={styles.postImage}
                accessibilityLabel={post.title}
              />
            ) : null}
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  postsList: {
    gap: theme.spacing.sm,
  },
  postCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postTitle: {
    fontWeight: "700",
  },
  postImage: {
    width: "100%",
    height: 160,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.xs,
  },
});
