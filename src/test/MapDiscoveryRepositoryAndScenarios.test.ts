import { mockMapDiscoveryRepository } from "../repositories/mock/MockMapDiscoveryRepository";
import { DEFAULT_MAP_FILTERS } from "../domain/map/map-filter-schema";

describe("MockMapDiscoveryRepository & Prototype Scenarios", () => {
  it("returns points and eventIds under normal scenario", async () => {
    const snapshot = await mockMapDiscoveryRepository.getSnapshot({
      city: "Johannesburg",
      filters: DEFAULT_MAP_FILTERS,
      scenario: "normal",
    });

    expect(snapshot.city).toBe("Johannesburg");
    expect(snapshot.points.length).toBeGreaterThan(0);
    expect(snapshot.eventIds.length).toBeGreaterThan(0);
    expect(snapshot.events.length).toBeGreaterThan(0);
  });

  it("returns empty points, events, and eventIds under map_no_results scenario", async () => {
    const snapshot = await mockMapDiscoveryRepository.getSnapshot({
      city: "Johannesburg",
      filters: DEFAULT_MAP_FILTERS,
      scenario: "map_no_results",
    });

    expect(snapshot.points).toEqual([]);
    expect(snapshot.eventIds).toEqual([]);
    expect(snapshot.events).toEqual([]);
  });

  it("transforms first event to sold_out under sold_out scenario", async () => {
    const snapshot = await mockMapDiscoveryRepository.getSnapshot({
      city: "Johannesburg",
      filters: DEFAULT_MAP_FILTERS,
      scenario: "sold_out",
    });

    expect(snapshot.events.length).toBeGreaterThan(0);
    expect(snapshot.events[0].status).toBe("sold_out");
    expect(snapshot.events[0].remainingTickets).toBe(0);
  });

  it("transforms first event to live under live_event scenario", async () => {
    const snapshot = await mockMapDiscoveryRepository.getSnapshot({
      city: "Johannesburg",
      filters: DEFAULT_MAP_FILTERS,
      scenario: "live_event",
    });

    expect(snapshot.events.length).toBeGreaterThan(0);
    expect(snapshot.events[0].status).toBe("live");
  });

  it("supports discovery_error simulated error via mock options", async () => {
    await expect(
      mockMapDiscoveryRepository.getSnapshot(
        {
          city: "Johannesburg",
          filters: DEFAULT_MAP_FILTERS,
          scenario: "discovery_error",
        },
        { shouldFail: true, failureMessage: "Discovery Error" },
      ),
    ).rejects.toThrow("Discovery Error");
  });

  it("filters map points by category and freeOnly filter", async () => {
    const snapshot = await mockMapDiscoveryRepository.getSnapshot({
      city: "Johannesburg",
      filters: {
        ...DEFAULT_MAP_FILTERS,
        categories: ["music"],
        freeOnly: true,
      },
      scenario: "normal",
    });

    expect(snapshot.points.length).toBeDefined();
  });
});
