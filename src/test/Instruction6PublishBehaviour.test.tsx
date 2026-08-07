import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PublishConfirmationModal from "../../app/(modals)/publish-confirmation";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";
import { CreatorEventProjection } from "../domain/creator";
import { toJohannesburgIso } from "../utils/johannesburg";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockDismiss = jest.fn();
let mockParams: Record<string, string> = { eventId: "evt-draft-001" };

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, dismiss: mockDismiss }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const VALID_DRAFT: Partial<CreatorEventProjection> = {
  event: {
    id: "evt-draft-001",
    title: "Publishable Draft",
    tagline: "Tagline",
    description:
      "A complete draft with valid media, schedule, venue and tiers.",
    category: "nightlife",
    status: "draft",
    host: {
      id: "host-groove-co",
      name: "Groove Co. Johannesburg",
      handle: "@grooveco",
      avatarUrl: "",
      avatarImageKey: "hostGrooveCo",
      isVerified: true,
    },
    venue: {
      id: "ven-braam",
      name: "Braamfontein Rooftop Social",
      address: "73 Juta Street",
      suburb: "Braamfontein",
      city: "Johannesburg",
      province: "Gauteng",
      latitude: -26.1929,
      longitude: 28.0373,
    },
    occurrence: {
      id: "occ-evt-draft-001",
      startTime: toJohannesburgIso("2026-08-15", "18:00"),
      endTime: toJohannesburgIso("2026-08-16", "02:00"),
      doorsOpen: "18:00",
    },
    heroImageKey: "eventMidnightGrooves",
    galleryImageKeys: [],
    startingPriceMinor: 25000,
    currency: "ZAR",
    totalCapacity: 200,
    remainingTickets: 200,
    isSaved: false,
  },
  host: {
    id: "host-groove-co",
    name: "Groove Co. Johannesburg",
    handle: "@grooveco",
    avatarUrl: "",
    avatarImageKey: "hostGrooveCo",
    isVerified: true,
  },
  operationalStatus: "draft",
  ticketsSold: 0,
  totalCapacity: 200,
  grossRevenueMinor: 0,
  checkedInCount: 0,
  contentSummary: { totalPosts: 0, pinnedCount: 0 },
  eventDraft: {
    title: "Publishable Draft",
    description:
      "A complete draft with valid media, schedule, venue and tiers.",
    category: "nightlife",
    visibility: "Public",
    ageGuidance: "18+",
    posterUploaded: true,
    startDate: "2026-08-15",
    startTime: "18:00",
    endDate: "2026-08-16",
    endTime: "02:00",
    venueName: "Braamfontein Rooftop Social",
    venueAddress: "73 Juta Street",
    venueSuburb: "Braamfontein",
    venueCity: "Johannesburg",
    isFree: false,
    tiers: [
      {
        id: "creator-tier-draft-001",
        name: "Early Bird Pass",
        description: "Includes entry before 20:00 SAST",
        priceMinor: 25000,
        capacity: 100,
        salesStart: "2026-08-01",
        salesEnd: "2026-08-14",
        maxPerOrder: 4,
        availability: "available",
      },
      {
        id: "creator-tier-draft-002",
        name: "General Admission",
        description: "Standard event pass",
        priceMinor: 35000,
        capacity: 100,
        salesStart: "2026-08-01",
        salesEnd: "2026-08-15",
        maxPerOrder: 4,
        availability: "available",
      },
    ],
  },
};

describe("LIIT Instruction 6: Publish Confirmation Behaviour", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockBack.mockClear();
    mockPush.mockClear();
    mockDismiss.mockClear();
  });

  const renderModal = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <PublishConfirmationModal />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders the review checklist derived from the actual draft — all valid", async () => {
    await mockCreatorRepository.saveEventDraft(VALID_DRAFT);
    const screen = renderModal();
    const confirmBtn = screen.getByTestId("confirm-publish-button");
    await waitFor(
      () => {
        expect(confirmBtn.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 10000 },
    );
    expect(
      screen.getAllByText(/Media & Cover Poster Selected/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Creator Identity Verified/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(confirmBtn.props.accessibilityState?.disabled).toBe(false);
  });

  it("executes review -> processing -> deterministic failure -> Retry -> processing -> success", async () => {
    await mockCreatorRepository.saveEventDraft(VALID_DRAFT);
    const screen = renderModal();
    const confirmBtn = screen.getByTestId("confirm-publish-button");
    await waitFor(
      () => {
        expect(confirmBtn.props.accessibilityState?.disabled).toBe(false);
      },
      { timeout: 10000 },
    );

    // Deterministic failure
    fireEvent.press(screen.getByTestId("publish-simulate-failure-toggle"));
    fireEvent.press(confirmBtn);
    await waitFor(() => {
      expect(screen.getByText(/Publishing Failed/i)).toBeTruthy();
    });

    // Draft survives the failed publish
    const afterFailure =
      await mockCreatorRepository.getCreatorEvent("evt-draft-001");
    expect(afterFailure?.eventDraft?.title).toBe("Publishable Draft");
    expect(afterFailure?.operationalStatus).toBe("draft");

    // Retry (explicit parameter — no stale closure)
    fireEvent.press(screen.getByTestId("retry-publish-button"));
    await waitFor(
      () => {
        expect(screen.getByText(/Event Publish Simulated/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );

    // Correct scope copy — no Consumer Discovery claim
    expect(
      screen.getByText(
        /Consumer marketplace propagation is deferred to Instruction 8/i,
      ),
    ).toBeTruthy();
    expect(
      screen.queryByText(/live and accessible in LIIT Consumer Discovery/i),
    ).toBeNull();

    // Repository status mutated to published (Creator-side simulation only)
    const afterSuccess =
      await mockCreatorRepository.getCreatorEvent("evt-draft-001");
    expect(afterSuccess?.operationalStatus).toBe("published");
  });

  it("disables publish when the draft is invalid and shows the missing items", async () => {
    await mockCreatorRepository.saveEventDraft({
      ...VALID_DRAFT,
      eventDraft: {
        ...VALID_DRAFT.eventDraft!,
        title: "",
        posterUploaded: false,
      },
    });
    const screen = renderModal();
    const confirmBtn = screen.getByTestId("confirm-publish-button");
    await waitFor(
      () => {
        expect(confirmBtn.props.accessibilityState?.disabled).toBe(true);
      },
      { timeout: 10000 },
    );
    expect(screen.getByText(/Publishing is disabled/i)).toBeTruthy();
    expect(
      screen.getAllByText(/Media & Cover Poster Selected/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("treats a missing draft as invalid and keeps publish disabled", async () => {
    const screen = renderModal();
    await waitFor(
      () => {
        expect(screen.getByTestId("confirm-publish-button")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(
      screen.getByTestId("confirm-publish-button").props.accessibilityState
        ?.disabled,
    ).toBe(true);
  });
});
