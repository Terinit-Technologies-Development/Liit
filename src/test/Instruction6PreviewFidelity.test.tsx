import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EventPreview from "../../app/(creator)/events/[eventId]/preview";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";
import { CreatorEventProjection } from "../domain/creator";
import { toJohannesburgIso } from "../utils/johannesburg";

const mockBack = jest.fn();
let mockParams: Record<string, string> = { eventId: "evt-draft-001" };

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const buildProjection = (
  overrides: Partial<CreatorEventProjection> = {},
): Partial<CreatorEventProjection> => ({
  event: {
    id: "evt-draft-001",
    title: "VIP Rooftop Session",
    tagline: "",
    description: "Preview fidelity draft.",
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
    startingPriceMinor: 45000,
    currency: "ZAR",
    totalCapacity: 80,
    remainingTickets: 80,
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
  totalCapacity: 80,
  grossRevenueMinor: 0,
  checkedInCount: 0,
  contentSummary: { totalPosts: 0, pinnedCount: 0 },
  eventDraft: {
    title: "VIP Rooftop Session",
    description: "Preview fidelity draft.",
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
    isFree: overrides.eventDraft?.isFree ?? false,
    tiers: overrides.eventDraft?.tiers ?? [
      {
        id: "creator-tier-draft-001",
        name: "VIP Rooftop",
        description: "Premium rooftop access",
        priceMinor: 45000,
        capacity: 80,
        salesStart: "2026-08-01",
        salesEnd: "2026-08-14",
        maxPerOrder: 4,
        availability: "available",
      },
    ],
  },
  ...overrides,
});

describe("LIIT Instruction 6: Preview Draft Fidelity", () => {
  let queryClient: QueryClient;
  let alertSpy: jest.SpyInstance;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockBack.mockClear();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  const renderPreview = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <EventPreview />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders the exact draft values: custom tier name, price, capacity and SAST time", async () => {
    await mockCreatorRepository.saveEventDraft(buildProjection());
    const screen = renderPreview();
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Rooftop Session/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );

    // Exact user-entered tier values — never fabricated.
    expect(screen.getByText("VIP Rooftop")).toBeTruthy();
    expect(screen.getByText("R 450,00")).toBeTruthy();
    expect(screen.getByText(/18:00 SAST/)).toBeTruthy();
    expect(
      screen.getAllByText(/Braamfontein Rooftop Social, Braamfontein/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows Free Registration for a free-event draft instead of paid tiers", async () => {
    await mockCreatorRepository.saveEventDraft(
      buildProjection({
        eventDraft: {
          ...buildProjection().eventDraft!,
          isFree: true,
          tiers: [
            {
              id: "creator-tier-draft-001",
              name: "Free Entry",
              description: "Free registration",
              priceMinor: 0,
              capacity: 80,
              salesStart: "2026-08-01",
              salesEnd: "2026-08-14",
              maxPerOrder: 4,
              availability: "available",
            },
          ],
        },
      }),
    );
    const screen = renderPreview();
    await waitFor(
      () => {
        expect(screen.getByText("Free Registration")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(
      screen.getByText(/This Event is a free registration event/i),
    ).toBeTruthy();
    expect(screen.queryByText("VIP Rooftop")).toBeNull();
  });

  it("Preview controls give explicit preview-mode feedback instead of silent no-ops", async () => {
    await mockCreatorRepository.saveEventDraft(buildProjection());
    const screen = renderPreview();
    await waitFor(
      () => {
        expect(screen.getByText(/VIP Rooftop Session/i)).toBeTruthy();
      },
      { timeout: 10000 },
    );

    fireEvent.press(screen.getByTestId("event-detail-share"));
    expect(alertSpy).toHaveBeenCalledWith(
      "Event Preview",
      expect.stringContaining("Sharing is disabled in Event Preview"),
    );

    fireEvent.press(screen.getByTestId("event-detail-save"));
    expect(alertSpy).toHaveBeenCalledWith(
      "Event Preview",
      expect.stringContaining("Saving is unavailable in Event Preview"),
    );

    fireEvent.press(screen.getByLabelText(/VIP Rooftop, R 450,00/));
    expect(alertSpy).toHaveBeenCalledWith(
      "Event Preview",
      expect.stringContaining("Ticket selection is non-interactive in Preview"),
    );
  });

  it("shows a typed Draft Not Found state for an unknown event", async () => {
    mockParams = { eventId: "evt-does-not-exist" };
    const screen = renderPreview();
    await waitFor(
      () => {
        expect(screen.getByText("Draft Not Found")).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(
      screen.getByText(/No saved draft exists for event ID/i),
    ).toBeTruthy();
  });
});
