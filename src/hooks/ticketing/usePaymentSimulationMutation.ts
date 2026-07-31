import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../state/query-keys";
import { mockTicketingRepository } from "../../repositories/mock/MockTicketingRepository";
import { SimulatePaymentInput } from "../../repositories/contracts/TicketingRepository";

export function usePaymentSimulationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SimulatePaymentInput) =>
      mockTicketingRepository.simulatePayment(input),

    onSuccess: async (attempt) => {
      if (attempt.status === "paid") {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.ticketing.all,
        });
      }
    },
  });
}
