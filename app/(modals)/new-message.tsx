import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { SearchField } from "../../src/components/forms/SearchField";
import { AppText } from "../../src/components/ui/AppText";
import { AppImage } from "../../src/components/ui/AppImage";
import { EmptyState } from "../../src/components/feedback/EmptyState";
import { getImageSource } from "../../src/assets/image-registry";
import { useMessageRecipientsQuery } from "../../src/hooks/social/useSocialQueries";
import { routeBuilders } from "../../src/navigation/routes";
import { MessageRecipient } from "../../src/domain/social";
import { theme } from "../../src/design-system/theme";

export default function NewMessageModal() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const recipientsQuery = useMessageRecipientsQuery(searchQuery);
  const recipients = recipientsQuery.data ?? [];

  const handleSelectRecipient = (recipient: MessageRecipient) => {
    router.dismiss();
    if (recipient.kind === "direct") {
      router.push(routeBuilders.directThread(recipient.targetConversationId));
    } else {
      router.push(routeBuilders.inquiryThread(recipient.targetConversationId));
    }
  };

  return (
    <Screen safeAreaEdges={["top"]} gutter={false} testID="new-message-modal">
      <AppHeader
        title="New Message"
        showBack={false}
        rightAction={{
          icon: "close",
          accessibilityLabel: "Close modal",
          onPress: () => router.back(),
          testID: "new-message-close-button",
        }}
      />

      <View style={styles.searchSection}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search people or hosts…"
          testID="new-message-search-input"
        />
      </View>

      <FlatList
        data={recipients}
        keyExtractor={(item) => `${item.kind}-${item.id}`}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => handleSelectRecipient(item)}
            testID={`recipient-row-${item.id}`}
          >
            <AppImage
              source={getImageSource(item.avatarUrl)}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.rowContent}>
              <AppText variant="subheading" style={styles.name}>
                {item.name}
              </AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {item.handle} · {item.subtitle}
              </AppText>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No recipients found"
            description="Try searching for a friend's name or handle."
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  listContent: {
    paddingVertical: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
  },
  rowContent: {
    flex: 1,
  },
  name: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
});
