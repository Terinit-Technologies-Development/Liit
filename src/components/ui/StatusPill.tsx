import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { theme } from "../../design-system/theme";

export type StatusPillType =
  "live" | "verified" | "draft" | "completed" | "warning" | "success";

export interface StatusPillProps {
  label: string;
  type?: StatusPillType;
  style?: ViewStyle;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  type = "live",
  style,
}) => {
  const getColors = () => {
    switch (type) {
      case "live":
        return {
          bg: "rgba(255, 77, 125, 0.15)",
          fg: theme.colors.pink500,
          border: theme.colors.pink500,
        };
      case "verified":
        return {
          bg: "rgba(149, 145, 255, 0.15)",
          fg: theme.colors.accentStart,
          border: theme.colors.accentStart,
        };
      case "success":
      case "completed":
        return {
          bg: "rgba(52, 211, 153, 0.15)",
          fg: theme.colors.emerald400,
          border: theme.colors.emerald400,
        };
      case "warning":
      case "draft":
      default:
        return {
          bg: "rgba(251, 191, 36, 0.15)",
          fg: theme.colors.amber400,
          border: theme.colors.amber400,
        };
    }
  };

  const palette = getColors();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      <AppText variant="label" color={palette.fg} align="center">
        {label.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});
