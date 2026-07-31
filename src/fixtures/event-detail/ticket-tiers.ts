import { TicketTier } from "../../domain/event-detail";

export const midnightGroovesTiers: TicketTier[] = [
  {
    id: "tier-general",
    name: "General Access",
    description: "Includes main rooftop deck entry and welcome drink.",
    priceMinor: 25000,
    currency: "ZAR",
    remaining: 84,
    state: "available",
    maxPerOrder: 6,
  },
  {
    id: "tier-vip",
    name: "VIP Lounge Deck",
    description: "Express entry, VIP bar access, and reserved seating.",
    priceMinor: 65000,
    currency: "ZAR",
    remaining: 12,
    state: "selling_fast",
    maxPerOrder: 4,
    premiumLabel: "Premium",
  },
  {
    id: "tier-vip-tables",
    name: "VIP Table Reservation (4 Guests)",
    description: "Reserved booth with complimentary bottle service.",
    priceMinor: 150000,
    currency: "ZAR",
    remaining: 2,
    state: "selling_fast",
    maxPerOrder: 2,
    premiumLabel: "VIP Table",
  },
];

export const deepHouseTiers: TicketTier[] = [
  {
    id: "tier-sold-out",
    name: "General Access",
    description: "Rooftop intimacy (Sold Out)",
    priceMinor: 18000,
    currency: "ZAR",
    remaining: 0,
    state: "sold_out",
    maxPerOrder: 6,
  },
];

export const freeRegistrationTiers: TicketTier[] = [
  {
    id: "tier-free-registration",
    name: "Free Registration",
    description: "One registration per LIIT profile.",
    priceMinor: 0,
    currency: "ZAR",
    remaining: 180,
    state: "available",
    maxPerOrder: 1,
  },
];
