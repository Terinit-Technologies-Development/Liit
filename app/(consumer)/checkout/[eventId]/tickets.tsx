import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppText } from "../../../../src/components/ui/AppText";
import { GradientButton } from "../../../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../../../src/components/ui/SecondaryButton";
import { IconButton } from "../../../../src/components/ui/IconButton";
import { TicketTierSelector } from "../../../../src/components/ticketing/TicketTierSelector";
import { OrderSummary } from "../../../../src/components/ticketing/OrderSummary";
import { CheckoutProgress } from "../../../../src/components/ticketing/CheckoutProgress";
import { PrototypeBadge } from "../../../../src/components/ui/PrototypeBadge";
import { useEventDetailQuery } from "../../../../src/hooks/events/useEventDetailQuery";
import { useCheckoutStore } from "../../../../src/state/useCheckoutStore";
import { useSessionStore } from "../../../../src/state/useSessionStore";
import { buildCheckoutQuote } from "../../../../src/domain/ticketing/quote";
import { mockTicketingRepository } from "../../../../src/repositories/mock/MockTicketingRepository";
import { routeBuilders, ROUTES } from "../../../../src/navigation/routes";
import { queryKeys } from "../../../../src/state/query-keys";
import { nanoid } from "../../../../src/utils/nanoid";
import { theme } from "../../../../src/design-system/theme";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

const EMPTY_MAP: Record<string, number> = {};

export default function CheckoutTicketsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    eventId?: string | string[];
    initialTierId?: string | string[];
  }>();

  const eventId = normaliseId(params.eventId);
  const initialTierId = normaliseId(params.initialTierId);

  const detailQuery = useEventDetailQuery(eventId);
  const detail = detailQuery.data;

  const user = useSessionStore((s) => s.user);
  const draftQuantities = useCheckoutStore((s) => s.draft?.quantities);
  const storeQuantities = draftQuantities ?? EMPTY_MAP;
  const setQuantity = useCheckoutStore((s) => s.setQuantity);
  const setQuote = useCheckoutStore((s) => s.setQuote);
  const clearCheckout = useCheckoutStore((s) => s.clearCheckout);
  const tryBeginFreeRegistration = useCheckoutStore(
    (s) => s.tryBeginFreeRegistration,
  );
  const releaseFreeRegistration = useCheckoutStore(
    (s) => s.releaseFreeRegistration,
  );

  const [quantities, setLocalQuantities] = useState<Record<string, number>>(
    () => {
      if (Object.keys(storeQuantities).length > 0) return storeQuantities;
      if (initialTierId) return { [initialTierId]: 1 };
      return {};
    },
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = useCallback(
    (tierId: string, qty: number) => {
      setLocalQuantities((prev) => ({ ...prev, [tierId]: qty }));
      setQuantity(tierId, qty);
    },
    [setQuantity],
  );

  const quote = useMemo(() => {
    if (!detail) return null;
    try {
      return buildCheckoutQuote(eventId ?? "", detail.ticketTiers, quantities);
    } catch {
      return null;
    }
  }, [detail, eventId, quantities]);

  const isFreeFlow = detail?.event?.startingPriceMinor === 0;
  const hasSelection = (quote?.totalQuantity ?? 0) > 0;

  const handleCancel = () => {
    clearCheckout();
    router.back();
  };

  const handleContinue = async () => {
    if (!quote || !eventId || !detail || quote.totalQuantity === 0) return;

    setQuote(quote);
    setSubmitError(null);

    if (isFreeFlow) {
      const registrationId = tryBeginFreeRegistration(
        `registration-${eventId}-${nanoid()}`,
      );

      if (!registrationId) {
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await mockTicketingRepository.createFreeRegistration({
          registrationId,
          eventId,
          attendeeId: user?.id ?? "usr-anonymous",
          attendeeName: user?.profile.displayName ?? "Guest",
          quote,
        });

        await queryClient.invalidateQueries({
          queryKey: queryKeys.ticketing.all,
        });

        clearCheckout();

        router.replace(
          routeBuilders.checkoutResult({
            eventId,
            result: "free_success",
            orderId: result.order.id,
            ticketId: result.tickets[0]?.id,
          }),
        );
      } catch {
        releaseFreeRegistration();
        setSubmitError("Registration failed. Please try again.");
        setIsSubmitting(false);
      }
      return;
    }

    router.push(routeBuilders.checkoutPayment(eventId));
  };

  if (!eventId || (!detailQuery.isLoading && !detail)) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.errorState}>
          <AppText variant="heading" style={styles.centered}>
            Event not found
          </AppText>
          <SecondaryButton
            label="Go back"
            onPress={() => router.replace(ROUTES.consumer.explore)}
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
          icon="close"
          accessibilityLabel="Cancel checkout"
          onPress={handleCancel}
          variant="ghost"
          testID="checkout-tickets-close"
        />
        <View style={styles.headerTitles}>
          <AppText variant="subheading" style={styles.headerTitle}>
            {isFreeFlow ? "Register" : "Select Tickets"}
          </AppText>
          {detail?.event.title ? (
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              numberOfLines={1}
            >
              {detail.event.title}
            </AppText>
          ) : null}
        </View>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(modals)/ticket-terms",
              params: { eventId: eventId ?? "" },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="View ticket terms"
          style={styles.termsButton}
        >
          <AppText variant="label" color={theme.colors.accentStart}>
            Terms
          </AppText>
        </Pressable>
      </View>

      <CheckoutProgress current="tickets" freeFlow={isFreeFlow} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PrototypeBadge />

        {detail?.ticketTiers.map((tier) => (
          <TicketTierSelector
            key={tier.id}
            tier={tier}
            quantity={quantities[tier.id] ?? 0}
            onChangeQuantity={(qty) => handleChange(tier.id, qty)}
          />
        ))}

        {quote && hasSelection && <OrderSummary quote={quote} />}

        {submitError ? (
          <AppText
            variant="caption"
            color={theme.colors.statusDanger}
            align="center"
            testID="checkout-tickets-error"
          >
            {submitError}
          </AppText>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={
            isSubmitting
              ? "Registering…"
              : isFreeFlow
                ? "Confirm Registration"
                : `Continue — ${quote && hasSelection ? `R${(quote.totalMinor / 100).toFixed(2)}` : "Select tickets"}`
          }
          onPress={handleContinue}
          disabled={!hasSelection || isSubmitting}
          testID="checkout-tickets-continue"
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
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: "700",
  },
  termsButton: {
    padding: theme.spacing.xs,
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
