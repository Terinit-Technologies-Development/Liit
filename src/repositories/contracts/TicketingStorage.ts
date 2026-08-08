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
  /** Per-tier persisted inventory, seeded from the canonical ticket tiers. */
  tierRemaining: Record<string, number>;
  /** Durable free-registration identity keyed by `${eventId}:${attendeeId}`. */
  freeRegistrations: Record<string, FreeRegistrationRecord>;
  /** registrationId -> registrationKey, guarding duplicate submissions. */
  freeRegistrationAttempts?: Record<string, string>;
}

export interface TicketingStorage {
  load(): Promise<TicketingRepositoryState | null>;
  save(state: TicketingRepositoryState): Promise<void>;
  clear(): Promise<void>;
}
