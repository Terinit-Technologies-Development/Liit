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
  dateHeader?: string;
  onRetry?(): void;
  testID?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showSenderName = false,
  dateHeader,
  onRetry,
  testID,
}) => {
  const { isIncoming, content, sentAt, status, senderName } = message;

  return (
    <>
      {dateHeader ? (
        <View
          style={styles.dateSeparatorContainer}
          testID={`date-separator-${dateHeader.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            style={styles.dateSeparatorText}
          >
            {dateHeader}
          </AppText>
        </View>
      ) : null}

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
    </>
  );
};

const styles = StyleSheet.create({
  dateSeparatorContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.md,
  },
  dateSeparatorText: {
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
  },
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
