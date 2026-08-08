import {
  CheckoutQuote,
  PaymentAttempt,
  PaymentMethod,
  TicketOrder,
  TicketStatus,
  WalletTicket,
} from "../../domain/ticketing";
import { PrototypeScenario } from "../../state/useAppStore";

export interface SimulatePaymentInput {
  attemptId: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  quote: CheckoutQuote;
  paymentMethodId: string;
  scenario?: PrototypeScenario;
}

export interface CreateFreeRegistrationInput {
  registrationId: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  quote: CheckoutQuote;
}

export interface TicketingRepository {
  listPaymentMethods(): Promise<PaymentMethod[]>;
  simulatePayment(input: SimulatePaymentInput): Promise<PaymentAttempt>;
  createFreeRegistration(input: CreateFreeRegistrationInput): Promise<{
    order: TicketOrder;
    tickets: WalletTicket[];
  }>;
  getOrder(orderId: string): Promise<TicketOrder | null>;
  listWalletTickets(): Promise<WalletTicket[]>;
  getTicket(ticketId: string): Promise<WalletTicket | null>;
  getTierAvailability(eventId: string): Promise<Record<string, number>>;
  setTicketStatus(
    ticketId: string,
    status: TicketStatus,
  ): Promise<WalletTicket | null>;
  reset(): Promise<void>;
}
