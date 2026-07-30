import { ImageAssetKey } from "../../assets/image-registry";

export type ConsumerNotificationType =
  | "ticket_confirmed"
  | "event_reminder"
  | "event_update"
  | "host_post"
  | "social_follow"
  | "social_reaction"
  | "booking_confirmed";

export type NotificationTarget =
  | {
      kind: "tickets";
    }
  | {
      kind: "event";
      eventId: string;
    }
  | {
      kind: "host";
      hostId: string;
    }
  | {
      kind: "search";
      query?: string;
    }
  | {
      kind: "profile";
    };

export interface NotificationItem {
  id: string;
  type: ConsumerNotificationType;
  title: string;
  body: string;
  createdAt: string;
  readState: "unread" | "read";
  target: NotificationTarget;
  avatarImageKey?: ImageAssetKey;
  eventImageKey?: ImageAssetKey;
}
