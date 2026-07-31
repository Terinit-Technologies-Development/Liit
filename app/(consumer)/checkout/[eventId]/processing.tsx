import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { ProcessingState } from "../../../../src/components/ticketing/ProcessingState";
import { useCheckoutStore } from "../../../../src/state/useCheckoutStore";
import { useAppStore } from "../../../../src/state/useAppStore";
import { useSessionStore } from "../../../../src/state/useSessionStore";
import { mockTicketingRepository } from "../../../../src/repositories/mock/MockTicketingRepository";
import { routeBuilders } from "../../../../src/navigation/routes";
import { theme } from "../../../../src/design-system/theme";

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
  const clearCheckout = useCheckoutStore((s) => s.clearCheckout);

  const scenario = useAppStore((s) => s.scenario);
  const user = useSessionStore((s) => s.user);

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (!eventId || !attemptId || !draft?.quote || !draft?.paymentMethodId) {
      return;
    }
    ranRef.current = true;

    const attendeeId = user?.id ?? "usr-anonymous";
    const attendeeName = user?.profile.displayName ?? "Guest";

    mockTicketingRepository
      .simulatePayment({
        attemptId,
        eventId,
        attendeeId,
        attendeeName,
        quote: draft.quote,
        paymentMethodId: draft.paymentMethodId,
        scenario,
      })
      .then((attempt) => {
        setLatestAttempt(attempt);

        if (attempt.status === "paid") {
          clearCheckout();
          router.replace(
            routeBuilders.checkoutResult({
              eventId,
              result: "paid_success",
              orderId: attempt.orderId,
              ticketId: attempt.ticketIds?.[0],
              attemptId,
            }),
          );
        } else if (attempt.status === "declined") {
          router.replace(
            routeBuilders.checkoutResult({
              eventId,
              result: "declined",
              attemptId,
            }),
          );
        } else {
          router.replace(
            routeBuilders.checkoutResult({
              eventId,
              result: "network_error",
              attemptId,
            }),
          );
        }
      })
      .catch(() => {
        router.replace(
          routeBuilders.checkoutResult({
            eventId,
            result: "network_error",
            attemptId: attemptId ?? "",
          }),
        );
      });
  }, [
    eventId,
    attemptId,
    draft,
    scenario,
    user,
    setLatestAttempt,
    clearCheckout,
    router,
  ]);

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
});
