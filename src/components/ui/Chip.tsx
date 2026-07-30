import React from "react";
import { Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { AppText } from "./AppText";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface ChipProps {
  label: string;
  selected?: boolean;
  active?: boolean;
  size?: "sm" | "md";
  onPress?: () => void;
  icon?: SemanticIconName;
  style?: StyleProp<ViewStyle>;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  active = false,
  size = "md",
  onPress,
  icon,
  style,
}) => {
  const isSelected = selected || active;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        styles.chip,
        size === "sm" && styles.chipSm,
        {
          backgroundColor: isSelected
            ? theme.colors.accentSolid
            : pressed
              ? theme.colors.surfaceElevated
              : theme.colors.surfacePrimary,
          borderColor: isSelected
            ? theme.colors.accentStart
            : theme.colors.borderSubtle,
        },
        style,
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size="xs"
          color={
            isSelected ? theme.colors.textInverse : theme.colors.textSecondary
          }
          style={styles.icon}
        />
      ) : null}
      <AppText
        variant={size === "sm" ? "caption" : "label"}
        color={
          isSelected ? theme.colors.textInverse : theme.colors.textSecondary
        }
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    minHeight: 32,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  chipSm: {
    minHeight: 24,
    paddingHorizontal: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
});
