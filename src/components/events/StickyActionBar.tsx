import React from "react";
import { StyleSheet, View } from "react-native";
import { EventConversionModel } from "../../domain/event-detail/conversion-model";
import { TicketTier } from "../../domain/event-detail";
import { GradientButton } from "../ui/GradientButton";
import { AppText } from "../ui/AppText";
import { formatCurrency } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface StickyActionBarProps {
  conversion: EventConversionModel;
  selectedTier?: TicketTier;
  onPrimaryAction(conversion: EventConversionModel): void;
}

export function StickyActionBar({
  conversion,
  selectedTier,
  onPrimaryAction,
}: StickyActionBarProps) {
  if (conversion.mode === "none" || !conversion.primaryLabel) {
    return (
      <View style={styles.endedContainer}>
        <AppText variant="label" color={theme.colors.textMuted}>
          {conversion.supportingLabel}
        </AppText>
      </View>
    );
  }

  const priceLabel = selectedTier
    ? formatCurrency(selectedTier.priceMinor, selectedTier.currency)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.textCol}>
        {priceLabel ? (
          <AppText variant="subheading" style={styles.price}>
            {priceLabel}
          </AppText>
        ) : null}
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          numberOfLines={1}
        >
          {conversion.supportingLabel}
        </AppText>
      </View>

      <GradientButton
        testID="event-primary-action"
        label={conversion.primaryLabel}
        disabled={conversion.disabled}
        onPress={() => onPrimaryAction(conversion)}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfacePrimary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    zIndex: 30,
  },
  endedContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  price: {
    fontWeight: "700",
    color: theme.colors.accentStart,
  },
  btn: {
    minWidth: 140,
  },
});
