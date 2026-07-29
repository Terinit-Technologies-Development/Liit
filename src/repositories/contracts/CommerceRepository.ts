import {
  TicketProduct,
  OwnedTicket,
  OrderSummary,
} from "../../domain/commerce";

export interface CommerceRepository {
  getTicketProducts(eventId: string): Promise<TicketProduct[]>;
  purchaseTicket(
    ticketProductId: string,
    quantity: number,
  ): Promise<OrderSummary>;
  getOwnedTickets(): Promise<OwnedTicket[]>;
}
