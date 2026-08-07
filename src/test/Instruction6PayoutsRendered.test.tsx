import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreatorPayouts from "../../app/(creator)/payouts";
import RequestPayoutModal from "../../app/(modals)/request-payout";

describe("LIIT Instruction 6: Payouts Overview & Request Modal Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders Creator Payouts screen with overview card and payout history", async () => {
    const { getByTestId, getByText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CreatorPayouts />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(getByTestId("creator-payouts-screen")).toBeTruthy();
    await waitFor(() => {
      expect(getByText(/Available for Payout/i)).toBeTruthy();
      expect(getByText(/Payout History/i)).toBeTruthy();
      expect(getByText(/Request Payout/i)).toBeTruthy();
    });
  });

  it("renders Request Payout modal with ZAR minor balance", async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <RequestPayoutModal />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(getByTestId("request-payout-modal")).toBeTruthy();
    expect(getByText(/Available for Immediate Payout:/i)).toBeTruthy();
    expect(getByText(/Standard Bank South Africa/i)).toBeTruthy();
    expect(getByPlaceholderText("e.g. 5000.00")).toBeTruthy();
  });
});
