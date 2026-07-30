import { DiscoveryFilters, FeedMode } from "../domain/discovery";
import { NotificationFilter } from "../repositories/contracts/NotificationRepository";

export const queryKeys = {
  identity: {
    all: ["identity"] as const,
    currentUser: () => [...queryKeys.identity.all, "user"] as const,
    permissions: () => [...queryKeys.identity.all, "permissions"] as const,
  },
  events: {
    all: ["events"] as const,
    featured: () => [...queryKeys.events.all, "featured"] as const,
    detail: (id: string) => [...queryKeys.events.all, "detail", id] as const,
    search: (query: string) =>
      [...queryKeys.events.all, "search", query] as const,
  },
  discovery: {
    all: ["discovery"] as const,
    feed: (mode: FeedMode, city: string, scenario: string) =>
      [...queryKeys.discovery.all, "feed", { mode, city, scenario }] as const,
    explore: (city: string, scenario: string) =>
      [...queryKeys.discovery.all, "explore", { city, scenario }] as const,
    search: (query: string, filters: DiscoveryFilters) =>
      [
        ...queryKeys.discovery.all,
        "search",
        {
          query: query.trim().toLocaleLowerCase(),
          filters,
        },
      ] as const,
  },
  commerce: {
    all: ["commerce"] as const,
    products: (eventId: string) =>
      [...queryKeys.commerce.all, "products", eventId] as const,
    tickets: () => [...queryKeys.commerce.all, "tickets"] as const,
  },
  creator: {
    all: ["creator"] as const,
    profile: () => [...queryKeys.creator.all, "profile"] as const,
    events: () => [...queryKeys.creator.all, "events"] as const,
    payouts: () => [...queryKeys.creator.all, "payouts"] as const,
  },
  social: {
    all: ["social"] as const,
    conversations: () => [...queryKeys.social.all, "conversations"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (filter: NotificationFilter = "all") =>
      [...queryKeys.notifications.all, "list", filter] as const,
  },
};
