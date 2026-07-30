import { useQuery } from "@tanstack/react-query";
import { DiscoveryFilters } from "../../domain/discovery";
import { mockDiscoveryRepository } from "../../repositories/mock/MockDiscoveryRepository";
import { queryKeys } from "../../state/query-keys";
import { useAppStore } from "../../state/useAppStore";

function hasActiveFilters(filters: DiscoveryFilters): boolean {
  return (
    filters.category !== null ||
    filters.date !== "any" ||
    filters.distanceKm !== null ||
    filters.maxPriceMinor !== null ||
    filters.availabilityOnly ||
    filters.liveOnly
  );
}

export function useDiscoverySearchQuery(
  query: string,
  filters: DiscoveryFilters,
) {
  const scenario = useAppStore((state) => state.scenario);
  const enabled = query.trim().length > 0 || hasActiveFilters(filters);

  return useQuery({
    queryKey: queryKeys.discovery.search(query, filters),
    queryFn: () =>
      mockDiscoveryRepository.search(
        {
          query,
          filters,
        },
        {
          shouldFail: scenario === "discovery_error",
        },
      ),
    enabled,
  });
}
