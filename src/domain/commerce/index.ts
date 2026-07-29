/**
 * Commerce Domain Models
 */

export type TicketInventoryState =
  "available" | "low_stock" | "sold_out" | "paused";
export type PaymentSimulationState =
  "idle" | "processing" | "success" | "declined" | "timeout";

export interface TicketProduct {
  id: string;
  eventId: string;
  name: string;
  tierName: string; // e.g. "Early Bird", "VIP Access"
  priceMinor: number; // e.g. 35000 = R350.00
  currency: string; // "ZAR"
  inventoryState: TicketInventoryState;
  maxPerOrder: number;
}

export interface OrderSummary {
  orderId: string;
  eventId: string;
  ticketProductId: string;
  quantity: number;
  totalPriceMinor: number;
  currency: string;
  purchasedAt: string;
  status: "completed" | "failed" | "pending";
}

export interface OwnedTicket {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  venueName: string;
  eventStartTime: string;
  ticketTierName: string;
  qrCodeValue: string; // Token identifier for future QR scanning
  status: "valid" | "used" | "cancelled" | "transferred";
}
