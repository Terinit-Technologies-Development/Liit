import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EventAnalyticsScreen from "../../app/(creator)/events/[eventId]/analytics";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockBack = jest.fn();
let mockParams: Record<string, string> = { eventId: "evt-midnight-grooves" };

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Analytics States & Invalid IDs", () => {
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

  const renderAnalytics = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <EventAnalyticsScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders populated analytics for a known event", async () => {
    const screen = renderAnalytics();
    await waitFor(
      () => {
        expect(screen.getByText(/Key Performance Indicators/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText("1,250")).toBeTruthy();
    expect(screen.getByText(/Ticket Sales Over Time/i)).toBeTruthy();
  });

  it("does NOT fabricate zero analytics for an unknown Event — shows Event Not Found", async () => {
    mockParams = { eventId: "evt-does-not-exist" };
    const screen = renderAnalytics();
    await waitFor(
      () => {
        expect(screen.getByText("Event Not Found")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    const analytics =
      await mockCreatorRepository.getEventAnalytics("evt-does-not-exist");
    expect(analytics).toBeNull();
  });

  it("shows No Analytics Yet for a known event without recorded metrics", async () => {
    mockParams = { eventId: "evt-soweto-food-market" };
    const screen = renderAnalytics();
    await waitFor(
      () => {
        expect(screen.getByText("No Analytics Yet")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it("recovers from a simulated analytics error via Retry", async () => {
    mockCreatorRepository.simulateErrorFor("analytics", true);
    const screen = renderAnalytics();
    await waitFor(
      () => {
        expect(screen.getByText("Analytics Unavailable")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    mockCreatorRepository.simulateErrorFor("analytics", false);
    fireEvent.press(screen.getByTestId("analytics-retry-button"));
    await waitFor(
      () => {
        expect(screen.getByText(/Key Performance Indicators/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });
});
