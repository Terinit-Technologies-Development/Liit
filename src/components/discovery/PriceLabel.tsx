import React from "react";
import { AppText } from "../ui/AppText";
import { formatCurrency } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface PriceLabelProps {
  amountMinor?: number;
  currency?: string;
  label?: string;
}

export function PriceLabel({
  amountMinor,
  currency = "ZAR",
  label,
}: PriceLabelProps) {
  const value =
    label ??
    (amountMinor === 0
      ? "Free"
      : `From ${formatCurrency(amountMinor ?? 0, currency)}`);

  return (
    <AppText variant="label" color={theme.colors.accentStart} numberOfLines={1}>
      {value}
    </AppText>
  );
}
