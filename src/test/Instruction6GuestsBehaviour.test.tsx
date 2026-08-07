import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EventGuestsScreen from "../../app/(creator)/events/[eventId]/guests";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";
import { toJohannesburgIso } from "../utils/johannesburg";

const mockBack = jest.fn();
let mockParams: Record<string, string> = { eventId: "evt-midnight-grooves" };

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Guest Roster Behaviour", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockBack.mockClear();
    mockParams = { eventId: "evt-midnight-grooves" };
  });

  const renderGuests = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <EventGuestsScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders the populated roster after async query hydration", async () => {
    const screen = renderGuests();
    await waitFor(
      () => {
        expect(screen.getByText("Sibusiso Dlamini")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText("Kagiso Molefe")).toBeTruthy();
    expect(screen.getAllByText("Checked In").length).toBeGreaterThanOrEqual(1);
  });

  it("filters by status and search", async () => {
    const screen = renderGuests();
    await waitFor(
      () => {
        expect(screen.getByText("Sibusiso Dlamini")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    fireEvent.press(screen.getByText("Pending"));
    await waitFor(
      () => {
        expect(screen.getByText("Zanele Khumalo")).toBeTruthy();
        expect(screen.queryByText("Sibusiso Dlamini")).toBeNull();
      },
      { timeout: 10000 },
    );

    fireEvent.press(screen.getByText("All"));
    fireEvent.changeText(
      screen.getByPlaceholderText(/Search guest name or reference/i),
      "LIIT-REF-9905",
    );
    await waitFor(
      () => {
        expect(screen.getByText("Tshepo Maseko")).toBeTruthy();
        expect(screen.queryByText("Sibusiso Dlamini")).toBeNull();
      },
      { timeout: 10000 },
    );
  });

  it("check-in toggles repository state and refreshes filtered queries", async () => {
    const screen = renderGuests();
    await waitFor(
      () => {
        expect(screen.getByText("Lerato Kgosi")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    fireEvent.press(screen.getByTestId("check-in-gst-003"));
    await waitFor(
      () => {
        expect(screen.getAllByText("Checked In").length).toBeGreaterThanOrEqual(
          3,
        );
      },
      { timeout: 10000 },
    );
    const roster = await mockCreatorRepository.getEventGuests(
      "evt-midnight-grooves",
    );
    expect(roster.find((g) => g.id === "gst-003")?.checkInStatus).toBe(
      "checked_in",
    );
  });

  it("shows a filtered-no-results empty state", async () => {
    const screen = renderGuests();
    await waitFor(
      () => {
        expect(screen.getByText("Sibusiso Dlamini")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(/Search guest name or reference/i),
      "zzz-no-match",
    );
    await waitFor(
      () => {
        expect(screen.getByText(/No guests match/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it("shows an invalid Event state for unknown event IDs", async () => {
    mockParams = { eventId: "evt-does-not-exist" };
    const screen = renderGuests();
    await waitFor(
      () => {
        expect(screen.getByText("Event Not Found")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it("shows the Event Has Not Started state for a future-scheduled event", async () => {
    await mockCreatorRepository.saveEventDraft({
      event: {
        id: "evt-future-draft",
        title: "Future Draft Event",
        tagline: "",
        description: "A future event.",
        category: "music",
        status: "draft",
        host: {
          id: "host-groove-co",
          name: "Groove Co. Johannesburg",
          handle: "@grooveco",
          avatarUrl: "",
          isVerified: true,
        },
        venue: {
          id: "ven-1",
          name: "Test Venue",
          address: "",
          suburb: "Braamfontein",
          city: "Johannesburg",
          province: "Gauteng",
          latitude: 0,
          longitude: 0,
        },
        occurrence: {
          id: "occ-future",
          startTime: toJohannesburgIso("2027-01-15", "18:00"),
          endTime: toJohannesburgIso("2027-01-16", "02:00"),
          doorsOpen: "18:00",
        },
        startingPriceMinor: 0,
        currency: "ZAR",
        totalCapacity: 10,
        remainingTickets: 10,
      },
      operationalStatus: "draft",
    });
    mockParams = { eventId: "evt-future-draft" };
    const screen = renderGuests();
    await waitFor(
      () => {
        expect(screen.getByText("Event Has Not Started")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it("recovers from a simulated error via Retry", async () => {
    mockCreatorRepository.simulateErrorFor("guests", true);
    const screen = renderGuests();
    await waitFor(
      () => {
        expect(screen.getByText("Guest Roster Unavailable")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    mockCreatorRepository.simulateErrorFor("guests", false);
    fireEvent.press(screen.getByTestId("guests-retry-button"));
    await waitFor(
      () => {
        expect(screen.getByText("Sibusiso Dlamini")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });
});
