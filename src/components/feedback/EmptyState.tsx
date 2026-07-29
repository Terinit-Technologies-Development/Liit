import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: SemanticIconName;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = "sparkles",
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size="lg" color={theme.colors.accentStart} />
      </View>
      <AppText variant="heading" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="body"
        color={theme.colors.textSecondary}
        align="center"
        style={styles.description}
      >
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    marginBottom: theme.spacing.lg,
    maxWidth: 280,
  },
  button: {
    marginTop: theme.spacing.xs,
  },
});
