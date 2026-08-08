/**
 * Instruction 7 corrective pass (rendered) — cached override refresh,
 * compact Search card save with shared Profile state and failure revert,
 * and ticket-specific notification deep links.
 */

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationsScreen from "../../app/(consumer)/notifications";
import SearchScreen from "../../app/(consumer)/search";
import { EventCard } from "../components/discovery/EventCard";
import { mockNotificationRepository } from "../repositories/mock/MockNotificationRepository";
import {
  invalidateEventOverrideQueries,
  usePrototypeOverridesStore,
} from "../state/usePrototypeOverridesStore";
import { useDiscoveryStore } from "../state/useDiscoveryStore";
import { usePrototypeControlsStore } from "../state/usePrototypeControlsStore";
import { useAppStore } from "../state/useAppStore";
import { useToast } from "../hooks/useToast";
import { useSaveFollowActions } from "../hooks/useSaveFollowActions";
import { useDemoNowIso } from "../hooks/useDemoNowIso";
import { getEventDisplayStatus } from "../domain/discovery/event-presentation";
import { useFeedQuery } from "../hooks/discovery/useFeedQuery";
import { discoveryEvents } from "../fixtures/discovery";
import { Event } from "../domain/events";
import { FeedEntry, FeedMode } from "../domain/discovery";

const mockPush = jest.fn();
const mockBack = jest.fn();

let mockParams: any = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockBack }),
  useNavigation: () => ({ getParent: () => ({ setOptions: jest.fn() }) }),
  useFocusEffect: (cb: any) => {
    const React = require("react");
    React.useEffect(() => {
      const cleanup = cb();
      return () => {
        if (cleanup) cleanup();
      };
    }, [cb]);
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function resetState() {
  useDiscoveryStore.getState().resetDiscovery();
  usePrototypeControlsStore.getState().resetPrototypeControls();
  usePrototypeOverridesStore.getState().resetPrototypeOverrides();
  useAppStore.getState().resetPrototype();
  useToast.getState().hideToast();
}

describe("Override cache invalidation refreshes rendered queries", () => {
  let queryClient: QueryClient;

  function FeedStatusHarness() {
    const feedQuery = useFeedQuery("all" as FeedMode);
    const nowIso = useDemoNowIso();
    const events = (feedQuery.data?.items ?? [])
      .filter((entry: FeedEntry) => entry.kind === "event")
      .map((entry: FeedEntry) => (entry as { event: Event }).event);
    return (
      <>
        {events.map((event: Event) => (
          <Text key={event.id} testID={`feed-status-${event.id}`}>
            {getEventDisplayStatus(event, nowIso)}
          </Text>
        ))}
      </>
    );
  }

  beforeEach(() => {
    resetState();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 5 * 60 * 1000,
          gcTime: Infinity,
        },
      },
    });
  });

  it("refreshes a previously cached feed query immediately after an override", async () => {
    const target = "evt-midnight-grooves";
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FeedStatusHarness />
      </QueryClientProvider>,
    );

    // Prime the cache: the feed renders with the fixture-derived status.
    await waitFor(() => {
      expect(screen.getByTestId(`feed-status-${target}`)).toBeTruthy();
    });
    const original = screen.getByTestId(`feed-status-${target}`).props
      .children as string;
    expect(original).toBe("Selling Fast");

    // Setting an override must refresh the cached query without remount.
    act(() => {
      usePrototypeOverridesStore
        .getState()
        .setEventStatusOverride(target, "cancelled");
    });
    await act(async () => {
      await invalidateEventOverrideQueries(queryClient);
    });

    await waitFor(() => {
      expect(screen.getByTestId(`feed-status-${target}`).props.children).toBe(
        "Cancelled",
      );
    });

    // Clearing the override restores the derived status through the cache.
    act(() => {
      usePrototypeOverridesStore
        .getState()
        .setEventStatusOverride(target, null);
    });
    await act(async () => {
      await invalidateEventOverrideQueries(queryClient);
    });

    await waitFor(() => {
      expect(screen.getByTestId(`feed-status-${target}`).props.children).toBe(
        original,
      );
    });
  });

  it("refreshes cached discovery results after clearing all overrides", async () => {
    const target = "evt-deep-house-rooftop";
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride(target, "live");

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FeedStatusHarness />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`feed-status-${target}`).props.children).toBe(
        "Live",
      );
    });

    act(() => {
      usePrototypeOverridesStore.getState().clearAllOverrides();
    });
    await act(async () => {
      await invalidateEventOverrideQueries(queryClient);
    });

    await waitFor(() => {
      expect(screen.getByTestId(`feed-status-${target}`).props.children).toBe(
        "Sold Out",
      );
    });
  });
});

