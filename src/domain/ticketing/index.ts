import { ImageAssetKey } from "../../assets/image-registry";

export type CurrencyCode = "ZAR";

export interface TicketSelectionLine {
  tierId: string;
  tierName: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface CheckoutQuote {
  eventId: string;
  currency: CurrencyCode;
  lines: TicketSelectionLine[];
  totalQuantity: number;
  subtotalMinor: number;
  serviceFeeMinor: number;
  totalMinor: number;
}

export type PaymentMethodType =
  "saved_card" | "demo_new_card" | "wallet_placeholder";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  description: string;
  brand?: "visa" | "mastercard";
  last4?: string;
  enabled: boolean;
  disabledReason?: string;
}

export type PaymentAttemptStatus = "paid" | "declined" | "network_error";

export interface PaymentAttempt {
  id: string;
  eventId: string;
  quote: CheckoutQuote;
  paymentMethodId: string;
  status: PaymentAttemptStatus;
  createdAt: string;
  orderId?: string;
  ticketIds?: string[];
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "free_confirmed"
  | "declined"
  | "failed"
  | "cancelled"
  | "refunded";

export interface TicketOrder {
  id: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  status: OrderStatus;
  source: "paid" | "free_registration";
  quote: CheckoutQuote;
  paymentMethodLabel?: string;
  createdAt: string;
  ticketIds: string[];
}

export type TicketStatus =
  "pending" | "valid" | "used" | "cancelled" | "refunded";

export type TicketEntryMode = "qr_placeholder" | "profile_verification";

export interface WalletTicket {
  id: string;
  orderId: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  tierId: string;
  tierName: string;
  status: TicketStatus;
  source: "paid" | "free_registration";
  entryMode: TicketEntryMode;
  issuedAt: string;
  eventSnapshot: {
    title: string;
    imageKey: ImageAssetKey;
    venueName: string;
    venueSuburb: string;
    city: "Johannesburg";
    startTime: string;
    endTime: string;
  };
}
