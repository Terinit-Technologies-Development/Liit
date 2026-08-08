import { useQuery } from "@tanstack/react-query";
import { mockEventRepository } from "../../repositories/mock/MockEventRepository";
import { queryKeys } from "../../state/query-keys";

export function useEventDetailQuery(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.eventDetail.detail(eventId ?? "missing"),
    queryFn: () => mockEventRepository.getEventDetail(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useRelatedEventsQuery(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.eventDetail.related(eventId ?? "missing"),
    queryFn: () => mockEventRepository.listRelatedEvents(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useEventsByIdsQuery(ids: string[]) {
  return useQuery({
    queryKey: queryKeys.events.byIds(ids),
    queryFn: () => mockEventRepository.listEventsByIds(ids),
    enabled: ids.length > 0,
  });
}
