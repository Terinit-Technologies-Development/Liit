import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreatorNotifications from "../../app/(creator)/notifications";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Notifications Behaviour", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockPush.mockClear();
  });

  const renderNotifications = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <CreatorNotifications />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders all notifications with unread markers", async () => {
    const screen = renderNotifications();
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Ticket Purchased/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText(/New Host Follower/i)).toBeTruthy();
    expect(screen.getByText(/Monthly Payout Scheduled/i)).toBeTruthy();
  });

  it("filters by Sales category", async () => {
    const screen = renderNotifications();
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Ticket Purchased/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
    fireEvent.press(screen.getByText("Sales"));
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Ticket Purchased/i)).toBeTruthy();
        expect(screen.queryByText(/New Host Follower/i)).toBeNull();
      },
      { timeout: 10000 },
    );
  });

  it("mark one read updates repository state and refreshes the filtered cache", async () => {
    const screen = renderNotifications();
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Ticket Purchased/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );

    fireEvent.press(screen.getByText(/VIP Ticket Purchased/i));
    await waitFor(
      async () => {
        const state =
          await mockCreatorRepository.getCreatorNotifications("sales");
        expect(state.find((n) => n.id === "cnotif-1")?.isRead).toBe(true);
      },
      { timeout: 10000 },
    );
  });

  it("mark all read updates every category cache (root-key family invalidation)", async () => {
    const screen = renderNotifications();
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Ticket Purchased/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );

    fireEvent.press(screen.getByText("Mark All Read"));
    await waitFor(
      async () => {
        const all = await mockCreatorRepository.getCreatorNotifications("all");
        expect(all.every((n) => n.isRead)).toBe(true);
        const sales =
          await mockCreatorRepository.getCreatorNotifications("sales");
        expect(sales.every((n) => n.isRead)).toBe(true);
      },
      { timeout: 10000 },
    );
  });

  it("recovers from a simulated error via Retry", async () => {
    mockCreatorRepository.simulateErrorFor("notifications", true);
    const screen = renderNotifications();
    await waitFor(
      () => {
        expect(screen.getByText("Notifications Unavailable")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    mockCreatorRepository.simulateErrorFor("notifications", false);
    fireEvent.press(screen.getByTestId("notifications-retry-button"));
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Ticket Purchased/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });
});
