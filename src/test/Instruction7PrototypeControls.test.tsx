/**
 * Instruction 7 — Prototype Controls surface
 *
 * Verifies the development-only controls: failure toggles, per-event status
 * overrides, ticket status overrides, demo clock advances, and Reset All.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrototypeControlsScreen from "../../app/(modals)/prototype-controls";
import { usePrototypeControlsStore } from "../../src/state/usePrototypeControlsStore";
import { usePrototypeOverridesStore } from "../../src/state/usePrototypeOverridesStore";
import { useDemoClockStore } from "../../src/state/useDemoClockStore";
import { mockTicketingRepository } from "../../src/repositories/mock/MockTicketingRepository";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  }),
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
  useLocalSearchParams: () => ({}),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Prototype Controls", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    usePrototypeControlsStore.getState().resetPrototypeControls();
    usePrototypeOverridesStore.getState().resetPrototypeOverrides();
    useDemoClockStore.getState().resetClock();
    await mockTicketingRepository.reset();
    mockPush.mockClear();
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("toggles the save/follow failure simulation", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <PrototypeControlsScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByTestId("controls-save-follow-failure"));

    await waitFor(() => {
      expect(
        usePrototypeControlsStore.getState().saveFollowFailure,
      ).toBe(true);
    });
  });

  it("toggles the comment failure simulation", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <PrototypeControlsScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByTestId("controls-comment-failure"));

    await waitFor(() => {
      expect(usePrototypeControlsStore.getState().commentFailure).toBe(true);
    });
  });

  it("applies and clears a per-event status override", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <PrototypeControlsScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByText("Midnight Kinetic Grooves"));

    await waitFor(() => {
      expect(screen.getByTestId("controls-event-status-cancelled")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("controls-event-status-cancelled"));

    await waitFor(() => {
      expect(
        usePrototypeOverridesStore.getState().eventStatusOverrides[
          "evt-midnight-grooves"
        ],
      ).toBe("cancelled");
    });

    fireEvent.press(screen.getByText("Clear"));
    await waitFor(() => {
      expect(
        usePrototypeOverridesStore.getState().eventStatusOverrides[
          "evt-midnight-grooves"
        ],
      ).toBeUndefined();
    });
  });

  it("advances and resets the demo clock", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <PrototypeControlsScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByTestId("controls-clock-plus-1h"));

    await waitFor(() => {
      expect(useDemoClockStore.getState().offsetMs).toBe(3600000);
    });

    fireEvent.press(screen.getByTestId("controls-clock-reset"));

    await waitFor(() => {
      expect(useDemoClockStore.getState().offsetMs).toBe(0);
    });
  });

  it("sets a wallet ticket status through the repository", async () => {
    const seedTickets = await mockTicketingRepository.listWalletTickets();
    expect(seedTickets.length).toBeGreaterThan(0);
    const seedId = seedTickets[0].id;

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <PrototypeControlsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Midnight Grooves (valid)")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Midnight Grooves (valid)"));

    await waitFor(() => {
      expect(screen.getByTestId("controls-ticket-status-used")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("controls-ticket-status-used"));

    await waitFor(async () => {
      const ticket = await mockTicketingRepository.getTicket(seedId);
      expect(ticket?.status).toBe("used");
    });
  });
});
