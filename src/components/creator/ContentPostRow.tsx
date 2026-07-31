import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";
import { CreatorContentPost } from "../../domain/creator";
import { Icon } from "../../design-system/icons/Icon";

interface ContentPostRowProps {
  post: CreatorContentPost;
  onPress: () => void;
}

export function ContentPostRow({ post, onPress }: ContentPostRowProps) {
  let iconName: "search" | "calendar" | "lock" | "sparkles" = "search";
  let iconColor = theme.colors.textMuted;

  switch (post.state) {
    case "pinned":
      iconName = "sparkles";
      iconColor = theme.colors.accentStart;
      break;
    case "scheduled":
      iconName = "calendar";
      iconColor = theme.colors.textPrimary;
      break;
    case "hidden":
    case "draft":
      iconName = "lock";
      break;
    case "public":
    default:
      iconName = "search";
      break;
  }

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size="md" color={iconColor} />
      </View>

      <View style={styles.content}>
        <AppText variant="heading" color="textPrimary" numberOfLines={1}>
          {post.title}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {post.state.toUpperCase()} •{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </AppText>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Icon name="heart" size="xs" color={theme.colors.textMuted} />
          <AppText variant="caption" color="textMuted" style={styles.statText}>
            {post.likes}
          </AppText>
        </View>
        <View style={styles.statItem}>
          <Icon name="search" size="xs" color={theme.colors.textMuted} />
          <AppText variant="caption" color="textMuted" style={styles.statText}>
            {post.views}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfacePrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  stats: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 4,
  },
});
