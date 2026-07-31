import React from "react";
import { render } from "@testing-library/react-native";
import CheckoutResultScreen from "../../app/(consumer)/checkout/[eventId]/result";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let mockParams: Record<string, string | undefined> = {
  result: "paid_success",
  eventId: "evt-midnight-grooves",
  orderId: "order-liit-seed-0001",
  ticketId: "t-123",
};

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock("../hooks/ticketing/useOrderQuery", () => ({
  useOrderQuery: jest.fn((id?: string) => ({
    data:
      id === "order-liit-seed-0002"
        ? {
            id,
            eventId: "evt-soweto-food-market",
            attendeeId: "usr-1",
            attendeeName: "Keketso",
            status: "free_confirmed",
            source: "free_registration",
            quote: {
              eventId: "evt-soweto-food-market",
              totalQuantity: 1,
              subtotalMinor: 0,
              serviceFeeMinor: 0,
              totalMinor: 0,
              currency: "ZAR",
              lines: [],
            },
            createdAt: "2026-07-28T10:00:00.000Z",
            ticketIds: ["t-456"],
          }
        : id === "order-mismatched"
          ? {
              id,
              eventId: "evt-different-event",
              attendeeId: "usr-1",
              attendeeName: "Keketso",
              status: "paid",
              source: "paid",
              quote: {
                eventId: "evt-different-event",
                totalQuantity: 1,
                subtotalMinor: 10000,
                serviceFeeMinor: 500,
                totalMinor: 10500,
                currency: "ZAR",
                lines: [],
              },
              createdAt: "2026-07-28T10:00:00.000Z",
              ticketIds: ["t-999"],
            }
          : id
            ? {
                id,
                eventId: "evt-midnight-grooves",
                attendeeId: "usr-1",
                attendeeName: "Keketso",
                status: "paid",
                source: "paid",
                quote: {
                  eventId: "evt-midnight-grooves",
                  totalQuantity: 1,
                  subtotalMinor: 10000,
                  serviceFeeMinor: 500,
                  totalMinor: 10500,
                  currency: "ZAR",
                  lines: [],
                },
                createdAt: "2026-07-28T10:00:00.000Z",
                ticketIds: ["t-123"],
              }
            : null,
    isLoading: false,
    isError: false,
  })),
}));

jest.mock("../hooks/events/useEventDetailQuery", () => ({
  useEventDetailQuery: jest.fn((id?: string) => ({
    data: id
      ? {
          event: {
            id,
            title:
              id === "evt-soweto-food-market"
                ? "Soweto Street Food Market"
                : "Midnight Grooves",
            venue: { name: "Braamfontein Rooftop", suburb: "Braamfontein" },
          },
        }
      : null,
    isLoading: false,
    isError: false,
  })),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("CheckoutResultScreen Rendered Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("paid_success: shows 'Tickets confirmed!', View my ticket button, Go to Wallet button", () => {
    mockParams = {
      result: "paid_success",
      eventId: "evt-midnight-grooves",
      orderId: "order-liit-seed-0001",
      ticketId: "t-123",
    };
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutResultScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Tickets confirmed!")).toBeTruthy();
    expect(screen.getByText("View my ticket")).toBeTruthy();
    expect(screen.getByText("Go to Wallet")).toBeTruthy();
  });

  it("free_success: shows 'Registration confirmed!', View Registration / Go to Wallet", () => {
    mockParams = {
      result: "free_success",
      eventId: "evt-soweto-food-market",
      orderId: "order-liit-seed-0002",
      ticketId: "t-456",
    };
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutResultScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Registration confirmed!")).toBeTruthy();
    expect(screen.getByText("View Registration Pass")).toBeTruthy();
    expect(screen.getByText("Go to Wallet")).toBeTruthy();
  });

  it("declined: shows 'Payment declined', Try again and Change payment method buttons", () => {
    mockParams = {
      result: "declined",
      eventId: "evt-midnight-grooves",
    };
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutResultScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Payment declined")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
    expect(screen.getByText("Change payment method")).toBeTruthy();
  });

  it("network_error: shows 'Something went wrong', Retry and Return to Event buttons", () => {
    mockParams = {
      result: "network_error",
      eventId: "evt-midnight-grooves",
    };
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutResultScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Retry")).toBeTruthy();
    expect(screen.getByText("Return to Event")).toBeTruthy();
  });

  it("invalid result param (missing/garbage): must NOT show success text", () => {
    mockParams = {
      result: "garbage_param",
      eventId: "evt-midnight-grooves",
    };
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutResultScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Invalid confirmation")).toBeTruthy();
    expect(screen.queryByText("Tickets confirmed!")).toBeNull();
    expect(screen.queryByText("Registration confirmed!")).toBeNull();
  });

  it("mismatched order and event ID: rejects confirmation and displays error state", () => {
    mockParams = {
      result: "paid_success",
      eventId: "evt-midnight-grooves",
      orderId: "order-mismatched",
    };
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutResultScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("result-order-mismatch")).toBeTruthy();
    expect(screen.getByText("Confirmation unavailable")).toBeTruthy();
    expect(
      screen.getByText(
        "This order does not match the requested event or confirmation type.",
      ),
    ).toBeTruthy();
  });
});
