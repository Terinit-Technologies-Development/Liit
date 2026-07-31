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
import { Screen } from "../../../../src/components/ui/Screen";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppImage } from "../../../../src/components/ui/AppImage";
import { getImageSource } from "../../../../src/assets/image-registry";
import { IconButton } from "../../../../src/components/ui/IconButton";
import { EventContextCard } from "../../../../src/components/social/EventContextCard";
import { BookingLinkCard } from "../../../../src/components/social/BookingLinkCard";
import { MessageBubble } from "../../../../src/components/social/MessageBubble";
import { MessageComposer } from "../../../../src/components/social/MessageComposer";
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
import { HostInquiryConversation } from "../../../../src/domain/social";
import { theme } from "../../../../src/design-system/theme";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function InquiryThreadScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const conversationId = normaliseId(params.conversationId);

  const conversationQuery = useConversationDetailQuery(conversationId);
  const messagesQuery = useMessagesQuery(conversationId);
  const sendMessageMutation = useSendMessageMutation();

  const conversation = conversationQuery.data as HostInquiryConversation | null;
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

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="inquiry-thread-loading"
      >
        <View style={styles.loadingContainer}>
          <AppText variant="body" color={theme.colors.textMuted}>
            Loading inquiry…
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!conversation || conversation.kind !== "inquiry") {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="inquiry-thread-error"
      >
        <ErrorState
          title="Inquiry not found"
          description="This inquiry does not exist or has been removed."
          onAction={() => router.back()}
          actionLabel="Return to Inbox"
        />
      </Screen>
    );
  }

  const handleSend = (text: string) => {
    if (conversationId) {
      sendMessageMutation.mutate({ conversationId, content: text });
    }
  };

  const handleBookingOfferSelect = () => {
    if (conversation.eventContext.bookingOffer) {
      router.push(
        routeBuilders.checkoutTickets(
          conversation.eventContext.eventId,
          conversation.eventContext.bookingOffer.tierId,
        ),
      );
    }
  };

  const bookingOffer = conversation.eventContext.bookingOffer;

  return (
    <Screen
      safeAreaEdges={["top"]}
      gutter={false}
      testID="inquiry-thread-screen"
    >
      {/* Contextual Host Inquiry Header */}
      <View style={styles.header} testID="inquiry-thread-header">
        <IconButton
          icon="back"
          accessibilityLabel="Back to inbox"
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
          testID="inquiry-thread-back"
        />

        <View style={styles.headerInfo}>
          <AppImage
            source={getImageSource(conversation.hostAvatarUrl)}
            style={styles.headerAvatar}
            contentFit="cover"
          />
          <View style={styles.headerTextCol}>
            <View style={styles.hostNameRow}>
              <AppText
                variant="subheading"
                style={styles.headerName}
                numberOfLines={1}
              >
                {conversation.hostName}
              </AppText>
              {conversation.isVerified ? (
                <View style={styles.verifiedBadge}>
                  <AppText variant="caption" style={styles.verifiedText}>
                    ✓ Verified Host
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {conversation.typicalReplyTime}
            </AppText>
          </View>
        </View>

        <IconButton
          icon="settings"
          accessibilityLabel="Inquiry options"
          onPress={() =>
            router.push(routeBuilders.conversationActionsModal(conversation.id))
          }
          variant="ghost"
          size="sm"
          testID="inquiry-thread-actions"
        />
      </View>

      {/* Sticky Event Context Header Card */}
      <EventContextCard
        context={conversation.eventContext}
        onPressEvent={() =>
          router.push(
            routeBuilders.eventDetail(conversation.eventContext.eventId),
          )
        }
        testID="inquiry-event-context-card"
      />

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
              testID={`inquiry-message-${item.id}`}
            />
          )}
          ListFooterComponent={
            bookingOffer ? (
              <BookingLinkCard
                offer={bookingOffer}
                onSelectOffer={handleBookingOfferSelect}
                testID="inquiry-booking-link-card"
              />
            ) : null
          }
          contentContainerStyle={styles.messagesList}
        />

        <MessageComposer
          onSend={handleSend}
          onAttachmentPress={() =>
            showToast("Attachment", "File attachment prototype.", "info")
          }
          disabled={sendMessageMutation.isPending}
          placeholder="Ask host a question…"
          testID="inquiry-message-composer"
        />
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
  headerTextCol: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerName: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontSize: 15,
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
  keyboardFlex: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
  },
});
