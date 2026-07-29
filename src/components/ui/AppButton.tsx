import React from "react";
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { AppText } from "./AppText";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: SemanticIconName;
  rightIcon?: SemanticIconName;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
  style,
}) => {
  const isInteractive = !disabled && !loading;

  const height =
    size === "sm"
      ? theme.layout.controlHeightSm
      : size === "lg"
        ? theme.layout.controlHeightLg
        : theme.layout.controlHeightMd;

  const minTouchTarget = Math.max(height, theme.layout.minTouchTarget);

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        {
          height: minTouchTarget,
          paddingHorizontal:
            size === "sm" ? theme.spacing.md : theme.spacing.xl,
          borderRadius: theme.radii.full,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        getVariantStyle(variant, pressed, disabled),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor(variant)} size="small" />
      ) : (
        <>
          {leftIcon ? (
            <Icon
              name={leftIcon}
              size={size === "sm" ? "xs" : "sm"}
              color={getTextColor(variant, disabled)}
              style={styles.leftIcon}
            />
          ) : null}
          <AppText
            variant="button"
            color={getTextColor(variant, disabled)}
            align="center"
          >
            {label}
          </AppText>
          {rightIcon ? (
            <Icon
              name={rightIcon}
              size={size === "sm" ? "xs" : "sm"}
              color={getTextColor(variant, disabled)}
              style={styles.rightIcon}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
};

function getVariantStyle(
  variant: ButtonVariant,
  pressed: boolean,
  disabled: boolean,
): ViewStyle {
  if (disabled) {
    return {
      backgroundColor: theme.colors.interactiveDisabled,
      borderWidth: 0,
    };
  }

  switch (variant) {
    case "primary":
      return {
        backgroundColor: pressed
          ? theme.colors.accentPressed
          : theme.colors.accentSolid,
      };
    case "secondary":
      return {
        backgroundColor: pressed
          ? theme.colors.surfaceElevated
          : theme.colors.surfacePrimary,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      };
    case "ghost":
      return {
        backgroundColor: pressed
          ? theme.colors.interactivePressed
          : "transparent",
      };
    case "danger":
      return {
        backgroundColor: pressed ? "#DC2626" : theme.colors.statusDanger,
      };
  }
}

function getTextColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) return theme.colors.textMuted;
  if (variant === "primary" || variant === "danger")
    return theme.colors.textInverse;
  return theme.colors.textPrimary;
}

function getSpinnerColor(variant: ButtonVariant): string {
  if (variant === "primary" || variant === "danger")
    return theme.colors.textInverse;
  return theme.colors.textPrimary;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
});
