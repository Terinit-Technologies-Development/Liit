/**
 * Instruction 7 corrective pass — authoritative overrides, contextual
 * inquiries, user-message-triggered host replies, durable free-registration
 * idempotency, stateful ticket inventory, demo-clock commerce timestamps,
 * and awaited notification reset.
 */

import {
  MockTicketingRepository,
  InsufficientTicketInventoryError,
} from "../../src/repositories/mock/MockTicketingRepository";
import { InMemoryTicketingStorage } from "../../src/repositories/mock/InMemoryTicketingStorage";
import { MockNotificationRepository } from "../../src/repositories/mock/MockNotificationRepository";
import {
  MockSocialRepository,
  HOST_REPLY_GAP_MS,
  HOST_TYPING_INDICATOR_MS,
} from "../../src/repositories/mock/MockSocialRepository";
import { buildCheckoutQuote } from "../../src/domain/ticketing/quote";
import {
  freeRegistrationTiers,
  midnightGroovesTiers,
} from "../../src/fixtures/event-detail/ticket-tiers";
import { discoveryEvents } from "../../src/fixtures/discovery";
import { DEMO_NOW_ISO } from "../../src/fixtures/discovery/demo-clock";
import {
  demoNowIso,
  useDemoClockStore,
} from "../../src/state/useDemoClockStore";
import { usePrototypeOverridesStore } from "../../src/state/usePrototypeOverridesStore";
import { useSocialStore } from "../../src/state/useSocialStore";
import {
  getEventDisplayStatus,
  toEventCardViewModel,
} from "../../src/domain/discovery/event-presentation";
import { classifyWalletTicket } from "../../src/domain/ticketing/wallet";

const midnightGroovesEvent = discoveryEvents.find(
  (e) => e.id === "evt-midnight-grooves",
)!;
const deepHouseEvent = discoveryEvents.find(
  (e) => e.id === "evt-deep-house-rooftop",
)!;
const completedEvent = discoveryEvents.find(
  (e) => e.id === "evt-completed-highlight",
)!;
const sowetoEvent = discoveryEvents.find(
  (e) => e.id === "evt-soweto-food-market",
)!;

describe("Forced prototype status is authoritative over derived presentation", () => {
  beforeEach(() => {
    usePrototypeOverridesStore.getState().resetPrototypeOverrides();
  });

  afterEach(() => {
    usePrototypeOverridesStore.getState().resetPrototypeOverrides();
  });

  it("renders Live for a sold-out fixture (zero inventory) forced to live", () => {
    expect(deepHouseEvent.status).toBe("sold_out");
    expect(deepHouseEvent.remainingTickets).toBe(0);

    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-deep-house-rooftop", "live");

    expect(getEventDisplayStatus(deepHouseEvent, DEMO_NOW_ISO)).toBe("Live");
    expect(
      toEventCardViewModel(deepHouseEvent, { nowIso: DEMO_NOW_ISO }).status,
    ).toBe("Live");
  });

  it("renders Live for a completed fixture whose end time is in the past", () => {
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-completed-highlight", "live");

    expect(getEventDisplayStatus(completedEvent, DEMO_NOW_ISO)).toBe("Live");
  });

  it("renders Cancelled for a published fixture forced to cancelled", () => {
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-midnight-grooves", "cancelled");

    expect(getEventDisplayStatus(midnightGroovesEvent, DEMO_NOW_ISO)).toBe(
      "Cancelled",
    );
  });

  it("restores the derived state after the override is cleared", () => {
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-deep-house-rooftop", "live");
    expect(getEventDisplayStatus(deepHouseEvent, DEMO_NOW_ISO)).toBe("Live");

    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-deep-house-rooftop", null);

    expect(getEventDisplayStatus(deepHouseEvent, DEMO_NOW_ISO)).toBe(
      "Sold Out",
    );
  });
});

