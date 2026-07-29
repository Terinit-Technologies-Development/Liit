import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface OfflineBannerProps {
  message?: string;
  style?: ViewStyle;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = "You are currently offline. Showing cached prototype data.",
  style,
}) => {
  return (
    <View style={[styles.banner, style]} accessibilityRole="alert">
      <Icon name="alert" size="sm" color={theme.colors.textInverse} />
      <AppText
        variant="caption"
        color={theme.colors.textInverse}
        style={styles.text}
      >
        {message}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.statusWarning,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  text: {
    fontWeight: "600",
  },
});
