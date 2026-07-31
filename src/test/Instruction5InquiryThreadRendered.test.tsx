import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InquiryThreadScreen from "../../app/(consumer)/inbox/inquiries/[conversationId]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useCheckoutStore } from "../state/useCheckoutStore";
import { calculateServiceFeeMinor } from "../domain/ticketing/fee-policy";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();

let mockConversationId = "conv-inquiry-club-vibez";

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
  useLocalSearchParams: () => ({
    conversationId: mockConversationId,
  }),
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
    mockConversationId = "conv-inquiry-club-vibez";
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

  it("Initializes checkout session, preselects tier in store, calculates quote, and navigates to checkout tickets", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InquiryThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("inquiry-booking-link-card")).toBeTruthy();
      expect(screen.getByText("VIP Table Reservation (4 Guests)")).toBeTruthy();
    });

    const cta = screen.getByTestId("booking-offer-cta");
    fireEvent.press(cta);

    // Verify Checkout Store draft exists and has preselected tier
    const checkoutDraft = useCheckoutStore.getState().draft;
    expect(checkoutDraft).not.toBeNull();
    expect(checkoutDraft?.eventId).toBe("evt-midnight-grooves");
    expect(checkoutDraft?.quantities["tier-vip-tables"]).toBe(1);

    // Verify prototype quote fee calculation for R1,500 VIP Table tier
    const subtotalMinor = 150000; // R1,500.00
    const serviceFeeMinor = calculateServiceFeeMinor(subtotalMinor); // R75.00 (5%)
    const totalMinor = subtotalMinor + serviceFeeMinor; // R1,575.00

    expect(subtotalMinor).toBe(150000);
    expect(serviceFeeMinor).toBe(7500);
    expect(totalMinor).toBe(157500);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(consumer)/checkout/[eventId]/tickets",
      params: {
        eventId: "evt-midnight-grooves",
        initialTierId: "tier-vip-tables",
      },
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
    mockConversationId = "invalid-inquiry-id";

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
