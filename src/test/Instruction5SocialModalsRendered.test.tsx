import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import NewMessageModal from "../../app/(modals)/new-message";
import ConversationActionsModal from "../../app/(modals)/conversation-actions";
import ReportContentModal from "../../app/(modals)/report-content";
import EventCommentsModal from "../../app/(modals)/event-comments";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockDismiss = jest.fn();

let mockParams: any = {
  conversationId: "conv-direct-alex",
  targetKind: "user",
  targetId: "usr-001",
  eventId: "evt-midnight-grooves",
};

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    dismiss: mockDismiss,
  }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Instruction 5 Social Modals Rendered Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockParams = {
      conversationId: "conv-direct-alex",
      targetKind: "user",
      targetId: "usr-001",
      eventId: "evt-midnight-grooves",
    };
    await mockSocialRepository.reset();
    mockPush.mockClear();
    mockBack.mockClear();
    mockDismiss.mockClear();
  });

  it("NewMessageModal renders recipient list and filtering works", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NewMessageModal />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("new-message-modal")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
      expect(screen.getByText("Club Vibez JHB")).toBeTruthy();
    });

    const searchInput = screen.getByTestId("new-message-search-input");
    fireEvent.changeText(searchInput, "Alex");

    await waitFor(() => {
      expect(screen.getByText("Alex Khumalo")).toBeTruthy();
      expect(screen.queryByText("Club Vibez JHB")).toBeNull();
    });
  });

  it("ConversationActionsModal renders Mute, Close Inquiry, Report, and Block options", async () => {
    mockParams = { conversationId: "conv-inquiry-club-vibez" };

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <ConversationActionsModal />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("conversation-actions-modal")).toBeTruthy();
      expect(screen.getByTestId("action-mute-button")).toBeTruthy();
      expect(screen.getByTestId("action-close-inquiry-button")).toBeTruthy();
      expect(screen.getByTestId("action-report-button")).toBeTruthy();
      expect(screen.getByTestId("action-block-button")).toBeTruthy();
    });
  });

  it("ReportContentModal renders reason selection and submits report", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <ReportContentModal />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("report-content-modal")).toBeTruthy();
    expect(screen.getByText("Spam or Unsolicited Promotion")).toBeTruthy();

    const submitBtn = screen.getByTestId("report-submit-button");
    fireEvent.press(submitBtn);

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it("ReportContentModal renders invalid state when targetKind is invalid", async () => {
    mockParams = {
      targetKind: "invalid-kind",
      targetId: "usr-001",
    };

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <ReportContentModal />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("report-invalid-target")).toBeTruthy();
    expect(screen.getByText("Invalid Report Target")).toBeTruthy();
  });

  it("EventCommentsModal renders comments list and handles optimistic comment and retry failure state", async () => {
    mockParams = { eventId: "evt-midnight-grooves" };

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <EventCommentsModal />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("event-comments-modal")).toBeTruthy();
      expect(
        screen.getByText(
          "The lineup for tonight is crazy! Who's performing at 11 PM?",
        ),
      ).toBeTruthy();
    });

    // Submit a comment configured to fail ("FAIL")
    const input = screen.getByTestId("composer-input");
    fireEvent.changeText(input, "This post will FAIL!");

    const sendBtn = screen.getByTestId("composer-send-button");
    fireEvent.press(sendBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to post comment. Tap to retry."),
      ).toBeTruthy();
    });
  });
});
