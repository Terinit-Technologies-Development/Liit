import React from "react";
import { render } from "@testing-library/react-native";
import CheckoutResultScreen from "../../app/(consumer)/checkout/[eventId]/result";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let mockParams = { result: "paid_success", ticketId: "t-123" };
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => mockParams,
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
    mockParams = { result: "paid_success", ticketId: "t-123" };
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutResultScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Tickets confirmed!")).toBeTruthy();
    expect(screen.getByText("View my ticket")).toBeTruthy();
    expect(screen.getByText("Go to Wallet")).toBeTruthy();
  });

  it.todo(
    "free_success: shows 'Registration confirmed!', View Registration / Go to Wallet",
  );

  it.todo(
    "declined: shows 'Payment declined', Try again and Change Payment Method buttons",
  );

  it.todo(
    "network_error: shows 'Something went wrong', Retry and Return to Event buttons",
  );

  it.todo("invalid result param (missing/garbage): must NOT show success text");
});
