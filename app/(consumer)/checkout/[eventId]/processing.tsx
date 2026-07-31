import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppText } from "../../../../src/components/ui/AppText";
import { SecondaryButton } from "../../../../src/components/ui/SecondaryButton";
import { ProcessingState } from "../../../../src/components/ticketing/ProcessingState";
import { useCheckoutStore } from "../../../../src/state/useCheckoutStore";
import { useAppStore } from "../../../../src/state/useAppStore";
import { useSessionStore } from "../../../../src/state/useSessionStore";
import { usePaymentSimulationMutation } from "../../../../src/hooks/ticketing/usePaymentSimulationMutation";
import { routeBuilders, ROUTES } from "../../../../src/navigation/routes";
import { theme } from "../../../../src/design-system/theme";
import { PaymentAttempt } from "../../../../src/domain/ticketing";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function CheckoutProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId?: string | string[];
    attemptId?: string | string[];
  }>();

  const eventId = normaliseId(params.eventId);
  const attemptId = normaliseId(params.attemptId);

  const draft = useCheckoutStore((s) => s.draft);
  const setLatestAttempt = useCheckoutStore((s) => s.setLatestAttempt);
  const releaseAttempt = useCheckoutStore((s) => s.releaseAttempt);
  const clearCheckout = useCheckoutStore((s) => s.clearCheckout);

  const scenario = useAppStore((s) => s.scenario);
  const user = useSessionStore((s) => s.user);

  const paymentMutation = usePaymentSimulationMutation();
  const hasStartedRef = useRef(false);

  // Validate session: all required data must be present
  const isValidSession =
    !!eventId &&
    !!attemptId &&
    !!draft?.quote &&
    !!draft?.paymentMethodId &&
    draft.activeAttemptId === attemptId;

  function handleAttemptResult(attempt: PaymentAttempt) {
    setLatestAttempt(attempt);

    if (attempt.status === "paid") {
      clearCheckout();
      router.replace(
        routeBuilders.checkoutResult({
          eventId: eventId!,
          result: "paid_success",
          orderId: attempt.orderId,
          ticketId: attempt.ticketIds?.[0],
          attemptId: attemptId!,
        }),
      );
    } else if (attempt.status === "declined") {
      releaseAttempt(); // allow retry
      router.replace(
        routeBuilders.checkoutResult({
          eventId: eventId!,
          result: "declined",
          attemptId: attemptId!,
        }),
      );
    } else {
      releaseAttempt(); // allow retry
      router.replace(
        routeBuilders.checkoutResult({
          eventId: eventId!,
          result: "network_error",
          attemptId: attemptId!,
        }),
      );
    }
  }

  function handleNetworkFailure() {
    releaseAttempt();
    if (eventId && attemptId) {
      router.replace(
        routeBuilders.checkoutResult({
          eventId,
          result: "network_error",
          attemptId,
        }),
      );
    }
  }

  useEffect(() => {
    if (hasStartedRef.current || paymentMutation.isPending) return;
    if (!isValidSession) return;

    hasStartedRef.current = true;

    const attendeeId = user?.id ?? "usr-anonymous";
    const attendeeName = user?.profile.displayName ?? "Guest";

    paymentMutation.mutate(
      {
        attemptId: attemptId!,
        eventId: eventId!,
        attendeeId,
        attendeeName,
        quote: draft!.quote!,
        paymentMethodId: draft!.paymentMethodId!,
        scenario,
      },
      {
        onSuccess: handleAttemptResult,
        onError: handleNetworkFailure,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, draft, eventId, isValidSession, scenario]);

  // Invalid session — show a recoverable error, never spin forever
  if (!isValidSession && !paymentMutation.isPending) {
    return (
      <Screen safeAreaEdges={["top", "bottom"]} style={styles.screen}>
        <View style={styles.errorState} testID="processing-invalid-session">
          <AppText variant="heading" style={styles.centered}>
            Session expired
          </AppText>
          <AppText variant="body" color={theme.colors.textMuted} align="center">
            Your checkout session is no longer valid. Please start again.
          </AppText>
          <SecondaryButton
            label="Return to Explore"
            onPress={() => {
              clearCheckout();
              router.replace(ROUTES.consumer.explore);
            }}
            testID="processing-invalid-return"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      gutter={false}
      style={styles.screen}
    >
      <ProcessingState />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
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
