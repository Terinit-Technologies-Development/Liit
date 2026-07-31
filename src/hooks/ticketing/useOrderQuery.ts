import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../state/query-keys";
import { mockTicketingRepository } from "../../repositories/mock/MockTicketingRepository";

export function useOrderQuery(orderId: string | null) {
  return useQuery({
    queryKey: queryKeys.ticketing.order(orderId ?? "missing"),
    queryFn: () => mockTicketingRepository.getOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}
