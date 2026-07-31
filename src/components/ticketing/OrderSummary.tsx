import React from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "../ui/Card";
import { AppText } from "../ui/AppText";
import { CheckoutQuote } from "../../domain/ticketing";
import { PROTOTYPE_SERVICE_FEE_LABEL } from "../../domain/ticketing/fee-policy";
import { formatCurrency } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface OrderSummaryProps {
  quote: CheckoutQuote;
  compact?: boolean;
}

export function OrderSummary({ quote, compact = false }: OrderSummaryProps) {
  return (
    <Card style={styles.card} accessibilityLabel="Order summary">
      <AppText variant="subheading" style={styles.title}>
        Order Summary
      </AppText>

      <View style={styles.lineRail}>
        {quote.lines.length === 0 ? (
          <AppText variant="caption" color={theme.colors.textMuted}>
            No tickets selected
          </AppText>
        ) : (
          quote.lines.map((line) => (
            <View key={line.tierId} style={styles.row}>
              <AppText variant="body" style={styles.lineLabel}>
                {line.tierName} × {line.quantity}
              </AppText>
              <AppText variant="body" style={styles.lineValue}>
                {line.lineTotalMinor === 0
                  ? "R0.00"
                  : formatCurrency(line.lineTotalMinor, quote.currency)}
              </AppText>
            </View>
          ))
        )}
      </View>

      {!compact ? (
        <View style={styles.calculationSection}>
          <View style={styles.row}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Subtotal
            </AppText>
            <AppText variant="caption">
              {formatCurrency(quote.subtotalMinor, quote.currency)}
            </AppText>
          </View>

          <View style={styles.row}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {PROTOTYPE_SERVICE_FEE_LABEL}
            </AppText>
            <AppText variant="caption">
              {formatCurrency(quote.serviceFeeMinor, quote.currency)}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.totalRow}>
        <AppText variant="subheading" style={styles.totalLabel}>
          Total
        </AppText>
        <AppText variant="heading" style={styles.totalValue}>
          {formatCurrency(quote.totalMinor, quote.currency)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfacePrimary,
  },
  title: {
    fontWeight: "700",
  },
  lineRail: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lineLabel: {
    color: theme.colors.textPrimary,
  },
  lineValue: {
    fontWeight: "600",
  },
  calculationSection: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
  },
  totalLabel: {
    fontWeight: "700",
  },
  totalValue: {
    fontWeight: "800",
    color: theme.colors.accentStart,
  },
});
