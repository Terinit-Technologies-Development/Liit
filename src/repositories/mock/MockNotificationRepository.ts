import { NotificationItem } from "../../domain/notifications";
import { mockConsumerNotifications } from "../../fixtures/discovery/notifications";
import { MockOptions, simulateMockOperation } from "../../utils/mock-operation";
import {
  NotificationFilter,
  NotificationRepository,
} from "../contracts/NotificationRepository";

const EVENT_TYPES = new Set([
  "ticket_confirmed",
  "event_reminder",
  "event_update",
  "booking_confirmed",
]);

function cloneNotifications(items: NotificationItem[]): NotificationItem[] {
  return JSON.parse(JSON.stringify(items));
}

export class MockNotificationRepository implements NotificationRepository {
  private items: NotificationItem[] = cloneNotifications(
    mockConsumerNotifications,
  );

  async list(
    filter: NotificationFilter,
    options?: MockOptions,
  ): Promise<NotificationItem[]> {
    return simulateMockOperation(() => {
      if (filter === "all") {
        return cloneNotifications(this.items);
      }

      if (filter === "events") {
        return cloneNotifications(
          this.items.filter((item) => EVENT_TYPES.has(item.type)),
        );
      }

      return cloneNotifications(
        this.items.filter((item) => !EVENT_TYPES.has(item.type)),
      );
    }, options);
  }

  async markRead(id: string): Promise<void> {
    const item = this.items.find((notification) => notification.id === id);
    if (item) {
      item.readState = "read";
    }
  }

  async markAllRead(): Promise<void> {
    this.items = this.items.map((item) => ({
      ...item,
      readState: "read",
    }));
  }

  reset(): void {
    this.items = cloneNotifications(mockConsumerNotifications);
  }
}

export const mockNotificationRepository = new MockNotificationRepository();
