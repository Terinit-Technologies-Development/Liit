import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { AppImage } from "../ui/AppImage";
import { getImageSource } from "../../assets/image-registry";
import { Icon } from "../../design-system/icons/Icon";
import { Comment } from "../../domain/social";
import { formatTime } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface CommentRowProps {
  comment: Comment;
  onToggleReaction(): void;
  onReport(): void;
  onRetry?(): void;
  testID?: string;
}

export const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  onToggleReaction,
  onReport,
  onRetry,
  testID,
}) => {
  const isPending = comment.status === "optimistic";
  const isFailed = comment.status === "failed";

  return (
    <View
      style={[
        styles.container,
        isPending && styles.containerPending,
        isFailed && styles.containerFailed,
      ]}
      testID={testID ?? `comment-row-${comment.id}`}
    >
      <AppImage
        source={getImageSource(comment.authorAvatarUrl)}
        style={styles.avatar}
        contentFit="cover"
      />

      <View style={styles.contentColumn}>
        <View style={styles.headerRow}>
          <AppText variant="subheading" style={styles.authorName}>
            {comment.authorName}
          </AppText>
          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            style={styles.timeText}
          >
            {formatTime(comment.postedAt)}
          </AppText>
        </View>

        <AppText variant="body" style={styles.commentContent}>
          {comment.content}
        </AppText>

        {isPending ? (
          <AppText
            variant="caption"
            color={theme.colors.accentStart}
            style={styles.statusText}
          >
            Posting comment…
          </AppText>
        ) : null}

        {isFailed ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry comment"
            disabled={!onRetry}
            onPress={onRetry}
            testID={`comment-retry-${comment.id}`}
          >
            <AppText
              variant="caption"
              color={theme.colors.statusDanger}
              style={styles.statusText}
            >
              Failed to post comment. Tap to retry.
            </AppText>
          </Pressable>
        ) : null}

        <View style={styles.footerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Like comment, ${comment.reactionsCount} likes`}
            onPress={onToggleReaction}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            testID={`comment-like-${comment.id}`}
          >
            <Icon
              name="heart"
              size={14}
              color={
                comment.userReacted
                  ? theme.colors.statusDanger
                  : theme.colors.textMuted
              }
            />
            <AppText
              variant="caption"
              color={
                comment.userReacted
                  ? theme.colors.statusDanger
                  : theme.colors.textMuted
              }
              style={styles.actionText}
            >
              {comment.reactionsCount}
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report comment"
            onPress={onReport}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            testID={`comment-report-${comment.id}`}
          >
            <Icon name="alertCircle" size={14} color={theme.colors.textMuted} />
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              style={styles.actionText}
            >
              Report
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  containerPending: {
    opacity: 0.7,
  },
  containerFailed: {
    backgroundColor: "rgba(255, 75, 110, 0.05)",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
  },
  contentColumn: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  authorName: {
    fontWeight: "700",
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 19,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.6,
  },
});
