import { CreatorRepository } from "../contracts/CreatorRepository";
import {
  CreatorProfile,
  CreatorEventProjection,
  CreatorEventSummary,
  CreatorStats,
  ActiveEventSalesProgress,
  PriorityAlert,
  PayoutSummary,
  PayoutsOverview,
  CreatorContentPost,
  CreatorContentDraft,
  EventAnalytics,
  CreatorGuest,
  CreatorNotification,
  CreatorActivationDraft,
  VerificationChecklistItem,
} from "../../domain/creator";
import {
  MOCK_CREATOR_PROFILE,
  MOCK_CREATOR_EVENT_PROJECTIONS,
  MOCK_CREATOR_STATS,
  MOCK_ACTIVE_EVENTS_PROGRESS,
  MOCK_PRIORITY_ALERTS,
  MOCK_PAYOUTS_OVERVIEW,
  MOCK_PAYOUT_HISTORY,
  MOCK_CONTENT_POSTS,
  MOCK_EVENT_ANALYTICS,
  MOCK_CREATOR_GUESTS,
  MOCK_CREATOR_NOTIFICATIONS,
  MOCK_VERIFICATION_CHECKLIST,
} from "../../fixtures/creator";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockCreatorRepository implements CreatorRepository {
  private profileState: CreatorProfile = { ...MOCK_CREATOR_PROFILE };
  private projectionsState: CreatorEventProjection[] = JSON.parse(
    JSON.stringify(MOCK_CREATOR_EVENT_PROJECTIONS),
  );
  private payoutsOverviewState: PayoutsOverview = {
    ...MOCK_PAYOUTS_OVERVIEW,
  };
  private payoutHistoryState: PayoutSummary[] = [...MOCK_PAYOUT_HISTORY];
  private contentPostsState: CreatorContentPost[] = JSON.parse(
    JSON.stringify(MOCK_CONTENT_POSTS),
  );
  private notificationsState: CreatorNotification[] = JSON.parse(
    JSON.stringify(MOCK_CREATOR_NOTIFICATIONS),
  );
  private guestsState: Record<string, CreatorGuest[]> = JSON.parse(
    JSON.stringify(MOCK_CREATOR_GUESTS),
  );
  private verificationState: VerificationChecklistItem[] = JSON.parse(
    JSON.stringify(MOCK_VERIFICATION_CHECKLIST),
  );
  private simulatedErrorKeys = new Set<string>();

  /** Deterministic reviewer/test failure injection, e.g. "analytics". */
  simulateErrorFor(key: string, enabled = true): void {
    if (enabled) {
      this.simulatedErrorKeys.add(key);
    } else {
      this.simulatedErrorKeys.delete(key);
    }
  }

  /** Reviewer/test override to simulate a zero or arbitrary payout balance. */
  overridePayoutsOverviewForTest(overview: PayoutsOverview): void {
    this.payoutsOverviewState = { ...overview };
  }

  private checkSimulatedError(key: string): void {
    if (this.simulatedErrorKeys.has(key)) {
      throw new Error(
        `Simulated failure for creator domain "${key}" (reviewer test scenario).`,
      );
    }
  }

  private knownEvent(eventId: string): boolean {
    return this.projectionsState.some((p) => p.event.id === eventId);
  }

  async getCreatorProfile(options?: MockOptions): Promise<CreatorProfile> {
    return simulateMockOperation(() => ({ ...this.profileState }), options);
  }

  async getCreatorStats(
    period?: string,
    options?: MockOptions,
  ): Promise<CreatorStats> {
    return simulateMockOperation(
      () => ({
        ...MOCK_CREATOR_STATS,
        period: (period as any) || "30d",
      }),
      options,
    );
  }

  async getCreatorEvents(
    filter?: string,
    options?: MockOptions,
  ): Promise<CreatorEventSummary[]> {
    return simulateMockOperation(() => {
      let items = this.projectionsState.map((p) => ({
        eventId: p.event.id,
        title: p.event.title,
        status: p.operationalStatus,
        ticketsSold: p.ticketsSold,
        totalCapacity: p.totalCapacity,
        grossRevenueMinor: p.grossRevenueMinor,
        currency: p.event.currency,
        startDate: p.event.occurrence.startTime,
        venueName: p.event.venue.name,
        checkedInCount: p.checkedInCount,
      }));

      if (filter && filter.toLowerCase() !== "all") {
        const lowerFilter = filter.toLowerCase();
        items = items.filter((item) => item.status === lowerFilter);
      }

      return items;
    }, options);
  }

  async getCreatorEvent(
    eventId: string,
    options?: MockOptions,
  ): Promise<CreatorEventProjection | null> {
    return simulateMockOperation(() => {
      const projection = this.projectionsState.find(
        (p) => p.event.id === eventId,
      );
      return projection ? JSON.parse(JSON.stringify(projection)) : null;
    }, options);
  }

  async getActiveEventProgress(
    options?: MockOptions,
  ): Promise<ActiveEventSalesProgress[]> {
    return simulateMockOperation(
      () => [...MOCK_ACTIVE_EVENTS_PROGRESS],
      options,
    );
  }

  async getPriorityAlerts(options?: MockOptions): Promise<PriorityAlert[]> {
    return simulateMockOperation(() => [...MOCK_PRIORITY_ALERTS], options);
  }

  async getPayoutsOverview(options?: MockOptions): Promise<PayoutsOverview> {
    return simulateMockOperation(
      () => ({ ...this.payoutsOverviewState }),
      options,
    );
  }

  async getPayoutHistory(options?: MockOptions): Promise<PayoutSummary[]> {
    return simulateMockOperation(() => [...this.payoutHistoryState], options);
  }

  async getContentPosts(
    eventId?: string,
    options?: MockOptions,
  ): Promise<CreatorContentPost[]> {
    return simulateMockOperation(() => {
      this.checkSimulatedError("content");
      if (eventId) {
        return this.contentPostsState.filter((p) => p.eventId === eventId);
      }
      return [...this.contentPostsState];
    }, options);
  }

  async getEventAnalytics(
    eventId: string,
    options?: MockOptions,
  ): Promise<EventAnalytics | null> {
    return simulateMockOperation(() => {
      this.checkSimulatedError("analytics");
      const analytics = MOCK_EVENT_ANALYTICS[eventId];
      if (analytics) {
        return JSON.parse(JSON.stringify(analytics));
      }
      // Unknown events (and known events with no recorded metrics) must NOT
      // silently receive fabricated zero analytics. Return null so the UI can
      // distinguish "no analytics yet" from "event does not exist".
      if (!this.knownEvent(eventId)) {
        return null;
      }
      return null;
    }, options);
  }

  async getEventGuests(
    eventId: string,
    filter?: string,
    search?: string,
    options?: MockOptions,
  ): Promise<CreatorGuest[]> {
    return simulateMockOperation(() => {
      this.checkSimulatedError("guests");
      let list = this.guestsState[eventId] || [];
      if (filter && filter.toLowerCase() !== "all") {
        const lowerFilter = filter.toLowerCase();
        if (lowerFilter === "confirmed") {
          list = list.filter((g) => g.registrationStatus === "confirmed");
        } else if (
          lowerFilter === "checked_in" ||
          lowerFilter === "checked in"
        ) {
          list = list.filter((g) => g.checkInStatus === "checked_in");
        } else if (lowerFilter === "pending") {
          list = list.filter((g) => g.registrationStatus === "pending");
        } else if (lowerFilter === "cancelled") {
          list = list.filter((g) => g.registrationStatus === "cancelled");
        }
      }

      if (search && search.trim()) {
        const term = search.toLowerCase().trim();
        list = list.filter(
          (g) =>
            g.displayName.toLowerCase().includes(term) ||
            g.mockReference.toLowerCase().includes(term) ||
            g.ticketType.toLowerCase().includes(term),
        );
      }

      return JSON.parse(JSON.stringify(list));
    }, options);
  }

  async getCreatorNotifications(
    category?: string,
    options?: MockOptions,
  ): Promise<CreatorNotification[]> {
    return simulateMockOperation(() => {
      this.checkSimulatedError("notifications");
      if (category && category.toLowerCase() !== "all") {
        return this.notificationsState.filter(
          (n) => n.category === category.toLowerCase(),
        );
      }
      return [...this.notificationsState];
    }, options);
  }

  async getVerificationChecklist(
    options?: MockOptions,
  ): Promise<VerificationChecklistItem[]> {
    return simulateMockOperation(() => [...this.verificationState], options);
  }

  // --- Prototype Mutations ---

  async saveActivationDraft(
    draft: CreatorActivationDraft,
    options?: MockOptions,
  ): Promise<CreatorProfile> {
    return simulateMockOperation(() => {
      this.profileState = {
        ...this.profileState,
        brandName: draft.brandName || this.profileState.brandName,
        bio: draft.bio || this.profileState.bio,
        contactEmail: draft.contactEmail,
        contactPreference: draft.contactPreference,
        categories: draft.categories,
        activationStatus: "in_progress",
      };
      return { ...this.profileState };
    }, options);
  }

  async completeActivation(options?: MockOptions): Promise<CreatorProfile> {
    return simulateMockOperation(() => {
      this.profileState = {
        ...this.profileState,
        activationStatus: "verified",
        isVerified: true,
      };
      return { ...this.profileState };
    }, options);
  }

  async saveEventDraft(
    draft: Partial<CreatorEventProjection>,
    options?: MockOptions,
  ): Promise<CreatorEventProjection> {
    return simulateMockOperation(() => {
      // Deterministic draft identity for review fixtures — never Date.now().
      const eventId = draft.event?.id || "evt-draft-001";
      let existingIndex = this.projectionsState.findIndex(
        (p) => p.event.id === eventId,
      );

      if (existingIndex >= 0) {
        this.projectionsState[existingIndex] = {
          ...this.projectionsState[existingIndex],
          ...draft,
          lastEditedAt: new Date().toISOString(),
        };
        return JSON.parse(JSON.stringify(this.projectionsState[existingIndex]));
      }

      // Create new projection
      const newProjection: CreatorEventProjection = {
        event: draft.event || {
          id: eventId,
          title: "Untitled Draft Event",
          tagline: "",
          description: "",
          category: "music",
          status: "draft",
          host: MOCK_CREATOR_PROFILE as any,
          venue: {
            id: "ven-default",
            name: "Default Venue",
            address: "",
            suburb: "Johannesburg",
            city: "Johannesburg",
            province: "Gauteng",
            latitude: -26.2041,
            longitude: 28.0473,
          },
          occurrence: {
            id: `occ-${eventId}`,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            doorsOpen: "18:00",
          },
          heroImageKey: "eventMidnightGrooves",
          galleryImageKeys: [],
          startingPriceMinor: 0,
          currency: "ZAR",
          totalCapacity: 100,
          remainingTickets: 100,
          isSaved: false,
        },
        host: MOCK_CREATOR_PROFILE as any,
        operationalStatus: "draft",
        ticketsSold: 0,
        totalCapacity: draft.totalCapacity || 100,
        grossRevenueMinor: 0,
        checkedInCount: 0,
        contentSummary: { totalPosts: 0, pinnedCount: 0 },
        completionPercentage: 50,
        eventDraft: draft.eventDraft,
        lastEditedAt: new Date().toISOString(),
      };

      this.projectionsState.push(newProjection);
      return JSON.parse(JSON.stringify(newProjection));
    }, options);
  }

  async simulatePublish(
    eventId: string,
    options?: MockOptions,
  ): Promise<{ success: boolean; eventId: string }> {
    return simulateMockOperation(() => {
      const projection = this.projectionsState.find(
        (p) => p.event.id === eventId,
      );
      if (projection) {
        projection.operationalStatus = "published";
        projection.event.status = "published";
      }
      return { success: true, eventId };
    }, options);
  }

  async simulatePayoutRequest(
    amountMinor: number,
    options?: MockOptions,
  ): Promise<{ success: boolean; amountMinor: number; reference: string }> {
    return simulateMockOperation(() => {
      if (amountMinor > this.payoutsOverviewState.availableMinor) {
        throw new Error("Amount exceeds available balance.");
      }

      this.payoutsOverviewState.availableMinor -= amountMinor;
      this.payoutsOverviewState.pendingMinor += amountMinor;

      const sequence = this.payoutHistoryState.length + 1;
      const newPayout: PayoutSummary = {
        payoutId: `pay-req-${String(sequence).padStart(3, "0")}`,
        amountMinor,
        currency: "ZAR",
        status: "processing",
        scheduledDate: new Date().toISOString().split("T")[0],
        bankAccountLast4: this.payoutsOverviewState.bankAccountLast4,
      };

      this.payoutHistoryState.unshift(newPayout);

      return {
        success: true,
        amountMinor,
        reference: `PAY-REQ-${String(sequence).padStart(4, "0")}`,
      };
    }, options);
  }

  async markCreatorNotificationRead(
    notificationId: string,
    options?: MockOptions,
  ): Promise<void> {
    return simulateMockOperation(() => {
      const notif = this.notificationsState.find(
        (n) => n.id === notificationId,
      );
      if (notif) {
        notif.isRead = true;
      }
    }, options);
  }

  async markAllCreatorNotificationsRead(options?: MockOptions): Promise<void> {
    return simulateMockOperation(() => {
      this.notificationsState.forEach((n) => {
        n.isRead = true;
      });
    }, options);
  }

  async toggleGuestCheckIn(
    eventId: string,
    guestId: string,
    options?: MockOptions,
  ): Promise<CreatorGuest> {
    return simulateMockOperation(() => {
      const list = this.guestsState[eventId];
      if (!list) throw new Error("Event guests not found");
      const guest = list.find((g) => g.id === guestId);
      if (!guest) throw new Error("Guest not found");

      if (guest.checkInStatus === "checked_in") {
        guest.checkInStatus = "not_checked_in";
        delete guest.checkInTime;
      } else {
        guest.checkInStatus = "checked_in";
        guest.checkInTime = `${new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} SAST`;
      }

      return { ...guest };
    }, options);
  }

  async createContentPost(
    draft: CreatorContentDraft,
    options?: MockOptions,
  ): Promise<CreatorContentPost> {
    return simulateMockOperation(() => {
      const post: CreatorContentPost = {
        id: `creator-post-${this.contentPostsState.length + 1}`,
        eventId: draft.eventId,
        eventTitle: draft.eventTitle,
        title: draft.title,
        body: draft.body,
        type: draft.type,
        state: draft.state,
        createdAt: new Date().toISOString(),
        scheduledFor: draft.scheduledFor,
        views: 0,
        likes: 0,
        isPinned: draft.autoPin || draft.state === "pinned",
        commentsEnabled: draft.commentsEnabled,
      };
      if (post.isPinned && post.state === "public") {
        post.state = "pinned";
      }
      this.contentPostsState.unshift(post);
      return { ...post };
    }, options);
  }

  async updateContentPost(
    postId: string,
    patch: Partial<CreatorContentPost>,
    options?: MockOptions,
  ): Promise<CreatorContentPost> {
    return simulateMockOperation(() => {
      const index = this.contentPostsState.findIndex((p) => p.id === postId);
      if (index < 0) throw new Error("Content post not found");
      this.contentPostsState[index] = {
        ...this.contentPostsState[index],
        ...patch,
      };
      return { ...this.contentPostsState[index] };
    }, options);
  }

  async toggleContentPin(
    postId: string,
    options?: MockOptions,
  ): Promise<CreatorContentPost> {
    return simulateMockOperation(() => {
      const index = this.contentPostsState.findIndex((p) => p.id === postId);
      if (index < 0) throw new Error("Content post not found");
      const post = this.contentPostsState[index];
      post.isPinned = !post.isPinned;
      if (post.isPinned && post.state === "public") {
        post.state = "pinned";
      } else if (!post.isPinned && post.state === "pinned") {
        post.state = "public";
      }
      return { ...post };
    }, options);
  }

  async toggleContentVisibility(
    postId: string,
    options?: MockOptions,
  ): Promise<CreatorContentPost> {
    return simulateMockOperation(() => {
      const index = this.contentPostsState.findIndex((p) => p.id === postId);
      if (index < 0) throw new Error("Content post not found");
      const post = this.contentPostsState[index];
      post.state = post.state === "hidden" ? "public" : "hidden";
      return { ...post };
    }, options);
  }

  async deleteContentPost(
    postId: string,
    options?: MockOptions,
  ): Promise<void> {
    return simulateMockOperation(() => {
      this.contentPostsState = this.contentPostsState.filter(
        (p) => p.id !== postId,
      );
    }, options);
  }

  resetState(): void {
    this.profileState = { ...MOCK_CREATOR_PROFILE };
    this.projectionsState = JSON.parse(
      JSON.stringify(MOCK_CREATOR_EVENT_PROJECTIONS),
    );
    this.payoutsOverviewState = { ...MOCK_PAYOUTS_OVERVIEW };
    this.payoutHistoryState = [...MOCK_PAYOUT_HISTORY];
    this.contentPostsState = JSON.parse(JSON.stringify(MOCK_CONTENT_POSTS));
    this.notificationsState = JSON.parse(
      JSON.stringify(MOCK_CREATOR_NOTIFICATIONS),
    );
    this.guestsState = JSON.parse(JSON.stringify(MOCK_CREATOR_GUESTS));
    this.verificationState = JSON.parse(
      JSON.stringify(MOCK_VERIFICATION_CHECKLIST),
    );
    this.simulatedErrorKeys.clear();
  }
}

export const mockCreatorRepository = new MockCreatorRepository();
