import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { Chip } from "../../src/components/ui/Chip";
import { Icon } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import {
  useCreatorNotifications,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../../src/hooks/creator/useCreatorQueries";
import { EmptyState } from "../../src/components/feedback/EmptyState";

const CATEGORIES = ["All", "Sales", "Activity", "System"];

export default function CreatorNotifications() {
  const router = useRouter();
  const [category, setCategory] = useState("All");

  const { data: notifications } = useCreatorNotifications(category);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const handlePressNotif = (id: string, targetRoute?: string) => {
    markReadMutation.mutate(id);
    if (targetRoute) {
      router.push(targetRoute as any);
    }
  };

  return (
    <Screen style={styles.container} testID="creator-notifications-screen">
      <AppHeader
        title="Creator Notifications"
        rightElement={
          <Pressable onPress={() => markAllReadMutation.mutate()} hitSlop={8}>
            <AppText
              variant="caption"
              color="accentStart"
              style={{ fontWeight: "bold" }}
            >
              Mark All Read
            </AppText>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category Filter Chips */}
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>

        {/* Notifications List */}
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <Pressable
              key={n.id}
              style={[styles.notifCard, !n.isRead && styles.unreadCard]}
              onPress={() => handlePressNotif(n.id, n.targetRoute)}
            >
              <View style={styles.iconCircle}>
                <Icon
                  name={
                    n.category === "sales"
                      ? "tickets"
                      : n.category === "activity"
                        ? "profile"
                        : "bell"
                  }
                  size="sm"
                  color={
                    n.category === "sales"
                      ? theme.colors.success
                      : n.category === "activity"
                        ? theme.colors.accentStart
                        : theme.colors.accentEnd
                  }
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.cardTitleRow}>
                  <AppText
                    variant="label"
                    color="textPrimary"
                    style={{ flex: 1 }}
                  >
                    {n.title}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {n.timestamp}
                  </AppText>
                </View>

                <AppText
                  variant="caption"
                  color="textMuted"
                  style={{ marginTop: 2 }}
                >
                  {n.message}
                </AppText>

                <View style={styles.badgeRow}>
                  <View style={styles.categoryBadge}>
                    <AppText variant="caption" style={styles.badgeText}>
                      {n.category.toUpperCase()}
                    </AppText>
                  </View>
                  {!n.isRead && <View style={styles.unreadDot} />}
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <EmptyState
            title="No Notifications"
            description={`No ${category.toLowerCase()} notifications found.`}
            icon="bell"
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  chipRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  notifCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accentStart,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 9, color: theme.colors.textMuted, fontWeight: "bold" },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentStart,
  },
});
