import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { IconButton } from "../../src/components/ui/IconButton";
import { PaymentMethodCard } from "../../src/components/ticketing/PaymentMethodCard";
import { useCheckoutStore } from "../../src/state/useCheckoutStore";
import { mockPaymentMethods } from "../../src/fixtures/ticketing";
import { theme } from "../../src/design-system/theme";

export default function PaymentMethodModal() {
  const router = useRouter();

  /** Source of truth from the store — what is currently applied. */
  const appliedMethodId =
    useCheckoutStore((s) => s.draft?.paymentMethodId) ?? "pm-demo-visa-4242";

  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);

  /** Local draft — changes to this do NOT mutate the store until Apply is pressed. */
  const [localSelectedId, setLocalSelectedId] = useState(appliedMethodId);

  const handleApply = () => {
    setPaymentMethod(localSelectedId);
    router.back();
  };

  const handleCancel = () => {
    // Do NOT call setPaymentMethod — local selection is discarded
    router.back();
  };

  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      gutter={false}
      style={styles.screen}
    >
      <View style={styles.header}>
        <AppText variant="subheading" style={styles.title}>
          Choose payment method
        </AppText>
        <IconButton
          icon="close"
          accessibilityLabel="Cancel payment method selection"
          onPress={handleCancel}
          variant="ghost"
          testID="payment-method-close"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mockPaymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={localSelectedId === method.id}
            onSelect={() => {
              if (method.enabled) {
                setLocalSelectedId(method.id);
              }
            }}
            testID={`payment-method-option-${method.id}`}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label="Apply"
          onPress={handleApply}
          variant="primary"
          fullWidth
          disabled={localSelectedId === appliedMethodId}
          testID="payment-method-apply"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  title: {
    fontWeight: "700",
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
  },
});
