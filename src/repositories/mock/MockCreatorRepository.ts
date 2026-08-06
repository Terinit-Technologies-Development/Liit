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
  EventAnalytics,
  CreatorGuest,
  CreatorNotification,
  CreatorActivationDraft,
  VerificationChecklistItem,
} from "../../domain/creator";
import {
  MOCK_CREATOR_PROFILE,
  MOCK_CREATOR_EVENT_PROJECTIONS,
  MOCK_CREATOR_EVENTS_SUMMARY,
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
      if (eventId) {
        return this.contentPostsState.filter((p) => p.eventId === eventId);
      }
      return [...this.contentPostsState];
    }, options);
  }

  async getEventAnalytics(
    eventId: string,
    options?: MockOptions,
  ): Promise<EventAnalytics> {
    return simulateMockOperation(() => {
      const analytics = MOCK_EVENT_ANALYTICS[eventId];
      if (analytics) {
        return JSON.parse(JSON.stringify(analytics));
      }
      // Fallback default analytics for draft/new events
      return {
        eventId,
        eventTitle: "Event Analytics",
        pageViews: 0,
        ticketsDistributed: 0,
        grossRevenueMinor: 0,
        conversionRate: 0,
        checkedInCount: 0,
        totalCapacity: 100,
        salesOverTime: [],
        checkInProgression: [],
        tierDistribution: [],
      };
    }, options);
  }

  async getEventGuests(
    eventId: string,
    filter?: string,
    search?: string,
    options?: MockOptions,
  ): Promise<CreatorGuest[]> {
    return simulateMockOperation(() => {
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
      const eventId = draft.event?.id || `evt-draft-${Date.now()}`;
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

      const newPayout: PayoutSummary = {
        payoutId: `pay-req-${Date.now()}`,
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
        reference: `PAY-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
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
  }
}

export const mockCreatorRepository = new MockCreatorRepository();
