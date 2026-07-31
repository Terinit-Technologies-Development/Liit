import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CheckoutTicketsScreen from "../../app/(consumer)/checkout/[eventId]/tickets";
import { useCheckoutStore } from "../state/useCheckoutStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
  }),
  useLocalSearchParams: () => ({
    eventId: "evt-midnight-grooves",
  }),
}));

jest.mock("../hooks/events/useEventDetailQuery", () => {
  const { eventDetailById } = require("../fixtures/event-detail/details");
  const { discoveryEvents } = require("../fixtures/discovery/events");
  return {
    useEventDetailQuery: jest.fn((id: string) => {
      const payload = eventDetailById[id];
      const event = discoveryEvents.find((e: any) => e.id === id);
      return {
        data: payload && event ? { ...payload, event } : null,
        isLoading: false,
      };
    }),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("CheckoutTicketsScreen Rendered Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    useCheckoutStore.getState().clearCheckout();
    mockBack.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("renders tier selectors for a paid event", () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutTicketsScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Select Tickets")).toBeTruthy();
    const continueBtn = screen.getByTestId("checkout-tickets-continue");
    expect(continueBtn).toBeTruthy();
  });

  it("disables continue button when no quantity is selected", () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutTicketsScreen />
      </QueryClientProvider>,
    );

    const continueBtn = screen.getByTestId("checkout-tickets-continue");
    expect(continueBtn.props.accessibilityState.disabled).toBe(true);
  });

  it("enables continue button when a tier is incremented", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutTicketsScreen />
      </QueryClientProvider>,
    );

    const incrementBtns = screen.getAllByLabelText(/Increase.*quantity/i);
    fireEvent.press(incrementBtns[0]);

    await waitFor(() => {
      const continueBtn = screen.getByTestId("checkout-tickets-continue");
      expect(continueBtn.props.accessibilityState.disabled).toBe(false);
    });
  });

  it("navigates to payment (not result) when continue is pressed for paid event", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutTicketsScreen />
      </QueryClientProvider>,
    );

    const incrementBtns = screen.getAllByLabelText(/Increase.*quantity/i);
    fireEvent.press(incrementBtns[0]);

    const continueBtn = screen.getByTestId("checkout-tickets-continue");
    fireEvent.press(continueBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining("/payment"),
        }),
      );
    });
  });
});
