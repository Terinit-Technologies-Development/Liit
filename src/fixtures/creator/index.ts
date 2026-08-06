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
  VerificationChecklistItem,
} from "../../domain/creator";
import { discoveryEvents } from "../discovery/events";
import { discoveryHosts } from "../discovery/hosts";

export const MOCK_CREATOR_PROFILE: CreatorProfile = {
  id: "host-groove-co",
  brandName: "Groove Co. Johannesburg",
  bio: "Curating premier deep house, electronic music & rooftop nightlife experiences in Jozi.",
  avatarUrl: "",
  avatarImageKey: "hostGrooveCo",
  coverImageUrl:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  rating: 4.9,
  isVerified: true,
  activationStatus: "verified",
  socialLinks: {
    instagram: "@grooveco_jhb",
    tiktok: "@grooveco_jhb",
    website: "https://grooveco.co.za",
  },
  contactPreference: "email",
  contactEmail: "events@grooveco.co.za",
  categories: ["nightlife", "music"],
  totalEventsHosted: 18,
  totalTicketsSold: 4250,
  followersCount: 3200,
};

export const MOCK_CREATOR_EVENT_PROJECTIONS: CreatorEventProjection[] = [
  {
    event: discoveryEvents[0], // evt-midnight-grooves
    host: discoveryHosts[0], // host-groove-co
    operationalStatus: "published",
    ticketsSold: 285,
    totalCapacity: 300,
    grossRevenueMinor: 7125000, // R71,250.00
    checkedInCount: 240,
    contentSummary: {
      totalPosts: 5,
      pinnedCount: 1,
      latestPostAt: "2026-07-28T14:00:00.000Z",
    },
    completionPercentage: 100,
    lastEditedAt: "2026-07-28T14:00:00.000Z",
  },
  {
    event: discoveryEvents[1], // evt-rosebank-art-jazz
    host: discoveryHosts[2], // host-art-hub-jhb
    operationalStatus: "published",
    ticketsSold: 80,
    totalCapacity: 200,
    grossRevenueMinor: 2800000, // R28,000.00
    checkedInCount: 0,
    contentSummary: {
      totalPosts: 2,
      pinnedCount: 0,
      latestPostAt: "2026-07-25T10:00:00.000Z",
    },
    completionPercentage: 100,
    lastEditedAt: "2026-07-25T10:00:00.000Z",
  },
  {
    event: discoveryEvents[2], // evt-soweto-food-market
    host: discoveryHosts[1], // host-jozi-vibe-tribe
    operationalStatus: "draft",
    ticketsSold: 0,
    totalCapacity: 400,
    grossRevenueMinor: 0,
    checkedInCount: 0,
    contentSummary: {
      totalPosts: 0,
      pinnedCount: 0,
    },
    completionPercentage: 75,
    lastEditedAt: "2026-07-29T09:30:00.000Z",
  },
];

