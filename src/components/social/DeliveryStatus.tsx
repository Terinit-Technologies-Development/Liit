import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { Icon } from "../../design-system/icons/Icon";
import { MessageStatus } from "../../domain/social";
import { theme } from "../../design-system/theme";

export interface DeliveryStatusProps {
  status: MessageStatus;
  onRetry?(): void;
  testID?: string;
}

export const DeliveryStatus: React.FC<DeliveryStatusProps> = ({
  status,
  onRetry,
  testID = "delivery-status",
}) => {
  switch (status) {
    case "sent":
      return (
        <View style={styles.container} testID={testID}>
          <Icon name="checkmark" size={12} color={theme.colors.textMuted} />
          <AppText variant="caption" color={theme.colors.textMuted}>
            Sent
          </AppText>
        </View>
      );
    case "delivered":
      return (
        <View style={styles.container} testID={testID}>
          <Icon name="checkmark" size={12} color={theme.colors.accentStart} />
          <AppText variant="caption" color={theme.colors.textMuted}>
            Delivered
          </AppText>
        </View>
      );
    case "read":
      return (
        <View style={styles.container} testID={testID}>
          <Icon name="checkmark" size={12} color={theme.colors.emerald400} />
          <AppText variant="caption" color={theme.colors.emerald400}>
            Read
          </AppText>
        </View>
      );
    case "failed":
      return (
        <View style={styles.container} testID={testID}>
          <Icon
            name="alertCircle"
            size={12}
            color={theme.colors.statusDanger}
          />
          <AppText variant="caption" color={theme.colors.statusDanger}>
            Failed
          </AppText>
          {onRetry ? (
            <AppText
              variant="caption"
              color={theme.colors.accentStart}
              style={styles.retryText}
              onPress={onRetry}
              testID="delivery-status-retry"
            >
              Retry
            </AppText>
          ) : null}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  retryText: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
