import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../state/query-keys";
import { mockTicketingRepository } from "../../repositories/mock/MockTicketingRepository";

export function useTicketQuery(ticketId: string | null) {
  return useQuery({
    queryKey: queryKeys.ticketing.ticket(ticketId ?? "missing"),
    queryFn: () => mockTicketingRepository.getTicket(ticketId as string),
    enabled: Boolean(ticketId),
  });
}
