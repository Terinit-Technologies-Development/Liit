import { useQuery } from "@tanstack/react-query";
import { mockDiscoveryRepository } from "../../repositories/mock/MockDiscoveryRepository";
import { queryKeys } from "../../state/query-keys";
import { useAppStore } from "../../state/useAppStore";
import { useSessionStore } from "../../state/useSessionStore";

export function useExploreQuery() {
  const scenario = useAppStore((state) => state.scenario);
  const city = useSessionStore((state) => state.selectedCity ?? "Johannesburg");

  return useQuery({
    queryKey: queryKeys.discovery.explore(city, scenario),
    queryFn: () =>
      mockDiscoveryRepository.getExplore(
        { city },
        {
          shouldFail: scenario === "discovery_error",
        },
      ),
  });
}
