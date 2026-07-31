import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { SegmentedControl } from "../../../src/components/ui/SegmentedControl";
import { SearchField } from "../../../src/components/forms/SearchField";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { Skeleton } from "../../../src/components/feedback/Skeleton";
import { ConversationRow } from "../../../src/components/social/ConversationRow";
import { useConversationsQuery } from "../../../src/hooks/social/useSocialQueries";
import { useSocialStore } from "../../../src/state/useSocialStore";
import { routeBuilders } from "../../../src/navigation/routes";
import { theme } from "../../../src/design-system/theme";

export default function InboxScreen() {
  const router = useRouter();

  const activeTab = useSocialStore((state) => state.inboxTab);
  const setInboxTab = useSocialStore((state) => state.setInboxTab);
  const searchQuery = useSocialStore((state) => state.searchQuery);
  const setSearchQuery = useSocialStore((state) => state.setSearchQuery);

  const conversationsQuery = useConversationsQuery(activeTab);
  const conversations = conversationsQuery.data ?? [];

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => {
      if (c.kind === "direct") {
        return (
          c.participantName.toLowerCase().includes(q) ||
          c.lastMessage.content.toLowerCase().includes(q)
        );
      } else {
        return (
          c.hostName.toLowerCase().includes(q) ||
          c.eventContext.eventTitle.toLowerCase().includes(q) ||
          c.lastMessage.content.toLowerCase().includes(q)
        );
      }
    });
  }, [conversations, searchQuery]);

  const handleConversationPress = (
    conversationId: string,
    kind: "direct" | "inquiry",
  ) => {
    if (kind === "direct") {
      router.push(routeBuilders.directThread(conversationId));
    } else {
      router.push(routeBuilders.inquiryThread(conversationId));
    }
  };

  return (
    <Screen safeAreaEdges={["top"]} gutter={false} testID="inbox-screen">
      <AppHeader
        title="Inbox"
        showBack
        onBack={() => router.back()}
        rightAction={{
          icon: "add",
          accessibilityLabel: "New message",
          onPress: () => router.push(routeBuilders.newMessageModal()),
          testID: "inbox-new-message-button",
        }}
      />

      <View style={styles.filterSection}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder={
            activeTab === "direct"
              ? "Search messages or friends…"
              : "Search host inquiries or events…"
          }
          testID="inbox-search-input"
        />

        <SegmentedControl
          value={activeTab}
          options={[
            { value: "direct", label: "Direct", testID: "inbox-tab-direct" },
            {
              value: "inquiry",
              label: "Hosts & Events",
              testID: "inbox-tab-inquiry",
            },
          ]}
          onChange={(val) => setInboxTab(val as "direct" | "inquiry")}
          accessibilityLabel="Inbox tab filter"
          testID="inbox-segmented-control"
        />
      </View>

      {conversationsQuery.isLoading ? (
        <View style={styles.loadingContainer} testID="inbox-loading">
          <Skeleton width="100%" height={72} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={72} style={{ marginBottom: 12 }} />
        </View>
      ) : conversationsQuery.isError ? (
        <ErrorState
          title="Could not load conversations"
          description="Failed to load your inbox messages."
          onAction={() => conversationsQuery.refetch()}
          actionLabel="Retry"
          testID="inbox-query-error"
        />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() => handleConversationPress(item.id, item.kind)}
              testID={`inbox-row-${item.id}`}
            />
          )}
          ListEmptyComponent={
            <View testID="inbox-empty-state">
              <EmptyState
                title={
                  activeTab === "direct"
                    ? "No direct messages yet"
                    : "No host inquiries yet"
                }
                description={
                  activeTab === "direct"
                    ? "Start a direct conversation with friends or fellow event attendees."
                    : "Ask event organizers questions about VIP booths, entry requirements, or timing."
                }
                actionLabel={
                  activeTab === "direct" ? "Start New Message" : undefined
                }
                onAction={
                  activeTab === "direct"
                    ? () => router.push(routeBuilders.newMessageModal())
                    : undefined
                }
              />
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  loadingContainer: {
    padding: theme.spacing.gutter,
  },
  listContent: {
    paddingVertical: theme.spacing.xs,
  },
});
