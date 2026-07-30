import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { SecondaryButton } from "./SecondaryButton";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface ErrorStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description = "Something went wrong. Please try again.",
  actionLabel = "Retry",
  onAction,
}) => {
  return (
    <View style={styles.container} testID="error-state-view">
      <Icon name="alertCircle" size={40} color={theme.colors.statusDanger} />
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText
          variant="body"
          color={theme.colors.textMuted}
          style={styles.description}
        >
          {description}
        </AppText>
      ) : null}
      {onAction ? (
        <SecondaryButton
          testID="error-state-retry-button"
          label={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
  button: {
    marginTop: theme.spacing.sm,
  },
});
