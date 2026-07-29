import React from "react";
import { Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface IconButtonProps {
  icon: SemanticIconName;
  onPress: () => void;
  accessibilityLabel: string; // Required for accessibility!
  size?: "sm" | "md" | "lg";
  variant?: "surface" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  size = "md",
  variant = "surface",
  disabled = false,
  style,
}) => {
  const isInteractive = !disabled;
  const iconSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !isInteractive }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            variant === "surface"
              ? pressed
                ? theme.colors.surfaceElevated
                : theme.colors.surfacePrimary
              : pressed
                ? theme.colors.interactivePressed
                : "transparent",
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={theme.colors.textPrimary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
