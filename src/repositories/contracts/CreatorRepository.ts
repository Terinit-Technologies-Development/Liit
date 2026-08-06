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

export interface CreatorRepository {
  getCreatorProfile(): Promise<CreatorProfile>;
  getCreatorStats(period?: string): Promise<CreatorStats>;
  getCreatorEvents(filter?: string): Promise<CreatorEventSummary[]>;
  getCreatorEvent(eventId: string): Promise<CreatorEventProjection | null>;
  getActiveEventProgress(): Promise<ActiveEventSalesProgress[]>;
  getPriorityAlerts(): Promise<PriorityAlert[]>;
  getPayoutsOverview(): Promise<PayoutsOverview>;
  getPayoutHistory(): Promise<PayoutSummary[]>;
  getContentPosts(eventId?: string): Promise<CreatorContentPost[]>;
  getEventAnalytics(eventId: string): Promise<EventAnalytics>;
  getEventGuests(
    eventId: string,
    filter?: string,
    search?: string,
  ): Promise<CreatorGuest[]>;
  getCreatorNotifications(category?: string): Promise<CreatorNotification[]>;
  getVerificationChecklist(): Promise<VerificationChecklistItem[]>;

  // Prototype mutations
  saveActivationDraft(draft: CreatorActivationDraft): Promise<CreatorProfile>;
  completeActivation(): Promise<CreatorProfile>;
  saveEventDraft(
    draft: Partial<CreatorEventProjection>,
  ): Promise<CreatorEventProjection>;
  simulatePublish(
    eventId: string,
  ): Promise<{ success: boolean; eventId: string }>;
  simulatePayoutRequest(
    amountMinor: number,
  ): Promise<{ success: boolean; amountMinor: number; reference: string }>;
  markCreatorNotificationRead(notificationId: string): Promise<void>;
  markAllCreatorNotificationsRead(): Promise<void>;
  toggleGuestCheckIn(eventId: string, guestId: string): Promise<CreatorGuest>;
}
