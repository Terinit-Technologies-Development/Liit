import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RequestPayoutModal from "../../app/(modals)/request-payout";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockBack = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Payout Request Behaviour", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockBack.mockClear();
  });

  const renderModal = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <RequestPayoutModal />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders the available balance from the repository (R 15,000.00 fixture)", async () => {
    const screen = renderModal();
    await waitFor(
      () => {
        expect(
          screen.getByText(/Available for Immediate Payout:/i),
        ).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText("R 15 000,00")).toBeTruthy();
  });

  it("a legitimate zero balance stays zero (?? not ||)", async () => {
    const overview = await mockCreatorRepository.getPayoutsOverview();
    mockCreatorRepository.overridePayoutsOverviewForTest?.({
      ...overview,
      availableMinor: 0,
    });
    const screen = renderModal();
    await waitFor(
      () => {
        expect(screen.getByText("R 0,00")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText(/cleared balance is R 0.00/i)).toBeTruthy();
    expect(
      screen.getByTestId("submit-payout-button").props.accessibilityState
        ?.disabled,
    ).toBe(true);
  });

  it("disables over-balance submissions", async () => {
    const screen = renderModal();
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText("e.g. 5000.00")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. 5000.00"),
      "99999.00",
    );
    expect(
      screen.getByText(/Amount exceeds available cleared balance/i),
    ).toBeTruthy();
    expect(
      screen.getByTestId("submit-payout-button").props.accessibilityState
        ?.disabled,
    ).toBe(true);
  });

  it("executes editing -> processing -> deterministic failure -> Retry -> processing -> success", async () => {
    const screen = renderModal();
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText("e.g. 5000.00")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. 5000.00"),
      "2500.00",
    );

    fireEvent.press(screen.getByTestId("payout-simulate-failure-toggle"));
    fireEvent.press(screen.getByTestId("submit-payout-button"));
    await waitFor(() => {
      expect(screen.getByText(/Processing Payout Request\.\.\./i)).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("Payout Failed")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("retry-payout-button"));
    await waitFor(() => {
      expect(screen.getByText(/Processing Payout Request\.\.\./i)).toBeTruthy();
    });
    await waitFor(
      () => {
        expect(screen.getByText("Payout Request Recorded")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText(/No bank transfer has occurred/i)).toBeTruthy();
  });

  it("updates available/pending balances and appends a ledger entry with deterministic reference", async () => {
    const screen = renderModal();
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText("e.g. 5000.00")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. 5000.00"),
      "2500.00",
    );
    fireEvent.press(screen.getByTestId("submit-payout-button"));
    await waitFor(
      () => {
        expect(screen.getByText("Payout Request Recorded")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    const overview = await mockCreatorRepository.getPayoutsOverview();
    expect(overview.availableMinor).toBe(1250000);
    expect(overview.pendingMinor).toBe(700000);

    const history = await mockCreatorRepository.getPayoutHistory();
    expect(history[0].amountMinor).toBe(250000);
    expect(history[0].status).toBe("processing");
    expect(history[0].payoutId).toBe("pay-req-003");
    expect(history[0].bankAccountLast4).toBe("4092");
  });

  it("keeps the disclosure visible in success copy", async () => {
    const screen = renderModal();
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText("e.g. 5000.00")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 5000.00"), "100.00");
    fireEvent.press(screen.getByTestId("submit-payout-button"));
    await waitFor(
      () => {
        expect(
          screen.getByText(
            /LIIT PROTOTYPE — payout request recorded in the local simulation/i,
          ),
        ).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.queryByText(/is being transferred/i)).toBeNull();
  });
});
