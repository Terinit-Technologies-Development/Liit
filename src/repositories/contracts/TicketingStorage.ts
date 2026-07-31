import {
  PaymentAttempt,
  TicketOrder,
  WalletTicket,
} from "../../domain/ticketing";

export interface FreeRegistrationRecord {
  orderId: string;
  ticketIds: string[];
}

export interface TicketingRepositoryState {
  nextOrderSequence: number;
  nextTicketSequence: number;
  orders: TicketOrder[];
  tickets: WalletTicket[];
  attempts: Record<string, PaymentAttempt>;
  freeRegistrations: Record<string, FreeRegistrationRecord>;
}

export interface TicketingStorage {
  load(): Promise<TicketingRepositoryState | null>;
  save(state: TicketingRepositoryState): Promise<void>;
  clear(): Promise<void>;
}
