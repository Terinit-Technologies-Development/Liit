import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppText } from "../../../src/components/ui/AppText";
import { AppImage } from "../../../src/components/ui/AppImage";
import { getImageSource } from "../../../src/assets/image-registry";
import { IconButton } from "../../../src/components/ui/IconButton";
import { SecondaryButton } from "../../../src/components/ui/SecondaryButton";
import { TicketStatusPill } from "../../../src/components/ticketing/TicketStatusPill";
import { QrPlaceholder } from "../../../src/components/ticketing/QrPlaceholder";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { useTicketQuery } from "../../../src/hooks/ticketing/useTicketQuery";
import { WalletTicket, TicketStatus } from "../../../src/domain/ticketing";
import { formatDate, formatTime } from "../../../src/utils/format";
import { theme } from "../../../src/design-system/theme";
import { ROUTES } from "../../../src/navigation/routes";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

interface EntryPresentation {
  canDisplayEntryCode: boolean;
  message: string;
}

export function getTicketEntryPresentation(
  ticket: WalletTicket,
): EntryPresentation {
  switch (ticket.status as TicketStatus) {
    case "valid":
      return {
        canDisplayEntryCode: ticket.entryMode === "qr_placeholder",
        message: "Simulated entry code. Not valid for admission.",
      };
    case "pending":
      return {
        canDisplayEntryCode: false,
        message: "This ticket is pending confirmation.",
      };
    case "used":
      return {
        canDisplayEntryCode: false,
        message: "This ticket has already been used.",
      };
    case "cancelled":
      return {
        canDisplayEntryCode: false,
        message: "This ticket is cancelled.",
      };
    case "refunded":
      return {
        canDisplayEntryCode: false,
        message: "This refunded placeholder cannot be used.",
      };
  }
}

export default function FullTicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ticketId?: string | string[] }>();
  const ticketId = normaliseId(params.ticketId);

  const ticketQuery = useTicketQuery(ticketId);
  const ticket = ticketQuery.data;

  const [highBrightness, setHighBrightness] = useState(false);

  const isFreeRegistration = ticket?.source === "free_registration";

  if (ticketQuery.isLoading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.center}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Loading ticket…
          </AppText>
        </View>
      </Screen>
    );
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <Screen style={styles.screen}>
        <ErrorState
          title="Ticket not found"
          description="This ticket could not be loaded."
          actionLabel="Return to Wallet"
          onAction={() => router.replace(ROUTES.consumer.tickets)}
        />
      </Screen>
    );
  }

  const entryPresentation = getTicketEntryPresentation(ticket);

  return (
    <Screen
      safeAreaEdges={["top"]}
      gutter={false}
      style={StyleSheet.flatten([
        styles.screen,
        highBrightness && styles.highBrightness,
      ])}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="back"
          accessibilityLabel="Back to wallet"
          onPress={() => router.back()}
          variant="ghost"
        />
        <AppText variant="subheading" style={styles.headerTitle}>
          {isFreeRegistration ? "Registration Pass" : "Full Ticket"}
        </AppText>
        <IconButton
          icon="share"
          accessibilityLabel="Share this ticket"
          onPress={() => {
            /* placeholder — sharing not yet implemented */
          }}
          variant="ghost"
          testID="full-ticket-share"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <AppImage
          source={getImageSource(ticket.eventSnapshot.imageKey)}
          style={styles.heroImage}
          accessibilityLabel={ticket.eventSnapshot.title}
        />

        {/* Status + Title */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <TicketStatusPill status={ticket.status} />
          </View>

          <AppText variant="title" style={styles.eventTitle}>
            {ticket.eventSnapshot.title}
          </AppText>

          <AppText variant="bodyStrong" color={theme.colors.accentStart}>
            {ticket.tierName}
          </AppText>
        </View>

        {/* Entry pass */}
        <View style={styles.section}>
          {isFreeRegistration ? (
            <View
              style={styles.profileVerifyBox}
              testID="full-ticket-profile-verification"
              accessibilityLabel="Profile verification notice"
            >
              <AppText variant="bodyStrong" align="center">
                Profile Verification
              </AppText>
              <AppText
                variant="caption"
                color={theme.colors.textMuted}
                align="center"
              >
                Show your LIIT profile at the event entrance. This prototype
                registration is not valid for real entry.
              </AppText>
            </View>
          ) : (
            <>
              <QrPlaceholder
                ticketId={ticket.id}
                enabled={entryPresentation.canDisplayEntryCode}
                testID="full-ticket-qr"
              />
              {!entryPresentation.canDisplayEntryCode && (
                <View
                  style={styles.disabledNotice}
                  testID="full-ticket-entry-disabled-notice"
                >
                  <AppText
                    variant="caption"
                    color={theme.colors.textMuted}
                    align="center"
                  >
                    {entryPresentation.message}
                  </AppText>
                </View>
              )}
            </>
          )}
        </View>

        {/* High-brightness toggle */}
        {!isFreeRegistration && (
          <View style={styles.brightnessRow}>
            <AppText variant="label">High brightness visual mode</AppText>
            <Switch
              testID="full-ticket-high-brightness"
              value={highBrightness}
              onValueChange={setHighBrightness}
              accessibilityLabel="High brightness visual mode"
              accessibilityHint="Changes the pass to a high-contrast visual style only."
            />
          </View>
        )}

        {/* Event Details */}
        <View style={styles.section}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            DATE & TIME
          </AppText>
          <AppText variant="body">
            {formatDate(ticket.eventSnapshot.startTime, "long")} ·{" "}
            {formatTime(ticket.eventSnapshot.startTime)}
          </AppText>

          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            style={styles.detailGap}
          >
            VENUE
          </AppText>
          <AppText variant="body">{ticket.eventSnapshot.venueName}</AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>
            {ticket.eventSnapshot.venueSuburb}, {ticket.eventSnapshot.city}
          </AppText>
        </View>

        {/* Attendee */}
        <View style={styles.section}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            ATTENDEE
          </AppText>
          <AppText variant="body">{ticket.attendeeName}</AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>
            {ticket.id}
          </AppText>
        </View>

        {/* Actions */}
        <SecondaryButton
          label="View Terms"
          onPress={() =>
            router.push({
              pathname: "/(modals)/ticket-terms",
              params: { eventId: ticket.eventId },
            })
          }
          testID="full-ticket-terms"
        />

        <SecondaryButton
          label="Return to Wallet"
          onPress={() => router.replace(ROUTES.consumer.tickets)}
          testID="full-ticket-return"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  highBrightness: {
    backgroundColor: "#FFFFFF",
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
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: theme.radii.xl,
    overflow: "hidden",
  },
  section: {
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfacePrimary,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
  },
  statusRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.xs,
  },
  eventTitle: {
    fontWeight: "800",
  },
  profileVerifyBox: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.violetBadgeBg,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  brightnessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xs,
  },
  detailGap: {
    marginTop: theme.spacing.sm,
  },
  disabledNotice: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
});
