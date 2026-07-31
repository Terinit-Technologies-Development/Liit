/**
 * Instruction 4 — Wallet classification and MockTicketingRepository
 *
 * Verifies ticket classification (upcoming vs past) and that the
 * MockTicketingRepository seeds, simulates payment, and creates free
 * registrations correctly.
 */

import { classifyWalletTicket } from "../../src/domain/ticketing/wallet";
import {
  MockTicketingRepository,
  createSeedTicketingState,
} from "../../src/repositories/mock/MockTicketingRepository";
import { InMemoryTicketingStorage } from "../../src/repositories/mock/InMemoryTicketingStorage";
import { WalletTicket } from "../../src/domain/ticketing";
import { buildCheckoutQuote } from "../../src/domain/ticketing/quote";
import { freeRegistrationTiers } from "../../src/fixtures/event-detail/ticket-tiers";

const NOW = "2026-07-30T12:00:00.000Z";
const FUTURE = "2026-08-15T21:00:00.000Z";
const PAST = "2026-07-01T21:00:00.000Z";

function makeTicket(
  overrides: Partial<WalletTicket> & {
    endTime?: string;
  },
): WalletTicket {
  const { endTime = FUTURE, ...rest } = overrides;
  return {
    id: "ticket-test-001",
    orderId: "order-001",
    eventId: "evt-test",
    attendeeId: "usr-001",
    attendeeName: "Test User",
    tierId: "tier-ga",
    tierName: "General Admission",
    status: "valid",
    source: "paid",
    entryMode: "qr_placeholder",
    issuedAt: NOW,
    eventSnapshot: {
      title: "Test Event",
      imageKey: "eventMidnightGrooves",
      venueName: "Test Venue",
      venueSuburb: "Johannesburg",
      city: "Johannesburg",
      startTime: FUTURE,
      endTime,
    },
    ...rest,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// classifyWalletTicket
// ──────────────────────────────────────────────────────────────────────────────

describe("classifyWalletTicket", () => {
  it("classifies a valid upcoming ticket as upcoming", () => {
    const ticket = makeTicket({ status: "valid", endTime: FUTURE });
    expect(classifyWalletTicket(ticket, NOW)).toBe("upcoming");
  });

  it("classifies a valid ticket whose event has ended as past", () => {
    const ticket = makeTicket({ status: "valid", endTime: PAST });
    expect(classifyWalletTicket(ticket, NOW)).toBe("past");
  });

  it("classifies a used ticket as past regardless of event time", () => {
    const ticket = makeTicket({ status: "used", endTime: FUTURE });
    expect(classifyWalletTicket(ticket, NOW)).toBe("past");
  });

  it("classifies a cancelled ticket as past regardless of event time", () => {
    const ticket = makeTicket({ status: "cancelled", endTime: FUTURE });
    expect(classifyWalletTicket(ticket, NOW)).toBe("past");
  });

  it("classifies a refunded ticket as past regardless of event time", () => {
    const ticket = makeTicket({ status: "refunded", endTime: FUTURE });
    expect(classifyWalletTicket(ticket, NOW)).toBe("past");
  });

  it("classifies a pending ticket with future event as upcoming", () => {
    const ticket = makeTicket({ status: "pending", endTime: FUTURE });
    expect(classifyWalletTicket(ticket, NOW)).toBe("upcoming");
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// MockTicketingRepository
// ──────────────────────────────────────────────────────────────────────────────

function makeRepo() {
  return new MockTicketingRepository(new InMemoryTicketingStorage());
}

describe("MockTicketingRepository — seed and listing", () => {
  it("seeds the wallet with the fixture tickets on first load", async () => {
    const repo = makeRepo();
    const tickets = await repo.listWalletTickets();
    expect(tickets.length).toBeGreaterThan(0);
  });

  it("lists payment methods", async () => {
    const repo = makeRepo();
    const methods = await repo.listPaymentMethods();
    expect(methods.length).toBeGreaterThan(0);
    expect(methods[0].id).toBeTruthy();
  });
});

describe("MockTicketingRepository — simulatePayment paid", () => {
  it("creates an order and tickets on paid scenario", async () => {
    const repo = makeRepo();
    const tier = {
      id: "tier-ga-midnight",
      name: "General Admission",
      priceMinor: 25000,
      currency: "ZAR" as const,
      state: "available" as const,
      remaining: 50,
      maxPerOrder: 5,
    };
    const quote = buildCheckoutQuote("evt-midnight-grooves", [tier], {
      "tier-ga-midnight": 1,
    });

    const attempt = await repo.simulatePayment({
      attemptId: "attempt-test-001",
      eventId: "evt-midnight-grooves",
      attendeeId: "usr-001",
      attendeeName: "Test User",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "normal",
    });

    expect(attempt.status).toBe("paid");
    expect(attempt.orderId).toBeTruthy();
    expect(attempt.ticketIds).toHaveLength(1);

    const tickets = await repo.listWalletTickets();
    const newTicket = tickets.find((t) => t.id === attempt.ticketIds![0]);
    expect(newTicket).toBeTruthy();
    expect(newTicket!.status).toBe("valid");
  });

  it("returns declined status on payment_decline scenario", async () => {
    const repo = makeRepo();
    const tier = {
      id: "tier-ga",
      name: "GA",
      priceMinor: 10000,
      currency: "ZAR" as const,
      state: "available" as const,
      remaining: 10,
      maxPerOrder: 2,
    };
    const quote = buildCheckoutQuote("evt-rosebank-art-jazz", [tier], {
      "tier-ga": 1,
    });

    const attempt = await repo.simulatePayment({
      attemptId: "attempt-decline-001",
      eventId: "evt-rosebank-art-jazz",
      attendeeId: "usr-001",
      attendeeName: "Test User",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "payment_decline",
    });

    expect(attempt.status).toBe("declined");
    expect(attempt.orderId).toBeUndefined();
  });

  it("returns network_error on payment_network_error scenario", async () => {
    const repo = makeRepo();
    const tier = {
      id: "tier-ga",
      name: "GA",
      priceMinor: 10000,
      currency: "ZAR" as const,
      state: "available" as const,
      remaining: 10,
      maxPerOrder: 2,
    };
    const quote = buildCheckoutQuote("evt-rosebank-art-jazz", [tier], {
      "tier-ga": 1,
    });

    const attempt = await repo.simulatePayment({
      attemptId: "attempt-net-error-001",
      eventId: "evt-rosebank-art-jazz",
      attendeeId: "usr-001",
      attendeeName: "Test User",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "payment_network_error",
    });

    expect(attempt.status).toBe("network_error");
  });
});

describe("MockTicketingRepository — createFreeRegistration", () => {
  it("creates an order and tickets for a free event", async () => {
    const repo = makeRepo();
    const tier = freeRegistrationTiers[0];
    if (!tier) return; // guard

    const quote = buildCheckoutQuote("evt-soweto-food-market", [tier], {
      [tier.id]: 1,
    });

    const { order, tickets } = await repo.createFreeRegistration({
      registrationId: "reg-test-001",
      eventId: "evt-soweto-food-market",
      attendeeId: "usr-001",
      attendeeName: "Test User",
      quote,
    });

    expect(order.status).toBe("free_confirmed");
    expect(order.source).toBe("free_registration");
    expect(tickets).toHaveLength(1);
    expect(tickets[0].entryMode).toBe("profile_verification");
    expect(tickets[0].status).toBe("valid");
  });

  it("returns the same free registration for the same idempotency key", async () => {
    const repo = makeRepo();
    const tier = freeRegistrationTiers[0];
    if (!tier) return;

    const quote = buildCheckoutQuote("evt-soweto-food-market", [tier], {
      [tier.id]: 1,
    });

    const initialWallet = await repo.listWalletTickets();
    const seedCount = initialWallet.length;

    const input = {
      registrationId: "reg-idempotent-001",
      eventId: "evt-soweto-food-market",
      attendeeId: "usr-001",
      attendeeName: "Test User",
      quote,
    };

    const first = await repo.createFreeRegistration(input);
    const second = await repo.createFreeRegistration(input);

    expect(second.order.id).toBe(first.order.id);
    expect(second.tickets.map((t) => t.id)).toEqual(
      first.tickets.map((t) => t.id),
    );

    const finalWallet = await repo.listWalletTickets();
    expect(finalWallet).toHaveLength(seedCount + first.tickets.length);
  });
});

describe("MockTicketingRepository — getOrder and getTicket", () => {
  it("returns null for a non-existent order", async () => {
    const repo = makeRepo();
    const result = await repo.getOrder("order-does-not-exist");
    expect(result).toBeNull();
  });

  it("returns null for a non-existent ticket", async () => {
    const repo = makeRepo();
    const result = await repo.getTicket("ticket-does-not-exist");
    expect(result).toBeNull();
  });
});

describe("MockTicketingRepository — createSeedTicketingState", () => {
  it("initialises with correct sequence counters", () => {
    const state = createSeedTicketingState();
    expect(state.nextOrderSequence).toBe(10);
    expect(state.nextTicketSequence).toBe(10);
    expect(state.orders.length).toBeGreaterThan(0);
    expect(state.tickets.length).toBeGreaterThan(0);
  });
});
