import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { IconButton } from "../ui/IconButton";
import { FeedEntry } from "../../domain/discovery";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";
import { formatDateRange } from "../../utils/format";

export interface CreatorPostCardProps {
  entry: Extract<FeedEntry, { kind: "creator_post" }>;
  onReact(): void;
  onComment(): void;
  onPressHost?(): void;
}

export function CreatorPostCard({
  entry,
  onReact,
  onComment,
  onPressHost,
}: CreatorPostCardProps) {
  return (
    <Card radius="xl" padding="md" style={styles.card}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open host ${entry.host.name}`}
          onPress={onPressHost}
          style={styles.hostGroup}
        >
          <Avatar
            source={getImageSource(entry.host.avatarImageKey)}
            size="sm"
          />
          <View>
            <AppText variant="subheading">{entry.host.name}</AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {entry.host.handle}
            </AppText>
          </View>
        </Pressable>
        <AppText variant="caption" color={theme.colors.textMuted}>
          {formatDateRange(entry.createdAt, entry.createdAt)}
        </AppText>
      </View>

      <AppText variant="body" style={styles.bodyText}>
        {entry.body}
      </AppText>

      {entry.mediaImageKey ? (
        <Image
          source={getImageSource(entry.mediaImageKey)}
          style={styles.mediaImage}
          accessibilityLabel="Creator post attached image"
        />
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Like post, ${entry.reactionCount} reactions`}
          onPress={onReact}
          style={styles.actionBtn}
        >
          <IconButton
            icon="heart"
            size="sm"
            variant="surface"
            onPress={onReact}
            accessibilityLabel={`Like post by ${entry.host.name}`}
          />
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {entry.reactionCount}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View comments, ${entry.commentCount} comments`}
          onPress={onComment}
          style={styles.actionBtn}
        >
          <IconButton
            icon="messageCircle"
            size="sm"
            variant="surface"
            onPress={onComment}
            accessibilityLabel={`Comments on post by ${entry.host.name}`}
          />
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {entry.commentCount}
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hostGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  bodyText: {
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  mediaImage: {
    width: "100%",
    height: 180,
    borderRadius: theme.radii.lg,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    minHeight: 44,
  },
});
