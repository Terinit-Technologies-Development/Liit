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
}

export interface CreatorEventSummary {
  eventId: string;
  title: string;
  status: "draft" | "published" | "live" | "completed";
  ticketsSold: number;
  totalCapacity: number;
  grossRevenueMinor: number;
  currency: string;
  startDate: string;
}

export interface EventDraftSummary {
  draftId: string;
  title: string;
  lastEditedAt: string;
  completionPercentage: number;
}

export interface PayoutSummary {
  payoutId: string;
  amountMinor: number;
  currency: string; // "ZAR"
  status: "paid" | "processing" | "pending";
  scheduledDate: string;
  bankAccountLast4: string;
}
