import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TicketWalletScreen from "../../app/(consumer)/tickets/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

let mockScenario = "normal";

jest.mock("../hooks/ticketing/useTicketWalletQuery", () => {
  const { seedWalletTickets } = require("../fixtures/ticketing/wallet");
  return {
    useTicketWalletQuery: jest.fn(() => ({
      data: mockScenario === "wallet_empty" ? [] : seedWalletTickets,
      isLoading: false,
      isError: false,
    })),
  };
});

jest.mock("../state/useAppStore", () => ({
  useAppStore: (selector: any) =>
    selector({ scenario: mockScenario, activeMode: "consumer" }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("TicketWalletRendered Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockScenario = "normal";
    mockPush.mockClear();
  });

  it("renders wallet index with seed fixture tickets and upcoming tab shows valid/pending tickets", () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <TicketWalletScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText("My Wallet")).toBeTruthy();
    expect(screen.getByText("Midnight Grooves")).toBeTruthy(); // valid
    expect(screen.getByText("Soweto Street Food & Craft Market")).toBeTruthy(); // valid

    // Past tickets shouldn't be in the upcoming tab
    expect(screen.queryByText("Jozi Nightlife Showcase")).toBeNull();
  });

  it("past tab shows used/cancelled tickets", () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <TicketWalletScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByText("Past"));

    expect(screen.getByText("Jozi Nightlife Showcase")).toBeTruthy(); // used
    expect(screen.getByText("Rosebank Art & Jazz Night")).toBeTruthy(); // cancelled

    // Upcoming tickets shouldn't be in the past tab
    expect(screen.queryByText("Midnight Grooves")).toBeNull();
  });

  it("tapping a ticket navigates to fullTicket route", () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <TicketWalletScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByText("Midnight Grooves"));

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: expect.stringContaining("/tickets"),
      }),
    );
  });

  it("wallet_empty scenario shows empty state", () => {
    mockScenario = "wallet_empty";
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <TicketWalletScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText("No upcoming tickets")).toBeTruthy();
    expect(
      screen.getByText("Browse events and purchase tickets to see them here."),
    ).toBeTruthy();
  });
});
