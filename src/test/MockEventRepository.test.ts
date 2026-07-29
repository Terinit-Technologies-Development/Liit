import { mockEventRepository } from "../repositories/mock/MockEventRepository";

describe("MockEventRepository", () => {
  it("returns list of featured events", async () => {
    const events = await mockEventRepository.listFeaturedEvents({
      latencyMs: 0,
    });
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].venue.city).toBe("Johannesburg");
    expect(events[0].currency).toBe("ZAR");
  });

  it("supports controlled operation failure scenario", async () => {
    await expect(
      mockEventRepository.listFeaturedEvents({
        latencyMs: 0,
        shouldFail: true,
        failureMessage: "Test simulated error",
      }),
    ).rejects.toThrow("Test simulated error");
  });

  it("searches events by query", async () => {
    const results = await mockEventRepository.searchEvents("Grooves", {
      latencyMs: 0,
    });
    expect(results.length).toBe(1);
    expect(results[0].title).toContain("Midnight Grooves");
  });
});