describe("Contextual inquiry routing", () => {
  let repo: MockSocialRepository;

  beforeEach(async () => {
    repo = new MockSocialRepository();
    await repo.reset();
    useDemoClockStore.getState().resetClock();
  });

  it("resolves the canonical host + event inquiry context for Ask about this event", async () => {
    const conversation = await repo.getOrCreateInquiryContext({
      hostId: sowetoEvent.host.id,
      eventId: sowetoEvent.id,
    });

    expect(conversation.kind).toBe("inquiry");
    expect(conversation.hostId).toBe(sowetoEvent.host.id);
    expect(conversation.hostName).toBe(sowetoEvent.host.name);
    expect(conversation.eventContext.eventId).toBe(sowetoEvent.id);
    expect(conversation.eventContext.eventTitle).toBe(sowetoEvent.title);
  });

  it("is deterministic: repeated calls return the same conversation", async () => {
    const first = await repo.getOrCreateInquiryContext({
      hostId: sowetoEvent.host.id,
      eventId: sowetoEvent.id,
    });
    const second = await repo.getOrCreateInquiryContext({
      hostId: sowetoEvent.host.id,
      eventId: sowetoEvent.id,
    });

    expect(second.id).toBe(first.id);
    expect(second.eventContext.eventId).toBe(sowetoEvent.id);
    const conversations = await repo.listConversations("inquiry");
    expect(conversations.filter((c) => c.id === first.id)).toHaveLength(1);
  });

  it("preserves host identity for Host Profile Message and resolves a recipient", async () => {
    const conversation = await repo.getOrCreateInquiryContext({
      hostId: sowetoEvent.host.id,
    });

    expect(conversation.hostId).toBe(sowetoEvent.host.id);

    const recipients = await repo.listMessageRecipients();
    const recipient = recipients.find(
      (r) => r.kind === "inquiry" && r.id === sowetoEvent.host.id,
    );
    expect(recipient?.targetConversationId).toBe(conversation.id);
  });
});

