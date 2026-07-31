import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InboxScreen from "../../app/(consumer)/inbox/index";
import FeedScreen from "../../app/(consumer)/feed";
import DirectThreadScreen from "../../app/(consumer)/inbox/direct/[conversationId]";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useSocialStore } from "../state/useSocialStore";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();

let mockParams: any = { conversationId: "conv-direct-alex" };

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

describe("InboxScreen & Social Feed Rendered Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockParams = { conversationId: "conv-direct-alex" };
    await mockSocialRepository.reset();
    useSocialStore.getState().resetSocial();
    mockPush.mockClear();
    mockBack.mockClear();
    mockSetOptions.mockClear();
  });

  it("Renders Inbox screen with conversation list and segmented tabs", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InboxScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("inbox-screen")).toBeTruthy();
    expect(screen.getByTestId("inbox-segmented-control")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
    });
  });

  it("Switches between Direct and Hosts & Events tabs", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InboxScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
    });

    const hostTabBtn = screen.getByText("Hosts & Events");
    fireEvent.press(hostTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Club Vibez JHB")).toBeTruthy();
    });
  });

  it("Renders Feed screen, opens Direct thread, marks conversation read, and updates Feed header inbox badge from 3 to 1", async () => {
    // 1. Render Feed screen
    const feedScreen = render(
      <QueryClientProvider client={queryClient}>
        <FeedScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(feedScreen.getByTestId("feed-open-inbox")).toBeTruthy();
      expect(feedScreen.getByTestId("unread-inbox-badge")).toBeTruthy();
      expect(feedScreen.getByText("3")).toBeTruthy();
    });

    // 2. Render DirectThreadScreen (which runs markRead on conv-direct-alex)
    const threadScreen = render(
      <QueryClientProvider client={queryClient}>
        <DirectThreadScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(threadScreen.getByTestId("direct-thread-screen")).toBeTruthy();
    });

    // 3. Re-render Feed screen to assert updated badge count (3 -> 1)
    const updatedFeed = render(
      <QueryClientProvider client={queryClient}>
        <FeedScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(updatedFeed.getByText("1")).toBeTruthy();
    });
  });

  it("Filters conversations via search field", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InboxScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
    });

    const searchInput = screen.getByTestId("inbox-search-input");
    fireEvent.changeText(searchInput, "NonExistentUserQuery");

    await waitFor(() => {
      expect(screen.getByTestId("inbox-empty-state")).toBeTruthy();
    });
  });

  it("Tapping a conversation row navigates to the thread route", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <InboxScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
    });

    const alexRow = screen.getByTestId("inbox-row-conv-direct-alex");
    fireEvent.press(alexRow);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(consumer)/inbox/direct/[conversationId]",
      params: { conversationId: "conv-direct-alex" },
    });
  });
});
