import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton } from "../ui/IconButton";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface QuantityStepperProps {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  disabled?: boolean;
  disabledReason?: string;
  onChange(value: number): void;
  testIDPrefix?: string;
}

export function QuantityStepper({
  label,
  value,
  minimum,
  maximum,
  disabled = false,
  disabledReason,
  onChange,
  testIDPrefix,
}: QuantityStepperProps) {
  const isDecrementDisabled = disabled || value <= minimum;
  const isIncrementDisabled = disabled || value >= maximum;

  return (
    <View style={styles.container} accessibilityLabel={`${label} quantity`}>
      <IconButton
        testID={testIDPrefix ? `${testIDPrefix}-decrement` : undefined}
        icon="minus"
        accessibilityLabel={`Decrease ${label} quantity`}
        disabled={isDecrementDisabled}
        onPress={() => onChange(Math.max(minimum, value - 1))}
        size="sm"
        variant="surface"
      />

      <AppText
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${value} selected`}
        variant="subheading"
        style={styles.valueText}
      >
        {value}
      </AppText>

      <IconButton
        testID={testIDPrefix ? `${testIDPrefix}-increment` : undefined}
        icon="plus"
        accessibilityLabel={`Increase ${label} quantity`}
        disabled={isIncrementDisabled}
        onPress={() => onChange(Math.min(maximum, value + 1))}
        size="sm"
        variant="surface"
      />

      {disabledReason && (disabled || isIncrementDisabled) ? (
        <AppText variant="caption" color={theme.colors.textMuted}>
          {disabledReason}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  valueText: {
    minWidth: 24,
    textAlign: "center",
    fontWeight: "700",
  },
});
