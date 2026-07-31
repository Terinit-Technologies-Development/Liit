import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppText } from "../../../../src/components/ui/AppText";
import { GradientButton } from "../../../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../../../src/components/ui/SecondaryButton";
import { IconButton } from "../../../../src/components/ui/IconButton";
import { PaymentMethodCard } from "../../../../src/components/ticketing/PaymentMethodCard";
import { DemoCardForm } from "../../../../src/components/ticketing/DemoCardForm";
import { OrderSummary } from "../../../../src/components/ticketing/OrderSummary";
import { CheckoutProgress } from "../../../../src/components/ticketing/CheckoutProgress";
import { PrototypeBadge } from "../../../../src/components/ui/PrototypeBadge";
import { useCheckoutStore } from "../../../../src/state/useCheckoutStore";
import { mockPaymentMethods } from "../../../../src/fixtures/ticketing";
import { routeBuilders } from "../../../../src/navigation/routes";
import { theme } from "../../../../src/design-system/theme";
import { nanoid } from "../../../../src/utils/nanoid";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function CheckoutPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = normaliseId(params.eventId);

  const draft = useCheckoutStore((s) => s.draft);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const beginAttempt = useCheckoutStore((s) => s.beginAttempt);
  const clearCheckout = useCheckoutStore((s) => s.clearCheckout);

  const [selectedMethodId, setSelectedMethodId] = useState(
    draft?.paymentMethodId ?? "pm-demo-visa-4242",
  );

  const selectedMethod = mockPaymentMethods.find(
    (m) => m.id === selectedMethodId,
  );

  const handleSelectMethod = (id: string) => {
    setSelectedMethodId(id);
    setPaymentMethod(id);
  };

  const handlePay = () => {
    if (!eventId || !draft?.quote) return;
    const attemptId = nanoid();
    beginAttempt(attemptId);
    router.push(routeBuilders.checkoutProcessing(eventId, attemptId));
  };

  if (!draft?.quote || !eventId) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.errorState}>
          <AppText variant="heading" style={styles.centered}>
            No checkout session found
          </AppText>
          <SecondaryButton
            label="Start over"
            onPress={() => {
              clearCheckout();
              router.back();
            }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={["top"]} gutter={false} style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="back"
          accessibilityLabel="Go back to ticket selection"
          onPress={() => router.back()}
          variant="ghost"
        />
        <AppText variant="subheading" style={styles.headerTitle}>
          Payment
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <CheckoutProgress current="payment" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PrototypeBadge />

        <AppText variant="bodyStrong" style={styles.sectionLabel}>
          Payment method
        </AppText>

        {mockPaymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={selectedMethodId === method.id}
            onSelect={() => method.enabled && handleSelectMethod(method.id)}
          />
        ))}

        {selectedMethod?.type === "demo_new_card" && <DemoCardForm />}

        <OrderSummary quote={draft.quote} />
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={`Pay R${(draft.quote.totalMinor / 100).toFixed(2)}`}
          onPress={handlePay}
          testID="checkout-payment-pay"
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  headerTitle: {
    flex: 1,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 44,
  },
  sectionLabel: {
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
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
    backgroundColor: theme.colors.surfacePrimary,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
  },
  centered: {
    textAlign: "center",
  },
});
