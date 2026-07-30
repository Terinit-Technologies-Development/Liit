import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { theme } from "../../design-system/theme";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionTestID,
  style,
}) => {
  return (
    <View style={[styles.headerRow, style]}>
      <View style={styles.titleColumn}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={theme.colors.textMuted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          testID={actionTestID}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
        >
          <AppText variant="label" color={theme.colors.accentStart}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  titleColumn: {
    gap: 2,
    flex: 1,
  },
});
