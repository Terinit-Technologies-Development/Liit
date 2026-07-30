import { mockDiscoveryRepository } from "../repositories/mock/MockDiscoveryRepository";
import { DEFAULT_DISCOVERY_FILTERS } from "../state/useDiscoveryStore";

describe("MockDiscoveryRepository", () => {
  it("searches events, hosts, and venues matching suburb or title", async () => {
    const result = await mockDiscoveryRepository.search({
      query: "Braam",
      filters: DEFAULT_DISCOVERY_FILTERS,
    });

    expect(result.events.some((e) => e.venue.suburb === "Braamfontein")).toBe(
      true,
    );
    expect(result.venues.some((v) => v.suburb === "Braamfontein")).toBe(true);
  });

  it("filters search results by category", async () => {
    const result = await mockDiscoveryRepository.search({
      query: "",
      filters: {
        ...DEFAULT_DISCOVERY_FILTERS,
        category: "music",
      },
    });

    expect(result.events.every((e) => e.category === "music")).toBe(true);
  });
});
