import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface ReactionBarProps {
  reactionsCount: number;
  commentsCount: number;
  userReacted: boolean;
  onToggleReaction(): void;
  onOpenComments(): void;
  testID?: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  reactionsCount,
  commentsCount,
  userReacted,
  onToggleReaction,
  onOpenComments,
  testID = "reaction-bar",
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Like event, ${reactionsCount} likes`}
        onPress={onToggleReaction}
        style={({ pressed }) => [
          styles.actionButton,
          userReacted && styles.actionButtonActive,
          pressed && styles.pressed,
        ]}
        testID="reaction-bar-like"
      >
        <Icon
          name="heart"
          size={18}
          color={
            userReacted ? theme.colors.statusDanger : theme.colors.textMuted
          }
        />
        <AppText
          variant="caption"
          color={
            userReacted ? theme.colors.statusDanger : theme.colors.textMuted
          }
          style={styles.actionText}
        >
          {reactionsCount}
        </AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Comments, ${commentsCount} comments`}
        onPress={onOpenComments}
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.pressed,
        ]}
        testID="reaction-bar-comments"
      >
        <Icon name="chatBubble" size={18} color={theme.colors.textMuted} />
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.actionText}
        >
          {commentsCount}
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceElevated,
  },
  actionButtonActive: {
    backgroundColor: "rgba(255, 75, 110, 0.15)",
  },
  actionText: {
    fontWeight: "700",
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
