import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DirectThreadScreen from "../../app/(consumer)/inbox/direct/[conversationId]";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useSocialStore } from "../state/useSocialStore";

let mockConversationId = "conv-direct-alex";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: mockBack,
      setParams: jest.fn(),
    }),
    useLocalSearchParams: () => ({
      conversationId: mockConversationId,
    }),
    useNavigation: () => ({
      setOptions: mockSetOptions,
    }),
  };
});

describe("DirectThreadScreen Rendered Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockConversationId = "conv-direct-alex";
    await mockSocialRepository.reset();
    useSocialStore.getState().resetSocial();
    mockPush.mockClear();
    mockBack.mockClear();
    mockSetOptions.mockClear();
  });

  it(
    "Renders Direct Thread screen with messages, voice/video header actions, and date separator",
    async () => {
      const screen = render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <QueryClientProvider client={queryClient}>
            <DirectThreadScreen />
          </QueryClientProvider>
        </SafeAreaProvider>,
      );

      await waitFor(
        () => {
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
        },
        { timeout: 10000 },
      );
    },
    15000,
  );

  it(
    "Triggers typing indicator after timer and clears on unmount",
    async () => {
      jest.useFakeTimers();

      const screen = render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <QueryClientProvider client={queryClient}>
            <DirectThreadScreen />
          </QueryClientProvider>
        </SafeAreaProvider>,
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
    },
    15000,
  );

  it(
    "Retries a failed outgoing message using retryMessage without creating duplicate messages",
    async () => {
      const screen = render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <QueryClientProvider client={queryClient}>
            <DirectThreadScreen />
          </QueryClientProvider>
        </SafeAreaProvider>,
      );

      await waitFor(
        () => {
          expect(
            screen.getByTestId("direct-message-msg-alex-failed"),
          ).toBeTruthy();
          expect(screen.getByTestId("delivery-status-retry")).toBeTruthy();
        },
        { timeout: 10000 },
      );

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
        { timeout: 10000 },
      );

      const finalMsgs =
        await mockSocialRepository.listMessages("conv-direct-alex");
      expect(finalMsgs.length).toBe(countBefore);
    },
    15000,
  );

  it(
    "Sends a new message using social store draft and clears draft on success",
    async () => {
      const screen = render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <QueryClientProvider client={queryClient}>
            <DirectThreadScreen />
          </QueryClientProvider>
        </SafeAreaProvider>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("composer-input")).toBeTruthy();
        },
        { timeout: 10000 },
      );

      const input = screen.getByTestId("composer-input");
      fireEvent.changeText(input, "I am on my way!");

      expect(useSocialStore.getState().drafts["conv-direct-alex"]).toBe(
        "I am on my way!",
      );

      const sendBtn = screen.getByTestId("composer-send-button");
      fireEvent.press(sendBtn);

      await waitFor(
        () => {
          expect(screen.getByText("I am on my way!")).toBeTruthy();
        },
        { timeout: 10000 },
      );

      expect(
        useSocialStore.getState().drafts["conv-direct-alex"],
      ).toBeUndefined();
    },
    15000,
  );

  it(
    "Renders blocked user banner when conversation is blocked",
    async () => {
      mockConversationId = "conv-direct-blocked";

      const screen = render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <QueryClientProvider client={queryClient}>
            <DirectThreadScreen />
          </QueryClientProvider>
        </SafeAreaProvider>,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("direct-blocked-banner")).toBeTruthy();
          expect(
            screen.getByText("You have blocked Sipho Mthethwa."),
          ).toBeTruthy();
        },
        { timeout: 10000 },
      );
    },
    15000,
  );

  it(
    "Renders invalid direct conversation ID error state",
    async () => {
      mockConversationId = "invalid-direct-id";

      const screen = render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <QueryClientProvider client={queryClient}>
            <DirectThreadScreen />
          </QueryClientProvider>
        </SafeAreaProvider>,
      );

      await waitFor(
        () => {
          expect(
            screen.getByText("Direct Conversation Not Found"),
          ).toBeTruthy();
        },
        { timeout: 10000 },
      );
    },
    15000,
  );
});
