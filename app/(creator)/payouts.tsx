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
import { EventStatusPill } from "../../src/components/creator/EventStatusPill";
import { EmptyState } from "../../src/components/feedback/EmptyState";

export default function CreatorPayouts() {
  const router = useRouter();
  const { data: overview } = usePayoutsOverview();
  const { data: history } = usePayoutHistory();

  return (
    <Screen style={styles.container}>
      <AppHeader title="Payouts" />
      <ScrollView contentContainerStyle={styles.content}>
        {overview && <PayoutSummaryCard overview={overview} />}

        <View style={styles.spacerLg} />

        <AppText variant="heading" style={styles.sectionTitle}>
          Payout History
        </AppText>

        {history?.length ? (
          history.map((payout: any) => (
            <View key={payout.payoutId} style={styles.historyRow}>
              <View>
                <AppText variant="body">
                  {formatCurrency(payout.amountMinor, payout.currency)}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {new Date(payout.scheduledDate).toLocaleDateString()} • ••••{" "}
                  {payout.bankAccountLast4}
                </AppText>
              </View>
              <EventStatusPill status={payout.status as any} />
            </View>
          ))
        ) : (
          <EmptyState
            title="No payouts yet"
            description="Your payout history will appear here."
            icon="card"
          />
        )}

        <View style={styles.spacerLg} />

        <AppButton
          label="Request Payout"
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
});
