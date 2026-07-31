import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { Icon } from "../../src/design-system/icons/Icon";
import { useConversationDetailQuery } from "../../src/hooks/social/useSocialQueries";
import { mockSocialRepository } from "../../src/repositories/mock/MockSocialRepository";
import { useToast } from "../../src/hooks/useToast";
import { routeBuilders } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function ConversationActionsModal() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const conversationId = normaliseId(params.conversationId);

  const conversationQuery = useConversationDetailQuery(conversationId);
  const conversation = conversationQuery.data;

  const handleMute = () => {
    showToast(
      "Notifications Muted",
      "Notifications for this conversation have been muted.",
      "info",
    );
    router.back();
  };

  const handleBlock = async () => {
    if (conversation) {
      const targetId =
        conversation.kind === "direct"
          ? conversation.participantId
          : conversation.hostId;
      await mockSocialRepository.blockUser(targetId);
      showToast(
        "User Blocked",
        "You will no longer receive messages from this user.",
        "info",
      );
      router.back();
    }
  };

  const handleReport = () => {
    router.back();
    setTimeout(() => {
      if (conversation) {
        const targetId =
          conversation.kind === "direct"
            ? conversation.participantId
            : conversation.hostId;
        router.push(
          routeBuilders.reportContentModal({
            targetKind: "user",
            targetId,
          }),
        );
      }
    }, 100);
  };

  return (
    <Screen
      safeAreaEdges={["top"]}
      gutter={false}
      testID="conversation-actions-modal"
    >
      <AppHeader
        title="Conversation Actions"
        showBack={false}
        rightAction={{
          icon: "close",
          accessibilityLabel: "Close modal",
          onPress: () => router.back(),
          testID: "conversation-actions-close",
        }}
      />

      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mute notifications"
          onPress={handleMute}
          style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          testID="action-mute"
        >
          <Icon name="bell" size={20} color={theme.colors.textPrimary} />
          <AppText variant="body" style={styles.actionLabel}>
            Mute Notifications
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Report content or user"
          onPress={handleReport}
          style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          testID="action-report"
        >
          <Icon
            name="alertCircle"
            size={20}
            color={theme.colors.statusWarning}
          />
          <AppText
            variant="body"
            color={theme.colors.statusWarning}
            style={styles.actionLabel}
          >
            Report Conversation or User
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Block user"
          onPress={handleBlock}
          style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          testID="action-block"
        >
          <Icon name="slash" size={20} color={theme.colors.statusDanger} />
          <AppText
            variant="body"
            color={theme.colors.statusDanger}
            style={styles.actionLabel}
          >
            Block User
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
  },
  actionLabel: {
    fontWeight: "600",
    fontSize: 15,
  },
  pressed: {
    opacity: 0.7,
  },
});
