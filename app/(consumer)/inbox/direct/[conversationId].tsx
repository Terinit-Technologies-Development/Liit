import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppImage } from "../../../../src/components/ui/AppImage";
import { getImageSource } from "../../../../src/assets/image-registry";
import { IconButton } from "../../../../src/components/ui/IconButton";
import { MessageBubble } from "../../../../src/components/social/MessageBubble";
import { MessageComposer } from "../../../../src/components/social/MessageComposer";
import { TypingIndicator } from "../../../../src/components/social/TypingIndicator";
import { SecondaryButton } from "../../../../src/components/ui/SecondaryButton";
import { ErrorState } from "../../../../src/components/ui/ErrorState";
import {
  useConversationDetailQuery,
  useMessagesQuery,
  useSendMessageMutation,
} from "../../../../src/hooks/social/useSocialQueries";
import { mockSocialRepository } from "../../../../src/repositories/mock/MockSocialRepository";
import { useToast } from "../../../../src/hooks/useToast";
import { routeBuilders } from "../../../../src/navigation/routes";
import { VISIBLE_CONSUMER_TAB_BAR_STYLE } from "../../_layout";
import { DirectConversation } from "../../../../src/domain/social";
import { theme } from "../../../../src/design-system/theme";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function DirectThreadScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const conversationId = normaliseId(params.conversationId);

  const [isTyping, setIsTyping] = useState(false);

  const conversationQuery = useConversationDetailQuery(conversationId);
  const messagesQuery = useMessagesQuery(conversationId);
  const sendMessageMutation = useSendMessageMutation();

  const conversation = conversationQuery.data as DirectConversation | null;
  const messages = messagesQuery.data ?? [];

  // Hide tab bar while in thread and restore on blur/unmount
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => {
        parent?.setOptions({ tabBarStyle: VISIBLE_CONSUMER_TAB_BAR_STYLE });
      };
    }, [navigation]),
  );

  // Mark conversation read on view
  useEffect(() => {
    if (conversationId && conversation && conversation.unreadCount > 0) {
      mockSocialRepository.markConversationRead(conversationId);
    }
  }, [conversationId, conversation]);

  // Simulate typing indicator for Alex
  useEffect(() => {
    if (conversationId === "conv-direct-alex") {
      const timer = setTimeout(() => setIsTyping(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [conversationId]);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="direct-thread-loading"
      >
        <View style={styles.loadingContainer}>
          <AppText variant="body" color={theme.colors.textMuted}>
            Loading conversation…
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!conversation || conversation.kind !== "direct") {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="direct-thread-error"
      >
        <ErrorState
          title="Conversation not found"
          description="This conversation does not exist or has been removed."
          onAction={() => router.back()}
          actionLabel="Return to Inbox"
        />
      </Screen>
    );
  }

  const handleSend = (text: string) => {
    if (conversationId) {
      setIsTyping(false);
      sendMessageMutation.mutate({ conversationId, content: text });
    }
  };

  const handleUnblock = async () => {
    if (conversation) {
      await mockSocialRepository.unblockUser(conversation.participantId);
      conversationQuery.refetch();
      showToast(
        "User unblocked",
        `You can now message ${conversation.participantName}.`,
        "info",
      );
    }
  };

  const isBlocked = conversation.isBlocked;

  return (
    <Screen
      safeAreaEdges={["top"]}
      gutter={false}
      testID="direct-thread-screen"
    >
      {/* Contextual Thread Header */}
      <View style={styles.header} testID="direct-thread-header">
        <IconButton
          icon="back"
          accessibilityLabel="Back to inbox"
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
          testID="direct-thread-back"
        />

        <View style={styles.headerInfo}>
          <AppImage
            source={getImageSource(conversation.participantAvatarUrl)}
            style={styles.headerAvatar}
            contentFit="cover"
          />
          <View>
            <AppText
              variant="subheading"
              style={styles.headerName}
              numberOfLines={1}
            >
              {conversation.participantName}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {conversation.isOnline
                ? "Active now"
                : (conversation.lastSeenText ?? "Offline")}
            </AppText>
          </View>
        </View>

        <View style={styles.headerActions}>
          <IconButton
            icon="search"
            accessibilityLabel="Audio call prototype"
            onPress={() =>
              showToast(
                "Voice Call",
                "Audio calls will be available in a later update.",
                "info",
              )
            }
            variant="ghost"
            size="sm"
            testID="direct-thread-call"
          />
          <IconButton
            icon="settings"
            accessibilityLabel="Conversation actions"
            onPress={() =>
              router.push(
                routeBuilders.conversationActionsModal(conversation.id),
              )
            }
            variant="ghost"
            size="sm"
            testID="direct-thread-actions"
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardFlex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onRetry={() => handleSend(item.content)}
              testID={`direct-message-${item.id}`}
            />
          )}
          ListFooterComponent={
            isTyping ? (
              <TypingIndicator
                name={conversation.participantName}
                testID="direct-typing-indicator"
              />
            ) : null
          }
          contentContainerStyle={styles.messagesList}
        />

        {isBlocked ? (
          <View style={styles.blockedBanner} testID="direct-blocked-banner">
            <AppText
              variant="body"
              color={theme.colors.textMuted}
              style={styles.blockedText}
            >
              You have blocked {conversation.participantName}.
            </AppText>
            <SecondaryButton
              label="Unblock User"
              onPress={handleUnblock}
              testID="direct-unblock-button"
            />
          </View>
        ) : (
          <MessageComposer
            onSend={handleSend}
            onAttachmentPress={() =>
              showToast(
                "Attachments",
                "Photo attachment will open in prototype release.",
                "info",
              )
            }
            onEmojiPress={() =>
              showToast("Reactions", "Quick reaction picker prototype.", "info")
            }
            disabled={sendMessageMutation.isPending}
            testID="direct-message-composer"
          />
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
    gap: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
  },
  headerName: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  keyboardFlex: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
  },
  blockedBanner: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    gap: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
  },
  blockedText: {
    fontSize: 13,
  },
});
