import {
  DiscoveryFixtureScenario,
  DiscoverySearchInput,
  DiscoverySearchResult,
  ExplorePayload,
  ExploreRequest,
  FeedEntry,
  FeedPage,
  FeedRequest,
  SearchDatePreset,
} from "../../domain/discovery";
import { Event } from "../../domain/events";
import {
  DEMO_NOW_ISO,
  discoveryEvents,
  discoveryHosts,
  discoveryVenues,
  mockLiveRecentFeedEntries,
  mockUpcomingFeedEntries,
} from "../../fixtures/discovery";
import { MockOptions, simulateMockOperation } from "../../utils/mock-operation";
import { DiscoveryRepository } from "../contracts/DiscoveryRepository";

const JOHANNESBURG_CENTRE = {
  latitude: -26.2041,
  longitude: 28.0473,
};

function normalise(text: string): string {
  return text.trim().toLocaleLowerCase();
}

export function applyEventScenario(
  events: Event[],
  scenario: DiscoveryFixtureScenario = "normal",
): Event[] {
  switch (scenario) {
    case "empty_discovery":
      return [];

    case "sold_out":
      return events.map((event, index) =>
        index === 0
          ? {
              ...event,
              status: "sold_out",
              remainingTickets: 0,
            }
          : event,
      );

    case "live_event":
      return events.map((event, index) =>
        index === 0
          ? {
              ...event,
              status: "live",
              occurrence: {
                ...event.occurrence,
                startTime: "2026-07-30T19:00:00.000Z",
                endTime: "2026-07-30T23:59:00.000Z",
              },
            }
          : event,
      );

    case "normal":
    default:
      return events;
  }
}

export function applyFeedScenario(
  items: FeedEntry[],
  scenario: DiscoveryFixtureScenario = "normal",
): FeedEntry[] {
  if (scenario === "empty_discovery") {
    return [];
  }
  return items.map((entry) => {
    if (entry.kind === "event") {
      const [updatedEvent] = applyEventScenario([entry.event], scenario);
      return {
        ...entry,
        event: updatedEvent,
      };
    }
    return entry;
  });
}

export function matchesDatePreset(
  event: Event,
  preset: SearchDatePreset,
  nowIso: string = DEMO_NOW_ISO,
): boolean {
  if (preset === "any") {
    return true;
  }

  const eventDate = new Date(event.occurrence.startTime);
  const now = new Date(nowIso);

  if (preset === "today") {
    return eventDate.toDateString() === now.toDateString();
  }

  if (preset === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return eventDate.toDateString() === tomorrow.toDateString();
  }

  if (preset === "this_weekend") {
    const day = eventDate.getDay();
    return day === 5 || day === 6 || day === 0;
  }

  return true;
}

export function haversineKm(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class MockDiscoveryRepository implements DiscoveryRepository {
  async getFeed(
    request: FeedRequest,
    options?: MockOptions,
  ): Promise<FeedPage> {
    return simulateMockOperation(() => {
      const rawItems =
        request.mode === "upcoming"
          ? mockUpcomingFeedEntries
          : mockLiveRecentFeedEntries;

      const items = applyFeedScenario(rawItems, request.scenario);

      return {
        items,
        nextCursor: null,
      };
    }, options);
  }

  async getExplore(
    request: ExploreRequest,
    options?: MockOptions,
  ): Promise<ExplorePayload> {
    return simulateMockOperation(() => {
      const scenario = request.scenario ?? "normal";
      const baseEvents = applyEventScenario(discoveryEvents, scenario);

      return {
        trending: baseEvents.slice(0, 4),
        categories: [
          "music",
          "nightlife",
          "art",
          "food_drink",
          "sport",
          "networking",
          "pop_up",
        ],
        featuredVenues:
          scenario === "empty_discovery" ? [] : discoveryVenues.slice(0, 4),
        recommended: baseEvents.slice(1, 5),
        thisWeekend: baseEvents.slice(2, 6),
        nearby: baseEvents.slice(0, 5),
      };
    }, options);
  }

  async search(
    input: DiscoverySearchInput,
    options?: MockOptions,
  ): Promise<DiscoverySearchResult> {
    return simulateMockOperation(() => {
      const scenario = input.scenario ?? "normal";
      if (scenario === "empty_discovery") {
        return { events: [], hosts: [], venues: [] };
      }

      const query = normalise(input.query);
      const baseEvents = applyEventScenario(discoveryEvents, scenario);

      const events = baseEvents.filter((event) => {
        const matchesQuery =
          query.length === 0 ||
          normalise(event.title).includes(query) ||
          normalise(event.description).includes(query) ||
          normalise(event.venue.name).includes(query) ||
          normalise(event.venue.suburb).includes(query) ||
          normalise(event.host.name).includes(query);

        const matchesCategory =
          input.filters.category === null ||
          event.category === input.filters.category;

        const matchesPrice =
          input.filters.maxPriceMinor === null ||
          event.startingPriceMinor <= input.filters.maxPriceMinor;

        const matchesAvailability =
          !input.filters.availabilityOnly || event.remainingTickets > 0;

        const matchesLive = !input.filters.liveOnly || event.status === "live";

        const matchesDate = matchesDatePreset(
          event,
          input.filters.date,
          DEMO_NOW_ISO,
        );

        const distKm = haversineKm(JOHANNESBURG_CENTRE, event.venue);
        const matchesDistance =
          input.filters.distanceKm === null ||
          distKm <= input.filters.distanceKm;

        const matchesCollection =
          !input.collection ||
          (input.collection === "this_weekend" &&
            matchesDatePreset(event, "this_weekend")) ||
          (input.collection === "nearby" && distKm <= 10) ||
          input.collection === "trending" ||
          input.collection === "recommended" ||
          input.collection === "venues";

        return (
          matchesQuery &&
          matchesCategory &&
          matchesPrice &&
          matchesAvailability &&
          matchesLive &&
          matchesDate &&
          matchesDistance &&
          matchesCollection
        );
      });

      const hosts = discoveryHosts.filter(
        (host) =>
          query.length === 0 ||
          normalise(host.name).includes(query) ||
          normalise(host.handle).includes(query),
      );

      const venues = discoveryVenues.filter(
        (venue) =>
          query.length === 0 ||
          normalise(venue.name).includes(query) ||
          normalise(venue.suburb).includes(query),
      );

      return {
        events,
        hosts,
        venues,
      };
    }, options);
  }
}

export const mockDiscoveryRepository = new MockDiscoveryRepository();
