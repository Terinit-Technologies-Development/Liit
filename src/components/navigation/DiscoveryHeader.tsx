import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { IconButton } from "../ui/IconButton";
import { PrototypeBadge } from "../ui/PrototypeBadge";
import { theme } from "../../design-system/theme";
import { Icon } from "../../design-system/icons/Icon";

export interface DiscoveryHeaderProps {
  city: string;
  unreadCount: number;
  unreadInboxCount?: number;
  onCityPress?(): void;
  onSearch(): void;
  onNotifications(): void;
  onInbox?(): void;
}

export function DiscoveryHeader({
  city,
  unreadCount,
  unreadInboxCount = 0,
  onCityPress,
  onSearch,
  onNotifications,
  onInbox,
}: DiscoveryHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <PrototypeBadge label="LIIT" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Current city ${city}`}
          onPress={onCityPress}
          style={({ pressed }) => [
            styles.citySelector,
            pressed && styles.pressed,
          ]}
        >
          <Icon name="mapPin" size={14} color={theme.colors.accentStart} />
          <AppText variant="subheading" style={styles.cityText}>
            {city}
          </AppText>
          <Icon name="chevronRight" size={14} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.rightGroup}>
        <IconButton
          testID="feed-open-search"
          icon="search"
          accessibilityLabel="Search LIIT"
          onPress={onSearch}
          variant="surface"
          size="sm"
        />

        {onInbox ? (
          <View style={styles.notifWrapper}>
            <IconButton
              testID="feed-open-inbox"
              icon="chatBubble"
              accessibilityLabel={
                unreadInboxCount > 0
                  ? `Inbox, ${unreadInboxCount} unread`
                  : "Inbox"
              }
              onPress={onInbox}
              variant="surface"
              size="sm"
            />
            {unreadInboxCount > 0 ? (
              <View style={styles.badgeDot}>
                <AppText variant="caption" style={styles.badgeText}>
                  {unreadInboxCount > 9 ? "9+" : unreadInboxCount}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.notifWrapper}>
          <IconButton
            testID="feed-open-notifications"
            icon="bell"
            accessibilityLabel={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            onPress={onNotifications}
            variant="surface"
            size="sm"
          />
          {unreadCount > 0 ? (
            <View style={styles.badgeDot}>
              <AppText variant="caption" style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.canvas,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
  },
  cityText: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  notifWrapper: {
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: theme.colors.accentStart,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#000",
  },
  pressed: {
    opacity: 0.7,
  },
});
