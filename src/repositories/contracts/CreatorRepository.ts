import {
  CreatorProfile,
  CreatorEventSummary,
  CreatorStats,
  ActiveEventSalesProgress,
  PriorityAlert,
  PayoutSummary,
  PayoutsOverview,
  CreatorContentPost,
  EventAnalytics,
} from "../../domain/creator";

export interface CreatorRepository {
  getCreatorProfile(): Promise<CreatorProfile>;
  getCreatorStats(): Promise<CreatorStats>;
  getCreatorEvents(): Promise<CreatorEventSummary[]>;
  getActiveEventProgress(): Promise<ActiveEventSalesProgress[]>;
  getPriorityAlerts(): Promise<PriorityAlert[]>;
  getPayoutsOverview(): Promise<PayoutsOverview>;
  getPayoutHistory(): Promise<PayoutSummary[]>;
  getContentPosts(): Promise<CreatorContentPost[]>;
  getEventAnalytics(eventId: string): Promise<EventAnalytics>;
}
