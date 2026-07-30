import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TicketTier } from "../../domain/event-detail";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { formatCurrency } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface TicketTierPreviewProps {
  tiers: TicketTier[];
  selectedTierId: string | null;
  onSelectTier(tierId: string): void;
}

export function TicketTierPreview({
  tiers,
  selectedTierId,
  onSelectTier,
}: TicketTierPreviewProps) {
  if (tiers.length === 0) return null;

  return (
    <View
      style={styles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel="Ticket tiers"
    >
      <AppText variant="subheading" style={styles.sectionTitle}>
        Ticket Tiers
      </AppText>

      <View style={styles.tiersList}>
        {tiers.map((tier) => {
          const selected = selectedTierId === tier.id;
          const disabled = tier.state === "sold_out";

          return (
            <Pressable
              key={tier.id}
              accessibilityRole="radio"
              accessibilityState={{
                selected,
                disabled,
              }}
              accessibilityLabel={`${tier.name}, ${formatCurrency(
                tier.priceMinor,
                tier.currency,
              )}${disabled ? ", Sold out" : ""}`}
              onPress={() => {
                if (!disabled) {
                  onSelectTier(tier.id);
                }
              }}
            >
              <Card
                radius="xl"
                padding="md"
                style={[
                  styles.tierCard,
                  selected && styles.selectedCard,
                  disabled && styles.disabledCard,
                ]}
              >
                <View style={styles.headerRow}>
                  <View style={styles.infoCol}>
                    <AppText variant="subheading" style={styles.tierName}>
                      {tier.name}
                    </AppText>
                    {tier.description ? (
                      <AppText variant="caption" color={theme.colors.textMuted}>
                        {tier.description}
                      </AppText>
                    ) : null}
                  </View>

                  <AppText variant="subheading" style={styles.tierPrice}>
                    {formatCurrency(tier.priceMinor, tier.currency)}
                  </AppText>
                </View>

                {tier.state === "selling_fast" ? (
                  <AppText variant="caption" color={theme.colors.accentStart}>
                    ⚡ Selling Fast! Only {tier.remaining} left
                  </AppText>
                ) : tier.state === "sold_out" ? (
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    ❌ Sold Out
                  </AppText>
                ) : null}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  tiersList: {
    gap: theme.spacing.sm,
  },
  tierCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    gap: theme.spacing.xs,
  },
  selectedCard: {
    borderColor: theme.colors.accentStart,
    borderWidth: 2,
    backgroundColor: theme.colors.surfaceElevated,
  },
  disabledCard: {
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  tierName: {
    fontWeight: "700",
  },
  tierPrice: {
    fontWeight: "700",
    color: theme.colors.accentStart,
  },
});
