import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EventOpsHub from "../../app/(creator)/events/[eventId]";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockReplace = jest.fn();
let mockParams: Record<string, string> = { eventId: "evt-midnight-grooves" };

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Event Operations Hub States", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockReplace.mockClear();
    mockParams = { eventId: "evt-midnight-grooves" };
  });

  const renderOpsHub = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <EventOpsHub />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders the populated Operations Hub for a known event", async () => {
    const screen = renderOpsHub();
    await waitFor(
      () => {
        expect(screen.getByText("Operations Hub")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText(/Analytics & Performance/i)).toBeTruthy();
    expect(screen.getByText(/Guest Roster & Check-In/i)).toBeTruthy();
    expect(screen.getByText(/Content & Announcements/i)).toBeTruthy();
  });

  it("shows the invalid Event state for unknown event IDs with a return action", async () => {
    mockParams = { eventId: "evt-does-not-exist" };
    const screen = renderOpsHub();
    await waitFor(
      () => {
        expect(screen.getByText("Event Operations Unavailable")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(
      screen.getByText(/Unable to load operations for event ID/i),
    ).toBeTruthy();

    const projection =
      await mockCreatorRepository.getCreatorEvent("evt-does-not-exist");
    expect(projection).toBeNull();
  });
});