export const MOCK_CREATOR_EVENTS_SUMMARY: CreatorEventSummary[] =
  MOCK_CREATOR_EVENT_PROJECTIONS.map((p) => ({
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

export const MOCK_CREATOR_STATS: CreatorStats = {
  period: "30d",
  totalViews: 14500,
  viewsTrend: 12.5,
  ticketsSold: 365,
  ticketsTrend: 8.2,
  grossRevenueMinor: 9925000, // R99,250.00
  revenueTrend: 15.4,
  newFollowers: 240,
  followersTrend: 6.1,
};

export const MOCK_ACTIVE_EVENTS_PROGRESS: ActiveEventSalesProgress[] = [
  {
    eventId: "evt-midnight-grooves",
    title: "Midnight Kinetic Grooves",
    ticketsSold: 285,
    totalCapacity: 300,
    revenueMinor: 7125000,
  },
  {
    eventId: "evt-rosebank-art-jazz",
    title: "Rosebank Art & Jazz Lounge",
    ticketsSold: 80,
    totalCapacity: 200,
    revenueMinor: 2800000,
  },
];

export const MOCK_PRIORITY_ALERTS: PriorityAlert[] = [
  {
    id: "alert-1",
    type: "action_required",
    severity: "urgent",
    message:
      "Midnight Kinetic Grooves is 95% sold out! Consider adding a final VIP tier.",
    targetRoute: "/(creator)/events/evt-midnight-grooves",
    actionText: "View Event Ops",
  },
  {
    id: "alert-2",
    type: "info",
    severity: "info",
    message: "Monthly creator payout of R 15,000.00 scheduled for Aug 10.",
    targetRoute: "/(creator)/payouts",
    actionText: "View Payouts",
  },
];

export const MOCK_PAYOUTS_OVERVIEW: PayoutsOverview = {
  availableMinor: 1500000, // R 15,000.00
  pendingMinor: 450000, // R 4,500.00
  earnedMinor: 8500000, // R 85,000.00
  currency: "ZAR",
  nextPayoutDate: "2026-08-10",
  bankAccountLast4: "4092",
  bankName: "Standard Bank South Africa",
};

export const MOCK_PAYOUT_HISTORY: PayoutSummary[] = [
  {
    payoutId: "pay-001",
    amountMinor: 3500000, // R35,000.00
    currency: "ZAR",
    status: "paid",
    scheduledDate: "2026-07-20",
    bankAccountLast4: "4092",
  },
  {
    payoutId: "pay-002",
    amountMinor: 5000000, // R50,000.00
    currency: "ZAR",
    status: "paid",
    scheduledDate: "2026-06-15",
    bankAccountLast4: "4092",
  },
];

export const MOCK_CONTENT_POSTS: CreatorContentPost[] = [
  {
    id: "post-1",
    eventId: "evt-midnight-grooves",
    eventTitle: "Midnight Kinetic Grooves",
    title: "DJ Lineup Announcement & Set Times",
    body: "Featuring JHB's finest selectors on the Braamfontein rooftop stage! Doors open 20:00.",
    type: "announcement",
    state: "pinned",
    createdAt: "2026-07-25T14:00:00.000Z",
    views: 1420,
    likes: 184,
    isPinned: true,
    commentsEnabled: true,
  },
  {
    id: "post-2",
    eventId: "evt-midnight-grooves",
    eventTitle: "Midnight Kinetic Grooves",
    title: "Sound Check & Visual Setup",
    body: "Rooftop lighting and acoustic testing in progress. Ready for tonight!",
    type: "story",
    state: "public",
    createdAt: "2026-07-28T10:00:00.000Z",
    views: 890,
    likes: 95,
    isPinned: false,
    commentsEnabled: true,
  },
  {
    id: "post-3",
    eventId: "evt-rosebank-art-jazz",
    eventTitle: "Rosebank Art & Jazz Lounge",
    title: "Featured Artist Spotlight: Sibusiso Dlamini",
    body: "Exclusive interview with our guest saxophone soloist.",
    type: "highlight",
    state: "public",
    createdAt: "2026-07-22T16:30:00.000Z",
    views: 640,
    likes: 72,
    isPinned: false,
    commentsEnabled: true,
  },
];

export const MOCK_EVENT_ANALYTICS: Record<string, EventAnalytics> = {
  "evt-midnight-grooves": {
    eventId: "evt-midnight-grooves",
    eventTitle: "Midnight Kinetic Grooves",
    pageViews: 1250,
    ticketsDistributed: 285,
    grossRevenueMinor: 7125000, // R71,250.00
    conversionRate: 22.8,
    checkedInCount: 240,
    totalCapacity: 300,
    salesOverTime: [
      { label: "Jul 20", amountMinor: 1250000, tickets: 50 },
      { label: "Jul 22", amountMinor: 2000000, tickets: 80 },
      { label: "Jul 25", amountMinor: 2500000, tickets: 100 },
      { label: "Jul 28", amountMinor: 1375000, tickets: 55 },
    ],
    checkInProgression: [
      { time: "20:00 SAST", count: 40 },
      { time: "21:00 SAST", count: 110 },
      { time: "22:00 SAST", count: 190 },
      { time: "23:00 SAST", count: 240 },
    ],
    tierDistribution: [
      {
        tierId: "tier-early",
        name: "Early Bird Pass",
        sold: 100,
        capacity: 100,
        revenueMinor: 2500000,
      },
      {
        tierId: "tier-general",
        name: "General Admission",
        sold: 150,
        capacity: 150,
        revenueMinor: 3750000,
      },
      {
        tierId: "tier-vip",
        name: "VIP Sky Deck",
        sold: 35,
        capacity: 50,
        revenueMinor: 875000,
      },
    ],
  },
};

export const MOCK_CREATOR_GUESTS: Record<string, CreatorGuest[]> = {
  "evt-midnight-grooves": [
    {
      id: "gst-001",
      displayName: "Sibusiso Dlamini",
      ticketType: "VIP Sky Deck",
      mockReference: "LIIT-REF-9901",
      registrationStatus: "confirmed",
      checkInStatus: "checked_in",
      checkInTime: "21:15 SAST",
    },
    {
      id: "gst-002",
      displayName: "Kagiso Molefe",
      ticketType: "General Admission",
      mockReference: "LIIT-REF-9902",
      registrationStatus: "confirmed",
      checkInStatus: "checked_in",
      checkInTime: "21:45 SAST",
    },
    {
      id: "gst-003",
      displayName: "Lerato Kgosi",
      ticketType: "Early Bird Pass",
      mockReference: "LIIT-REF-9903",
      registrationStatus: "confirmed",
      checkInStatus: "not_checked_in",
    },
    {
      id: "gst-004",
      displayName: "Zanele Khumalo",
      ticketType: "General Admission",
      mockReference: "LIIT-REF-9904",
      registrationStatus: "pending",
      checkInStatus: "not_checked_in",
    },
    {
      id: "gst-005",
      displayName: "Tshepo Maseko",
      ticketType: "Early Bird Pass",
      mockReference: "LIIT-REF-9905",
      registrationStatus: "cancelled",
      checkInStatus: "not_checked_in",
    },
  ],
};

export const MOCK_CREATOR_NOTIFICATIONS: CreatorNotification[] = [
  {
    id: "cnotif-1",
    category: "sales",
    title: "VIP Ticket Purchased",
    message:
      "Sibusiso Dlamini purchased 1x VIP Sky Deck ticket for Midnight Kinetic Grooves.",
    timestamp: "10m ago",
    isRead: false,
    targetRoute: "/(creator)/events/evt-midnight-grooves/guests",
  },
  {
    id: "cnotif-2",
    category: "activity",
    title: "New Host Follower",
    message: "Lerato Kgosi started following Groove Co. Johannesburg.",
    timestamp: "1h ago",
    isRead: false,
    targetRoute: "/(creator)/profile",
  },
  {
    id: "cnotif-3",
    category: "system",
    title: "Monthly Payout Scheduled",
    message:
      "Your payout of R 15,000.00 is scheduled for processing on Aug 10.",
    timestamp: "1d ago",
    isRead: true,
    targetRoute: "/(creator)/payouts",
  },
];

export const MOCK_VERIFICATION_CHECKLIST: VerificationChecklistItem[] = [
  {
    id: "vcheck-1",
    title: "Creator Profile Complete",
    description: "Public brand name, bio, and social handles provided.",
    status: "completed",
  },
  {
    id: "vcheck-2",
    title: "Contact Preference Confirmed",
    description: "Verified email contact events@grooveco.co.za.",
    status: "completed",
  },
  {
    id: "vcheck-3",
    title: "Hosting Responsibilities Accepted",
    description: "Agreed to safe event guidelines and refund terms.",
    status: "completed",
  },
  {
    id: "vcheck-4",
    title: "Payout Account Connected",
    description: "Standard Bank South Africa (•••• 4092) linked.",
    status: "completed",
  },
  {
    id: "vcheck-5",
    title: "Simulated Identity Verification",
    description: "Prototype identity check passed.",
    status: "completed",
  },
  {
    id: "vcheck-6",
    title: "Community Guidelines",
    description: "Agreed to South African event safety standards.",
    status: "completed",
  },
];
