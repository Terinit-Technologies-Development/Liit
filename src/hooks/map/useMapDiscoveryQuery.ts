import { useQuery } from "@tanstack/react-query";
import { MapFilters } from "../../domain/map";
import { mockMapDiscoveryRepository } from "../../repositories/mock/MockMapDiscoveryRepository";
import { queryKeys } from "../../state/query-keys";
import { PrototypeScenario } from "../../state/useAppStore";

export interface UseMapDiscoveryQueryOptions {
  filters: MapFilters;
  scenario: PrototypeScenario;
}

export function useMapDiscoveryQuery({
  filters,
  scenario,
}: UseMapDiscoveryQueryOptions) {
  return useQuery({
    queryKey: queryKeys.map.snapshot(filters, scenario),
    queryFn: () =>
      mockMapDiscoveryRepository.getSnapshot(
        {
          city: "Johannesburg",
          filters,
          scenario,
        },
        {
          shouldFail: scenario === "discovery_error",
        },
      ),
  });
}
