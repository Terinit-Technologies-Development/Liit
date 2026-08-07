/**
 * Instruction 7 — Notification persistence and deep-link navigation
 *
 * Verifies that consumer notifications persist across repository instances,
 * that booking actions record notifications with monotonic ids, and that
 * notification rows navigate to the correct event / host / message / tickets
 * context.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationsScreen from "../../app/(consumer)/notifications";
import { MockNotificationRepository } from "../../src/repositories/mock/MockNotificationRepository";
import { mockNotificationRepository } from "../../src/repositories/mock/MockNotificationRepository";
import { useAppStore } from "../../src/state/useAppStore";
import { useDemoClockStore } from "../../src/state/useDemoClockStore";

const mockPush = jest.fn();
const mockBack = jest.fn();

let mockParams: any = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
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

async function listAll(
  repo: MockNotificationRepository,
): Promise<any[]> {
  return repo.list("all", { latencyMs: 0 });
}

describe("Notification persistence", () => {
  beforeEach(async () => {
    await new MockNotificationRepository().reset();
    useDemoClockStore.getState().resetClock();
    useAppStore.getState().setScenario("normal");
    mockPush.mockClear();
  });

  it("records a ticket confirmation notification and persists it to a fresh repository instance", async () => {
    const first = new MockNotificationRepository();
    await first.reset();

    const item = await first.recordTicketConfirmed({
      eventId: "evt-midnight-grooves",
      eventTitle: "Midnight Kinetic Grooves",
      orderId: "order-liit-0010",
      ticketId: "ticket-liit-0010",
      eventImageKey: "eventMidnightGrooves",
    });

    expect(item.type).toBe("ticket_confirmed");
    expect(item.readState).toBe("unread");
    expect(item.target).toEqual({ kind: "tickets" });
    expect(item.id).toBe("notif-7");

    const second = new MockNotificationRepository();
    const all = await listAll(second);
    expect(all.some((n) => n.id === "notif-7")).toBe(true);
  });

  it("records a registration confirmation notification with a monotonic id", async () => {
    const repo = new MockNotificationRepository();
    await repo.reset();

    await repo.recordRegistrationConfirmed({
      eventId: "evt-soweto-food-market",
      eventTitle: "Soweto Street Food & Craft Market",
      orderId: "order-liit-0011",
      eventImageKey: "eventSowetoFoodMarket",
    });
    await repo.recordTicketConfirmed({
      eventId: "evt-rosebank-art-jazz",
      eventTitle: "Rosebank Art & Jazz Lounge",
      orderId: "order-liit-0012",
    });

    const all = await listAll(repo);
    const ids = all.map((n) => n.id);
    expect(ids[0]).toBe("notif-8");
    expect(ids[1]).toBe("notif-7");
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("persists mark-all-read across repository instances", async () => {
    const first = new MockNotificationRepository();
    await first.reset();
    await first.markAllRead();

    const second = new MockNotificationRepository();
    const all = await listAll(second);
    expect(all.every((n) => n.readState === "read")).toBe(true);
  });

  it("resets the notification list to the fixture seed", async () => {
    const repo = new MockNotificationRepository();
    await repo.reset();
    await repo.recordTicketConfirmed({
      eventId: "evt-midnight-grooves",
      eventTitle: "Midnight Kinetic Grooves",
      orderId: "order-liit-0010",
    });
    await repo.reset();

    const all = await listAll(repo);
    expect(all.map((n) => n.id).sort()).toEqual([
      "notif-1",
      "notif-2",
      "notif-3",
      "notif-4",
      "notif-5",
      "notif-6",
    ]);
  });
});

describe("Notification deep-link navigation", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockParams = {};
    await new MockNotificationRepository().reset();
    useDemoClockStore.getState().resetClock();
    useAppStore.getState().setScenario("normal");
    mockPush.mockClear();
  });

  it("routes a tickets-target notification to the wallet", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmed! 🎉")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Booking Confirmed! 🎉"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("tickets"),
      );
    });
  });

  it("routes an event-target notification to the event detail", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Starting in 1 Hour")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Starting in 1 Hour"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("events/[eventId]"),
          params: expect.objectContaining({
            eventId: "evt-deep-house-rooftop",
          }),
        }),
      );
    });
  });

  it("routes a host-target notification to the host profile", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Groove Co. posted an update"),
      ).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Groove Co. posted an update"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("hosts/[hostId]"),
          params: expect.objectContaining({ hostId: "host-groove-co" }),
        }),
      );
    });
  });

  it("routes a message-target notification to the inquiry thread", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("New message from Club Vibez"),
      ).toBeTruthy();
    });

    fireEvent.press(screen.getByText("New message from Club Vibez"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("inquiries/[conversationId]"),
          params: expect.objectContaining({
            conversationId: "conv-inquiry-club-vibez",
          }),
        }),
      );
    });
  });

  it("marks a notification read when tapped", async () => {
    await mockNotificationRepository.reset();

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Starting in 1 Hour")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Starting in 1 Hour"));

    await waitFor(async () => {
      const all = await listAll(mockNotificationRepository);
      const notif2 = all.find((n) => n.id === "notif-2");
      expect(notif2?.readState).toBe("read");
    });
  });
});
