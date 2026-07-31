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

export const MOCK_CREATOR_PROFILE: CreatorProfile = {
  id: "creator_1",
  brandName: "Underground Sounds",
  bio: "Curators of the finest electronic music experiences in Jozi.",
  totalEventsHosted: 24,
  totalTicketsSold: 12500,
  rating: 4.8,
  followersCount: 3200,
  isVerified: true,
  socialLinks: {
    instagram: "@undergroundsounds",
  },
};

export const MOCK_CREATOR_STATS: CreatorStats = {
  period: "30d",
  totalViews: 45000,
  viewsTrend: 12.5,
  ticketsSold: 850,
  ticketsTrend: 5.2,
  grossRevenueMinor: 12750000,
  revenueTrend: 8.4,
  newFollowers: 120,
  followersTrend: -2.1,
};

export const MOCK_CREATOR_EVENTS: CreatorEventSummary[] = [
  {
    eventId: "evt_1",
    title: "Techno Warehouse",
    status: "published",
    ticketsSold: 450,
    totalCapacity: 500,
    grossRevenueMinor: 6750000,
    currency: "ZAR",
    startDate: "2026-08-15T22:00:00Z",
    venueName: "The Old Biscuit Mill",
  },
  {
    eventId: "evt_2",
    title: "House Classics Session",
    status: "draft",
    ticketsSold: 0,
    totalCapacity: 300,
    grossRevenueMinor: 0,
    currency: "ZAR",
    startDate: "2026-09-01T20:00:00Z",
    venueName: "Rooftop Garden",
  },
  {
    eventId: "evt_3",
    title: "Deep Tech Sundowner",
    status: "live",
    ticketsSold: 250,
    totalCapacity: 250,
    grossRevenueMinor: 3750000,
    currency: "ZAR",
    startDate: new Date().toISOString(),
    venueName: "Beach Club",
  },
  {
    eventId: "evt_4",
    title: "NYE 2026",
    status: "completed",
    ticketsSold: 1000,
    totalCapacity: 1000,
    grossRevenueMinor: 25000000,
    currency: "ZAR",
    startDate: "2025-12-31T20:00:00Z",
    venueName: "Stadium Outer Fields",
  },
];

export const MOCK_ACTIVE_EVENT_PROGRESS: ActiveEventSalesProgress[] = [
  {
    eventId: "evt_1",
    title: "Techno Warehouse",
    ticketsSold: 450,
    totalCapacity: 500,
    revenueMinor: 6750000,
  },
];

export const MOCK_PRIORITY_ALERTS: PriorityAlert[] = [
  {
    id: "alert_1",
    type: "action_required",
    message: "Action required: Complete KYC verification to enable payouts.",
    actionText: "Verify Now",
    actionUrl: "/verification",
  },
];

export const MOCK_PAYOUTS_OVERVIEW: PayoutsOverview = {
  availableMinor: 1500000,
  pendingMinor: 6750000,
  earnedMinor: 25000000,
  currency: "ZAR",
};

export const MOCK_PAYOUT_HISTORY: PayoutSummary[] = [
  {
    payoutId: "pay_1",
    amountMinor: 5000000,
    currency: "ZAR",
    status: "paid",
    scheduledDate: "2026-07-01T10:00:00Z",
    bankAccountLast4: "1234",
  },
  {
    payoutId: "pay_2",
    amountMinor: 1500000,
    currency: "ZAR",
    status: "pending",
    scheduledDate: "2026-08-01T10:00:00Z",
    bankAccountLast4: "1234",
  },
];

export const MOCK_CONTENT_POSTS: CreatorContentPost[] = [
  {
    id: "post_1",
    title: "Techno Warehouse Lineup Announcement",
    state: "pinned",
    createdAt: "2026-07-25T14:00:00Z",
    views: 1250,
    likes: 342,
  },
  {
    id: "post_2",
    title: "Behind the Scenes: NYE",
    state: "public",
    createdAt: "2026-07-20T10:00:00Z",
    views: 890,
    likes: 120,
  },
  {
    id: "post_3",
    title: "Secret Guest Hint",
    state: "scheduled",
    createdAt: "2026-07-30T10:00:00Z",
    scheduledFor: "2026-08-05T18:00:00Z",
    views: 0,
    likes: 0,
  },
];

export const MOCK_EVENT_ANALYTICS: EventAnalytics = {
  eventId: "evt_1",
  pageViews: 5600,
  conversionRate: 8.03,
  totalRevenueMinor: 6750000,
  ticketsDistributed: [
    {
      tierId: "tier_early",
      name: "Early Bird",
      sold: 100,
      capacity: 100,
    },
    {
      tierId: "tier_ga",
      name: "General Admission",
      sold: 300,
      capacity: 350,
    },
    {
      tierId: "tier_vip",
      name: "VIP",
      sold: 50,
      capacity: 50,
    },
  ],
  checkInProgress: {
    checkedIn: 0,
    total: 450,
  },
};
