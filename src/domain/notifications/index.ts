/**
 * Notifications Domain Models
 */

export type NotificationType =
  | "ticket_confirmed"
  | "event_reminder"
  | "event_update"
  | "creator_payout"
  | "social_follow";

export type NotificationReadState = "read" | "unread";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readState: NotificationReadState;
  createdAt: string; // ISO 8601 string
  targetRoute?: string;
}
