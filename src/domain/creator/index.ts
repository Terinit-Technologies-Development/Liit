/**
 * Creator Domain Models
 */

export interface CreatorProfile {
  id: string;
  brandName: string;
  bio: string;
  totalEventsHosted: number;
  totalTicketsSold: number;
  rating: number;
  followersCount: number;
  isVerified: boolean;
  avatarUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export type EventStatus =
  "draft" | "published" | "live" | "completed" | "cancelled";

export interface CreatorEventSummary {
  eventId: string;
  title: string;
  status: EventStatus;
  ticketsSold: number;
  totalCapacity: number;
  grossRevenueMinor: number;
  currency: string;
  startDate: string;
  venueName: string;
}

export interface CreatorStats {
  period: "7d" | "30d" | "all_time";
  totalViews: number;
  viewsTrend: number;
  ticketsSold: number;
  ticketsTrend: number;
  grossRevenueMinor: number;
  revenueTrend: number;
  newFollowers: number;
  followersTrend: number;
}

export interface ActiveEventSalesProgress {
  eventId: string;
  title: string;
  ticketsSold: number;
  totalCapacity: number;
  revenueMinor: number;
}

export interface PriorityAlert {
  id: string;
  type: "action_required" | "info" | "warning";
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export interface PayoutSummary {
  payoutId: string;
  amountMinor: number;
  currency: string;
  status: "paid" | "processing" | "pending";
  scheduledDate: string;
  bankAccountLast4?: string;
}

export interface PayoutsOverview {
  availableMinor: number;
  pendingMinor: number;
  earnedMinor: number;
  currency: string;
}

export type ContentState =
  "pinned" | "public" | "hidden" | "scheduled" | "draft";

export interface CreatorContentPost {
  id: string;
  title: string;
  state: ContentState;
  createdAt: string;
  scheduledFor?: string;
  views: number;
  likes: number;
}

export interface EventAnalytics {
  eventId: string;
  pageViews: number;
  conversionRate: number;
  totalRevenueMinor: number;
  ticketsDistributed: {
    tierId: string;
    name: string;
    sold: number;
    capacity: number;
  }[];
  checkInProgress: {
    checkedIn: number;
    total: number;
  };
}
