import {
  DiscoverySearchInput,
  DiscoverySearchResult,
  ExplorePayload,
  ExploreRequest,
  FeedPage,
  FeedRequest,
} from "../../domain/discovery";
import {
  discoveryEvents,
  discoveryHosts,
  discoveryVenues,
  mockLiveRecentFeedEntries,
  mockUpcomingFeedEntries,
} from "../../fixtures/discovery";
import { MockOptions, simulateMockOperation } from "../../utils/mock-operation";
import { DiscoveryRepository } from "../contracts/DiscoveryRepository";

function normalise(text: string): string {
  return text.trim().toLocaleLowerCase();
}

export class MockDiscoveryRepository implements DiscoveryRepository {
  async getFeed(
    request: FeedRequest,
    options?: MockOptions,
  ): Promise<FeedPage> {
    return simulateMockOperation(() => {
      const items =
        request.mode === "upcoming"
          ? mockUpcomingFeedEntries
          : mockLiveRecentFeedEntries;

      return {
        items,
        nextCursor: null,
      };
    }, options);
  }

  async getExplore(
    _request: ExploreRequest,
    options?: MockOptions,
  ): Promise<ExplorePayload> {
    return simulateMockOperation(
      () => ({
        trending: discoveryEvents.slice(0, 4),
        categories: [
          "music",
          "nightlife",
          "art",
          "food_drink",
          "sport",
          "networking",
          "pop_up",
        ],
        featuredVenues: discoveryVenues.slice(0, 4),
        recommended: discoveryEvents.slice(1, 5),
        thisWeekend: discoveryEvents.slice(2, 6),
        nearby: discoveryEvents.slice(0, 5),
      }),
      options,
    );
  }

  async search(
    input: DiscoverySearchInput,
    options?: MockOptions,
  ): Promise<DiscoverySearchResult> {
    return simulateMockOperation(() => {
      const query = normalise(input.query);

      const events = discoveryEvents.filter((event) => {
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

        return (
          matchesQuery &&
          matchesCategory &&
          matchesPrice &&
          matchesAvailability &&
          matchesLive
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
