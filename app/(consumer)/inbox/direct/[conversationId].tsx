import React, { useCallback, useEffect } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { Skeleton } from "../../../../src/components/feedback/Skeleton";
import { EmptyState } from "../../../../src/components/feedback/EmptyState";
import {
  useConversationDetailQuery,
  useMarkReadMutation,
  useMessagesQuery,
  useRetryMessageMutation,
  useSendMessageMutation,
  useUnblockUserMutation,
} from "../../../../src/hooks/social/useSocialQueries";
import { useSocialStore } from "../../../../src/state/useSocialStore";
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
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const conversationId = normaliseId(params.conversationId);

  const conversationQuery = useConversationDetailQuery(conversationId);
  const messagesQuery = useMessagesQuery(conversationId);
  const sendMessageMutation = useSendMessageMutation();
  const retryMessageMutation = useRetryMessageMutation();
  const markReadMutation = useMarkReadMutation();
  const unblockUserMutation = useUnblockUserMutation();

  const conversation = conversationQuery.data as DirectConversation | null;
  const messages = messagesQuery.data ?? [];

  const draft = useSocialStore((state) =>
    conversationId ? (state.drafts[conversationId] ?? "") : "",
  );
  const setDraft = useSocialStore((state) => state.setDraft);
  const clearDraft = useSocialStore((state) => state.clearDraft);
  const isTypingMap = useSocialStore((state) => state.isTypingMap);

  const setTyping = useSocialStore((state) => state.setTyping);

  const isTyping = Boolean(conversationId && isTypingMap[conversationId]);

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

  // Deterministic typing indicator for Alex Khumalo walkthrough
  useEffect(() => {
    if (!conversationId || conversationId !== "conv-direct-alex") return;

    const showTimer = setTimeout(() => {
      setTyping(conversationId, true);
    }, 1200);

    const hideTimer = setTimeout(() => {
      setTyping(conversationId, false);
    }, 4200);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      setTyping(conversationId, false);
    };
  }, [conversationId, setTyping]);

  // Mark conversation read on view
  const unreadCount = conversation?.unreadCount ?? 0;
  const markReadMutate = markReadMutation.mutate;

  useEffect(() => {
    if (conversationId && unreadCount > 0) {
      markReadMutate(conversationId);
    }
  }, [conversationId, unreadCount, markReadMutate]);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="direct-thread-loading"
      >
        <View style={styles.skeletonHeader}>
          <Skeleton width={120} height={20} />
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton width="70%" height={48} style={{ marginBottom: 12 }} />
          <Skeleton width="50%" height={48} style={{ alignSelf: "flex-end" }} />
        </View>
      </Screen>
    );
  }

  if (conversationQuery.isError || messagesQuery.isError) {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="direct-thread-query-error"
      >
        <ErrorState
          title="Could not load messages"
          description="A network or repository error occurred."
          onAction={() => {
            conversationQuery.refetch();
            messagesQuery.refetch();
          }}
          actionLabel="Retry"
        />
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
      sendMessageMutation.mutate(
        { conversationId, content: text },
        {
          onSuccess: () => {
            clearDraft(conversationId);
          },
          onError: () => {
            showToast("Send Failed", "Could not send message.", "error");
          },
        },
      );
    }
  };

  const handleUnblock = () => {
    if (conversation) {
      unblockUserMutation.mutate(conversation.participantId, {
        onSuccess: () => {
          showToast(
            "User Unblocked",
            `You can now message ${conversation.participantName}.`,
            "info",
          );
        },
      });
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
            icon="phone"
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
            testID="direct-thread-voice-call"
          />
          <IconButton
            icon="video"
            accessibilityLabel="Video call prototype"
            onPress={() =>
              showToast(
                "Video Call",
                "Video calls will be available in a later update.",
                "info",
              )
            }
            variant="ghost"
            size="sm"
            testID="direct-thread-video-call"
          />
          <IconButton
            icon="more"
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
          renderItem={({ item, index }) => (
            <MessageBubble
              message={item}
              dateHeader={index === 0 ? "Today" : undefined}
              onRetry={() =>
                retryMessageMutation.mutate({
                  conversationId: conversation.id,
                  messageId: item.id,
                })
              }
              testID={`direct-message-${item.id}`}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No messages yet"
              description="Send a message to start the conversation!"
            />
          }
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
          <View
            style={{
              paddingBottom: Math.max(insets.bottom, theme.spacing.xs),
            }}
          >
            <MessageComposer
              value={draft}
              onChangeText={(text) => {
                if (conversationId) setDraft(conversationId, text);
              }}
              onSend={handleSend}
              onAttachmentPress={() =>
                showToast(
                  "Attachments",
                  "Photo attachment will open in prototype release.",
                  "info",
                )
              }
              onEmojiPress={() =>
                showToast(
                  "Reactions",
                  "Quick reaction picker prototype.",
                  "info",
                )
              }
              disabled={sendMessageMutation.isPending}
              testID="direct-message-composer"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    padding: theme.spacing.gutter,
    justifyContent: "center",
  },
  skeletonHeader: {
    padding: theme.spacing.gutter,
    backgroundColor: theme.colors.surfacePrimary,
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
