import { NotificationItem } from "../../domain/notifications";
import { MockOptions } from "../../utils/mock-operation";

export type NotificationFilter = "all" | "events" | "activity";

export interface NotificationRepository {
  list(
    filter: NotificationFilter,
    options?: MockOptions,
  ): Promise<NotificationItem[]>;
  markRead(id: string, options?: MockOptions): Promise<void>;
  markAllRead(options?: MockOptions): Promise<void>;
  reset(): void;
}
