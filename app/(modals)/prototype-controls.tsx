import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { Stack } from "../../src/components/ui/Stack";
import { Row } from "../../src/components/ui/Row";
import { Divider } from "../../src/components/ui/Divider";
import { IconButton } from "../../src/components/ui/IconButton";
import { useAppStore, PrototypeScenario } from "../../src/state/useAppStore";
import { useSessionStore } from "../../src/state/useSessionStore";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { useMapDiscoveryStore } from "../../src/state/useMapDiscoveryStore";
import { useCheckoutStore } from "../../src/state/useCheckoutStore";
import { useSocialStore } from "../../src/state/useSocialStore";
import { useCreatorStore } from "../../src/state/useCreatorStore";
import { usePrototypeControlsStore } from "../../src/state/usePrototypeControlsStore";
import { usePrototypeOverridesStore } from "../../src/state/usePrototypeOverridesStore";
import {
  demoNowIso,
  useDemoClockStore,
} from "../../src/state/useDemoClockStore";
import { mockNotificationRepository } from "../../src/repositories/mock/MockNotificationRepository";
import { mockTicketingRepository } from "../../src/repositories/mock/MockTicketingRepository";
import { mockSocialRepository } from "../../src/repositories/mock/MockSocialRepository";
import { queryKeys } from "../../src/state/query-keys";
import { discoveryEvents } from "../../src/fixtures/discovery";
import { TicketStatus } from "../../src/domain/ticketing";
import { EventStatus } from "../../src/domain/events";
import { envConfig } from "../../src/config/env";
import { mockUser } from "../../src/fixtures";
import { theme } from "../../src/design-system/theme";

const EVENT_STATUS_OPTIONS: Exclude<EventStatus, "draft" | "published">[] = [
  "live",
  "sold_out",
  "completed",
  "cancelled",
];

const TICKET_STATUS_OPTIONS: TicketStatus[] = [
  "pending",
  "valid",
  "used",
  "cancelled",
];

