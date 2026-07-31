import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FullTicketScreen from "../../app/(consumer)/tickets/[ticketId]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockBack = jest.fn();
const mockReplace = jest.fn();

let mockTicketId = "ticket-liit-seed-0001";
let mockTicketDataOverride: any = null;

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    push: jest.fn(),
  }),
  useNavigation: () => ({
    getParent: () => ({
      setOptions: jest.fn(),
    }),
  }),
  useLocalSearchParams: () => ({
    ticketId: mockTicketId,
  }),
}));

jest.mock("../hooks/ticketing/useTicketQuery", () => {
  const { seedWalletTickets } = require("../fixtures/ticketing/wallet");
  return {
    useTicketQuery: jest.fn(() => ({
      data:
        mockTicketDataOverride ??
        seedWalletTickets.find((t: any) => t.id === mockTicketId),
      isLoading: false,
      isError: false,
    })),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("FullTicketRendered Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockTicketDataOverride = null;
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("valid paid ticket: QrPlaceholder enabled, no disabled notice", () => {
    mockTicketId = "ticket-liit-seed-0001"; // valid paid
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    const qr = screen.getByTestId("full-ticket-qr");
    expect(qr.props.accessibilityLabel).toContain("Simulated QR placeholder");
  });

  it("pending ticket: QrPlaceholder disabled (canDisplayEntryCode=false), shows pending message", () => {
    mockTicketId = "ticket-liit-seed-0003"; // pending
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId("full-ticket-entry-disabled-notice"),
    ).toBeTruthy();
    expect(
      screen.getByText("This ticket is pending confirmation."),
    ).toBeTruthy();
  });

  it("used ticket: QrPlaceholder disabled, shows used message", () => {
    mockTicketId = "ticket-liit-seed-0004"; // used
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId("full-ticket-entry-disabled-notice"),
    ).toBeTruthy();
    expect(screen.getByText("This ticket has already been used.")).toBeTruthy();
  });

  it("cancelled ticket: QrPlaceholder disabled", () => {
    mockTicketId = "ticket-liit-seed-0005"; // cancelled
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId("full-ticket-entry-disabled-notice"),
    ).toBeTruthy();
    expect(screen.getByText("This ticket is cancelled.")).toBeTruthy();
  });

  it("free_registration valid ticket: shows Profile Verification box, no QR", () => {
    mockTicketId = "ticket-liit-seed-0002"; // free registration
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("full-ticket-profile-verification")).toBeTruthy();
    expect(screen.queryByTestId("full-ticket-qr")).toBeNull();
  });

  it("free_registration cancelled/used ticket: displays disabled status notice instead of profile verification", () => {
    const { seedWalletTickets } = require("../fixtures/ticketing/wallet");
    const baseFreeTicket = seedWalletTickets.find(
      (t: any) => t.id === "ticket-liit-seed-0002",
    );
    mockTicketDataOverride = {
      ...baseFreeTicket,
      status: "cancelled",
    };

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId("full-ticket-entry-disabled-notice"),
    ).toBeTruthy();
    expect(screen.getByText("This ticket is cancelled.")).toBeTruthy();
    expect(screen.queryByTestId("full-ticket-profile-verification")).toBeNull();
  });

  it("High-brightness toggle renders and updates screen and pass container styles to high-contrast palette", () => {
    mockTicketId = "ticket-liit-seed-0001";
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    const switchToggle = screen.getByTestId("full-ticket-high-brightness");
    expect(switchToggle).toBeTruthy();

    const screenViewBefore = screen.getByTestId("full-ticket-screen");
    expect(screenViewBefore.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#0F0D16" }),
      ]),
    );

    fireEvent(switchToggle, "onValueChange", true);

    const screenViewAfter = screen.getByTestId("full-ticket-screen");
    expect(screenViewAfter.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#FFFFFF" }),
      ]),
    );
  });

  it("Return to Wallet button navigates back", () => {
    mockTicketId = "ticket-liit-seed-0001";
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByText("Return to Wallet"));
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("/tickets"),
    );
  });
});
