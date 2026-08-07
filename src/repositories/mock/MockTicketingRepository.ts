import {
  CreateFreeRegistrationInput,
  SimulatePaymentInput,
  TicketingRepository,
} from "../contracts/TicketingRepository";
import {
  TicketingRepositoryState,
  TicketingStorage,
} from "../contracts/TicketingStorage";
import { AsyncStorageTicketingStorage } from "./AsyncStorageTicketingStorage";
import {
  NotificationRepository,
} from "../contracts/NotificationRepository";
import {
  PaymentAttempt,
  PaymentMethod,
  TicketOrder,
  TicketStatus,
  WalletTicket,
} from "../../domain/ticketing";
import {
  mockPaymentMethods,
  seedTicketOrders,
  seedWalletTickets,
} from "../../fixtures/ticketing";
import { discoveryEvents } from "../../fixtures/discovery";
import { DEMO_NOW_ISO } from "../../fixtures/discovery/demo-clock";
import { mockNotificationRepository } from "./MockNotificationRepository";

function formatSequence(value: number): string {
  return value.toString().padStart(4, "0");
}

export function createOrderId(sequence: number): string {
  return `order-liit-${formatSequence(sequence)}`;
}

export function createTicketId(sequence: number): string {
  return `ticket-liit-${formatSequence(sequence)}`;
}

function normaliseState(
  state: TicketingRepositoryState,
): TicketingRepositoryState {
  return {
    ...state,
    attempts: state.attempts ?? {},
    freeRegistrations: state.freeRegistrations ?? {},
  };
}

