import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { SegmentedControl } from "../../../src/components/ui/SegmentedControl";
import { SearchField } from "../../../src/components/forms/SearchField";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { ConversationRow } from "../../../src/components/social/ConversationRow";
import { useConversationsQuery } from "../../../src/hooks/social/useSocialQueries";
import { routeBuilders } from "../../../src/navigation/routes";
import { theme } from "../../../src/design-system/theme";

export default function InboxScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"direct" | "inquiry">("direct");
  const [searchQuery, setSearchQuery] = useState("");

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
          onChange={(val) => setActiveTab(val as "direct" | "inquiry")}
          accessibilityLabel="Inbox tab filter"
          testID="inbox-segmented-control"
        />
      </View>

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.canvas,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});
