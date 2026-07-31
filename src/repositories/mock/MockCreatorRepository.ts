import { CreatorRepository } from "../contracts/CreatorRepository";
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
import {
  MOCK_CREATOR_PROFILE,
  MOCK_CREATOR_EVENTS,
  MOCK_CREATOR_STATS,
  MOCK_ACTIVE_EVENT_PROGRESS,
  MOCK_PRIORITY_ALERTS,
  MOCK_PAYOUTS_OVERVIEW,
  MOCK_PAYOUT_HISTORY,
  MOCK_CONTENT_POSTS,
  MOCK_EVENT_ANALYTICS,
} from "../../fixtures/creator";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockCreatorRepository implements CreatorRepository {
  async getCreatorProfile(options?: MockOptions): Promise<CreatorProfile> {
    return simulateMockOperation(() => ({ ...MOCK_CREATOR_PROFILE }), options);
  }

  async getCreatorStats(options?: MockOptions): Promise<CreatorStats> {
    return simulateMockOperation(() => ({ ...MOCK_CREATOR_STATS }), options);
  }

  async getCreatorEvents(
    options?: MockOptions,
  ): Promise<CreatorEventSummary[]> {
    return simulateMockOperation(() => [...MOCK_CREATOR_EVENTS], options);
  }

  async getActiveEventProgress(
    options?: MockOptions,
  ): Promise<ActiveEventSalesProgress[]> {
    return simulateMockOperation(
      () => [...MOCK_ACTIVE_EVENT_PROGRESS],
      options,
    );
  }

  async getPriorityAlerts(options?: MockOptions): Promise<PriorityAlert[]> {
    return simulateMockOperation(() => [...MOCK_PRIORITY_ALERTS], options);
  }

  async getPayoutsOverview(options?: MockOptions): Promise<PayoutsOverview> {
    return simulateMockOperation(() => ({ ...MOCK_PAYOUTS_OVERVIEW }), options);
  }

  async getPayoutHistory(options?: MockOptions): Promise<PayoutSummary[]> {
    return simulateMockOperation(() => [...MOCK_PAYOUT_HISTORY], options);
  }

  async getContentPosts(options?: MockOptions): Promise<CreatorContentPost[]> {
    return simulateMockOperation(() => [...MOCK_CONTENT_POSTS], options);
  }

  async getEventAnalytics(
    eventId: string,
    options?: MockOptions,
  ): Promise<EventAnalytics> {
    return simulateMockOperation(() => ({ ...MOCK_EVENT_ANALYTICS }), options);
  }
}

export const mockCreatorRepository = new MockCreatorRepository();