export default function PrototypeControlsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [overrideEventId, setOverrideEventId] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const {
    activeMode,
    scenario,
    hasCompletedOnboarding,
    setActiveMode,
    setScenario,
    setOnboardingCompleted,
    resetPrototype,
  } = useAppStore();

  const resetSession = useSessionStore((s) => s.resetSession);
  const resetDiscovery = useDiscoveryStore((s) => s.resetDiscovery);
  const resetMapDiscovery = useMapDiscoveryStore((s) => s.resetMapDiscovery);
  const resetCheckout = useCheckoutStore((s) => s.resetCheckout);
  const resetSocial = useSocialStore((s) => s.resetSocial);
  const resetCreator = useCreatorStore((s) => s.resetCreatorStore);

  const {
    saveFollowFailure,
    commentFailure,
    setSaveFollowFailure,
    setCommentFailure,
  } = usePrototypeControlsStore();

  const { eventStatusOverrides, setEventStatusOverride, clearAllOverrides } =
    usePrototypeOverridesStore();

  const { offsetMs, advanceClock, resetClock } = useDemoClockStore();

  const walletQuery = useQuery({
    queryKey: ["ticketing", "wallet", "prototype-controls"],
    queryFn: () => mockTicketingRepository.listWalletTickets(),
  });
  const walletTickets = walletQuery.data ?? [];
  const selectedTicket = walletTickets.find((t) => t.id === ticketId) ?? null;

  const handleModeSwitch = (mode: "consumer" | "creator") => {
    setActiveMode(mode);
    if (mode === "creator") {
      router.replace("/(creator)/dashboard");
    } else {
      router.replace("/(consumer)/feed");
    }
  };

  const handleSetTicketStatus = async (status: TicketStatus) => {
    if (!ticketId) return;
    await mockTicketingRepository.setTicketStatus(ticketId, status);
    await queryClient.invalidateQueries({ queryKey: queryKeys.ticketing.all });
    await walletQuery.refetch();
  };

  const handleResetAll = async () => {
    resetPrototype();
    resetSession();
    resetDiscovery();
    resetMapDiscovery();
    resetCheckout();
    resetSocial();
    // Creator mode: activation, verification, event draft, dirty state,
    // publish state, filters, payout simulation, content + guest mutations,
    // repository state (resetCreatorStore resets MockCreatorRepository) and
    // the React Query cache below.
    resetCreator();
    usePrototypeControlsStore.getState().resetPrototypeControls();
    usePrototypeOverridesStore.getState().resetPrototypeOverrides();
    useDemoClockStore.getState().resetClock();
    mockNotificationRepository.reset();
    await mockTicketingRepository.reset();
    await mockSocialRepository.reset();
    queryClient.clear();
    setOverrideEventId(null);
    setTicketId(null);
  };

  const scenarios: { key: PrototypeScenario; label: string }[] = [
    { key: "normal", label: "Normal" },
    { key: "sold_out", label: "Sold Out Events" },
    { key: "offline", label: "Offline State" },
    { key: "payment_decline", label: "Payment Decline" },
    { key: "payment_network_error", label: "Payment Network Error" },
    { key: "live_event", label: "Live Event Active" },
    { key: "empty_discovery", label: "Empty Discovery" },
    { key: "discovery_error", label: "Discovery Error" },
    { key: "notifications_disabled", label: "Notifications Disabled" },
    { key: "map_location_disabled", label: "Map Location Disabled" },
    { key: "map_no_results", label: "Map No Results" },
    { key: "wallet_empty", label: "Wallet Empty" },
    { key: "ticketing_error", label: "Ticketing Error" },
  ];

  return (
    <Screen scrollable>
      <Row justify="space-between" align="center" style={styles.topRow}>
        <AppText variant="heading">Prototype Controls</AppText>
        <IconButton
          icon="close"
          onPress={() => router.back()}
          accessibilityLabel="Close controls"
          testID="prototype-controls-close"
          variant="surface"
          size="sm"
        />
      </Row>

      <Stack gap="lg" style={styles.content}>
        {/* Mode Switcher */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Active Operating Mode</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Switch between Consumer and Creator views using the same identity.
            </AppText>
            <Row gap="sm">
              <Chip
                label="Consumer Mode"
                selected={activeMode === "consumer"}
                onPress={() => handleModeSwitch("consumer")}
              />
              <Chip
                label="Creator Mode"
                selected={activeMode === "creator"}
                onPress={() => handleModeSwitch("creator")}
              />
            </Row>
          </Stack>
        </Card>

        {/* Prototype Scenario Controls */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">
              Deterministic Scenario Overrides
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Test deterministic UI states across screens.
            </AppText>
            <Row gap="xs" wrap>
              {scenarios.map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  selected={scenario === item.key}
                  onPress={() => setScenario(item.key)}
                />
              ))}
            </Row>
          </Stack>
        </Card>

        {/* Failure Simulation Toggles */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Failure Simulation Toggles</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Development-only. Save/follow toggles revert optimistically after
              a short delay. Comments fail once per post — turn the toggle off
              and retry to recover.
            </AppText>
            <Row gap="sm" wrap>
              <Chip
                label="Simulate Save/Follow Failure"
                selected={saveFollowFailure}
                onPress={() => setSaveFollowFailure(!saveFollowFailure)}
                testID="controls-save-follow-failure"
              />
              <Chip
                label="Simulate Comment Failure"
                selected={commentFailure}
                onPress={() => setCommentFailure(!commentFailure)}
                testID="controls-comment-failure"
              />
            </Row>
          </Stack>
        </Card>

        {/* Per-Event Status Override */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Event Status Override</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Force one canonical event into a status. Applied across Feed,
              Explore, Search, Map and Event Detail. Overrides win over global
              scenarios.
            </AppText>
            <Row gap="xs" wrap>
              {discoveryEvents.map((event) => (
                <Chip
                  key={event.id}
                  label={event.title}
                  selected={overrideEventId === event.id}
                  onPress={() =>
                    setOverrideEventId(
                      overrideEventId === event.id ? null : event.id,
                    )
                  }
                />
              ))}
            </Row>
            {overrideEventId ? (
              <Stack gap="sm">
                <AppText variant="caption" color={theme.colors.textMuted}>
                  Current override:{" "}
                  {eventStatusOverrides[overrideEventId] ?? "none"}
                </AppText>
                <Row gap="xs" wrap>
                  {EVENT_STATUS_OPTIONS.map((status) => (
                    <Chip
                      key={status}
                      label={status}
                      selected={
                        eventStatusOverrides[overrideEventId] === status
                      }
                      onPress={() =>
                        setEventStatusOverride(overrideEventId, status)
                      }
                      testID={`controls-event-status-${status}`}
                    />
                  ))}
                  <Chip
                    label="Clear"
                    selected={!eventStatusOverrides[overrideEventId]}
                    onPress={() =>
                      setEventStatusOverride(overrideEventId, null)
                    }
                  />
                </Row>
              </Stack>
            ) : null}
            {Object.keys(eventStatusOverrides).length > 0 ? (
              <Chip label="Clear All Overrides" onPress={clearAllOverrides} />
            ) : null}
          </Stack>
        </Card>

        {/* Ticket Status Override */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Ticket Status Override</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Pick a wallet ticket and force its status. The Full Ticket screen
              and wallet classification follow the demo clock and this status.
            </AppText>
            <Row gap="xs" wrap>
              {walletTickets.map((ticket) => (
                <Chip
                  key={ticket.id}
                  label={`${ticket.eventSnapshot.title} (${ticket.status})`}
                  selected={ticketId === ticket.id}
                  onPress={() =>
                    setTicketId(ticketId === ticket.id ? null : ticket.id)
                  }
                />
              ))}
            </Row>
            {selectedTicket ? (
              <Row gap="xs" wrap>
                {TICKET_STATUS_OPTIONS.map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    selected={selectedTicket.status === status}
                    onPress={() => handleSetTicketStatus(status)}
                    testID={`controls-ticket-status-${status}`}
                  />
                ))}
              </Row>
            ) : null}
          </Stack>
        </Card>

        {/* Demo Clock */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Demo Clock</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Advances the fixed prototype clock. Wallet upcoming/past, ticket
              validity and event statuses are classified against it.
            </AppText>
            <AppText variant="body">Demo now: {demoNowIso(offsetMs)}</AppText>
            <Row gap="xs" wrap>
              <Chip
                label="+1 hour"
                onPress={() => advanceClock(60 * 60 * 1000)}
                testID="controls-clock-plus-1h"
              />
              <Chip
                label="+6 hours"
                onPress={() => advanceClock(6 * 60 * 60 * 1000)}
                testID="controls-clock-plus-6h"
              />
              <Chip
                label="+24 hours"
                onPress={() => advanceClock(24 * 60 * 60 * 1000)}
                testID="controls-clock-plus-24h"
              />
              <Chip
                label="Reset"
                selected={offsetMs === 0}
                onPress={resetClock}
                testID="controls-clock-reset"
              />
            </Row>
          </Stack>
        </Card>

        {/* Onboarding State */}
        <Card radius="xl" padding="lg">
          <Stack gap="sm">
            <AppText variant="subheading">Onboarding State</AppText>
            <Row justify="space-between" align="center">
              <AppText variant="body" color={theme.colors.textSecondary}>
                Status: {hasCompletedOnboarding ? "Completed" : "Incomplete"}
              </AppText>
              <Chip
                label={
                  hasCompletedOnboarding
                    ? "Reset Onboarding"
                    : "Complete Onboarding"
                }
                onPress={() => setOnboardingCompleted(!hasCompletedOnboarding)}
              />
            </Row>
          </Stack>
        </Card>

        {/* Active Identity Info */}
        <Card radius="xl" padding="lg">
          <Stack gap="xs">
            <AppText variant="subheading">Active Fixture Identity</AppText>
            <AppText variant="body">
              {mockUser.profile.displayName} (@{mockUser.profile.handle})
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Email: {mockUser.email} • ID: {mockUser.id}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Location: {mockUser.profile.city}, {mockUser.profile.country}
            </AppText>
          </Stack>
        </Card>

        {/* Environment & Build Info */}
        <Card radius="xl" padding="lg">
          <Stack gap="xs">
            <AppText variant="subheading">App & Environment Info</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              App Name: {envConfig.appName} ({envConfig.appVersion})
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Environment: {envConfig.environment} • Latency:{" "}
              {envConfig.mockApiLatencyMs}ms
            </AppText>
          </Stack>
        </Card>

        {/* Component Preview Navigation */}
        <AppButton
          label="Open Component Preview Library"
          onPress={() => router.push("/(modals)/component-preview")}
          variant="secondary"
          leftIcon="sparkles"
          fullWidth
        />

        <Divider />

        {/* Reset Prototype */}
        <AppButton
          label="Reset All Prototype State"
          onPress={handleResetAll}
          variant="danger"
          fullWidth
        />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingVertical: theme.spacing.md,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
  },
});
