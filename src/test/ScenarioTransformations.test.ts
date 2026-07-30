import { mockDiscoveryRepository } from "../repositories/mock/MockDiscoveryRepository";

describe("Discovery Scenario Transformations", () => {
  it("empty_discovery scenario returns empty lists for Feed, Explore, and Search", async () => {
    const feed = await mockDiscoveryRepository.getFeed({
      mode: "live_recent",
      city: "Johannesburg",
      cursor: null,
      scenario: "empty_discovery",
    });
    expect(feed.items).toHaveLength(0);

    const explore = await mockDiscoveryRepository.getExplore({
      city: "Johannesburg",
      scenario: "empty_discovery",
    });
    expect(explore.trending).toHaveLength(0);
    expect(explore.featuredVenues).toHaveLength(0);

    const search = await mockDiscoveryRepository.search({
      query: "Amapiano",
      filters: {
        category: null,
        date: "any",
        distanceKm: null,
        maxPriceMinor: null,
        availabilityOnly: false,
        liveOnly: false,
      },
      scenario: "empty_discovery",
    });
    expect(search.events).toHaveLength(0);
    expect(search.hosts).toHaveLength(0);
  });

  it("sold_out scenario transforms the first event into a sold out state with 0 remaining tickets", async () => {
    const feed = await mockDiscoveryRepository.getFeed({
      mode: "live_recent",
      city: "Johannesburg",
      cursor: null,
      scenario: "sold_out",
    });

    const firstItem = feed.items.find((item) => item.kind === "event");
    expect(firstItem).toBeDefined();
    if (firstItem && firstItem.kind === "event") {
      expect(firstItem.event.status).toBe("sold_out");
      expect(firstItem.event.remainingTickets).toBe(0);
    }
  });

  it("live_event scenario transforms the first event into a live status event", async () => {
    const explore = await mockDiscoveryRepository.getExplore({
      city: "Johannesburg",
      scenario: "live_event",
    });

    expect(explore.trending[0].status).toBe("live");
    expect(explore.trending[0].occurrence.startTime).toBe(
      "2026-07-30T19:00:00.000Z",
    );
  });

  it("normal scenario returns unaltered default discovery fixtures", async () => {
    const explore = await mockDiscoveryRepository.getExplore({
      city: "Johannesburg",
      scenario: "normal",
    });

    expect(explore.trending.length).toBeGreaterThan(0);
    expect(explore.featuredVenues.length).toBeGreaterThan(0);
  });
});
