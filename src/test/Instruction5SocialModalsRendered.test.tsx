import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import NewMessageModal from "../../app/(modals)/new-message";
import ConversationActionsModal from "../../app/(modals)/conversation-actions";
import ReportContentModal from "../../app/(modals)/report-content";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";

const mockPush = jest.fn();
const mockBack = jest.fn();

let mockParams: any = {
  conversationId: "conv-direct-alex",
  targetKind: "user",
  targetId: "usr-001",
};

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
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
    };
    await mockSocialRepository.reset();
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("NewMessageModal renders recipient list and filtering works", () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <NewMessageModal />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("new-message-modal")).toBeTruthy();
    expect(screen.getByText("Alex Khumalo")).toBeTruthy();
    expect(screen.getByText("Club Vibez JHB")).toBeTruthy();

    const searchInput = screen.getByTestId("new-message-search-input");
    fireEvent.changeText(searchInput, "Alex");

    expect(screen.getByText("Alex Khumalo")).toBeTruthy();
    expect(screen.queryByText("Club Vibez JHB")).toBeNull();
  });

  it("ConversationActionsModal renders Mute, Report, and Block options", async () => {
    const screen = render(
      <QueryClientProvider client={queryClient}>
        <ConversationActionsModal />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("conversation-actions-modal")).toBeTruthy();
    expect(screen.getByTestId("action-mute")).toBeTruthy();
    expect(screen.getByTestId("action-report")).toBeTruthy();
    expect(screen.getByTestId("action-block")).toBeTruthy();
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
});
