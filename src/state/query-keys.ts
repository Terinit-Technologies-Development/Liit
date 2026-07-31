import { DiscoveryFilters, FeedMode } from "../domain/discovery";
import { MapFilters } from "../domain/map";
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
  map: {
    all: ["map"] as const,
    snapshot: (filters: MapFilters, scenario: string) =>
      [
        ...queryKeys.map.all,
        "snapshot",
        {
          filters,
          scenario,
          city: "Johannesburg",
        },
      ] as const,
  },
  eventDetail: {
    all: ["event-detail"] as const,
    detail: (eventId: string) =>
      [...queryKeys.eventDetail.all, "detail", eventId] as const,
    related: (eventId: string) =>
      [...queryKeys.eventDetail.all, "related", eventId] as const,
  },
  hosts: {
    all: ["hosts"] as const,
    publicProfile: (hostId: string) =>
      [...queryKeys.hosts.all, "public-profile", hostId] as const,
    upcomingEvents: (hostId: string) =>
      [...queryKeys.hosts.all, "upcoming-events", hostId] as const,
  },
  ticketing: {
    all: ["ticketing"] as const,
    wallet: (scenario: string) =>
      [...queryKeys.ticketing.all, "wallet", scenario] as const,
    ticket: (ticketId: string) =>
      [...queryKeys.ticketing.all, "ticket", ticketId] as const,
    order: (orderId: string) =>
      [...queryKeys.ticketing.all, "order", orderId] as const,
    paymentMethods: () =>
      [...queryKeys.ticketing.all, "payment-methods"] as const,
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
    conversations: (kind?: string) =>
      [...queryKeys.social.all, "conversations", kind ?? "all"] as const,
    conversationDetail: (id: string) =>
      [...queryKeys.social.all, "conversation-detail", id] as const,
    messages: (conversationId: string) =>
      [...queryKeys.social.all, "messages", conversationId] as const,
    comments: (eventId: string) =>
      [...queryKeys.social.all, "comments", eventId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (filter: NotificationFilter = "all") =>
      [...queryKeys.notifications.all, "list", filter] as const,
  },
};
