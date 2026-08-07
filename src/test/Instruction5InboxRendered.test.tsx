import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import InboxScreen from "../../app/(consumer)/inbox/index";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useSocialStore } from "../state/useSocialStore";

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
    useNavigation: () => ({
      setOptions: mockSetOptions,
    }),
  };
});

describe("InboxScreen & Social Feed Rendered Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    await mockSocialRepository.reset();
    useSocialStore.getState().resetSocial();
    mockPush.mockClear();
    mockBack.mockClear();
    mockSetOptions.mockClear();
  });

  it("Renders Inbox screen with conversation list and segmented tabs", async () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <InboxScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByTestId("inbox-screen")).toBeTruthy();
    expect(screen.getByTestId("inbox-segmented-control")).toBeTruthy();

    await waitFor(
      () => {
        expect(screen.getByText("Alex Khumalo")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  }, 15000);

  it("Switches between Direct and Hosts & Events tabs", async () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <InboxScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText("Alex Khumalo")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    const hostTabBtn = screen.getByText("Hosts & Events");
    fireEvent.press(hostTabBtn);

    await waitFor(
      () => {
        expect(screen.getByText("Club Vibez JHB")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  }, 15000);

  it("Navigates to direct thread when direct item is tapped", async () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <InboxScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText("Alex Khumalo")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    const row = screen.getByTestId("inbox-item-conv-direct-alex");
    fireEvent.press(row);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(consumer)/inbox/direct/[conversationId]",
      params: { conversationId: "conv-direct-alex" },
    });
  }, 15000);

  it("Navigates to new message composer modal when compose button is pressed", async () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <InboxScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    const composeBtn = screen.getByTestId("inbox-compose-button");
    fireEvent.press(composeBtn);

    expect(mockPush).toHaveBeenCalledWith("/(modals)/new-message");
  }, 15000);

  it("Renders unread badge for conversation with unread messages", async () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <InboxScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("unread-badge-2")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  }, 15000);
});
