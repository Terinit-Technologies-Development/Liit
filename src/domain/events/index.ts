/**
 * Events Domain Models
 */

export type EventStatus =
  "draft" | "published" | "live" | "sold_out" | "cancelled" | "completed";
export type EventCategory =
  "music" | "nightlife" | "cultural" | "fashion" | "art" | "food_drink";

export interface Venue {
  id: string;
  name: string;
  address: string;
  suburb: string;
  city: string; // e.g. "Johannesburg"
  province: string; // e.g. "Gauteng"
  latitude: number;
  longitude: number;
}

export interface HostSummary {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface EventOccurrence {
  id: string;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  doorsOpen: string;
}

export interface Event {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  host: HostSummary;
  venue: Venue;
  occurrence: EventOccurrence;
  heroImageUrl: string;
  galleryImageUrls: string[];
  startingPriceMinor: number; // e.g. 25000 for R250.00
  currency: string; // "ZAR"
  totalCapacity: number;
  remainingTickets: number;
  isSaved?: boolean;
}
