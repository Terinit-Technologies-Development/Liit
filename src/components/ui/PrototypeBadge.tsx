import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { theme } from "../../design-system/theme";

export interface PrototypeBadgeProps {
  label?: string;
  visible?: boolean;
  style?: ViewStyle;
}

export const PrototypeBadge: React.FC<PrototypeBadgeProps> = ({
  label = "PROTOTYPE SIMULATION",
  visible = true,
  style,
}) => {
  if (!visible) return null;

  return (
    <View
      style={[styles.badge, style]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <AppText
        variant="label"
        color={theme.colors.amber400}
        align="center"
        style={styles.text}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.8,
  },
});
