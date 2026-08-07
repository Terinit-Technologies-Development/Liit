import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EventContentScreen from "../../app/(creator)/events/[eventId]/content";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockBack = jest.fn();
let mockParams: Record<string, string> = { eventId: "evt-midnight-grooves" };

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Content Repository Behaviour", () => {
  let queryClient: QueryClient;
  let alertSpy: jest.SpyInstance;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockBack.mockClear();
    mockParams = { eventId: "evt-midnight-grooves" };
    // Auto-confirm destructive Alert dialogs so delete flows execute.
    alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        const destructive = buttons?.find((b) => b.style === "destructive");
        destructive?.onPress?.();
      });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  const renderContent = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <EventContentScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  const fillEditor = (
    screen: ReturnType<typeof renderContent>,
    title: string,
    body: string,
  ) => {
    fireEvent.press(screen.getByTestId("new-content-post-button"));
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Set Times & DJ Lineup"),
      title,
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Write update for event attendees..."),
      body,
    );
  };

  it("renders the seeded posts (pinned + public) after async query hydration", async () => {
    const screen = renderContent();
    await waitFor(
      () => {
        expect(
          screen.getByText(/DJ Lineup Announcement & Set Times/i),
        ).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText("PINNED")).toBeTruthy();
    expect(screen.getByText("PUBLIC")).toBeTruthy();
  });

  it("creates and publishes a post via repository mutation (no stale local array)", async () => {
    const screen = renderContent();
    fillEditor(
      screen,
      "Set Times Update",
      "Doors at 20:00 SAST, headliner at 23:00.",
    );

    fireEvent.press(screen.getByTestId("content-publish"));
    await waitFor(
      () => {
        expect(screen.getAllByText("PUBLIC").length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 10000 },
    );

    const posts = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    const created = posts.find((p) => p.title === "Set Times Update");
    expect(created).toBeDefined();
    expect(created?.state).toBe("public");
    expect(created?.body).toBe("Doors at 20:00 SAST, headliner at 23:00.");
  });

  it("Save Draft stores the post as a draft state", async () => {
    const screen = renderContent();
    fillEditor(screen, "Draft Announcement", "Work in progress update.");
    fireEvent.press(screen.getByTestId("content-save-draft"));

    await waitFor(
      () => {
        expect(screen.getByText("DRAFT")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    const posts = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    expect(posts.find((p) => p.title === "Draft Announcement")?.state).toBe(
      "draft",
    );
  });

  it("Schedule requires a date and stores a scheduled post", async () => {
    const screen = renderContent();
    fillEditor(screen, "Scheduled Post", "Coming soon.");
    fireEvent.press(screen.getByTestId("content-schedule"));
    expect(alertSpy).toHaveBeenCalledWith(
      "Schedule Required",
      expect.stringContaining("Enter a schedule date"),
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("2026-08-20"),
      "2026-08-20",
    );
    fireEvent.press(screen.getByTestId("content-schedule"));
    await waitFor(
      () => {
        expect(screen.getByText("SCHEDULED")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    const posts = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    const scheduled = posts.find((p) => p.title === "Scheduled Post");
    expect(scheduled?.state).toBe("scheduled");
    expect(scheduled?.scheduledFor).toBe("2026-08-20");
  });

  it("pin/unpin and hide/show mutate repository state and refresh the query", async () => {
    const screen = renderContent();
    await waitFor(
      () => {
        expect(
          screen.getByText(/DJ Lineup Announcement & Set Times/i),
        ).toBeTruthy();
      },
      { timeout: 10000 },
    );

    fireEvent.press(screen.getByTestId("toggle-pin-post-2"));
    await waitFor(
      () => {
        expect(screen.getAllByText("Unpin").length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 10000 },
    );
    const afterPin = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    expect(afterPin.find((p) => p.id === "post-2")?.isPinned).toBe(true);
    expect(afterPin.find((p) => p.id === "post-2")?.state).toBe("pinned");

    fireEvent.press(screen.getByTestId("toggle-visibility-post-2"));
    await waitFor(
      () => {
        expect(screen.getByText("HIDDEN")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    const afterHide = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    expect(afterHide.find((p) => p.id === "post-2")?.state).toBe("hidden");
  });

  it("deletes a post via repository mutation", async () => {
    const screen = renderContent();
    await waitFor(
      () => {
        expect(screen.getByText(/Sound Check & Visual Setup/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
    fireEvent.press(screen.getByTestId("delete-post-post-2"));

    await waitFor(
      () => {
        expect(screen.queryByText(/Sound Check & Visual Setup/i)).toBeNull();
      },
      { timeout: 10000 },
    );
    const posts = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    expect(posts.find((p) => p.id === "post-2")).toBeUndefined();
  });

  it("shows an empty state for an event with no content", async () => {
    mockParams = { eventId: "evt-soweto-food-market" };
    const screen = renderContent();
    await waitFor(
      () => {
        expect(screen.getByText(/No Content for this Event/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it("shows an invalid Event state for unknown event IDs", async () => {
    mockParams = { eventId: "evt-does-not-exist" };
    const screen = renderContent();
    await waitFor(
      () => {
        expect(screen.getByText("Event Not Found")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it("recovers from a simulated query error via Retry", async () => {
    mockCreatorRepository.simulateErrorFor("content", true);
    const screen = renderContent();
    await waitFor(
      () => {
        expect(screen.getByText("Content Unavailable")).toBeTruthy();
      },
      { timeout: 10000 },
    );

    mockCreatorRepository.simulateErrorFor("content", false);
    fireEvent.press(screen.getByTestId("content-retry-button"));
    await waitFor(
      () => {
        expect(
          screen.getByText(/DJ Lineup Announcement & Set Times/i),
        ).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });
});
