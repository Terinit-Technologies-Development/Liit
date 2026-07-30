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
          bg: theme.colors.pinkBadgeBg,
          fg: theme.colors.pink500,
          border: theme.colors.pink500,
        };
      case "verified":
        return {
          bg: theme.colors.violetBadgeBg,
          fg: theme.colors.accentStart,
          border: theme.colors.accentStart,
        };
      case "success":
      case "completed":
        return {
          bg: theme.colors.emeraldBadgeBg,
          fg: theme.colors.emerald400,
          border: theme.colors.emerald400,
        };
      case "warning":
      case "draft":
      default:
        return {
          bg: theme.colors.amberBadgeBg,
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
