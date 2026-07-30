import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { NotificationItem } from "../../domain/notifications";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";
import { formatDateRange } from "../../utils/format";

export interface NotificationRowProps {
  item: NotificationItem;
  onPress(): void;
}

export function NotificationRow({ item, onPress }: NotificationRowProps) {
  const isUnread = item.readState === "unread";
  const imageKey = item.eventImageKey ?? item.avatarImageKey;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.body}`}
      accessibilityHint={
        isUnread
          ? "Unread notification. Opens related LIIT destination."
          : "Read notification. Opens related LIIT destination."
      }
      accessibilityState={{ selected: isUnread }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isUnread ? styles.containerUnread : styles.containerRead,
        pressed && styles.pressed,
      ]}
    >
      {imageKey ? (
        <Image
          source={getImageSource(imageKey)}
          style={styles.image}
          accessibilityLabel="Notification attachment image"
        />
      ) : null}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppText
            variant={isUnread ? "subheading" : "body"}
            color={
              isUnread ? theme.colors.textPrimary : theme.colors.textSecondary
            }
            numberOfLines={1}
            style={isUnread ? styles.unreadTitle : undefined}
          >
            {item.title}
          </AppText>

          <AppText variant="caption" color={theme.colors.textMuted}>
            {formatDateRange(item.createdAt, item.createdAt)}
          </AppText>
        </View>

        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          numberOfLines={2}
          style={styles.bodyText}
        >
          {item.body}
        </AppText>
      </View>

      {isUnread ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.md,
    minHeight: 72,
    marginVertical: 4,
  },
  containerUnread: {
    backgroundColor: theme.colors.surfaceElevated,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accentStart,
  },
  containerRead: {
    backgroundColor: theme.colors.surfacePrimary,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.md,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unreadTitle: {
    fontWeight: "700",
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accentStart,
  },
  pressed: {
    opacity: 0.85,
  },
});
