import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error loading this information.",
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]} accessibilityRole="alert">
      <View style={styles.iconCircle}>
        <Icon name="alert" size="lg" color={theme.colors.statusDanger} />
      </View>
      <AppText variant="heading" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="body"
        color={theme.colors.textSecondary}
        align="center"
        style={styles.message}
      >
        {message}
      </AppText>
      {onRetry ? (
        <AppButton
          label="Try Again"
          onPress={onRetry}
          variant="secondary"
          leftIcon="refresh"
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
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(248, 113, 113, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  message: {
    marginBottom: theme.spacing.lg,
    maxWidth: 280,
  },
  button: {
    marginTop: theme.spacing.xs,
  },
});
