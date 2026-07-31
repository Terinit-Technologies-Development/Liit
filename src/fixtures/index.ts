import { User } from "../domain/identity";
import { Event } from "../domain/events";
import { TicketProduct, OwnedTicket } from "../domain/commerce";
import {
  CreatorProfile,
  CreatorEventSummary,
  PayoutSummary,
} from "../domain/creator";
import { ConversationSummary } from "../domain/social";

export * from "./discovery";
export * from "./social";

export const mockUser: User = {
  id: "usr_jhb_001",
  email: "thabo@liit.app",
  profile: {
    id: "prof_jhb_001",
    handle: "thabo_m",
    displayName: "Thabo Mbeki",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    bio: "Music enthusiast & event creator based in Rosebank, JHB.",
    city: "Johannesburg",
    country: "South Africa",
  },
  creatorCapability: {
    isVerified: true,
    canHostEvents: true,
    canCollectPayouts: true,
    tier: "verified",
  },
  activeMode: "consumer",
  createdAt: "2025-01-15T08:00:00Z",
};

export const mockEvents: Event[] = [
  {
    id: "evt_jhb_midnight_grooves",
    title: "Midnight Grooves JHB",
    tagline: "Deep House & Amapiano under the Braamfontein skyline",
    description:
      "An exclusive rooftop nightlife experience bringing together the finest DJs in Gauteng. Food pop-ups, mixology, and immersive visual art.",
    category: "nightlife",
    status: "published",
    host: {
      id: "host_groove_co",
      name: "Groove Co Johannesburg",
      handle: "grooveco_jhb",
      avatarUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80",
      isVerified: true,
    },
    venue: {
      id: "ven_braam_roof",
      name: "Braamfontein Rooftop Social",
      address: "73 Juta Street",
      suburb: "Braamfontein",
      city: "Johannesburg",
      province: "Gauteng",
      latitude: -26.1929,
      longitude: 28.0373,
    },
    occurrence: {
      id: "occ_midnight_grooves_01",
      startTime: "2026-08-15T18:00:00Z",
      endTime: "2026-08-16T02:00:00Z",
      doorsOpen: "2026-08-15T17:00:00Z",
    },
    heroImageKey: "eventMidnightGrooves",
    galleryImageKeys: ["eventMidnightGrooves"],
    heroImageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    galleryImageUrls: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    ],
    startingPriceMinor: 25000, // R250.00
    currency: "ZAR",
    totalCapacity: 500,
    remainingTickets: 120,
    isSaved: true,
  },
  {
    id: "evt_jhb_rosebank_art",
    title: "Rosebank Art & Jazz Sunset",
    tagline: "Live acoustics and contemporary South African art",
    description:
      "Relaxed Sunday evening session featuring live jazz quintets, local craft drinks, and interactive gallery displays.",
    category: "cultural",
    status: "published",
    host: {
      id: "host_jhb_arts",
      name: "Gauteng Cultural Collective",
      handle: "gauteng_arts",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      isVerified: true,
    },
    venue: {
      id: "ven_keyes_art",
      name: "Keyes Art Mile",
      address: "21 Keyes Avenue",
      suburb: "Rosebank",
      city: "Johannesburg",
      province: "Gauteng",
      latitude: -26.1466,
      longitude: 28.0436,
    },
    occurrence: {
      id: "occ_rosebank_art_01",
      startTime: "2026-08-22T15:00:00Z",
      endTime: "2026-08-22T21:00:00Z",
      doorsOpen: "2026-08-22T14:30:00Z",
    },
    heroImageKey: "eventRosebankArtJazz",
    galleryImageKeys: ["eventRosebankArtJazz"],
    heroImageUrl:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80",
    galleryImageUrls: [],
    startingPriceMinor: 15000, // R150.00
    currency: "ZAR",
    totalCapacity: 300,
    remainingTickets: 45,
    isSaved: false,
  },
];

export const mockTicketProducts: TicketProduct[] = [
  {
    id: "tkt_prod_early",
    eventId: "evt_jhb_midnight_grooves",
    name: "Early Bird Pass",
    tierName: "Early Bird",
    priceMinor: 25000, // R250.00
    currency: "ZAR",
    inventoryState: "available",
    maxPerOrder: 4,
  },
  {
    id: "tkt_prod_vip",
    eventId: "evt_jhb_midnight_grooves",
    name: "VIP Sky Deck",
    tierName: "VIP Access",
    priceMinor: 65000, // R650.00
    currency: "ZAR",
    inventoryState: "low_stock",
    maxPerOrder: 2,
  },
];

export const mockOwnedTickets: OwnedTicket[] = [
  {
    id: "tkt_owned_001",
    orderId: "ord_jhb_9910",
    eventId: "evt_jhb_midnight_grooves",
    eventTitle: "Midnight Grooves JHB",
    venueName: "Braamfontein Rooftop Social",
    eventStartTime: "2026-08-15T18:00:00Z",
    ticketTierName: "Early Bird",
    qrCodeValue: "LIIT-TKT-JHB-9910-001",
    status: "valid",
  },
];

export const mockCreatorProfile: CreatorProfile = {
  id: "cprof_jhb_001",
  brandName: "Thabo Mbeki Presents",
  bio: "Curating underground house and electronic music experiences in Jozi.",
  totalEventsHosted: 12,
  totalTicketsSold: 2450,
  rating: 4.9,
};

export const mockCreatorEvents: CreatorEventSummary[] = [
  {
    eventId: "evt_jhb_midnight_grooves",
    title: "Midnight Grooves JHB",
    status: "published",
    ticketsSold: 380,
    totalCapacity: 500,
    grossRevenueMinor: 9500000, // R95,000.00
    currency: "ZAR",
    startDate: "2026-08-15",
  },
];

export const mockPayouts: PayoutSummary[] = [
  {
    payoutId: "pay_jhb_881",
    amountMinor: 4500000, // R45,000.00
    currency: "ZAR",
    status: "paid",
    scheduledDate: "2026-07-20",
    bankAccountLast4: "4092",
  },
];

export const mockConversations: ConversationSummary[] = [
  {
    id: "conv_001",
    participantNames: ["Sibusiso Dlamini"],
    participantAvatarUrls: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    ],
    lastMessage: {
      id: "msg_001",
      conversationId: "conv_001",
      senderId: "usr_sibu",
      senderName: "Sibusiso",
      senderAvatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      senderType: "consumer",
      content: "Hey Thabo, see you at Braamfontein tonight!",
      sentAt: "2026-07-29T10:00:00Z",
      status: "delivered",
      isIncoming: true,
    },
    unreadCount: 1,
  },
];
