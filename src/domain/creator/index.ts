import { Event, EventCategory, HostSummary } from "../events";

/**
 * Creator Domain Models
 */

export type CreatorActivationStatus =
  | "not_started"
  | "in_progress"
  | "verification_pending"
  | "verified"
  | "rejected";

export type VerificationState =
  "not_started" | "incomplete" | "under_review" | "verified" | "rejected";

export interface CreatorProfile {
  id: string; // Matches host.id or user.id
  brandName: string;
  bio: string;
  avatarUrl?: string;
  avatarImageKey?: string;
  coverImageUrl?: string;
  coverImageKey?: string;
  rating?: number;
  isVerified: boolean;
  activationStatus: CreatorActivationStatus;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  contactPreference?: "email" | "whatsapp" | "phone";
  contactEmail?: string;
  categories?: string[];
  totalEventsHosted: number;
  totalTicketsSold: number;
  followersCount: number;
}

export interface CreatorActivationDraft {
  brandName: string;
  bio: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  contactEmail?: string;
  contactPreference?: "email" | "whatsapp" | "phone";
  categories?: string[];
}

export interface VerificationChecklistItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "action_required";
  actionLabel?: string;
}

/**
 * Persisted Event Builder draft. Every field exposed by the Creator Event
 * Builder is captured here so Preview/Edit reconstruct the exact user input.
 */
export interface EventTierDraft {
  id: string;
  name: string;
  description?: string;
  priceMinor: number;
  capacity: number;
  salesStart?: string;
  salesEnd?: string;
  maxPerOrder: number;
  availability: "available" | "selling_fast" | "sold_out";
}

export interface EventDraft {
  title: string;
  description: string;
  category: EventCategory;
  visibility: "Public" | "Private" | "Unlisted";
  ageGuidance: "18+" | "21+" | "All Ages";
  posterUploaded: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  venueSuburb: string;
  venueCity: string;
  isFree: boolean;
  tiers: EventTierDraft[];
}

export interface CreatorContentDraft {
  title: string;
  body: string;
  eventId: string;
  eventTitle?: string;
  type: "post" | "story" | "highlight" | "announcement";
  state: ContentState;
  commentsEnabled: boolean;
  autoPin: boolean;
  scheduledFor?: string;
}

export type EventStatus =
  "draft" | "published" | "live" | "completed" | "cancelled";

export interface CreatorContentSummary {
  totalPosts: number;
  pinnedCount: number;
  latestPostAt?: string;
}

/**
 * Projection of canonical Event + Host data with Creator operational metrics
 */
export interface CreatorEventProjection {
  event: Event;
  host: HostSummary;
  operationalStatus: EventStatus;
  ticketsSold: number;
  totalCapacity: number;
  grossRevenueMinor: number;
  checkedInCount: number;
  contentSummary: CreatorContentSummary;
  completionPercentage?: number;
  lastEditedAt?: string;
  /** Persisted Event Builder draft fields (full form state) */
  eventDraft?: EventDraft;
}

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
  checkedInCount?: number;
}

export interface CreatorStats {
  period: "7d" | "30d" | "all";
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
  severity: "urgent" | "warning" | "info";
  message: string;
  targetRoute?: string;
  targetParams?: Record<string, string>;
  actionUrl?: string;
  actionText?: string;
}

export interface PayoutSummary {
  payoutId: string;
  amountMinor: number;
  currency: string; // "ZAR"
  status: "paid" | "processing" | "pending" | "failed";
  scheduledDate: string;
  bankAccountLast4?: string;
}

export interface PayoutsOverview {
  availableMinor: number;
  pendingMinor: number;
  earnedMinor: number;
  currency: string; // "ZAR"
  nextPayoutDate: string;
  bankAccountLast4: string;
  bankName: string;
}

export type PayoutRequestState =
  "editing" | "processing" | "success" | "failure";

export type PublishSimulationState =
  "review" | "processing" | "success" | "failure";

export type ContentState =
  "pinned" | "public" | "hidden" | "scheduled" | "draft";

export interface CreatorContentPost {
  id: string;
  eventId?: string;
  eventTitle?: string;
  title: string;
  body: string;
  type: "post" | "story" | "highlight" | "announcement";
  state: ContentState;
  createdAt: string;
  scheduledFor?: string;
  views: number;
  likes: number;
  isPinned: boolean;
  commentsEnabled: boolean;
}

export interface AnalyticsSalesPoint {
  label: string;
  amountMinor: number;
  tickets: number;
}

export interface AnalyticsCheckInPoint {
  time: string;
  count: number;
}

export interface AnalyticsTierDistribution {
  tierId: string;
  name: string;
  sold: number;
  capacity: number;
  revenueMinor: number;
}

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  pageViews: number;
  ticketsDistributed: number;
  grossRevenueMinor: number;
  conversionRate: number;
  checkedInCount: number;
  totalCapacity: number;
  salesOverTime: AnalyticsSalesPoint[];
  checkInProgression: AnalyticsCheckInPoint[];
  tierDistribution: AnalyticsTierDistribution[];
}

export interface CreatorGuest {
  id: string;
  displayName: string;
  ticketType: string;
  mockReference: string;
  registrationStatus: "confirmed" | "pending" | "cancelled";
  checkInStatus: "checked_in" | "not_checked_in";
  checkInTime?: string;
}

export interface CreatorNotification {
  id: string;
  category: "sales" | "activity" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetRoute?: string;
  targetParams?: Record<string, string>;
}
