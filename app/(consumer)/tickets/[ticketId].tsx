import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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
import { formatDate, formatTime } from "../../../src/utils/format";
import { theme } from "../../../src/design-system/theme";
import { ROUTES } from "../../../src/navigation/routes";

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function FullTicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ticketId?: string | string[] }>();
  const ticketId = normaliseId(params.ticketId);

  const ticketQuery = useTicketQuery(ticketId);
  const ticket = ticketQuery.data;

  const isActiveEntry =
    ticket?.status === "valid" || ticket?.status === "pending";
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

  return (
    <Screen safeAreaEdges={["top"]} gutter={false} style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="back"
          accessibilityLabel="Back to wallet"
          onPress={() => router.back()}
          variant="ghost"
        />
        <AppText variant="subheading" style={styles.headerTitle}>
          Full Ticket
        </AppText>
        <View style={styles.headerSpacer} />
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
            <QrPlaceholder ticketId={ticket.id} enabled={isActiveEntry} />
          )}
        </View>

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

        {!isActiveEntry && (
          <View style={styles.disabledNotice}>
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              align="center"
            >
              This ticket is {ticket.status} and cannot be used for entry.
            </AppText>
          </View>
        )}

        <SecondaryButton
          label="Return to Wallet"
          onPress={() => router.replace(ROUTES.consumer.tickets)}
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
  detailGap: {
    marginTop: theme.spacing.sm,
  },
  disabledNotice: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
});
