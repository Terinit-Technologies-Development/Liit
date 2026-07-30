import { useQuery } from "@tanstack/react-query";
import { DiscoveryFixtureScenario, FeedMode } from "../../domain/discovery";
import { mockDiscoveryRepository } from "../../repositories/mock/MockDiscoveryRepository";
import { queryKeys } from "../../state/query-keys";
import { useAppStore } from "../../state/useAppStore";
import { useSessionStore } from "../../state/useSessionStore";

export function useFeedQuery(mode: FeedMode) {
  const scenario = useAppStore((state) => state.scenario);
  const city = useSessionStore((state) => state.selectedCity ?? "Johannesburg");

  const fixtureScenario: DiscoveryFixtureScenario =
    scenario === "empty_discovery" ||
    scenario === "sold_out" ||
    scenario === "live_event"
      ? scenario
      : "normal";

  return useQuery({
    queryKey: queryKeys.discovery.feed(mode, city, scenario),
    queryFn: () =>
      mockDiscoveryRepository.getFeed(
        {
          mode,
          city,
          cursor: null,
          scenario: fixtureScenario,
        },
        {
          shouldFail: scenario === "discovery_error",
        },
      ),
  });
}
