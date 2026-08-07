/**
 * Instruction 7 — Booking and registration create notifications
 *
 * Verifies that a paid checkout creates a ticket_confirmed notification,
 * a declined payment creates nothing, duplicate attempt ids stay idempotent,
 * and free registration creates a booking_confirmed notification.
 */

import { MockTicketingRepository } from "../../src/repositories/mock/MockTicketingRepository";
import { InMemoryTicketingStorage } from "../../src/repositories/mock/InMemoryTicketingStorage";
import { MockNotificationRepository } from "../../src/repositories/mock/MockNotificationRepository";
import { buildCheckoutQuote } from "../../src/domain/ticketing/quote";
import {
  freeRegistrationTiers,
  midnightGroovesTiers,
} from "../../src/fixtures/event-detail/ticket-tiers";
import { discoveryEvents } from "../../src/fixtures/discovery";
import { useDemoClockStore } from "../../src/state/useDemoClockStore";

async function buildPaidRepo() {
  const notifications = new MockNotificationRepository();
  await notifications.reset();
  const repo = new MockTicketingRepository(
    new InMemoryTicketingStorage(),
    notifications,
  );
  await repo.reset();
  return { repo, notifications };
}

describe("Booking notification creation", () => {
  beforeEach(() => {
    useDemoClockStore.getState().resetClock();
  });

  it("creates a ticket_confirmed notification on paid success", async () => {
    const { repo, notifications } = await buildPaidRepo();

    const event = discoveryEvents.find((e) => e.id === "evt-midnight-grooves")!;
    const tiers = midnightGroovesTiers;
    const quote = buildCheckoutQuote(
      event.id,
      tiers,
      { [tiers[0].id]: 2 },
    );

    const attempt = await repo.simulatePayment({
      attemptId: "attempt-001",
      eventId: event.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "normal",
    });

    expect(attempt.status).toBe("paid");

    const all = await notifications.list("all", { latencyMs: 0 });
    const created = all.find((n) => n.type === "ticket_confirmed");
    expect(created).toBeTruthy();
    expect(created?.readState).toBe("unread");
    expect(created?.target).toEqual({ kind: "tickets" });
    expect(created?.body).toContain(event.title);
  });

  it("creates no notification on declined payment", async () => {
    const { repo, notifications } = await buildPaidRepo();

    const event = discoveryEvents.find((e) => e.id === "evt-midnight-grooves")!;
    const tiers = midnightGroovesTiers;
    const quote = buildCheckoutQuote(event.id, tiers, {
      [tiers[0].id]: 1,
    });

    const attempt = await repo.simulatePayment({
      attemptId: "attempt-declined",
      eventId: event.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "payment_decline",
    });

    expect(attempt.status).toBe("declined");

    const all = await notifications.list("all", { latencyMs: 0 });
    expect(
      all.filter((n) => n.type === "ticket_confirmed"),
    ).toHaveLength(0);
  });

  it("does not duplicate notifications when the same attempt id is replayed", async () => {
    const { repo, notifications } = await buildPaidRepo();

    const event = discoveryEvents.find((e) => e.id === "evt-midnight-grooves")!;
    const tiers = midnightGroovesTiers;
    const quote = buildCheckoutQuote(event.id, tiers, {
      [tiers[0].id]: 1,
    });
    const input = {
      attemptId: "attempt-dup",
      eventId: event.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "normal",
    };

    await repo.simulatePayment(input);
    await repo.simulatePayment(input);

    const all = await notifications.list("all", { latencyMs: 0 });
    expect(
      all.filter((n) => n.type === "ticket_confirmed"),
    ).toHaveLength(1);
  });

  it("creates a booking_confirmed notification on free registration", async () => {
    const { repo, notifications } = await buildPaidRepo();

    const event = discoveryEvents.find(
      (e) => e.id === "evt-soweto-food-market",
    )!;
    const tiers = freeRegistrationTiers;
    const quote = buildCheckoutQuote(event.id, tiers, {
      [tiers[0].id]: 1,
    });

    const { order } = await repo.createFreeRegistration({
      registrationId: "registration-ev-001",
      eventId: event.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
    });

    expect(order.status).toBe("free_confirmed");

    const all = await notifications.list("all", { latencyMs: 0 });
    const created = all.find((n) => n.type === "booking_confirmed");
    expect(created).toBeTruthy();
    expect(created?.body).toContain(event.title);
  });

  it("resolves offline scenario payment as a network error with no order or notification", async () => {
    const { repo, notifications } = await buildPaidRepo();

    const event = discoveryEvents.find((e) => e.id === "evt-midnight-grooves")!;
    const tiers = midnightGroovesTiers;
    const quote = buildCheckoutQuote(event.id, tiers, {
      [tiers[0].id]: 1,
    });

    const attempt = await repo.simulatePayment({
      attemptId: "attempt-offline",
      eventId: event.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "offline",
    });

    expect(attempt.status).toBe("network_error");
    expect(attempt.orderId).toBeUndefined();

    const all = await notifications.list("all", { latencyMs: 0 });
    expect(
      all.filter((n) => n.type === "ticket_confirmed"),
    ).toHaveLength(0);
  });
});
