import { useQuery } from "@tanstack/react-query";
import { mockTicketingRepository } from "../../repositories/mock/MockTicketingRepository";
import { queryKeys } from "../../state/query-keys";

export function useTierAvailabilityQuery(eventId: string | null) {
  return useQuery<Record<string, number>>({
    queryKey: queryKeys.ticketing.availability(eventId ?? ""),
    queryFn: () =>
      eventId
        ? mockTicketingRepository.getTierAvailability(eventId)
        : Promise.resolve({}),
    enabled: Boolean(eventId),
  });
}
