import { ImageAssetKey } from "../../assets/image-registry";
import { Event } from "../events";

export type EventConversionMode =
  "paid" | "free_registration" | "waitlist" | "none";

export interface EventDetailModules {
  lineup: boolean;
  ticketTiers: boolean;
  attendeeProof: boolean;
  eventPosts: boolean;
  relatedEvents: boolean;
}

export interface LineupMember {
  id: string;
  name: string;
  role: string;
  imageKey: ImageAssetKey;
  startTimeLabel?: string;
}

export interface TicketTier {
  id: string;
  name: string;
  description?: string;
  priceMinor: number;
  currency: "ZAR";
  remaining: number | null;
  state: "available" | "selling_fast" | "sold_out";
  maxPerOrder: number;
  premiumLabel?: string;
}

export interface EventPostPreview {
  id: string;
  type: "host_update" | "live_placeholder";
  title: string;
  body: string;
  createdAt: string;
  imageKey?: ImageAssetKey;
}

export interface EventDetailPayload {
  event: Event;
  longDescription: string;
  conversionMode: EventConversionMode;
  modules: EventDetailModules;
  lineup: LineupMember[];
  ticketTiers: TicketTier[];
  attendeeAvatarKeys: ImageAssetKey[];
  attendeeCount: number;
  posts: EventPostPreview[];
  relatedEventIds: string[];
}
