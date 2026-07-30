import { TicketTier } from "../../domain/event-detail";

export const midnightGroovesTiers: TicketTier[] = [
  {
    id: "tier-general",
    name: "General Access",
    description: "Includes main rooftop deck entry and welcome drink",
    priceMinor: 25000,
    currency: "ZAR",
    remaining: 84,
    state: "available",
  },
  {
    id: "tier-vip",
    name: "VIP Lounge Deck",
    description: "Express entry, VIP bar access, and reserved seating",
    priceMinor: 65000,
    currency: "ZAR",
    remaining: 12,
    state: "selling_fast",
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
  },
];
