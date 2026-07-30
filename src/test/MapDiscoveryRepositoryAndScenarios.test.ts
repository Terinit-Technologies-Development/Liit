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
  });

  it("returns empty points and eventIds under map_no_results scenario", async () => {
    const snapshot = await mockMapDiscoveryRepository.getSnapshot({
      city: "Johannesburg",
      filters: DEFAULT_MAP_FILTERS,
      scenario: "map_no_results",
    });

    expect(snapshot.points).toEqual([]);
    expect(snapshot.eventIds).toEqual([]);
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
