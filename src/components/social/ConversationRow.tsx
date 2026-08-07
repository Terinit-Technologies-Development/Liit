import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { AppImage } from "../ui/AppImage";
import { getImageSource } from "../../assets/image-registry";
import { Conversation } from "../../domain/social";
import { formatTime } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface ConversationRowProps {
  conversation: Conversation;
  onPress(): void;
  testID?: string;
}

export const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  onPress,
  testID,
}) => {
  const isDirect = conversation.kind === "direct";
  const name = isDirect ? conversation.participantName : conversation.hostName;
  const avatarKey = isDirect
    ? conversation.participantAvatarUrl
    : conversation.hostAvatarUrl;
  const unreadCount = conversation.unreadCount;
  const isUnread = unreadCount > 0;
  const isBlocked = isDirect && conversation.isBlocked;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${name}, ${isUnread ? `${unreadCount} unread` : "read"}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isUnread && styles.rowUnread,
        pressed && styles.pressed,
      ]}
      testID={testID ?? `conversation-row-${conversation.id}`}
    >
      <View style={styles.avatarWrapper}>
        <AppImage
          source={getImageSource(avatarKey)}
          style={styles.avatar}
          contentFit="cover"
        />
        {isDirect && conversation.isOnline ? (
          <View style={styles.onlineDot} />
        ) : null}
      </View>

      <View style={styles.centerContent}>
        <View style={styles.topRow}>
          <AppText
            variant="subheading"
            style={[styles.nameText, isUnread && styles.boldText]}
            numberOfLines={1}
          >
            {name}
          </AppText>

          {!isDirect && conversation.isVerified ? (
            <View style={styles.verifiedBadge}>
              <AppText variant="caption" style={styles.verifiedText}>
                ✓ Verified
              </AppText>
            </View>
          ) : null}

          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            style={styles.timeText}
          >
            {formatTime(conversation.lastMessage.sentAt)}
          </AppText>
        </View>

        {!isDirect ? (
          <AppText
            variant="caption"
            color={theme.colors.accentStart}
            numberOfLines={1}
            style={styles.eventContextText}
          >
            {conversation.eventContext.eventTitle}
          </AppText>
        ) : null}

        <View style={styles.bottomRow}>
          <AppText
            variant="body"
            color={isUnread ? theme.colors.textPrimary : theme.colors.textMuted}
            style={[styles.previewText, isUnread && styles.boldText]}
            numberOfLines={1}
          >
            {isBlocked ? "User blocked" : conversation.lastMessage.content}
          </AppText>

          {unreadCount > 0 ? (
            <View
              style={styles.unreadBadge}
              testID={`unread-badge-${unreadCount}`}
            >
              <AppText variant="caption" style={styles.unreadBadgeText}>
                {unreadCount}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.canvas,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
    gap: theme.spacing.md,
  },
  rowUnread: {
    backgroundColor: "rgba(149, 145, 255, 0.05)",
  },
  pressed: {
    opacity: 0.7,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.emerald400,
    borderWidth: 2,
    borderColor: theme.colors.canvas,
  },
  centerContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  boldText: {
    fontWeight: "800",
  },
  verifiedBadge: {
    backgroundColor: "rgba(149, 145, 255, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radii.pill,
  },
  verifiedText: {
    fontSize: 10,
    color: theme.colors.accentStart,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 11,
    marginLeft: "auto",
  },
  eventContextText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  previewText: {
    fontSize: 13,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: theme.colors.accentStart,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
