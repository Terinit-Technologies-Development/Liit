import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface CheckoutProgressProps {
  current: "tickets" | "payment" | "confirmation";
  freeFlow?: boolean;
}

export function CheckoutProgress({
  current,
  freeFlow = false,
}: CheckoutProgressProps) {
  const steps = freeFlow
    ? [
        { key: "tickets", label: "Registration" },
        { key: "confirmation", label: "Confirmation" },
      ]
    : [
        { key: "tickets", label: "Tickets" },
        { key: "payment", label: "Payment" },
        { key: "confirmation", label: "Confirmation" },
      ];

  return (
    <View style={styles.container} accessibilityLabel="Checkout progress">
      {steps.map((step, idx) => {
        const isActive = step.key === current;
        return (
          <React.Fragment key={step.key}>
            {idx > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.step}>
              <View style={[styles.badge, isActive && styles.activeBadge]}>
                <AppText
                  variant="caption"
                  color={
                    isActive ? theme.colors.canvas : theme.colors.textMuted
                  }
                  style={styles.badgeText}
                >
                  {idx + 1}
                </AppText>
              </View>
              <AppText
                variant="caption"
                color={
                  isActive ? theme.colors.textPrimary : theme.colors.textMuted
                }
                style={isActive ? styles.activeLabel : undefined}
              >
                {step.label}
              </AppText>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
    gap: theme.spacing.sm,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadge: {
    backgroundColor: theme.colors.accentStart,
  },
  badgeText: {
    fontWeight: "700",
  },
  activeLabel: {
    fontWeight: "700",
  },
  divider: {
    width: 16,
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
});