export function createSeedTicketingState(): TicketingRepositoryState {
  return {
    nextOrderSequence: 10,
    nextTicketSequence: 10,
    orders: structuredClone(seedTicketOrders),
    tickets: structuredClone(seedWalletTickets),
    attempts: {},
    freeRegistrations: {},
  };
}

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockTicketingRepository implements TicketingRepository {
  private storage: TicketingStorage;
  private mutationQueue: Promise<void> = Promise.resolve();
  private notificationPublisher: NotificationRepository | null;

  constructor(
    storage?: TicketingStorage,
    notificationPublisher?: NotificationRepository | null,
  ) {
    this.storage = storage ?? new AsyncStorageTicketingStorage();
    this.notificationPublisher = notificationPublisher ?? null;
  }

  private runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutationQueue.then(operation, operation);
    this.mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async loadState(): Promise<TicketingRepositoryState> {
    const stored = await this.storage.load();
    if (stored) {
      return normaliseState(stored);
    }
    const seeded = createSeedTicketingState();
    await this.storage.save(seeded);
    return seeded;
  }

  async listPaymentMethods(): Promise<PaymentMethod[]> {
    await delayMs(200);
    return structuredClone(mockPaymentMethods);
  }

  async simulatePayment(input: SimulatePaymentInput): Promise<PaymentAttempt> {
    return this.runExclusive(async () => {
      await delayMs(1800);

      const state = await this.loadState();

      if (state.attempts[input.attemptId]) {
        return structuredClone(state.attempts[input.attemptId]);
      }

      const status =
        input.scenario === "payment_decline"
          ? "declined"
          : input.scenario === "payment_network_error"
            ? "network_error"
            : "paid";

      const attempt: PaymentAttempt = {
        id: input.attemptId,
        eventId: input.eventId,
        quote: input.quote,
        paymentMethodId: input.paymentMethodId,
        status,
        createdAt: DEMO_NOW_ISO,
      };

      if (status === "paid") {
        const orderId = createOrderId(state.nextOrderSequence++);
        const event = discoveryEvents.find((e) => e.id === input.eventId);
        const paymentMethod = mockPaymentMethods.find(
          (method) => method.id === input.paymentMethodId,
        );

        const newTickets: WalletTicket[] = [];

        for (const line of input.quote.lines) {
          for (let i = 0; i < line.quantity; i++) {
            const ticketId = createTicketId(state.nextTicketSequence++);
            newTickets.push({
              id: ticketId,
              orderId,
              eventId: input.eventId,
              attendeeId: input.attendeeId,
              attendeeName: input.attendeeName,
              tierId: line.tierId,
              tierName: line.tierName,
              status: "valid",
              source: "paid",
              entryMode: "qr_placeholder",
              issuedAt: DEMO_NOW_ISO,
              eventSnapshot: {
                title: event?.title ?? "LIIT Event",
                imageKey: event?.heroImageKey ?? "eventMidnightGrooves",
                venueName: event?.venue.name ?? "Braamfontein Rooftop",
                venueSuburb: event?.venue.suburb ?? "Braamfontein",
                city: "Johannesburg",
                startTime: event?.occurrence.startTime ?? DEMO_NOW_ISO,
                endTime: event?.occurrence.endTime ?? DEMO_NOW_ISO,
              },
            });
          }
        }

        const newOrder: TicketOrder = {
          id: orderId,
          eventId: input.eventId,
          attendeeId: input.attendeeId,
          attendeeName: input.attendeeName,
          status: "paid",
          source: "paid",
          quote: input.quote,
          paymentMethodLabel: paymentMethod?.label ?? "Demo payment method",
          createdAt: DEMO_NOW_ISO,
          ticketIds: newTickets.map((t) => t.id),
        };

        state.orders.unshift(newOrder);
        state.tickets.unshift(...newTickets);

        attempt.orderId = orderId;
        attempt.ticketIds = newTickets.map((t) => t.id);

        if (this.notificationPublisher) {
          await this.notificationPublisher.recordTicketConfirmed({
            eventId: input.eventId,
            eventTitle: event?.title ?? "LIIT Event",
            orderId,
            ticketId: newTickets[0]?.id,
            eventImageKey: event?.heroImageKey,
          });
        }
      }

      state.attempts[input.attemptId] = attempt;
      await this.storage.save(state);

      return structuredClone(attempt);
    });
  }

  async createFreeRegistration(
    input: CreateFreeRegistrationInput,
  ): Promise<{ order: TicketOrder; tickets: WalletTicket[] }> {
    return this.runExclusive(async () => {
      await delayMs(800);

      const state = await this.loadState();

      const existing = state.freeRegistrations[input.registrationId];
      if (existing) {
        const order = state.orders.find((item) => item.id === existing.orderId);
        const tickets = existing.ticketIds
          .map((ticketId) => state.tickets.find((item) => item.id === ticketId))
          .filter((ticket): ticket is WalletTicket => Boolean(ticket));

        if (order) {
          return {
            order: structuredClone(order),
            tickets: structuredClone(tickets),
          };
        }
      }

      const orderId = createOrderId(state.nextOrderSequence++);
      const event = discoveryEvents.find((e) => e.id === input.eventId);

      const newTickets: WalletTicket[] = [];

      for (const line of input.quote.lines) {
        for (let i = 0; i < line.quantity; i++) {
          const ticketId = createTicketId(state.nextTicketSequence++);
          newTickets.push({
            id: ticketId,
            orderId,
            eventId: input.eventId,
            attendeeId: input.attendeeId,
            attendeeName: input.attendeeName,
            tierId: line.tierId,
            tierName: line.tierName,
            status: "valid",
            source: "free_registration",
            entryMode: "profile_verification",
            issuedAt: DEMO_NOW_ISO,
            eventSnapshot: {
              title: event?.title ?? "LIIT Event",
              imageKey: event?.heroImageKey ?? "eventSowetoFoodMarket",
              venueName: event?.venue.name ?? "Johannesburg Venue",
              venueSuburb: event?.venue.suburb ?? "Johannesburg",
              city: "Johannesburg",
              startTime: event?.occurrence.startTime ?? DEMO_NOW_ISO,
              endTime: event?.occurrence.endTime ?? DEMO_NOW_ISO,
            },
          });
        }
      }

      const newOrder: TicketOrder = {
        id: orderId,
        eventId: input.eventId,
        attendeeId: input.attendeeId,
        attendeeName: input.attendeeName,
        status: "free_confirmed",
        source: "free_registration",
        quote: input.quote,
        createdAt: DEMO_NOW_ISO,
        ticketIds: newTickets.map((t) => t.id),
      };

      state.orders.unshift(newOrder);
      state.tickets.unshift(...newTickets);
      state.freeRegistrations[input.registrationId] = {
        orderId: newOrder.id,
        ticketIds: newTickets.map((t) => t.id),
      };

      await this.storage.save(state);

      if (this.notificationPublisher) {
        await this.notificationPublisher.recordRegistrationConfirmed({
          eventId: input.eventId,
          eventTitle: event?.title ?? "LIIT Event",
          orderId: newOrder.id,
          eventImageKey: event?.heroImageKey,
        });
      }

      return {
        order: structuredClone(newOrder),
        tickets: structuredClone(newTickets),
      };
    });
  }

  async getOrder(orderId: string): Promise<TicketOrder | null> {
    await delayMs(200);
    const state = await this.loadState();
    const order = state.orders.find((o) => o.id === orderId) ?? null;
    return order ? structuredClone(order) : null;
  }

  async listWalletTickets(): Promise<WalletTicket[]> {
    await delayMs(300);
    const state = await this.loadState();
    return structuredClone(state.tickets);
  }

  async getTicket(ticketId: string): Promise<WalletTicket | null> {
    await delayMs(200);
    const state = await this.loadState();
    const ticket = state.tickets.find((t) => t.id === ticketId) ?? null;
    return ticket ? structuredClone(ticket) : null;
  }

  async setTicketStatus(
    ticketId: string,
    status: TicketStatus,
  ): Promise<WalletTicket | null> {
    return this.runExclusive(async () => {
      await delayMs(200);
      const state = await this.loadState();
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) {
        return null;
      }
      ticket.status = status;
      await this.storage.save(state);
      return structuredClone(ticket);
    });
  }

  async reset(): Promise<void> {
    await this.runExclusive(async () => {
      await this.storage.clear();
      await this.storage.save(createSeedTicketingState());
    });
  }
}

export const mockTicketingRepository = new MockTicketingRepository(
  undefined,
  mockNotificationRepository,
);
