import { CommerceRepository } from "../contracts/CommerceRepository";
import {
  TicketProduct,
  OwnedTicket,
  OrderSummary,
} from "../../domain/commerce";
import { mockTicketProducts, mockOwnedTickets } from "../../fixtures";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockCommerceRepository implements CommerceRepository {
  private products: TicketProduct[] = [...mockTicketProducts];
  private ownedTickets: OwnedTicket[] = [...mockOwnedTickets];

  async getTicketProducts(
    eventId: string,
    options?: MockOptions,
  ): Promise<TicketProduct[]> {
    return simulateMockOperation(() => {
      return this.products.filter((p) => p.eventId === eventId);
    }, options);
  }

  async purchaseTicket(
    ticketProductId: string,
    quantity: number,
    options?: MockOptions,
  ): Promise<OrderSummary> {
    return simulateMockOperation(() => {
      const product = this.products.find((p) => p.id === ticketProductId);
      if (!product) {
        throw new Error("Ticket product not found");
      }
      if (product.inventoryState === "sold_out") {
        throw new Error("Ticket tier is sold out");
      }

      const totalPriceMinor = product.priceMinor * quantity;
      const orderSummary: OrderSummary = {
        orderId: `ord_sim_${Date.now()}`,
        eventId: product.eventId,
        ticketProductId: product.id,
        quantity,
        totalPriceMinor,
        currency: product.currency,
        purchasedAt: new Date().toISOString(),
        status: "completed",
      };

      const newTicket: OwnedTicket = {
        id: `tkt_owned_${Date.now()}`,
        orderId: orderSummary.orderId,
        eventId: product.eventId,
        eventTitle: "Midnight Grooves JHB",
        venueName: "Braamfontein Rooftop Social",
        eventStartTime: new Date().toISOString(),
        ticketTierName: product.tierName,
        qrCodeValue: `LIIT-${orderSummary.orderId}`,
        status: "valid",
      };
      this.ownedTickets.push(newTicket);

      return orderSummary;
    }, options);
  }

  async getOwnedTickets(options?: MockOptions): Promise<OwnedTicket[]> {
    return simulateMockOperation(() => [...this.ownedTickets], options);
  }
}

export const mockCommerceRepository = new MockCommerceRepository();
