import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppText } from "../../../../src/components/ui/AppText";
import { Icon } from "../../../../src/design-system/icons/Icon";
import { GradientButton } from "../../../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../../../src/components/ui/SecondaryButton";
import { CheckoutProgress } from "../../../../src/components/ticketing/CheckoutProgress";
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

function normaliseResult(
  value: string | string[] | undefined,
): CheckoutResultKind {
  const v = normaliseId(value);
  if (
    v === "paid_success" ||
    v === "free_success" ||
    v === "declined" ||
    v === "network_error"
  ) {
    return v;
  }
  return "paid_success";
}

export default function CheckoutResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId?: string | string[];
    result?: string | string[];
    orderId?: string | string[];
    ticketId?: string | string[];
  }>();

  const eventId = normaliseId(params.eventId);
  const result = normaliseResult(params.result);
  const ticketId = normaliseId(params.ticketId);

  const isSuccess = result === "paid_success" || result === "free_success";
  const isDeclined = result === "declined";
  const isFree = result === "free_success";

  const handleViewTicket = () => {
    if (ticketId) {
      router.replace(routeBuilders.fullTicket(ticketId));
    } else {
      router.replace(ROUTES.consumer.tickets);
    }
  };

  const handleGoToWallet = () => {
    router.replace(ROUTES.consumer.tickets);
  };

  const handleTryAgain = () => {
    if (eventId) {
      router.replace(routeBuilders.checkoutPayment(eventId));
    } else {
      router.replace(ROUTES.consumer.explore);
    }
  };

  const handleGoHome = () => {
    router.replace(ROUTES.consumer.explore);
  };

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
        {isSuccess ? (
          <View
            style={styles.successIcon}
            accessibilityLabel="Payment confirmed"
          >
            <Icon name="checkmark" size={48} color={theme.colors.emerald400} />
          </View>
        ) : (
          <View
            style={styles.failureIcon}
            accessibilityLabel={
              isDeclined ? "Payment declined" : "Payment failed"
            }
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

        <AppText variant="title" style={styles.headline} align="center">
          {result === "paid_success" && "Tickets confirmed!"}
          {result === "free_success" && "Registration confirmed!"}
          {result === "declined" && "Payment declined"}
          {result === "network_error" && "Something went wrong"}
        </AppText>

        <AppText
          variant="body"
          color={theme.colors.textMuted}
          align="center"
          style={styles.sub}
        >
          {result === "paid_success" &&
            "Your prototype tickets have been issued to your LIIT Wallet."}
          {result === "free_success" &&
            "Your free registration pass has been added to your LIIT Wallet."}
          {result === "declined" &&
            "Your prototype payment was declined. No real payment was processed. Please try a different method."}
          {result === "network_error" &&
            "A simulated network error occurred. No payment was processed. Please try again."}
        </AppText>

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

        <View style={styles.actions}>
          {isSuccess ? (
            <>
              {ticketId ? (
                <GradientButton
                  label="View my ticket"
                  onPress={handleViewTicket}
                  testID="result-view-ticket"
                />
              ) : null}
              <SecondaryButton
                label="Go to Wallet"
                onPress={handleGoToWallet}
                testID="result-go-to-wallet"
              />
            </>
          ) : (
            <>
              <GradientButton
                label="Try again"
                onPress={handleTryAgain}
                testID="result-try-again"
              />
              <SecondaryButton
                label="Back to Explore"
                onPress={handleGoHome}
                testID="result-go-home"
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
});
