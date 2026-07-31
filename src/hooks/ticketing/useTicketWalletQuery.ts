import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../state/query-keys";
import { mockTicketingRepository } from "../../repositories/mock/MockTicketingRepository";
import { PrototypeScenario } from "../../state/useAppStore";

export function useTicketWalletQuery(scenario: PrototypeScenario) {
  return useQuery({
    queryKey: queryKeys.ticketing.wallet(scenario),
    queryFn: async () => {
      if (scenario === "ticketing_error") {
        throw new Error("Ticketing Error");
      }

      if (scenario === "wallet_empty") {
        return [];
      }

      return mockTicketingRepository.listWalletTickets();
    },
  });
}
