import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import DirectThreadScreen from "../../app/(consumer)/inbox/direct/[conversationId]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useSocialStore } from "../state/useSocialStore";

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
    useSocialStore.getState().resetSocial();
    mockPush.mockClear();
    mockBack.mockClear();
    mockSetOptions.mockClear();
  });

  it("Renders Direct Thread screen with messages, voice/video header actions, and date separator", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("direct-thread-screen")).toBeTruthy();
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
      expect(screen.getByTestId("direct-thread-voice-call")).toBeTruthy();
      expect(screen.getByTestId("direct-thread-video-call")).toBeTruthy();
      expect(screen.getByTestId("date-separator-today")).toBeTruthy();
      expect(
        screen.getByText(
          "Are you still pulling up to Braamfontein rooftop tonight?",
        ),
      ).toBeTruthy();
    });
  });

  it("Triggers typing indicator after timer and clears on unmount", async () => {
    jest.useFakeTimers();

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("direct-thread-screen")).toBeTruthy();
    });

    act(() => {
      jest.advanceTimersByTime(1300);
    });

    await waitFor(() => {
      expect(screen.getByTestId("direct-typing-indicator")).toBeTruthy();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("direct-typing-indicator")).toBeNull();
    });

    jest.useRealTimers();
  });

  it("Retries a failed outgoing message using retryMessage without creating duplicate messages", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("direct-message-msg-alex-failed")).toBeTruthy();
      expect(screen.getByTestId("delivery-status-retry")).toBeTruthy();
    });

    const initialMsgs =
      await mockSocialRepository.listMessages("conv-direct-alex");
    const countBefore = initialMsgs.length;

    const retryBtn = screen.getByTestId("delivery-status-retry");
    await act(async () => {
      fireEvent.press(retryBtn);
    });

    await waitFor(
      () => {
        expect(screen.queryByTestId("delivery-status-retry")).toBeNull();
      },
      { timeout: 4000 },
    );

    const finalMsgs =
      await mockSocialRepository.listMessages("conv-direct-alex");
    expect(finalMsgs.length).toBe(countBefore);
  }, 10000);

  it("Sends a new message using social store draft and clears draft on success", async () => {
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

    expect(useSocialStore.getState().drafts["conv-direct-alex"]).toBe(
      "I am on my way!",
    );

    const sendBtn = screen.getByTestId("composer-send-button");
    fireEvent.press(sendBtn);

    await waitFor(() => {
      expect(screen.getByText("I am on my way!")).toBeTruthy();
    });

    expect(
      useSocialStore.getState().drafts["conv-direct-alex"],
    ).toBeUndefined();
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

  it("Renders invalid direct conversation ID error state", async () => {
    mockConversationId = "invalid-direct-id";

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("direct-thread-error")).toBeTruthy();
      expect(screen.getByText("Conversation not found")).toBeTruthy();
    });
  });
});
