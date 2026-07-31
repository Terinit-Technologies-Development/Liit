import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";
import { Icon } from "../../design-system/icons/Icon";

interface CreatorStatCardProps {
  label: string;
  value: string;
  trend?: number;
}

export function CreatorStatCard({ label, value, trend }: CreatorStatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <View style={styles.container}>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <AppText variant="title" color="textPrimary">
          {value}
        </AppText>
        {trend !== undefined && (
          <View style={styles.trendContainer}>
            {isPositive && (
              <Icon name="plus" size="xs" color={theme.colors.success} />
            )}
            {isNegative && (
              <Icon name="minus" size="xs" color={theme.colors.destructive} />
            )}
            <AppText
              variant="caption"
              color={
                isPositive
                  ? "success"
                  : isNegative
                    ? "destructive"
                    : "textMuted"
              }
            >
              {Math.abs(trend)}%
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    flex: 1,
    minWidth: "45%",
    margin: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: theme.spacing.xs,
    justifyContent: "space-between",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
