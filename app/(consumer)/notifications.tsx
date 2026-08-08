import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { SegmentedControl } from "../../src/components/ui/SegmentedControl";
import { NotificationRow } from "../../src/components/notifications/NotificationRow";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { useNotificationsQuery } from "../../src/hooks/discovery/useNotificationsQuery";
import { useAppStore } from "../../src/state/useAppStore";
import { NotificationFilter } from "../../src/repositories/contracts/NotificationRepository";
import { NotificationTarget } from "../../src/domain/notifications";
import { mockSocialRepository } from "../../src/repositories/mock/MockSocialRepository";
import { routeBuilders, ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";
import { Icon } from "../../src/design-system/icons/Icon";

export default function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const scenario = useAppStore((state) => state.scenario);

  const {
    data = [],
    isLoading,
    isError,
    markAllRead,
    markRead,
    refetch,
  } = useNotificationsQuery(filter);

  const notificationsDisabled = scenario === "notifications_disabled";
  const unreadCount = data.filter((item) => item.readState === "unread").length;

  const handleTargetNavigation = (target: NotificationTarget) => {
    switch (target.kind) {
      case "tickets":
        router.push(ROUTES.consumer.tickets as any);
        break;
      case "ticket":
        router.push(routeBuilders.fullTicket(target.ticketId));
        break;
      case "event":
        router.push(routeBuilders.eventDetail(target.eventId));
        break;
      case "host":
        router.push(routeBuilders.hostProfile(target.hostId));
        break;
      case "message":
        void (async () => {
          try {
            const conversation = await mockSocialRepository.getConversation(
              target.conversationId,
            );
            if (!conversation) {
              router.push(routeBuilders.inbox());
              return;
            }
            router.push(
              conversation.kind === "inquiry"
                ? routeBuilders.inquiryThread(conversation.id)
                : routeBuilders.directThread(conversation.id),
            );
          } catch {
            router.push(routeBuilders.inbox());
          }
        })();
        break;
      case "search":
        router.push({
          pathname: ROUTES.consumer.search as any,
          params: { q: target.query },
        });
        break;
      case "profile":
        router.push(ROUTES.consumer.profile as any);
        break;
    }
  };

  if (notificationsDisabled) {
    return (
      <Screen safeAreaEdges={["top"]} style={styles.screen}>
        <AppHeader title="Notifications" showBack />
        <View style={styles.disabledContainer}>
          <Icon name="bell" size={48} color={theme.colors.textMuted} />
          <AppText variant="heading" style={styles.disabledTitle}>
            Notifications are paused
          </AppText>
          <AppText
            variant="body"
            color={theme.colors.textMuted}
            style={styles.disabledBody}
          >
            This prototype state represents disabled notification permissions or
            scenario override.
          </AppText>
          <SecondaryButton
            label="Open Prototype Controls"
            onPress={() => router.push(ROUTES.modals.prototypeControls as any)}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={["top"]} style={styles.screen}>
      <AppHeader
        title="Notifications"
        showBack
        rightAction={{
          icon: "check",
          accessibilityLabel:
            unreadCount > 0
              ? `Mark all ${unreadCount} notifications as read`
              : "All notifications are read",
          onPress: unreadCount > 0 ? () => markAllRead() : () => undefined,
          testID: "notifications-mark-all-read",
        }}
      />

      <View style={styles.filterBar}>
        <SegmentedControl
          value={filter}
          onChange={(val) => setFilter(val as NotificationFilter)}
          accessibilityLabel="Notification filters"
          options={[
            {
              value: "all",
              label: "All",
              testID: "notifications-filter-all",
            },
            {
              value: "events",
              label: "Events",
              testID: "notifications-filter-events",
            },
            {
              value: "activity",
              label: "Activity",
              testID: "notifications-filter-activity",
            },
          ]}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <AppText variant="body" color={theme.colors.textMuted}>
                Loading notifications...
              </AppText>
            </View>
          ) : isError ? (
            <View style={styles.emptyState}>
              <AppText variant="heading">Notifications did not load</AppText>
              <SecondaryButton label="Retry" onPress={() => refetch()} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="bell" size={36} color={theme.colors.textMuted} />
              <AppText variant="heading">Nothing new</AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Event reminders and activity will appear here.
              </AppText>
            </View>
          )
        }
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            onPress={() => {
              if (item.readState === "unread") {
                markRead(item.id);
              }
              handleTargetNavigation(item.target);
            }}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  filterBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  disabledContainer: {
    flex: 1,
    padding: theme.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  disabledTitle: {
    textAlign: "center",
  },
  disabledBody: {
    textAlign: "center",
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
});
