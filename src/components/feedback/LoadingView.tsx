import React from "react";
import { View, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface LoadingViewProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = "Loading...",
  style,
}) => {
  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={theme.colors.accentStart} />
      <AppText
        variant="subheading"
        color={theme.colors.textSecondary}
        style={styles.text}
      >
        {message}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  text: {
    marginTop: theme.spacing.sm,
  },
});
