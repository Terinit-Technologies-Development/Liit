import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "../../design-system/icons/Icon";
import { AppText } from "../ui/AppText";
import { PaymentMethod } from "../../domain/ticketing";
import { theme } from "../../design-system/theme";

export interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect(): void;
  testID?: string;
}

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
  testID,
}: PaymentMethodCardProps) {
  return (
    <Pressable
      disabled={!method.enabled}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{
        selected,
        disabled: !method.enabled,
      }}
      accessibilityLabel={method.label}
      accessibilityHint={
        method.enabled ? method.description : method.disabledReason
      }
      style={[
        styles.card,
        selected && styles.selectedCard,
        !method.enabled && styles.disabledCard,
      ]}
      testID={testID ?? `payment-method-${method.id}`}
    >
      <View style={styles.radioIndicator}>
        <View style={[styles.outerCircle, selected && styles.selectedCircle]}>
          {selected ? <View style={styles.innerDot} /> : null}
        </View>
      </View>

      <View style={styles.iconContainer}>
        <Icon
          name={method.type === "wallet_placeholder" ? "tickets" : "card"}
          size="md"
          color={
            method.enabled ? theme.colors.accentStart : theme.colors.textMuted
          }
        />
      </View>

      <View style={styles.detailsCol}>
        <AppText
          variant="subheading"
          style={styles.label}
          color={
            method.enabled ? theme.colors.textPrimary : theme.colors.textMuted
          }
        >
          {method.label}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted}>
          {method.enabled ? method.description : method.disabledReason}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1.5,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.md,
  },
  selectedCard: {
    borderColor: theme.colors.accentStart,
    backgroundColor: theme.colors.surfaceElevated,
  },
  disabledCard: {
    opacity: 0.6,
  },
  radioIndicator: {
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCircle: {
    borderColor: theme.colors.accentStart,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accentStart,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCol: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  label: {
    fontWeight: "700",
  },
});
