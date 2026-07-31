import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";
import { PayoutsOverview } from "../../domain/creator";
import { formatCurrency } from "../../utils/format";

interface PayoutSummaryCardProps {
  overview: PayoutsOverview;
}

export function PayoutSummaryCard({ overview }: PayoutSummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <AppText variant="label" color="textMuted">
          Available for Payout
        </AppText>
        <AppText variant="title" color="success">
          {formatCurrency(overview.availableMinor, overview.currency)}
        </AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.subSection}>
          <AppText variant="label" color="textMuted">
            Pending Clearing
          </AppText>
          <AppText variant="heading" color="textPrimary">
            {formatCurrency(overview.pendingMinor, overview.currency)}
          </AppText>
        </View>

        <View style={styles.subSection}>
          <AppText variant="label" color="textMuted">
            Total Earned
          </AppText>
          <AppText variant="heading" color="textPrimary">
            {formatCurrency(overview.earnedMinor, overview.currency)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subSection: {
    flex: 1,
  },
});
