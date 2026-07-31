import React from "react";
import { Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface IconButtonProps {
  icon: SemanticIconName;
  onPress: () => void;
  accessibilityLabel: string; // Required for accessibility!
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  size?: "sm" | "md" | "lg";
  variant?: "surface" | "ghost" | "gradient" | "glass";
  iconColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  accessibilityState,
  size = "md",
  variant = "surface",
  iconColor,
  disabled = false,
  style,
  testID,
}) => {
  const isInteractive = !disabled;
  const iconSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";

  const getBgColor = (pressed: boolean) => {
    if (variant === "gradient") {
      return pressed ? theme.colors.accentPressed : theme.colors.accentStart;
    }
    if (variant === "glass") {
      return pressed ? "rgba(255, 255, 255, 0.2)" : "rgba(33, 30, 42, 0.65)";
    }
    if (variant === "surface") {
      return pressed
        ? theme.colors.surfaceElevated
        : theme.colors.surfacePrimary;
    }
    return pressed ? theme.colors.interactivePressed : "transparent";
  };

  return (
    <Pressable
      testID={testID}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !isInteractive, ...accessibilityState }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: getBgColor(pressed),
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={
          iconColor ??
          (variant === "gradient" ? "#000000" : theme.colors.textPrimary)
        }
      />
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
