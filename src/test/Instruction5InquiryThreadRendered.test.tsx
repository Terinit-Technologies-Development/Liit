import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InquiryThreadScreen from "../../app/(consumer)/inbox/inquiries/[conversationId]";
import CheckoutTicketsScreen from "../../app/(consumer)/checkout/[eventId]/tickets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useCheckoutStore } from "../state/useCheckoutStore";
import { calculateServiceFeeMinor } from "../domain/ticketing/fee-policy";
import { formatCurrency } from "../utils/format";
import { HostInquiryConversation } from "../domain/social";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();

let mockParams: any = {
  conversationId: "conv-inquiry-club-vibez",
  eventId: "evt-midnight-grooves",
  initialTierId: "tier-vip-tables",
};

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useNavigation: () => ({
    getParent: () => ({
      setOptions: mockSetOptions,
    }),
  }),
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

describe("InquiryThreadScreen Rendered Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockParams = {
      conversationId: "conv-inquiry-club-vibez",
      eventId: "evt-midnight-grooves",
      initialTierId: "tier-vip-tables",
    };
    await mockSocialRepository.reset();
    useCheckoutStore.getState().resetCheckout();
    mockPush.mockClear();
    mockBack.mockClear();
    mockSetOptions.mockClear();
  });

  it("Renders Host Inquiry thread screen with event context card and verified badge", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InquiryThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("inquiry-thread-screen")).toBeTruthy();
      expect(screen.getByText("Club Vibez JHB")).toBeTruthy();
      expect(screen.getByText("✓ Verified Host")).toBeTruthy();
      expect(screen.getByTestId("inquiry-event-context-card")).toBeTruthy();
      expect(screen.getByText("Midnight Kinetic Grooves")).toBeTruthy();
    });

    expect(mockSetOptions).toHaveBeenCalledWith({
      tabBarStyle: { display: "none" },
    });
  });

  it("Runs markRead effect on mount exactly once and updates cached inquiry conversation state", async () => {
    const markReadSpy = jest.spyOn(
      mockSocialRepository,
      "markConversationRead",
    );

    // Initially conv-inquiry-club-vibez has unreadCount = 1
    const initialConv = (await mockSocialRepository.getConversation(
      "conv-inquiry-club-vibez",
    )) as HostInquiryConversation;
    expect(initialConv.unreadCount).toBe(1);

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InquiryThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("inquiry-thread-screen")).toBeTruthy();
    });

    await waitFor(async () => {
      const updatedConv = (await mockSocialRepository.getConversation(
        "conv-inquiry-club-vibez",
      )) as HostInquiryConversation;
      expect(updatedConv.unreadCount).toBe(0);
    });

    expect(markReadSpy).toHaveBeenCalledTimes(1);
    expect(markReadSpy).toHaveBeenCalledWith("conv-inquiry-club-vibez");
    markReadSpy.mockRestore();
  });

  it("Initializes checkout session, preselects tier, renders CheckoutTickets quote, and navigates to Payment", async () => {
    const inquiryScreen = render(
      <QueryClientProvider client={queryClient}>
        <InquiryThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        inquiryScreen.getByTestId("inquiry-booking-link-card"),
      ).toBeTruthy();
      expect(
        inquiryScreen.getByText("VIP Table Reservation (4 Guests)"),
      ).toBeTruthy();
    });

    const cta = inquiryScreen.getByTestId("booking-offer-cta");
    fireEvent.press(cta);

    // Verify Checkout Store draft exists and has preselected tier
    const checkoutDraft = useCheckoutStore.getState().draft;
    expect(checkoutDraft).not.toBeNull();
    expect(checkoutDraft?.eventId).toBe("evt-midnight-grooves");
    expect(checkoutDraft?.quantities["tier-vip-tables"]).toBe(1);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(consumer)/checkout/[eventId]/tickets",
      params: {
        eventId: "evt-midnight-grooves",
        initialTierId: "tier-vip-tables",
      },
    });

    // 2. Render CheckoutTicketsScreen to verify rendered quote & payment navigation
    const checkoutScreen = render(
      <QueryClientProvider client={queryClient}>
        <CheckoutTicketsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        checkoutScreen.getByTestId("checkout-tickets-screen"),
      ).toBeTruthy();
      expect(
        checkoutScreen.getByText("VIP Table Reservation (4 Guests)"),
      ).toBeTruthy();
      // Rendered order summary quote amounts
      expect(
        checkoutScreen.getAllByText(formatCurrency(150000)).length,
      ).toBeGreaterThanOrEqual(1); // Subtotal
      expect(checkoutScreen.getByText(formatCurrency(7500))).toBeTruthy(); // 5% fee
      expect(checkoutScreen.getByText(formatCurrency(157500))).toBeTruthy(); // Total
    });

    const continueBtn = checkoutScreen.getByTestId("checkout-tickets-continue");
    fireEvent.press(continueBtn);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(consumer)/checkout/[eventId]/payment",
      params: { eventId: "evt-midnight-grooves" },
    });
  });

  it("Renders closed inquiry banner and removes booking offer CTA when inquiry is closed", async () => {
    await mockSocialRepository.closeInquiry("conv-inquiry-club-vibez");

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InquiryThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("inquiry-closed-banner")).toBeTruthy();
      expect(screen.getByText("You closed this inquiry.")).toBeTruthy();
      expect(screen.queryByTestId("inquiry-booking-link-card")).toBeNull();
      expect(screen.queryByTestId("inquiry-message-composer")).toBeNull();
    });
  });

  it("Renders invalid inquiry ID error state", async () => {
    mockParams = { conversationId: "invalid-inquiry-id" };

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InquiryThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("inquiry-thread-error")).toBeTruthy();
      expect(screen.getByText("Inquiry not found")).toBeTruthy();
    });
  });
});
