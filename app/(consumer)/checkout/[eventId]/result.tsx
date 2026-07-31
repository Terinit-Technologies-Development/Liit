import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppText } from "../../../../src/components/ui/AppText";
import { Icon } from "../../../../src/design-system/icons/Icon";
import { GradientButton } from "../../../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../../../src/components/ui/SecondaryButton";
import { CheckoutProgress } from "../../../../src/components/ticketing/CheckoutProgress";
import { OrderSummary } from "../../../../src/components/ticketing/OrderSummary";
import { useOrderQuery } from "../../../../src/hooks/ticketing/useOrderQuery";
import { useEventDetailQuery } from "../../../../src/hooks/events/useEventDetailQuery";
import {
  CheckoutResultKind,
  routeBuilders,
  ROUTES,
} from "../../../../src/navigation/routes";
import { theme } from "../../../../src/design-system/theme";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

/**
 * Strictly validates the result param. Returns null for any unrecognised
 * value — a malformed deep link must NEVER show a false success confirmation.
 */
function parseResult(
  value: string | string[] | undefined,
): CheckoutResultKind | null {
  const v = normaliseId(value);
  if (
    v === "paid_success" ||
    v === "free_success" ||
    v === "declined" ||
    v === "network_error"
  ) {
    return v;
  }
  return null;
}

