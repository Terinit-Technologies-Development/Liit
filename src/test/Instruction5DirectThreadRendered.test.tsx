import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import DirectThreadScreen from "../../app/(consumer)/inbox/direct/[conversationId]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();

let mockConversationId = "conv-direct-alex";

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

describe("DirectThreadScreen Rendered Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockConversationId = "conv-direct-alex";
    await mockSocialRepository.reset();
    mockPush.mockClear();
    mockBack.mockClear();
    mockSetOptions.mockClear();
  });

  it("Renders Direct Thread screen with messages and participant info", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("direct-thread-screen")).toBeTruthy();
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
      expect(
        screen.getByText(
          "Are you still pulling up to Braamfontein rooftop tonight?",
        ),
      ).toBeTruthy();
    });

    expect(mockSetOptions).toHaveBeenCalledWith({
      tabBarStyle: { display: "none" },
    });
  });

  it("Sends a new message and appends it to the chat list", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("composer-input")).toBeTruthy();
    });

    const input = screen.getByTestId("composer-input");
    fireEvent.changeText(input, "I am on my way!");

    const sendBtn = screen.getByTestId("composer-send-button");
    fireEvent.press(sendBtn);

    await waitFor(() => {
      expect(screen.getByText("I am on my way!")).toBeTruthy();
    });
  });

  it("Renders blocked user banner when conversation is blocked", async () => {
    mockConversationId = "conv-direct-blocked";

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("direct-blocked-banner")).toBeTruthy();
      expect(screen.getByText("You have blocked Sipho Mthethwa.")).toBeTruthy();
    });
  });
});
