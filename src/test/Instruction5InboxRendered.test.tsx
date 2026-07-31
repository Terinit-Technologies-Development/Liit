import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InboxScreen from "../../app/(consumer)/inbox/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";

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
