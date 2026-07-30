import {
  DiscoveryCollection,
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

const COLLECTION_EVENT_IDS: Record<string, Set<string>> = {
  trending: new Set([
    "evt-deep-house-rooftop",
    "evt-midnight-grooves",
    "evt-soweto-food-market",
  ]),
  recommended: new Set([
    "evt-rosebank-art-jazz",
    "evt-jozi-run-club",
    "evt-midnight-grooves",
  ]),
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

  let transformedFirstEvent = false;

  return items.map((entry) => {
    if (
      entry.kind !== "event" ||
      transformedFirstEvent ||
      scenario === "normal"
    ) {
      return entry;
    }

    transformedFirstEvent = true;

    const [event] = applyEventScenario([entry.event], scenario);

    return {
      ...entry,
      event,
    };
  });
}

const JOHANNESBURG_OFFSET_MS = 2 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function getWeekendRange(nowIso: string): {
  start: number;
  end: number;
} {
  const localNow = new Date(Date.parse(nowIso) + JOHANNESBURG_OFFSET_MS);

  const localDay = localNow.getUTCDay();

  const daysFromCurrentDateToFriday =
    localDay === 6 ? -1 : localDay === 0 ? -2 : 5 - localDay;

  const fridayLocalMidnight = Date.UTC(
    localNow.getUTCFullYear(),
    localNow.getUTCMonth(),
    localNow.getUTCDate() + daysFromCurrentDateToFriday,
    0,
    0,
    0,
    0,
  );

  const start = fridayLocalMidnight - JOHANNESBURG_OFFSET_MS;

  return {
    start,
    end: start + THREE_DAYS_MS,
  };
}

export function matchesDatePreset(
  event: Event,
  preset: SearchDatePreset,
  nowIso: string = DEMO_NOW_ISO,
): boolean {
  if (preset === "any") {
    return true;
  }

  const eventTime = new Date(event.occurrence.startTime).getTime();
  const now = new Date(nowIso);

  if (preset === "today") {
    const eventDate = new Date(event.occurrence.startTime);
    return eventDate.toDateString() === now.toDateString();
  }

  if (preset === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(event.occurrence.startTime);
    return eventDate.toDateString() === tomorrow.toDateString();
  }

  if (preset === "this_weekend") {
    const { start, end } = getWeekendRange(nowIso);
    return eventTime >= start && eventTime < end;
  }

  return true;
}

export function matchesCollection(
  event: Event,
  collection?: DiscoveryCollection | string,
): boolean {
  if (!collection || collection === "venues") {
    return true;
  }

  if (collection === "trending" || collection === "recommended") {
    const set = COLLECTION_EVENT_IDS[collection];
    return set ? set.has(event.id) : true;
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
        trending: baseEvents.filter((evt) =>
          matchesCollection(evt, "trending"),
        ),
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
        recommended: baseEvents.filter((evt) =>
          matchesCollection(evt, "recommended"),
        ),
        thisWeekend: baseEvents.filter((evt) =>
          matchesDatePreset(evt, "this_weekend"),
        ),
        nearby: baseEvents.filter(
          (evt) => haversineKm(JOHANNESBURG_CENTRE, evt.venue) <= 10,
        ),
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

        const matchCol = matchesCollection(event, input.collection);

        return (
          matchesQuery &&
          matchesCategory &&
          matchesPrice &&
          matchesAvailability &&
          matchesLive &&
          matchesDate &&
          matchesDistance &&
          matchCol
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
