import { NotificationItem } from "../../domain/notifications";
import { MockOptions } from "../../utils/mock-operation";

export type NotificationFilter = "all" | "events" | "activity";

export interface RecordTicketConfirmedInput {
  eventId: string;
  eventTitle: string;
  orderId: string;
  ticketId?: string;
  eventImageKey?: NotificationItem["eventImageKey"];
}

export interface RecordRegistrationConfirmedInput {
  eventId: string;
  eventTitle: string;
  orderId: string;
  eventImageKey?: NotificationItem["eventImageKey"];
}

export interface NotificationRepository {
  list(
    filter: NotificationFilter,
    options?: MockOptions,
  ): Promise<NotificationItem[]>;
  markRead(id: string, options?: MockOptions): Promise<void>;
  markAllRead(options?: MockOptions): Promise<void>;
  recordTicketConfirmed(
    input: RecordTicketConfirmedInput,
  ): Promise<NotificationItem>;
  recordRegistrationConfirmed(
    input: RecordRegistrationConfirmedInput,
  ): Promise<NotificationItem>;
  reset(): void;
}
