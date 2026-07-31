import React from "react";
import { render } from "@testing-library/react-native";
import FullTicketScreen from "../../app/(consumer)/tickets/[ticketId]";
import {
  CONSUMER_TAB_ROUTES,
  VISIBLE_CONSUMER_TAB_BAR_STYLE,
} from "../../app/(consumer)/_layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockSetOptions = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  }),
  useNavigation: () => ({
    getParent: () => ({
      setOptions: mockSetOptions,
    }),
  }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require("react");
    React.useEffect(() => {
      const cleanup = callback();
      return () => {
        if (cleanup) cleanup();
      };
    }, [callback]);
  },
  useLocalSearchParams: () => ({
    ticketId: "ticket-liit-seed-0001",
  }),
}));

jest.mock("../hooks/ticketing/useTicketQuery", () => {
  const { seedWalletTickets } = require("../fixtures/ticketing/wallet");
  return {
    useTicketQuery: jest.fn(() => ({
      data: seedWalletTickets[0],
      isLoading: false,
      isError: false,
    })),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Instruction 4 Tab Bar Visibility Configuration & Nested Behavior", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockSetOptions.mockClear();
  });

  it("Confirms CONSUMER_TAB_ROUTES has tickets visible and checkout hidden with hideTabBar:true", () => {
    const ticketsRoute = CONSUMER_TAB_ROUTES.find((r) => r.name === "tickets");
    const checkoutRoute = CONSUMER_TAB_ROUTES.find(
      (r) => r.name === "checkout",
    );

    expect(ticketsRoute).toBeDefined();
    expect(ticketsRoute?.visible).toBe(true);

    expect(checkoutRoute).toBeDefined();
    expect(checkoutRoute?.visible).toBe(false);
    expect(checkoutRoute?.hideTabBar).toBe(true);
  });

  it("Full Ticket screen hides tab bar on focus and restores exact visible style on unmount", () => {
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <FullTicketScreen />
      </QueryClientProvider>,
    );

    // On focus, parent setOptions called with { display: "none" }
    expect(mockSetOptions).toHaveBeenCalledWith({
      tabBarStyle: { display: "none" },
    });

    unmount();

    // On unmount/blur, parent setOptions called with VISIBLE_CONSUMER_TAB_BAR_STYLE
    expect(mockSetOptions).toHaveBeenCalledWith({
      tabBarStyle: VISIBLE_CONSUMER_TAB_BAR_STYLE,
    });
  });
});
