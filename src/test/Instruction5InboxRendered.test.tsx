import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InboxScreen from "../../app/(consumer)/inbox/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useSocialStore } from "../state/useSocialStore";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("InboxScreen Rendered Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await mockSocialRepository.reset();
    useSocialStore.getState().resetSocial();
    mockPush.mockClear();
    mockBack.mockClear();
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

  it("Clears unread state when marking conversation read", async () => {
    // Initial direct conversations list has unread count on Alex
    let conversations = await mockSocialRepository.listConversations("direct");
    const alexConv = conversations.find((c) => c.id === "conv-direct-alex");
    expect(alexConv?.unreadCount).toBeGreaterThan(0);

    // Mark read
    await mockSocialRepository.markConversationRead("conv-direct-alex");

    // Re-fetch
    conversations = await mockSocialRepository.listConversations("direct");
    const updatedAlex = conversations.find((c) => c.id === "conv-direct-alex");
    expect(updatedAlex?.unreadCount).toBe(0);
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
