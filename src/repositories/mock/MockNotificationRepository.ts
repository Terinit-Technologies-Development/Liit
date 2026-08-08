import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ConsumerNotificationType,
  NotificationItem,
  NotificationTarget,
} from "../../domain/notifications";
import { mockConsumerNotifications } from "../../fixtures/discovery/notifications";
import { demoNowIso, useDemoClockStore } from "../../state/useDemoClockStore";
import { MockOptions, simulateMockOperation } from "../../utils/mock-operation";
import {
  NotificationFilter,
  NotificationRepository,
  RecordRegistrationConfirmedInput,
  RecordTicketConfirmedInput,
} from "../contracts/NotificationRepository";

const EVENT_TYPES = new Set<ConsumerNotificationType>([
  "ticket_confirmed",
  "event_reminder",
  "event_update",
  "booking_confirmed",
]);

const STORAGE_KEY = "liit-notifications-v1";

interface NotificationStorageState {
  items: NotificationItem[];
  nextSequence: number;
}

function cloneNotifications(items: NotificationItem[]): NotificationItem[] {
  return JSON.parse(JSON.stringify(items));
}

function seedState(): NotificationStorageState {
  const items = cloneNotifications(mockConsumerNotifications);
  const maxSuffix = items.reduce((max, item) => {
    const match = /^notif-(\d+)$/.exec(item.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return {
    items,
    nextSequence: maxSuffix + 1,
  };
}

function nextNotificationId(sequence: number): string {
  return `notif-${sequence}`;
}

export class MockNotificationRepository implements NotificationRepository {
  private state: NotificationStorageState = seedState();
  private loaded = false;

  private async loadState(): Promise<NotificationStorageState> {
    if (this.loaded) {
      return this.state;
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationStorageState;
        this.state = {
          items: parsed.items ?? [],
          nextSequence: parsed.nextSequence ?? 1,
        };
      }
    } catch {
      this.state = seedState();
    }
    this.loaded = true;
    return this.state;
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Persistence is best-effort in the prototype; in-memory state remains.
    }
  }

  private async record(input: {
    type: ConsumerNotificationType;
    title: string;
    body: string;
    target: NotificationTarget;
    avatarImageKey?: NotificationItem["avatarImageKey"];
    eventImageKey?: NotificationItem["eventImageKey"];
  }): Promise<NotificationItem> {
    await this.loadState();
    const id = nextNotificationId(this.state.nextSequence);
    const item: NotificationItem = {
      id,
      type: input.type,
      title: input.title,
      body: input.body,
      createdAt: demoNowIso(useDemoClockStore.getState().offsetMs),
      readState: "unread",
      target: input.target,
      avatarImageKey: input.avatarImageKey,
      eventImageKey: input.eventImageKey,
    };
    this.state.items.unshift(item);
    this.state.nextSequence += 1;
    await this.persist();
    return structuredClone(item);
  }

  async list(
    filter: NotificationFilter,
    options?: MockOptions,
  ): Promise<NotificationItem[]> {
    await this.loadState();
    return simulateMockOperation(() => {
      if (filter === "all") {
        return cloneNotifications(this.state.items);
      }

      if (filter === "events") {
        return cloneNotifications(
          this.state.items.filter((item) => EVENT_TYPES.has(item.type)),
        );
      }

      return cloneNotifications(
        this.state.items.filter((item) => !EVENT_TYPES.has(item.type)),
      );
    }, options);
  }

  async markRead(id: string, _options?: MockOptions): Promise<void> {
    await this.loadState();
    const item = this.state.items.find(
      (notification) => notification.id === id,
    );
    if (item) {
      item.readState = "read";
      await this.persist();
    }
  }

  async markAllRead(_options?: MockOptions): Promise<void> {
    await this.loadState();
    this.state.items = this.state.items.map((item) => ({
      ...item,
      readState: "read",
    }));
    await this.persist();
  }

  async recordTicketConfirmed(
    input: RecordTicketConfirmedInput,
  ): Promise<NotificationItem> {
    return this.record({
      type: "ticket_confirmed",
      title: "Tickets confirmed",
      body: `Your tickets for ${input.eventTitle} are in your wallet. Show the pass at the door.`,
      target: input.ticketId
        ? { kind: "ticket", ticketId: input.ticketId }
        : { kind: "tickets" },
      eventImageKey: input.eventImageKey,
    });
  }

  async recordRegistrationConfirmed(
    input: RecordRegistrationConfirmedInput,
  ): Promise<NotificationItem> {
    return this.record({
      type: "booking_confirmed",
      title: "Registration confirmed",
      body: `You are registered for ${input.eventTitle}. Your pass is in your wallet.`,
      target: input.ticketId
        ? { kind: "ticket", ticketId: input.ticketId }
        : { kind: "tickets" },
      eventImageKey: input.eventImageKey,
    });
  }

  async reset(): Promise<void> {
    this.state = seedState();
    this.loaded = true;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Best-effort cleanup.
    }
  }
}

export const mockNotificationRepository = new MockNotificationRepository();