describe("Simulated host reply starts after a user message", () => {
  let repo: MockSocialRepository;

  beforeEach(async () => {
    repo = new MockSocialRepository();
    await repo.reset();
    useSocialStore.getState().resetSocial();
    useDemoClockStore.getState().resetClock();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("send → delivered → typing → reply → typing stops, once per reset", async () => {
    const convId = "conv-inquiry-club-vibez";

    const sendPromise = repo.sendMessage({
      conversationId: convId,
      content: "Is a VIP table still free for 4?",
    });
    await jest.advanceTimersByTimeAsync(300);
    const sent = await sendPromise;
    expect(sent.status).toBe("delivered");

    const schedulePromise = repo.maybeSchedulePrototypeHostReply(convId);
    await jest.advanceTimersByTimeAsync(150); // getConversation latency
    expect(useSocialStore.getState().isTypingMap[convId]).toBe(true);

    await jest.advanceTimersByTimeAsync(HOST_TYPING_INDICATOR_MS);
    expect(useSocialStore.getState().isTypingMap[convId]).toBe(false);

    await jest.advanceTimersByTimeAsync(HOST_REPLY_GAP_MS);
    const reply = await schedulePromise;
    expect(reply).toBeTruthy();
    expect(reply?.isIncoming).toBe(true);
    expect(reply?.senderId).toBe("host-club-vibez");

    const messagesPromise = repo.listMessages(convId);
    await jest.advanceTimersByTimeAsync(200); // listMessages latency
    const messages = await messagesPromise;
    const replies = messages.filter(
      (m) => m.id === "msg-conv-inquiry-club-vibez-reply",
    );
    expect(replies).toHaveLength(1);
    expect(useSocialStore.getState().isTypingMap[convId]).toBe(false);
  });

  it("does not produce a second canned reply until the repository is reset", async () => {
    const convId = "conv-inquiry-club-vibez";

    const firstSend = repo.sendMessage({
      conversationId: convId,
      content: "First question",
    });
    await jest.advanceTimersByTimeAsync(300);
    await firstSend;

    const schedule1 = repo.maybeSchedulePrototypeHostReply(convId);
    await jest.advanceTimersByTimeAsync(150);
    await jest.advanceTimersByTimeAsync(HOST_TYPING_INDICATOR_MS);
    await jest.advanceTimersByTimeAsync(HOST_REPLY_GAP_MS);
    await schedule1;

    const secondSend = repo.sendMessage({
      conversationId: convId,
      content: "Second question",
    });
    await jest.advanceTimersByTimeAsync(300);
    await secondSend;

    const schedule2 = repo.maybeSchedulePrototypeHostReply(convId);
    await jest.advanceTimersByTimeAsync(150);
    await jest.advanceTimersByTimeAsync(HOST_TYPING_INDICATOR_MS);
    await jest.advanceTimersByTimeAsync(HOST_REPLY_GAP_MS);
    const secondReply = await schedule2;
    expect(secondReply).toBeNull();

    const messagesPromise = repo.listMessages(convId);
    await jest.advanceTimersByTimeAsync(200); // listMessages latency
    const messages = await messagesPromise;
    const replies = messages.filter((m) =>
      m.id.startsWith("msg-conv-inquiry-club-vibez-reply"),
    );
    expect(replies).toHaveLength(1);

    await repo.reset();
    const thirdSend = repo.sendMessage({
      conversationId: convId,
      content: "Third question",
    });
    await jest.advanceTimersByTimeAsync(300);
    await thirdSend;

    const schedule3 = repo.maybeSchedulePrototypeHostReply(convId);
    await jest.advanceTimersByTimeAsync(150);
    await jest.advanceTimersByTimeAsync(HOST_TYPING_INDICATOR_MS);
    await jest.advanceTimersByTimeAsync(HOST_REPLY_GAP_MS);
    const thirdReply = await schedule3;
    expect(thirdReply).toBeTruthy();
  });

  it("does nothing for direct conversations", async () => {
    const schedulePromise = repo.maybeSchedulePrototypeHostReply(
      "conv-direct-alex",
    );
    await jest.advanceTimersByTimeAsync(150); // getConversation latency
    const reply = await schedulePromise;
    expect(reply).toBeNull();
    expect(useSocialStore.getState().isTypingMap["conv-direct-alex"]).toBe(
      undefined,
    );
  });
});

describe("Durable free-registration idempotency", () => {
  async function buildFreeRepo() {
    const notifications = new MockNotificationRepository();
    await notifications.reset();
    const repo = new MockTicketingRepository(
      new InMemoryTicketingStorage(),
      notifications,
    );
    await repo.reset();
    return { repo, notifications };
  }

  it("re-registering after checkout state is cleared returns the same order and pass", async () => {
    const { repo, notifications } = await buildFreeRepo();

    const input = {
      eventId: sowetoEvent.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote: buildCheckoutQuote(sowetoEvent.id, freeRegistrationTiers, {
        [freeRegistrationTiers[0].id]: 1,
      }),
    };

    const first = await repo.createFreeRegistration({
      registrationId: "registration-new-id-a",
      ...input,
    });

    // A fresh nanoid registration id after checkout state was cleared must
    // still resolve to the existing registration for eventId + attendeeId.
    const second = await repo.createFreeRegistration({
      registrationId: "registration-new-id-b",
      ...input,
    });

    expect(second.order.id).toBe(first.order.id);
    expect(second.tickets.map((t) => t.id)).toEqual(
      first.tickets.map((t) => t.id),
    );
    expect(second.order.status).toBe("free_confirmed");

    const wallet = await repo.listWalletTickets();
    const owned = wallet.filter(
      (t) =>
        t.eventId === sowetoEvent.id &&
        !t.id.startsWith("ticket-liit-seed-"),
    );
    expect(owned).toHaveLength(1);

    const orders = await Promise.all(
      owned.map((t) => repo.getOrder(t.orderId)),
    );
    expect(orders.filter(Boolean)).toHaveLength(1);

    const all = await notifications.list("all", { latencyMs: 0 });
    const created = all.filter(
      (n) =>
        n.type === "booking_confirmed" && n.target.kind === "ticket",
    );
    expect(created).toHaveLength(1);
    expect(created[0]?.target).toEqual({
      kind: "ticket",
      ticketId: first.tickets[0]?.id,
    });
  });

  it("survives repository restart so Event Detail keeps showing the owned pass", async () => {
    const storage = new InMemoryTicketingStorage();
    const firstRepo = new MockTicketingRepository(storage);
    await firstRepo.reset();

    const first = await firstRepo.createFreeRegistration({
      registrationId: "registration-restart-001",
      eventId: sowetoEvent.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote: buildCheckoutQuote(sowetoEvent.id, freeRegistrationTiers, {
        [freeRegistrationTiers[0].id]: 1,
      }),
    });

    // Simulate restart/hydration with a fresh repository over the same state.
    const restarted = new MockTicketingRepository(storage);
    const wallet = await restarted.listWalletTickets();
    const owned = wallet.filter((t) => t.id === first.tickets[0]?.id);
    expect(owned).toHaveLength(1);
    expect(owned[0]?.source).toBe("free_registration");
  });
});

describe("Stateful ticket inventory", () => {
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

  const vipTier = midnightGroovesTiers.find(
    (t) => t.id === "tier-vip-tables",
  )!;

  async function payOne(
    repo: MockTicketingRepository,
    attemptId: string,
    scenario: "normal" | "payment_decline" | "payment_network_error" | "offline",
  ) {
    const quote = buildCheckoutQuote(midnightGroovesEvent.id, midnightGroovesTiers, {
      [vipTier.id]: 1,
    });
    return repo.simulatePayment({
      attemptId,
      eventId: midnightGroovesEvent.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario,
    });
  }

  it("decrements inventory on success and seeds the canonical counts", async () => {
    const { repo } = await buildPaidRepo();

    expect(
      await repo.getTierAvailability(midnightGroovesEvent.id),
    ).toMatchObject({ "tier-vip-tables": 2 });

    const paid = await payOne(repo, "attempt-inv-001", "normal");
    expect(paid.status).toBe("paid");

    const after = await repo.getTierAvailability(midnightGroovesEvent.id);
    expect(after["tier-vip-tables"]).toBe(1);
  });

  it("does not decrement on decline, network error, or offline", async () => {
    const { repo } = await buildPaidRepo();

    await payOne(repo, "attempt-inv-declined", "payment_decline");
    await payOne(repo, "attempt-inv-network", "payment_network_error");
    await payOne(repo, "attempt-inv-offline", "offline");

    const after = await repo.getTierAvailability(midnightGroovesEvent.id);
    expect(after["tier-vip-tables"]).toBe(2);
  });

  it("does not decrement twice for a replayed duplicate attempt id", async () => {
    const { repo } = await buildPaidRepo();

    const attempt = await payOne(repo, "attempt-inv-dup", "normal");
    expect(attempt.status).toBe("paid");
    await payOne(repo, "attempt-inv-dup", "normal");

    const after = await repo.getTierAvailability(midnightGroovesEvent.id);
    expect(after["tier-vip-tables"]).toBe(1);
    expect(
      (await repo.listWalletTickets()).filter(
        (t) => t.tierId === "tier-vip-tables",
      ),
    ).toHaveLength(1);
  });

  it("rejects sequential purchases once the tier is depleted (cannot oversell)", async () => {
    const { repo } = await buildPaidRepo();

    const first = await payOne(repo, "attempt-inv-1", "normal");
    expect(first.status).toBe("paid");

    const second = await payOne(repo, "attempt-inv-2", "normal");
    expect(second.status).toBe("paid");

    const after = await repo.getTierAvailability(midnightGroovesEvent.id);
    expect(after["tier-vip-tables"]).toBe(0);

    await expect(payOne(repo, "attempt-inv-3", "normal")).rejects.toThrow(
      InsufficientTicketInventoryError,
    );
  });
});

describe("Demo clock drives new commerce timestamps", () => {
  it("stamps attempt, order, ticket, and notification at the advanced demo time", async () => {
    const notifications = new MockNotificationRepository();
    await notifications.reset();
    const repo = new MockTicketingRepository(
      new InMemoryTicketingStorage(),
      notifications,
    );
    await repo.reset();

    useDemoClockStore.getState().resetClock();
    useDemoClockStore.getState().advanceClock(6 * 60 * 60 * 1000);
    const advancedNow = demoNowIso(
      useDemoClockStore.getState().offsetMs,
    );

    const event = midnightGroovesEvent;
    const quote = buildCheckoutQuote(event.id, midnightGroovesTiers, {
      [midnightGroovesTiers[0].id]: 1,
    });

    const attempt = await repo.simulatePayment({
      attemptId: "attempt-clock-001",
      eventId: event.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "normal",
    });

    expect(attempt.status).toBe("paid");
    expect(attempt.createdAt).toBe(advancedNow);

    const order = await repo.getOrder(attempt.orderId!);
    expect(order?.createdAt).toBe(advancedNow);

    const tickets = await repo.listWalletTickets();
    const newTicket = tickets.find((t) => t.id === attempt.ticketIds?.[0]);
    expect(newTicket?.issuedAt).toBe(advancedNow);

    const all = await notifications.list("all", { latencyMs: 0 });
    const created = all.find((n) => n.type === "ticket_confirmed");
    expect(created?.createdAt).toBe(advancedNow);

    // Free-registration records use the same shared clock.
    useDemoClockStore.getState().advanceClock(60 * 60 * 1000);
    const laterNow = demoNowIso(useDemoClockStore.getState().offsetMs);
    const free = await repo.createFreeRegistration({
      registrationId: "registration-clock-001",
      eventId: sowetoEvent.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote: buildCheckoutQuote(sowetoEvent.id, freeRegistrationTiers, {
        [freeRegistrationTiers[0].id]: 1,
      }),
    });
    expect(free.order.createdAt).toBe(laterNow);
    expect(free.tickets[0]?.issuedAt).toBe(laterNow);
  });
});

describe("Awaited notification reset", () => {
  it("completes before a fresh repository instance can read", async () => {
    const first = new MockNotificationRepository();
    await first.reset();

    await first.recordTicketConfirmed({
      eventId: "evt-midnight-grooves",
      eventTitle: "Midnight Kinetic Grooves",
      orderId: "order-liit-0010",
      ticketId: "ticket-liit-0010",
    });

    const resetPromise = first.reset();
    expect(resetPromise).toBeInstanceOf(Promise);
    await resetPromise;

    const fresh = new MockNotificationRepository();
    const all = await fresh.list("all", { latencyMs: 0 });
    expect(all.map((n) => n.id).sort()).toEqual([
      "notif-1",
      "notif-2",
      "notif-3",
      "notif-4",
      "notif-5",
      "notif-6",
    ]);
  });
});

describe("Demo-clock ticket expiry and wallet classification agree", () => {
  it("classifies a ticket past and prevents active entry after the event ends", async () => {
    const repo = new MockTicketingRepository(new InMemoryTicketingStorage());
    await repo.reset();
    useDemoClockStore.getState().resetClock();

    // Create a session ticket whose event ends during the +24h advance.
    const quote = buildCheckoutQuote(midnightGroovesEvent.id, midnightGroovesTiers, {
      [midnightGroovesTiers[0].id]: 1,
    });
    const attempt = await repo.simulatePayment({
      attemptId: "attempt-expiry-001",
      eventId: midnightGroovesEvent.id,
      attendeeId: "usr-001",
      attendeeName: "Keketso",
      quote,
      paymentMethodId: "pm-demo-visa-4242",
      scenario: "normal",
    });
    const ticket = await repo.getTicket(attempt.ticketIds![0]!);
    expect(ticket?.status).toBe("valid");

    expect(classifyWalletTicket(ticket!, DEMO_NOW_ISO)).toBe("upcoming");

    useDemoClockStore.getState().advanceClock(24 * 60 * 60 * 1000);
    const advanced = demoNowIso(useDemoClockStore.getState().offsetMs);

    expect(classifyWalletTicket(ticket!, advanced)).toBe("past");
    useDemoClockStore.getState().resetClock();
  });
});
