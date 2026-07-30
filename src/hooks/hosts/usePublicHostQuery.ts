import { useQuery } from "@tanstack/react-query";
import { mockHostRepository } from "../../repositories/mock/MockHostRepository";
import { queryKeys } from "../../state/query-keys";

export function usePublicHostQuery(hostId: string | null) {
  return useQuery({
    queryKey: queryKeys.hosts.publicProfile(hostId ?? "missing"),
    queryFn: () => mockHostRepository.getPublicProfile(hostId as string),
    enabled: Boolean(hostId),
  });
}

export function useHostUpcomingEventsQuery(hostId: string | null) {
  return useQuery({
    queryKey: queryKeys.hosts.upcomingEvents(hostId ?? "missing"),
    queryFn: () => mockHostRepository.listUpcomingEvents(hostId as string),
    enabled: Boolean(hostId),
  });
}
