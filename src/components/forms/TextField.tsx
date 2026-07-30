import React, { useState } from "react";
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { AppText } from "../ui/AppText";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { IconButton } from "../ui/IconButton";
import { theme } from "../../design-system/theme";

export interface TextFieldProps extends RNTextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: SemanticIconName;
  rightIcon?: SemanticIconName;
  rightAction?: {
    icon: SemanticIconName;
    accessibilityLabel: string;
    onPress(): void;
  };
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  rightAction,
  disabled = false,
  containerStyle,
  style,
  onFocus,
  onBlur,
  accessibilityLabel,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = !!error;

  const borderColor = hasError
    ? theme.colors.statusDanger
    : isFocused
      ? theme.colors.borderFocus
      : theme.colors.borderSubtle;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText
          variant="label"
          color={theme.colors.textSecondary}
          style={styles.label}
        >
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: disabled
              ? theme.colors.interactiveDisabled
              : theme.colors.surfacePrimary,
          },
        ]}
      >
        {leftIcon ? (
          <Icon
            name={leftIcon}
            size="sm"
            color={
              hasError ? theme.colors.statusDanger : theme.colors.textSecondary
            }
            style={styles.leftIcon}
          />
        ) : null}

        <RNTextInput
          style={[
            styles.input,
            {
              color: disabled
                ? theme.colors.textMuted
                : theme.colors.textPrimary,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel || label}
          {...props}
        />

        {rightAction ? (
          <IconButton
            icon={rightAction.icon}
            accessibilityLabel={rightAction.accessibilityLabel}
            onPress={rightAction.onPress}
            variant="ghost"
            size="sm"
          />
        ) : rightIcon ? (
          <Icon
            name={rightIcon}
            size="sm"
            color={theme.colors.textSecondary}
            style={styles.rightIcon}
          />
        ) : null}
      </View>

      {hasError ? (
        <AppText
          variant="caption"
          color={theme.colors.statusDanger}
          style={styles.error}
        >
          {error}
        </AppText>
      ) : hint ? (
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.hint}
        >
          {hint}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  label: {
    marginBottom: theme.spacing.xxs,
  },
  inputWrapper: {
    height: theme.layout.controlHeightMd,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    paddingVertical: 0,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  error: {
    marginTop: theme.spacing.xxs,
  },
  hint: {
    marginTop: theme.spacing.xxs,
  },
});
