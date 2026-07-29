import React from "react";
import { Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { AppText } from "./AppText";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  leftIcon?: SemanticIconName;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  leftIcon,
  fullWidth = false,
  accessibilityLabel,
  style,
}) => {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed
            ? theme.colors.surfaceElevated
            : theme.colors.surfacePrimary,
          opacity: disabled ? 0.4 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {leftIcon ? (
        <Icon
          name={leftIcon}
          size="sm"
          color={theme.colors.textPrimary}
          style={styles.icon}
        />
      ) : null}
      <AppText variant="button" color={theme.colors.textPrimary} align="center">
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
});
