import { useQuery } from "@tanstack/react-query";
import { DiscoveryFixtureScenario } from "../../domain/discovery";
import { mockDiscoveryRepository } from "../../repositories/mock/MockDiscoveryRepository";
import { queryKeys } from "../../state/query-keys";
import { useAppStore } from "../../state/useAppStore";
import { useSessionStore } from "../../state/useSessionStore";

export function useExploreQuery() {
  const scenario = useAppStore((state) => state.scenario);
  const city = useSessionStore((state) => state.selectedCity ?? "Johannesburg");

  const fixtureScenario: DiscoveryFixtureScenario =
    scenario === "empty_discovery" ||
    scenario === "sold_out" ||
    scenario === "live_event"
      ? scenario
      : "normal";

  return useQuery({
    queryKey: queryKeys.discovery.explore(city, scenario),
    queryFn: () =>
      mockDiscoveryRepository.getExplore(
        { city, scenario: fixtureScenario },
        {
          shouldFail: scenario === "discovery_error",
        },
      ),
  });
}
