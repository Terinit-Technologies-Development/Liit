import React from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "../ui/Card";
import { AppText } from "../ui/AppText";
import { StatusPill } from "../ui/StatusPill";
import { TicketTier } from "../../domain/event-detail";
import { QuantityStepper } from "./QuantityStepper";
import { formatCurrency } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface TicketTierSelectorProps {
  tier: TicketTier;
  quantity: number;
  onChangeQuantity(quantity: number): void;
}

export function TicketTierSelector({
  tier,
  quantity,
  onChangeQuantity,
}: TicketTierSelectorProps) {
  const isSoldOut = tier.state === "sold_out";

  return (
    <Card
      style={[styles.card, isSoldOut && styles.soldOutCard]}
      testID={`ticket-tier-${tier.id}`}
      accessibilityLabel={`${tier.name} tier, ${
        isSoldOut ? "sold out" : formatCurrency(tier.priceMinor, tier.currency)
      }`}
    >
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <View style={styles.nameRow}>
            <AppText variant="subheading" style={styles.nameText}>
              {tier.name}
            </AppText>
            {tier.premiumLabel ? (
              <StatusPill label={tier.premiumLabel} type="warning" />
            ) : null}
          </View>

          {tier.description ? (
            <AppText variant="caption" color={theme.colors.textMuted}>
              {tier.description}
            </AppText>
          ) : null}
        </View>

        {isSoldOut ? (
          <StatusPill label="Sold Out" type="sold_out" />
        ) : (
          <AppText variant="subheading" style={styles.priceText}>
            {tier.priceMinor === 0
              ? "Free"
              : formatCurrency(tier.priceMinor, tier.currency)}
          </AppText>
        )}
      </View>

      <View style={styles.footer}>
        {isSoldOut ? (
          <AppText variant="caption" color={theme.colors.textMuted}>
            This tier has no remaining tickets available.
          </AppText>
        ) : (
          <>
            {tier.remaining !== null ? (
              <AppText variant="caption" color={theme.colors.textMuted}>
                {tier.remaining} remaining
              </AppText>
            ) : (
              <View />
            )}

            <QuantityStepper
              label={tier.name}
              value={quantity}
              minimum={0}
              maximum={Math.min(
                tier.maxPerOrder,
                tier.remaining ?? tier.maxPerOrder,
              )}
              disabled={isSoldOut}
              onChange={onChangeQuantity}
              testIDPrefix={`ticket-tier-${tier.id}`}
            />
          </>
        )}
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
  soldOutCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  titleCol: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  nameText: {
    fontWeight: "700",
  },
  priceText: {
    fontWeight: "700",
    color: theme.colors.accentStart,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
  },
});
