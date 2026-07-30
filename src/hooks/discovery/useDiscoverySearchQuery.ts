import { useQuery } from "@tanstack/react-query";
import {
  DiscoveryFilters,
  DiscoveryFixtureScenario,
} from "../../domain/discovery";
import { mockDiscoveryRepository } from "../../repositories/mock/MockDiscoveryRepository";
import { queryKeys } from "../../state/query-keys";
import { useAppStore } from "../../state/useAppStore";

function hasActiveFilters(
  filters: DiscoveryFilters,
  collection?: string,
): boolean {
  return (
    filters.category !== null ||
    filters.date !== "any" ||
    filters.distanceKm !== null ||
    filters.maxPriceMinor !== null ||
    filters.availabilityOnly ||
    filters.liveOnly ||
    Boolean(collection)
  );
}

export function useDiscoverySearchQuery(
  query: string,
  filters: DiscoveryFilters,
  collection?: string,
) {
  const scenario = useAppStore((state) => state.scenario);
  const enabled =
    query.trim().length > 0 || hasActiveFilters(filters, collection);

  const fixtureScenario: DiscoveryFixtureScenario =
    scenario === "empty_discovery" ||
    scenario === "sold_out" ||
    scenario === "live_event"
      ? scenario
      : "normal";

  return useQuery({
    queryKey: [
      ...queryKeys.discovery.search(query, filters),
      collection,
      scenario,
    ],
    queryFn: () =>
      mockDiscoveryRepository.search(
        {
          query,
          filters,
          collection,
          scenario: fixtureScenario,
        },
        {
          shouldFail: scenario === "discovery_error",
        },
      ),
    enabled,
  });
}
