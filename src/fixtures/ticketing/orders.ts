import { TicketOrder } from "../../domain/ticketing";

export const seedTicketOrders: TicketOrder[] = [
  {
    id: "order-liit-seed-0001",
    eventId: "evt-midnight-grooves",
    attendeeId: "usr-consumer-01",
    attendeeName: "Keketso Molefe",
    status: "paid",
    source: "paid",
    quote: {
      eventId: "evt-midnight-grooves",
      currency: "ZAR",
      lines: [
        {
          tierId: "tier-general",
          tierName: "General Access",
          quantity: 1,
          unitPriceMinor: 25000,
          lineTotalMinor: 25000,
        },
      ],
      totalQuantity: 1,
      subtotalMinor: 25000,
      serviceFeeMinor: 1250,
      totalMinor: 26250,
    },
    paymentMethodLabel: "Demo Visa •••• 4242",
    createdAt: "2026-07-28T10:00:00.000Z",
    ticketIds: ["ticket-liit-seed-0001"],
  },
  {
    id: "order-liit-seed-0002",
    eventId: "evt-soweto-food-market",
    attendeeId: "usr-consumer-01",
    attendeeName: "Keketso Molefe",
    status: "free_confirmed",
    source: "free_registration",
    quote: {
      eventId: "evt-soweto-food-market",
      currency: "ZAR",
      lines: [
        {
          tierId: "tier-free-registration",
          tierName: "Free Registration",
          quantity: 1,
          unitPriceMinor: 0,
          lineTotalMinor: 0,
        },
      ],
      totalQuantity: 1,
      subtotalMinor: 0,
      serviceFeeMinor: 0,
      totalMinor: 0,
    },
    createdAt: "2026-07-28T11:00:00.000Z",
    ticketIds: ["ticket-liit-seed-0002"],
  },
];
