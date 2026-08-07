/**
 * Instruction 7 — Event Detail registration/ownership state
 *
 * Verifies that after a session-created booking the Event Detail conversion
 * becomes "View your pass / View your ticket" (preventing repeated
 * registration), seeded wallet history is unchanged, and the inquiry entry
 * resolves through the new-message modal when the host has no open inquiry.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EventDetailScreen from "../../app/(consumer)/events/[eventId]";
import { mockTicketingRepository } from "../../src/repositories/mock/MockTicketingRepository";
import { mockSocialRepository } from "../../src/repositories/mock/MockSocialRepository";
import { useAppStore } from "../../src/state/useAppStore";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { useCheckoutStore } from "../../src/state/useCheckoutStore";
import { useDemoClockStore } from "../../src/state/useDemoClockStore";
import { buildCheckoutQuote } from "../../src/domain/ticketing/quote";
import {
  freeRegistrationTiers,
  midnightGroovesTiers,
} from "../../src/fixtures/event-detail/ticket-tiers";

const mockPush = jest.fn();
const mockBack = jest.fn();

let mockParams: any = { eventId: "evt-soweto-food-market" };

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

describe("Event Detail registration state", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await mockTicketingRepository.reset();
    await mockSocialRepository.reset();
    useAppStore.getState().setScenario("normal");
    useDiscoveryStore.getState().resetDiscovery();
    useCheckoutStore.getState().resetCheckout();
    useDemoClockStore.getState().resetClock();
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("shows Register free before registration and View your pass after free registration", async () => {
    mockParams = { eventId: "evt-soweto-food-market" };

    const before = render(
      <QueryClientProvider client={queryClient}>
        <EventDetailScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(before.getByText("Register free")).toBeTruthy();
    });
    before.unmount();

    await mockTicketingRepository.createFreeRegistration({
      registrationId: "registration-e2e-001",
      eventId: "evt-soweto-food-market",
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote: buildCheckoutQuote(
        "evt-soweto-food-market",
        freeRegistrationTiers,
        { [freeRegistrationTiers[0].id]: 1 },
      ),
    });

    const after = render(
      <QueryClientProvider client={queryClient}>
        <EventDetailScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(after.getByText("View your pass")).toBeTruthy();
    });

    fireEvent.press(after.getByTestId("event-primary-action"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("tickets/[ticketId]"),
        }),
      );
    });
  });

  it("shows Choose tickets before payment and View your ticket after paid checkout", async () => {
    mockParams = { eventId: "evt-midnight-grooves" };

    const before = render(
      <QueryClientProvider client={queryClient}>
        <EventDetailScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(before.getByText("Choose tickets")).toBeTruthy();
    });
    before.unmount();

    const quote = buildCheckoutQuote(
      "evt-midnight-grooves",
      midnightGroovesTiers,
      { [midnightGroovesTiers[0].id]: 1 },
    );
    const attempt = await mockTicketingRepository.simulatePayment({
      attemptId: "attempt-e2e-001",
      eventId: "evt-midnight-grooves",
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "normal",
    });
    expect(attempt.status).toBe("paid");

    const after = render(
      <QueryClientProvider client={queryClient}>
        <EventDetailScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(after.getByText("View your ticket")).toBeTruthy();
    });

    fireEvent.press(after.getByTestId("event-primary-action"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("tickets/[ticketId]"),
        }),
      );
    });
  });

  it("does not treat seeded wallet history as a session booking", async () => {
    mockParams = { eventId: "evt-soweto-food-market" };

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <EventDetailScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Register free")).toBeTruthy();
    });
  });

  it("opens the new-message modal from Ask about this event when the host has no open inquiry", async () => {
    mockParams = { eventId: "evt-soweto-food-market" };

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <EventDetailScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("event-detail-ask-question")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("event-detail-ask-question"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("new-message"),
        }),
      );
    });
  });
});
