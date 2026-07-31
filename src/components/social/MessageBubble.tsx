import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { DeliveryStatus } from "./DeliveryStatus";
import { Message } from "../../domain/social";
import { formatTime } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface MessageBubbleProps {
  message: Message;
  showSenderName?: boolean;
  onRetry?(): void;
  testID?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showSenderName = false,
  onRetry,
  testID,
}) => {
  const { isIncoming, content, sentAt, status, senderName } = message;

  return (
    <View
      style={[
        styles.wrapper,
        isIncoming ? styles.wrapperIncoming : styles.wrapperOutgoing,
      ]}
      testID={testID ?? `message-bubble-${message.id}`}
    >
      {showSenderName && isIncoming ? (
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.senderName}
        >
          {senderName}
        </AppText>
      ) : null}

      <View
        style={[
          styles.bubble,
          isIncoming ? styles.bubbleIncoming : styles.bubbleOutgoing,
        ]}
      >
        <AppText
          variant="body"
          color={isIncoming ? theme.colors.textPrimary : "#FFFFFF"}
          style={styles.content}
        >
          {content}
        </AppText>
      </View>

      <View style={styles.footerRow}>
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.timeText}
        >
          {formatTime(sentAt)}
        </AppText>
        {!isIncoming ? (
          <DeliveryStatus status={status} onRetry={onRetry} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: theme.spacing.xxs,
    maxWidth: "80%",
  },
  wrapperIncoming: {
    alignSelf: "flex-start",
  },
  wrapperOutgoing: {
    alignSelf: "flex-end",
  },
  senderName: {
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
  },
  bubbleIncoming: {
    backgroundColor: theme.colors.surfacePrimary,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
  },
  bubbleOutgoing: {
    backgroundColor: theme.colors.accentStart,
    borderBottomRightRadius: 4,
  },
  content: {
    fontSize: 15,
    lineHeight: 21,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.xs,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  timeText: {
    fontSize: 10,
  },
});
