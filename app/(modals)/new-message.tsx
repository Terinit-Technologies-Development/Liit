import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { SearchField } from "../../src/components/forms/SearchField";
import { AppText } from "../../src/components/ui/AppText";
import { AppImage } from "../../src/components/ui/AppImage";
import { getImageSource } from "../../src/assets/image-registry";
import { routeBuilders } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

interface RecipientOption {
  id: string;
  name: string;
  handle: string;
  avatarKey: string;
  kind: "direct" | "inquiry";
  targetConversationId: string;
  subtitle: string;
}

const mockRecipients: RecipientOption[] = [
  {
    id: "usr-alex-khumalo",
    name: "Alex Khumalo",
    handle: "@alex_k",
    avatarKey: "hostGrooveCo",
    kind: "direct",
    targetConversationId: "conv-direct-alex",
    subtitle: "Friend · Johannesburg",
  },
  {
    id: "usr-thandi-biko",
    name: "Thandi Biko",
    handle: "@thandi_b",
    avatarKey: "hostAmapianoSunsets",
    kind: "direct",
    targetConversationId: "conv-direct-thandi",
    subtitle: "Friend · Rosebank",
  },
  {
    id: "host-club-vibez",
    name: "Club Vibez JHB",
    handle: "@clubvibez_jhb",
    avatarKey: "hostGrooveCo",
    kind: "inquiry",
    targetConversationId: "conv-inquiry-club-vibez",
    subtitle: "Verified Organizer · Midnight Kinetic Grooves",
  },
  {
    id: "host-soweto-collective",
    name: "Soweto Food & Craft Collective",
    handle: "@sowetocraft",
    avatarKey: "eventSowetoFoodMarket",
    kind: "inquiry",
    targetConversationId: "conv-inquiry-soweto-market",
    subtitle: "Verified Organizer · Soweto Street Food Market",
  },
];

export default function NewMessageModal() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filteredRecipients = mockRecipients.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.handle.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelectRecipient = (recipient: RecipientOption) => {
    router.back();
    setTimeout(() => {
      if (recipient.kind === "direct") {
        router.push(routeBuilders.directThread(recipient.targetConversationId));
      } else {
        router.push(
          routeBuilders.inquiryThread(recipient.targetConversationId),
        );
      }
    }, 100);
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
          testID: "new-message-close",
        }}
      />

      <View style={styles.searchSection}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          placeholder="Search name, handle, or host…"
          testID="new-message-search-input"
        />
      </View>

      <FlatList
        data={filteredRecipients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Send message to ${item.name}`}
            onPress={() => handleSelectRecipient(item)}
            style={({ pressed }) => [
              styles.recipientRow,
              pressed && styles.pressed,
            ]}
            testID={`recipient-row-${item.id}`}
          >
            <AppImage
              source={getImageSource(item.avatarKey)}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <AppText variant="subheading" style={styles.nameText}>
                  {item.name}
                </AppText>
                <AppText variant="caption" color={theme.colors.textMuted}>
                  {item.handle}
                </AppText>
              </View>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {item.subtitle}
              </AppText>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.canvas,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.canvas,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
    gap: theme.spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: 2,
  },
  nameText: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});
