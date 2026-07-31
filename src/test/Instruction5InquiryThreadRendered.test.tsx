import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InquiryThreadScreen from "../../app/(consumer)/inbox/inquiries/[conversationId]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";

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

  it("Renders BookingLinkCard and tapping CTA navigates to checkout tickets", async () => {
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

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(consumer)/checkout/[eventId]/tickets",
      params: {
        eventId: "evt-midnight-grooves",
        initialTierId: "tier-vip-tables",
      },
    });
  });
});
