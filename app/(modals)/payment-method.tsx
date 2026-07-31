import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { IconButton } from "../../src/components/ui/IconButton";
import { PaymentMethodCard } from "../../src/components/ticketing/PaymentMethodCard";
import { useCheckoutStore } from "../../src/state/useCheckoutStore";
import { mockPaymentMethods } from "../../src/fixtures/ticketing";
import { theme } from "../../src/design-system/theme";

export default function PaymentMethodModal() {
  const router = useRouter();
  const selectedId = useCheckoutStore(
    (s) => s.draft?.paymentMethodId ?? "pm-demo-visa-4242",
  );
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);

  const handleSelect = (id: string) => {
    setPaymentMethod(id);
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
          accessibilityLabel="Close payment method selection"
          onPress={() => router.back()}
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
            selected={selectedId === method.id}
            onSelect={() => method.enabled && handleSelect(method.id)}
          />
        ))}
      </ScrollView>
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
});
