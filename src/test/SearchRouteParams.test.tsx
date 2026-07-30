import { filtersFromRoute } from "../domain/discovery";
import { DEFAULT_DISCOVERY_FILTERS } from "../state/useDiscoveryStore";

describe("Search Route Parameters", () => {
  it("maps category parameter to search filters", () => {
    const updated = filtersFromRoute(
      { category: "nightlife" },
      DEFAULT_DISCOVERY_FILTERS,
    );
    expect(updated.category).toBe("nightlife");
  });

  it("maps this_weekend collection parameter to date filter", () => {
    const updated = filtersFromRoute(
      { collection: "this_weekend" },
      DEFAULT_DISCOVERY_FILTERS,
    );
    expect(updated.date).toBe("this_weekend");
  });

  it("maps nearby collection parameter to 10km distance filter", () => {
    const updated = filtersFromRoute(
      { collection: "nearby" },
      DEFAULT_DISCOVERY_FILTERS,
    );
    expect(updated.distanceKm).toBe(10);
  });
});
