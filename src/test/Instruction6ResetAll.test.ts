import { QueryClient } from "@tanstack/react-query";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

describe("LIIT Instruction 6: Reset All Prototype State", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
  });

  const seedPrototypeMutations = async () => {
    // Activation + verification mutations
    const store = useCreatorStore.getState();
    store.setActivationDraft({ brandName: "Mutated Brand" });
    store.setActivationStatus("verified");
    store.setVerificationState("verified");
    store.setCompletedVerificationItems(["vcheck-1", "vcheck-2"]);

    // Event draft + dirty + publish state
    await mockCreatorRepository.saveEventDraft({
      event: {
        id: "evt-draft-001",
        title: "Seeded Draft",
        tagline: "",
        description: "Seeded",
        category: "music",
        status: "draft",
        host: {
          id: "host-groove-co",
          name: "Groove Co.",
          handle: "@grooveco",
          avatarUrl: "",
          isVerified: true,
        },
        venue: {
          id: "v1",
          name: "Venue",
          address: "",
          suburb: "JHB",
          city: "Johannesburg",
          province: "Gauteng",
          latitude: 0,
          longitude: 0,
        },
        occurrence: {
          id: "o1",
          startTime: "2026-08-15T18:00:00+02:00",
          endTime: "2026-08-16T02:00:00+02:00",
          doorsOpen: "18:00",
        },
        startingPriceMinor: 0,
        currency: "ZAR",
        totalCapacity: 10,
        remainingTickets: 10,
      },
      operationalStatus: "draft",
      eventDraft: {
        title: "Seeded Draft",
        description: "Seeded",
        category: "music",
        visibility: "Public",
        ageGuidance: "18+",
        posterUploaded: true,
        startDate: "2026-08-15",
        startTime: "18:00",
        endDate: "2026-08-16",
        endTime: "02:00",
        venueName: "Venue",
        venueAddress: "",
        venueSuburb: "JHB",
        venueCity: "Johannesburg",
        isFree: true,
        tiers: [],
      },
    });
    store.setIsFormDirty(true);
    store.setPublishSimulationState("failure");
    store.setSelectedEventFilter("published");
    store.setSelectedNotificationCategory("sales");
    store.setEventDraft({
      title: "Seeded Draft",
      description: "Seeded",
      category: "music",
      visibility: "Public",
      ageGuidance: "18+",
      posterUploaded: true,
      startDate: "2026-08-15",
      startTime: "18:00",
      endDate: "2026-08-16",
      endTime: "02:00",
      venueName: "Venue",
      venueAddress: "",
      venueSuburb: "JHB",
      venueCity: "Johannesburg",
      isFree: true,
      tiers: [],
    });
    store.setActiveDraftEvent({ event: { id: "evt-draft-001" } as any });

    // Payout simulation
    await mockCreatorRepository.simulatePayoutRequest(50000);

    // Content mutation
    await mockCreatorRepository.createContentPost({
      title: "Reset Me Post",
      body: "Should be removed on reset",
      eventId: "evt-midnight-grooves",
      type: "announcement",
      state: "public",
      commentsEnabled: true,
      autoPin: false,
    });

    // Guest check-in mutation
    await mockCreatorRepository.toggleGuestCheckIn(
      "evt-midnight-grooves",
      "gst-003",
    );

    // Notification mutations
    await mockCreatorRepository.markAllCreatorNotificationsRead();
  };

  it("resets activation, verification, event draft, dirty state, publish state and filters", async () => {
    await seedPrototypeMutations();

    const before = useCreatorStore.getState();
    expect(before.activationStatus).toBe("verified");
    expect(before.isFormDirty).toBe(true);
    expect(before.publishSimulationState).toBe("failure");

    useCreatorStore.getState().resetCreatorStore();

    const after = useCreatorStore.getState();
    expect(after.activationStatus).toBe("not_started");
    expect(after.verificationState).toBe("not_started");
    expect(after.completedVerificationItems).toEqual([]);
    expect(after.activationDraft.brandName).toBe("");
    expect(after.eventDraft).toBeNull();
    expect(after.activeDraftEvent).toBeNull();
    expect(after.isFormDirty).toBe(false);
    expect(after.publishSimulationState).toBe("review");
    expect(after.selectedEventFilter).toBe("all");
    expect(after.selectedNotificationCategory).toBe("all");
  });

  it("resets the Creator repository state (profile, events, payouts, content, guests, notifications)", async () => {
    await seedPrototypeMutations();

    const profileBefore = await mockCreatorRepository.getCreatorProfile();
    expect(profileBefore.activationStatus).toBe("verified");

    const eventsBefore = await mockCreatorRepository.getCreatorEvents();
    expect(eventsBefore.some((e) => e.eventId === "evt-draft-001")).toBe(true);

    const overviewBefore = await mockCreatorRepository.getPayoutsOverview();
    expect(overviewBefore.availableMinor).toBe(1450000);

    const contentBefore = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    expect(contentBefore.some((p) => p.title === "Reset Me Post")).toBe(true);

    const guestsBefore = await mockCreatorRepository.getEventGuests(
      "evt-midnight-grooves",
    );
    expect(guestsBefore.find((g) => g.id === "gst-003")?.checkInStatus).toBe(
      "checked_in",
    );

    const notifsBefore = await mockCreatorRepository.getCreatorNotifications();
    expect(notifsBefore.every((n) => n.isRead)).toBe(true);

    // Reset All: store reset also resets the repository singleton.
    useCreatorStore.getState().resetCreatorStore();

    const profileAfter = await mockCreatorRepository.getCreatorProfile();
    expect(profileAfter.activationStatus).toBe("verified");
    expect(profileAfter.isVerified).toBe(true);
    expect(profileAfter.brandName).toBe("Groove Co. Johannesburg");

    const eventsAfter = await mockCreatorRepository.getCreatorEvents();
    expect(eventsAfter.some((e) => e.eventId === "evt-draft-001")).toBe(false);

    const overviewAfter = await mockCreatorRepository.getPayoutsOverview();
    expect(overviewAfter.availableMinor).toBe(1500000);
    expect(overviewAfter.pendingMinor).toBe(450000);

    const contentAfter = await mockCreatorRepository.getContentPosts(
      "evt-midnight-grooves",
    );
    expect(contentAfter.some((p) => p.title === "Reset Me Post")).toBe(false);

    const guestsAfter = await mockCreatorRepository.getEventGuests(
      "evt-midnight-grooves",
    );
    expect(guestsAfter.find((g) => g.id === "gst-003")?.checkInStatus).toBe(
      "not_checked_in",
    );

    const notifsAfter = await mockCreatorRepository.getCreatorNotifications();
    expect(notifsAfter.some((n) => !n.isRead)).toBe(true);

    const historyAfter = await mockCreatorRepository.getPayoutHistory();
    expect(historyAfter.map((h) => h.payoutId)).toEqual(["pay-001", "pay-002"]);
  });

  it("clears the Creator React Query cache (as Reset All does via queryClient.clear)", async () => {
    await mockCreatorRepository.saveEventDraft({
      event: {
        id: "evt-draft-001",
        title: "Cache Test",
        tagline: "",
        description: "Cache test",
        category: "music",
        status: "draft",
        host: {
          id: "host-groove-co",
          name: "Groove Co.",
          handle: "@grooveco",
          avatarUrl: "",
          isVerified: true,
        },
        venue: {
          id: "v1",
          name: "Venue",
          address: "",
          suburb: "JHB",
          city: "Johannesburg",
          province: "Gauteng",
          latitude: 0,
          longitude: 0,
        },
        occurrence: {
          id: "o1",
          startTime: "2026-08-15T18:00:00+02:00",
          endTime: "2026-08-16T02:00:00+02:00",
          doorsOpen: "18:00",
        },
        startingPriceMinor: 0,
        currency: "ZAR",
        totalCapacity: 10,
        remainingTickets: 10,
      },
      operationalStatus: "draft",
    });
    queryClient.setQueryData(
      ["creator", "events"],
      [{ eventId: "evt-draft-001" }],
    );

    // Mirror prototype-controls handleResetAll cache behaviour.
    useCreatorStore.getState().resetCreatorStore();
    queryClient.clear();

    expect(queryClient.getQueryData(["creator", "events"])).toBeUndefined();
    expect(
      queryClient.getQueryData(["creator", "event", "evt-draft-001"]),
    ).toBeUndefined();
    expect(useCreatorStore.getState().activationStatus).toBe("not_started");
  });
});
