import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { Icon, SemanticIconName } from "../../src/design-system/icons/Icon";
import {
  useBlockUserMutation,
  useCloseInquiryMutation,
  useConversationDetailQuery,
  useUnblockUserMutation,
} from "../../src/hooks/social/useSocialQueries";
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
  const blockMutation = useBlockUserMutation();
  const unblockMutation = useUnblockUserMutation();
  const closeInquiryMutation = useCloseInquiryMutation();

  const conversation = conversationQuery.data;

  if (!conversationId || !conversation) {
    return (
      <Screen safeAreaEdges={["top"]} gutter={false}>
        <AppHeader
          title="Conversation Actions"
          showBack={false}
          rightAction={{
            icon: "close",
            accessibilityLabel: "Close",
            onPress: () => router.back(),
          }}
        />
        <View style={styles.content}>
          <AppText variant="body" color={theme.colors.textMuted}>
            Conversation details unavailable.
          </AppText>
        </View>
      </Screen>
    );
  }

  const isBlocked = conversation.isBlocked;
  const isDirect = conversation.kind === "direct";
  const targetId = isDirect ? conversation.participantId : conversation.hostId;
  const targetName = isDirect
    ? conversation.participantName
    : conversation.hostName;

  const handleMute = () => {
    router.back();
    showToast("Muted", `Notifications muted for ${targetName}.`, "info");
  };

  const handleToggleBlock = () => {
    router.back();
    if (isBlocked) {
      unblockMutation.mutate(targetId, {
        onSuccess: () => {
          showToast("Unblocked", `${targetName} has been unblocked.`, "info");
        },
      });
    } else {
      blockMutation.mutate(targetId, {
        onSuccess: () => {
          showToast("Blocked", `${targetName} has been blocked.`, "info");
        },
      });
    }
  };

  const handleCloseInquiry = () => {
    router.back();
    closeInquiryMutation.mutate(conversation.id, {
      onSuccess: () => {
        showToast(
          "Inquiry Closed",
          "This host inquiry has been closed.",
          "info",
        );
      },
    });
  };

  const handleReport = () => {
    router.dismiss();
    router.push(
      routeBuilders.reportContentModal({
        targetKind: isDirect ? "user" : "host",
        targetId,
      }),
    );
  };

  return (
    <Screen
      safeAreaEdges={["top"]}
      gutter={false}
      testID="conversation-actions-modal"
    >
      <AppHeader
        title="Options"
        showBack={false}
        rightAction={{
          icon: "close",
          accessibilityLabel: "Close options",
          onPress: () => router.back(),
          testID: "conversation-actions-close",
        }}
      />

      <View style={styles.content}>
        <ActionButton
          icon="bell"
          label="Mute Notifications"
          description="Silence alerts for this conversation"
          onPress={handleMute}
          testID="action-mute-button"
        />

        {!isDirect && !conversation.isClosed ? (
          <ActionButton
            icon="close"
            label="Close Inquiry"
            description="Archive and mark this inquiry as closed"
            onPress={handleCloseInquiry}
            testID="action-close-inquiry-button"
          />
        ) : null}

        <ActionButton
          icon="slash"
          label={isBlocked ? "Unblock User" : "Block User"}
          description={
            isBlocked
              ? "Allow messages and inquiries"
              : "Prevent this user from messaging you"
          }
          danger={!isBlocked}
          onPress={handleToggleBlock}
          testID="action-block-button"
        />

        <ActionButton
          icon="alertCircle"
          label="Report Conversation"
          description="Flag inappropriate messages to moderation"
          danger
          onPress={handleReport}
          testID="action-report-button"
        />
      </View>
    </Screen>
  );
}

function ActionButton({
  icon,
  label,
  description,
  danger = false,
  onPress,
  testID,
}: {
  icon: SemanticIconName;
  label: string;
  description: string;
  danger?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
      onPress={onPress}
      testID={testID}
    >
      <Icon
        name={icon}
        size={24}
        color={danger ? theme.colors.statusDanger : theme.colors.textPrimary}
      />
      <View style={styles.actionTextCol}>
        <AppText
          variant="subheading"
          color={danger ? theme.colors.statusDanger : theme.colors.textPrimary}
          style={styles.actionLabel}
        >
          {label}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted}>
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  actionTextCol: {
    flex: 1,
  },
  actionLabel: {
    fontWeight: "700",
  },
});
