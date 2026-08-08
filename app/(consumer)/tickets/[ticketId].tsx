import React, { useCallback, useState } from "react";
import { Share, ScrollView, StyleSheet, Switch, View } from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { VISIBLE_CONSUMER_TAB_BAR_STYLE } from "../_layout";
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
import { WalletTicket } from "../../../src/domain/ticketing";
import { getEffectiveTicketState } from "../../../src/domain/ticketing/wallet";
import { formatDate, formatTime } from "../../../src/utils/format";
import { theme } from "../../../src/design-system/theme";
import { ROUTES } from "../../../src/navigation/routes";
import { useDemoNowIso } from "../../../src/hooks/useDemoNowIso";

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
  nowIso: string,
): EntryPresentation {
  const effectiveState = getEffectiveTicketState(ticket, nowIso);
  switch (effectiveState) {
    case "valid":
      return {
        canDisplayEntryCode: ticket.entryMode === "qr_placeholder",
        message: "Simulated entry code. Not valid for admission.",
      };
    case "expired":
      return {
        canDisplayEntryCode: false,
        message: "This pass expired when the event ended.",
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
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ ticketId?: string | string[] }>();
  const ticketId = normaliseId(params.ticketId);

  const ticketQuery = useTicketQuery(ticketId);
  const ticket = ticketQuery.data;
  const nowIso = useDemoNowIso();

  const [highBrightness, setHighBrightness] = useState(false);

  // Hide bottom tab bar when Full Ticket is focused and restore exact style on blur/unmount
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: "none" } });
      return () => {
        parent?.setOptions({ tabBarStyle: VISIBLE_CONSUMER_TAB_BAR_STYLE });
      };
    }, [navigation]),
  );

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

  const isFreeRegistration = ticket.source === "free_registration";
  const entryPresentation = getTicketEntryPresentation(ticket, nowIso);
  const isProfileVerification = ticket.entryMode === "profile_verification";
  const canVerifyProfile =
    isProfileVerification &&
    getEffectiveTicketState(ticket, nowIso) === "valid";

  const passPalette = highBrightness
    ? {
        background: "#FFFFFF",
        surface: "#FFFFFF",
        text: "#0F0D16",
        secondaryText: "#3C3747",
        border: "#0F0D16",
      }
    : {
        background: theme.colors.canvas,
        surface: theme.colors.surfacePrimary,
        text: theme.colors.textPrimary,
        secondaryText: theme.colors.textMuted,
        border: theme.colors.borderSubtle,
      };

  const handleShare = async () => {
    await Share.share({
      title: ticket.eventSnapshot.title,
      message: `${ticket.eventSnapshot.title}\nLIIT prototype pass — not valid for real entry.`,
    });
  };

  return (
    <Screen
      statusBarStyle={highBrightness ? "dark" : "light"}
      safeAreaEdges={["top"]}
      gutter={false}
      style={StyleSheet.flatten([
        styles.screen,
        { backgroundColor: passPalette.background },
      ])}
      testID="full-ticket-screen"
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: passPalette.border,
            backgroundColor: passPalette.background,
          },
        ]}
        testID="full-ticket-header"
      >
        <IconButton
          icon="back"
          accessibilityLabel="Back to wallet"
          onPress={() => router.back()}
          variant="ghost"
          iconColor={passPalette.text}
          testID="full-ticket-back"
        />
        <AppText
          variant="subheading"
          style={styles.headerTitle}
          color={passPalette.text}
        >
          {isFreeRegistration ? "Registration Pass" : "Full Ticket"}
        </AppText>
        <IconButton
          icon="share"
          accessibilityLabel="Share this ticket"
          onPress={handleShare}
          variant="ghost"
          iconColor={passPalette.text}
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
        <View
          style={[
            styles.section,
            {
              backgroundColor: passPalette.surface,
              borderColor: passPalette.border,
            },
          ]}
          testID="full-ticket-card-title"
        >
          <View style={styles.statusRow}>
            <TicketStatusPill status={ticket.status} />
          </View>

          <AppText
            variant="title"
            style={styles.eventTitle}
            color={passPalette.text}
          >
            {ticket.eventSnapshot.title}
          </AppText>

          <AppText variant="bodyStrong" color={theme.colors.accentStart}>
            {ticket.tierName}
          </AppText>
        </View>

        {/* Entry pass */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: passPalette.surface,
              borderColor: passPalette.border,
            },
          ]}
          testID="full-ticket-pass-container"
        >
          {canVerifyProfile ? (
            <View
              style={[
                styles.profileVerifyBox,
                {
                  backgroundColor: highBrightness
                    ? "#F0F0FF"
                    : theme.colors.violetBadgeBg,
                },
              ]}
              testID="full-ticket-profile-verification"
              accessibilityLabel="Profile verification notice"
            >
              <AppText
                variant="bodyStrong"
                align="center"
                color={passPalette.text}
              >
                Profile Verification
              </AppText>
              <AppText
                variant="caption"
                color={passPalette.secondaryText}
                align="center"
              >
                Show your LIIT profile at the event entrance. This prototype
                registration is not valid for real entry.
              </AppText>
            </View>
          ) : isProfileVerification ? (
            <View
              style={[
                styles.disabledNotice,
                {
                  backgroundColor: passPalette.surface,
                  borderColor: passPalette.border,
                },
              ]}
              testID="full-ticket-entry-disabled-notice"
            >
              <AppText
                variant="caption"
                color={passPalette.secondaryText}
                align="center"
              >
                {entryPresentation.message}
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
                  style={[
                    styles.disabledNotice,
                    {
                      backgroundColor: passPalette.surface,
                      borderColor: passPalette.border,
                    },
                  ]}
                  testID="full-ticket-entry-disabled-notice"
                >
                  <AppText
                    variant="caption"
                    color={passPalette.secondaryText}
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
            <AppText variant="label" color={passPalette.text}>
              High brightness visual mode
            </AppText>
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
        <View
          style={[
            styles.section,
            {
              backgroundColor: passPalette.surface,
              borderColor: passPalette.border,
            },
          ]}
        >
          <AppText variant="caption" color={passPalette.secondaryText}>
            DATE & TIME
          </AppText>
          <AppText variant="body" color={passPalette.text}>
            {formatDate(ticket.eventSnapshot.startTime, "long")} ·{" "}
            {formatTime(ticket.eventSnapshot.startTime)}
          </AppText>

          <AppText
            variant="caption"
            color={passPalette.secondaryText}
            style={styles.detailGap}
          >
            VENUE
          </AppText>
          <AppText variant="body" color={passPalette.text}>
            {ticket.eventSnapshot.venueName}
          </AppText>
          <AppText variant="caption" color={passPalette.secondaryText}>
            {ticket.eventSnapshot.venueSuburb}, {ticket.eventSnapshot.city}
          </AppText>
        </View>

        {/* Attendee */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: passPalette.surface,
              borderColor: passPalette.border,
            },
          ]}
        >
          <AppText variant="caption" color={passPalette.secondaryText}>
            ATTENDEE
          </AppText>
          <AppText variant="body" color={passPalette.text}>
            {ticket.attendeeName}
          </AppText>
          <AppText variant="caption" color={passPalette.secondaryText}>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
    marginTop: theme.spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
});