describe("Compact Search card save", () => {
  beforeEach(async () => {
    resetState();
    mockPush.mockClear();
    mockBack.mockClear();
    mockParams = { q: "rosebank", tab: "events" };
    await mockNotificationRepository.reset();
  });

  it("saves from the compact card without navigating and reflects in Profile Saved state", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <SearchScreen />
      </QueryClientProvider>,
    );

    const saveButton = await screen.findByTestId(
      "search-event-save-evt-rosebank-art-jazz",
    );

    expect(saveButton.props.accessibilityLabel).toContain("Save");
    expect(saveButton.props.accessibilityState?.selected).toBe(false);

    fireEvent.press(saveButton);

    // Optimistic saved state is shared with Profile (same discovery store).
    expect(
      useDiscoveryStore.getState().savedEventIds,
    ).toContain("evt-rosebank-art-jazz");
    expect(screen.getByTestId("search-event-save-evt-rosebank-art-jazz").props
      .accessibilityState?.selected).toBe(true);

    // Pressing save must not trigger card navigation.
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("reverts the compact save when save/follow failure is simulated", async () => {
    jest.useFakeTimers();
    usePrototypeControlsStore.getState().setSaveFollowFailure(true);

    function CompactSaveHarness() {
      const { toggleSaved } = useSaveFollowActions();
      const savedEventIds = useDiscoveryStore((state) => state.savedEventIds);
      const event = discoveryEvents.find(
        (e) => e.id === "evt-rosebank-art-jazz",
      )!;
      return (
        <>
          <EventCard
            event={event}
            variant="compact"
            nowIso="2026-07-30T20:00:00.000Z"
            isSaved={savedEventIds.includes(event.id)}
            onPress={jest.fn()}
            onSave={() => toggleSaved(event.id)}
            saveTestID={`search-event-save-${event.id}`}
          />
          <Pressable testID="probe" accessibilityLabel="probe">
            <Text>probe</Text>
          </Pressable>
        </>
      );
    }

    const screen = render(<CompactSaveHarness />);

    act(() => {
      fireEvent.press(screen.getByTestId("search-event-save-evt-rosebank-art-jazz"));
    });

    expect(
      screen.getByTestId("search-event-save-evt-rosebank-art-jazz").props
        .accessibilityState?.selected,
    ).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(
      screen.getByTestId("search-event-save-evt-rosebank-art-jazz").props
        .accessibilityState?.selected,
    ).toBe(false);

    const toast = useToast.getState().toast;
    expect(toast?.type).toBe("error");
    expect(toast?.title).toContain("Could not save");
    jest.useRealTimers();
  });
});

describe("Ticket-specific notification deep link", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    resetState();
    mockPush.mockClear();
    mockParams = {};
    await mockNotificationRepository.reset();
  });

  it("routes a ticket-target notification to the Full Ticket screen", async () => {
    await mockNotificationRepository.recordTicketConfirmed({
      eventId: "evt-midnight-grooves",
      eventTitle: "Midnight Kinetic Grooves",
      orderId: "order-liit-0010",
      ticketId: "ticket-liit-0010",
      eventImageKey: "eventMidnightGrooves",
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tickets confirmed")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Tickets confirmed"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("tickets/[ticketId]"),
          params: expect.objectContaining({
            ticketId: "ticket-liit-0010",
          }),
        }),
      );
    });
  });

  it("keeps the generic wallet target for notifications without a ticket id", async () => {
    await mockNotificationRepository.recordTicketConfirmed({
      eventId: "evt-midnight-grooves",
      eventTitle: "Midnight Kinetic Grooves",
      orderId: "order-liit-0010",
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Tickets confirmed")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Tickets confirmed"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("tickets"),
      );
    });
  });
});
