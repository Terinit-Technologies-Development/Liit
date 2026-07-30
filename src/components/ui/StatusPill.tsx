import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { theme } from "../../design-system/theme";

export type StatusPillType =
  | "live"
  | "verified"
  | "draft"
  | "completed"
  | "warning"
  | "success"
  | "sold_out"
  | "free"
  | "info"
  | "neutral";

export interface StatusPillProps {
  label?: string;
  type?: StatusPillType;
  status?: string;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  type = "live",
  status,
  size: _size,
  style,
}) => {
  const textLabel = label ?? status ?? "Live";

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
      case "free":
        return {
          bg: "rgba(52, 211, 153, 0.2)",
          fg: theme.colors.emerald400,
          border: theme.colors.emerald400,
        };
      case "warning":
        return {
          bg: theme.colors.amberBadgeBg,
          fg: theme.colors.amber400,
          border: theme.colors.amber400,
        };
      case "sold_out":
      case "neutral":
        return {
          bg: "rgba(181, 174, 196, 0.15)",
          fg: theme.colors.textMuted,
          border: theme.colors.borderStrong,
        };
      case "info":
      case "draft":
      default:
        return {
          bg: theme.colors.violetBadgeBg,
          fg: theme.colors.accentStart,
          border: theme.colors.accentStart,
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
      accessibilityLabel={`Status: ${textLabel}`}
    >
      <AppText variant="label" color={palette.fg} align="center">
        {textLabel.toUpperCase()}
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
