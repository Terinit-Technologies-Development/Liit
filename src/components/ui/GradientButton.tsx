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

export interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: SemanticIconName;
  rightIcon?: SemanticIconName;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
  testID,
  style,
}) => {
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      testID={testID}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.gradientBase,
        {
          opacity: disabled ? 0.4 : pressed ? 0.88 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.textInverse} size="small" />
      ) : (
        <>
          {leftIcon ? (
            <Icon
              name={leftIcon}
              size="sm"
              color={theme.colors.textInverse}
              style={styles.leftIcon}
            />
          ) : null}
          <AppText
            variant="button"
            color={theme.colors.textInverse}
            align="center"
          >
            {label}
          </AppText>
          {rightIcon ? (
            <Icon
              name={rightIcon}
              size="sm"
              color={theme.colors.textInverse}
              style={styles.rightIcon}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gradientBase: {
    height: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.accentStart,
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
