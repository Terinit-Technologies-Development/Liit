import { Event, EventCategory, HostSummary, Venue } from "../events";
import { ImageAssetKey } from "../../assets/image-registry";

export type FeedMode = "live_recent" | "upcoming";

export type DiscoveryFixtureScenario =
  "normal" | "empty_discovery" | "sold_out" | "live_event";

export type FeedEntry =
  | {
      id: string;
      kind: "event";
      event: Event;
      editorialRank: number;
      attendeeCount: number;
      attendeeAvatarKeys?: ImageAssetKey[];
    }
  | {
      id: string;
      kind: "creator_post";
      host: HostSummary;
      createdAt: string;
      body: string;
      mediaImageKey?: ImageAssetKey;
      reactionCount: number;
      commentCount: number;
      relatedEventId?: string;
    }
  | {
      id: string;
      kind: "live_placeholder";
      host: HostSummary;
      title: string;
      viewerCount: number;
      relatedEventId?: string;
      previewImageKey: ImageAssetKey;
    };

export interface FeedPage {
  items: FeedEntry[];
  nextCursor: string | null;
}

export interface FeedRequest {
  mode: FeedMode;
  city: string;
  cursor: string | null;
  scenario?: DiscoveryFixtureScenario;
}

export interface VenueSummary extends Venue {
  imageKey: ImageAssetKey;
  followerCount: number;
  eventCount: number;
}

export interface ExploreCollection {
  id: string;
  title: string;
  subtitle?: string;
  kind: "trending" | "recommended" | "this_weekend" | "nearby";
  events: Event[];
}

export interface ExploreRequest {
  city: string;
  scenario?: DiscoveryFixtureScenario;
}

export interface ExplorePayload {
  trending: Event[];
  categories: EventCategory[];
  featuredVenues: VenueSummary[];
  recommended: Event[];
  thisWeekend: Event[];
  nearby: Event[];
}

export type SearchResultTab = "events" | "hosts" | "venues";

export interface DiscoverySearchRouteParams {
  q?: string;
  tab?: SearchResultTab;
  category?: string;
  collection?: string;
  source?: "feed" | "explore" | "notification";
}

export type SearchDatePreset = "any" | "today" | "tomorrow" | "this_weekend";

export interface DiscoveryFilters {
  category: EventCategory | null;
  date: SearchDatePreset;
  distanceKm: 5 | 10 | 25 | 50 | null;
  maxPriceMinor: number | null;
  availabilityOnly: boolean;
  liveOnly: boolean;
}

export interface DiscoverySearchInput {
  query: string;
  filters: DiscoveryFilters;
  scenario?: DiscoveryFixtureScenario;
  collection?: string;
}

export interface DiscoverySearchResult {
  events: Event[];
  hosts: HostSummary[];
  venues: VenueSummary[];
}

export function filtersFromRoute(
  params: DiscoverySearchRouteParams,
  current: DiscoveryFilters,
): DiscoveryFilters {
  if (params.category) {
    return {
      ...current,
      category: params.category as EventCategory,
    };
  }

  if (params.collection === "this_weekend") {
    return {
      ...current,
      date: "this_weekend",
    };
  }

  if (params.collection === "nearby") {
    return {
      ...current,
      distanceKm: 10,
    };
  }

  return current;
}