export default function CheckoutResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId?: string | string[];
    result?: string | string[];
    orderId?: string | string[];
    ticketId?: string | string[];
    attemptId?: string | string[];
  }>();

  const eventId = normaliseId(params.eventId);
  const result = parseResult(params.result);
  const orderId = normaliseId(params.orderId);
  const ticketId = normaliseId(params.ticketId);

  const orderQuery = useOrderQuery(orderId);
  const detailQuery = useEventDetailQuery(eventId);

  // Strict guard: invalid or missing result parameter must show an error
  if (!result) {
    return (
      <Screen safeAreaEdges={["top", "bottom"]} style={styles.screen}>
        <View style={styles.errorState} testID="result-invalid-params">
          <Icon
            name="alertCircle"
            size={48}
            color={theme.colors.statusDanger}
          />
          <AppText variant="heading" style={styles.centered}>
            Invalid confirmation
          </AppText>
          <AppText variant="body" color={theme.colors.textMuted} align="center">
            This confirmation link is not valid. Please return to your Wallet.
          </AppText>
          <GradientButton
            label="Go to Wallet"
            onPress={() => router.replace(ROUTES.consumer.tickets)}
            testID="result-invalid-go-wallet"
          />
        </View>
      </Screen>
    );
  }

  const isSuccess = result === "paid_success" || result === "free_success";
  const isDeclined = result === "declined";
  const isFree = result === "free_success";

  const event = detailQuery.data?.event;
  const order = orderQuery.data;

  const handleViewTicket = () => {
    if (ticketId) {
      router.replace(routeBuilders.fullTicket(ticketId));
    } else {
      router.replace(ROUTES.consumer.tickets);
    }
  };

  const handleGoToWallet = () => router.replace(ROUTES.consumer.tickets);

  const handleTryAgain = () => {
    if (eventId) {
      router.replace(routeBuilders.checkoutPayment(eventId));
    } else {
      router.replace(ROUTES.consumer.explore);
    }
  };

  const handleChangeMethod = () => {
    if (eventId) {
      router.push(routeBuilders.checkoutPayment(eventId));
    }
  };

  const handleReturnToEvent = () => {
    if (eventId) {
      router.replace(routeBuilders.eventDetail(eventId));
    } else {
      router.replace(ROUTES.consumer.explore);
    }
  };

  const handleBackToFeed = () => router.replace(ROUTES.consumer.feed);

  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      gutter={false}
      style={styles.screen}
    >
      <CheckoutProgress current="confirmation" freeFlow={isFree} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status icon */}
        {isSuccess ? (
          <View
            style={styles.successIcon}
            accessibilityLabel="Confirmed"
            testID="result-success-icon"
          >
            <Icon name="checkmark" size={48} color={theme.colors.emerald400} />
          </View>
        ) : (
          <View
            style={styles.failureIcon}
            accessibilityLabel={
              isDeclined ? "Payment declined" : "Payment failed"
            }
            testID="result-failure-icon"
          >
            <Icon
              name="alertCircle"
              size={48}
              color={
                isDeclined ? theme.colors.amber400 : theme.colors.statusDanger
              }
            />
          </View>
        )}

        {/* Headline */}
        <AppText
          variant="title"
          style={styles.headline}
          align="center"
          testID="result-headline"
        >
          {result === "paid_success" && "Tickets confirmed!"}
          {result === "free_success" && "Registration confirmed!"}
          {result === "declined" && "Payment declined"}
          {result === "network_error" && "Something went wrong"}
        </AppText>

        {/* Sub-text */}
        <AppText
          variant="body"
          color={theme.colors.textMuted}
          align="center"
          style={styles.sub}
        >
          {result === "paid_success" &&
            "Your prototype tickets have been issued to your LIIT Wallet."}
          {result === "free_success" &&
            "Your free registration pass has been added to your LIIT Wallet. Show your LIIT profile at the venue entrance."}
          {result === "declined" &&
            "Your prototype payment was declined. No real payment was processed. Please try a different method."}
          {result === "network_error" &&
            "A simulated network error occurred. No payment was processed. Please try again."}
        </AppText>

        {/* Event summary */}
        {event && (
          <View style={styles.summaryCard} testID="result-event-summary">
            <AppText variant="label" color={theme.colors.textMuted}>
              EVENT
            </AppText>
            <AppText variant="bodyStrong">{event.title}</AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {event.venue?.name} · {event.venue?.suburb}
            </AppText>
          </View>
        )}

        {/* Order summary (for paid success) */}
        {isSuccess && order ? (
          <View style={styles.summaryCard} testID="result-order-summary">
            <OrderSummary quote={order.quote} />
            <View style={styles.orderIdRow}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                ORDER ID
              </AppText>
              <AppText
                variant="label"
                color={theme.colors.textSecondary}
                testID="result-order-id"
              >
                {order.id}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* Free registration entry requirement */}
        {result === "free_success" && (
          <View style={styles.entryBox} testID="result-entry-requirement">
            <Icon name="user" size={20} color={theme.colors.accentStart} />
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              align="center"
            >
              Entry is via LIIT profile verification at the venue. No QR code is
              required for free registrations.
            </AppText>
          </View>
        )}

        {/* Prototype notice */}
        {isSuccess && (
          <View style={styles.noticeBox}>
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              align="center"
            >
              LIIT PROTOTYPE — Tickets are simulated and not valid for real
              events.
            </AppText>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {result === "paid_success" && (
            <>
              <GradientButton
                label={ticketId ? "View my ticket" : "View Wallet"}
                onPress={handleViewTicket}
                testID="result-view-ticket"
              />
              <SecondaryButton
                label="Go to Wallet"
                onPress={handleGoToWallet}
                testID="result-go-to-wallet"
              />
              <SecondaryButton
                label="Share with Friends"
                onPress={() => {
                  /* placeholder — sharing not yet implemented */
                }}
                testID="result-share"
              />
              <SecondaryButton
                label="Back to Feed"
                onPress={handleBackToFeed}
                testID="result-back-to-feed"
              />
            </>
          )}

          {result === "free_success" && (
            <>
              <GradientButton
                label={ticketId ? "View Registration Pass" : "View Wallet"}
                onPress={handleViewTicket}
                testID="result-view-ticket"
              />
              <SecondaryButton
                label="Go to Wallet"
                onPress={handleGoToWallet}
                testID="result-go-to-wallet"
              />
              <SecondaryButton
                label="Add to Calendar"
                onPress={() => {
                  /* placeholder — calendar not yet implemented */
                }}
                testID="result-add-to-calendar"
              />
              <SecondaryButton
                label="Share Event"
                onPress={() => {
                  /* placeholder — sharing not yet implemented */
                }}
                testID="result-share"
              />
              <SecondaryButton
                label="Back to Feed"
                onPress={handleBackToFeed}
                testID="result-back-to-feed"
              />
            </>
          )}

          {result === "declined" && (
            <>
              <GradientButton
                label="Try again"
                onPress={handleTryAgain}
                testID="result-try-again"
              />
              <SecondaryButton
                label="Change payment method"
                onPress={handleChangeMethod}
                testID="result-change-method"
              />
            </>
          )}

          {result === "network_error" && (
            <>
              <GradientButton
                label="Retry"
                onPress={handleTryAgain}
                testID="result-try-again"
              />
              <SecondaryButton
                label="Return to Event"
                onPress={handleReturnToEvent}
                testID="result-return-to-event"
              />
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.emeraldBadgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  failureIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.amberBadgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    fontWeight: "800",
  },
  sub: {
    maxWidth: 300,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  orderIdRow: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xxs,
  },
  entryBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    maxWidth: 300,
  },
  noticeBox: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    maxWidth: 300,
  },
  actions: {
    width: "100%",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  centered: {
    textAlign: "center",
  },
});
