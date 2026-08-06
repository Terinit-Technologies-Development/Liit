import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { theme } from "../../src/design-system/theme";
import { ROUTES } from "../../src/navigation/routes";
import {
  usePayoutsOverview,
  usePayoutHistory,
} from "../../src/hooks/creator/useCreatorQueries";
import { PayoutSummaryCard } from "../../src/components/creator/PayoutSummaryCard";
import { formatCurrency } from "../../src/utils/format";
import { EmptyState } from "../../src/components/feedback/EmptyState";

export default function CreatorPayouts() {
  const router = useRouter();
  const { data: overview } = usePayoutsOverview();
  const { data: history } = usePayoutHistory();

  return (
    <Screen style={styles.container} testID="creator-payouts-screen">
      <AppHeader title="Creator Payouts" />
      <ScrollView contentContainerStyle={styles.content}>
        {overview && <PayoutSummaryCard overview={overview} />}

        <View style={styles.spacerLg} />

        <AppText
          variant="heading"
          color="textPrimary"
          style={styles.sectionTitle}
        >
          Payout History
        </AppText>

        {history && history.length > 0 ? (
          history.map((payout) => (
            <View key={payout.payoutId} style={styles.historyRow}>
              <View>
                <AppText variant="label" color="textPrimary">
                  {formatCurrency(payout.amountMinor, payout.currency)}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {new Date(payout.scheduledDate).toLocaleDateString()} • Bank
                  (•••• {payout.bankAccountLast4 || "4092"})
                </AppText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  payout.status === "paid"
                    ? styles.badgePaid
                    : payout.status === "processing"
                      ? styles.badgeProcessing
                      : styles.badgePending,
                ]}
              >
                <AppText variant="caption" style={styles.badgeText}>
                  {payout.status.toUpperCase()}
                </AppText>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title="No Payout History"
            description="Your past payout transfers will appear here."
            icon="card"
          />
        )}

        <View style={styles.spacerLg} />

        <AppButton
          label="Request Payout"
          variant="primary"
          onPress={() => router.push(ROUTES.modals.requestPayout as any)}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  spacerLg: { height: theme.spacing.xxl },
  sectionTitle: { marginBottom: theme.spacing.md },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgePaid: { backgroundColor: "rgba(0, 200, 120, 0.15)" },
  badgeProcessing: { backgroundColor: "rgba(193, 128, 255, 0.15)" },
  badgePending: { backgroundColor: "rgba(255, 170, 0, 0.15)" },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
});
