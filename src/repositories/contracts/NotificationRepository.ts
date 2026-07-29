import { NotificationItem } from "../../domain/notifications";

export interface NotificationRepository {
  listNotifications(): Promise<NotificationItem[]>;
}
