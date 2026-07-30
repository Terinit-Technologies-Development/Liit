/**
 * Typed route helper constants for LIIT navigation.
 */

export const CONSUMER_TAB_ROUTES = [
  { name: "feed", title: "Feed", icon: "feed", visible: true },
  { name: "explore", title: "Explore", icon: "explore", visible: true },
  { name: "map", title: "Map", icon: "map", visible: true },
  { name: "tickets", title: "Tickets", icon: "tickets", visible: true },
  { name: "profile", title: "Profile", icon: "profile", visible: true },

  { name: "settings", title: "Settings", visible: false },
  { name: "search", title: "Search", visible: false },
  { name: "notifications", title: "Notifications", visible: false },

  {
    name: "events",
    title: "Event",
    visible: false,
    hideTabBar: true,
  },
  {
    name: "hosts",
    title: "Host",
    visible: false,
    hideTabBar: true,
  },
] as const;

export const ROUTES = {
  public: {
    welcome: "/(public)/welcome",
    location: "/(public)/location",
    interests: "/(public)/interests",
    signIn: "/(public)/sign-in",
  },
  consumer: {
    feed: "/(consumer)/feed",
    explore: "/(consumer)/explore",
    map: "/(consumer)/map",
    tickets: "/(consumer)/tickets",
    profile: "/(consumer)/profile",
    savedEvents: "/(consumer)/profile/saved",
    activity: "/(consumer)/profile/activity",
    settings: "/(consumer)/settings",
    search: "/(consumer)/search",
    notifications: "/(consumer)/notifications",
    eventDetail: "/(consumer)/events/[eventId]",
    hostProfile: "/(consumer)/hosts/[hostId]",
  },
  creator: {
    dashboard: "/(creator)/dashboard",
    create: "/(creator)/create",
    events: "/(creator)/events",
    tools: "/(creator)/tools",
    profile: "/(creator)/profile",
  },
  modals: {
    modeSwitch: "/(modals)/mode-switch",
    prototypeControls: "/(modals)/prototype-controls",
    componentPreview: "/(modals)/component-preview",
    searchFilters: "/(modals)/search-filters",
    mapFilters: "/(modals)/map-filters",
    eventShare: "/(modals)/event-share",
    eventReport: "/(modals)/event-report",
  },
} as const;

export const routeBuilders = {
  eventDetail(eventId: string) {
    return {
      pathname: ROUTES.consumer.eventDetail,
      params: { eventId },
    } as const;
  },

  hostProfile(hostId: string) {
    return {
      pathname: ROUTES.consumer.hostProfile,
      params: { hostId },
    } as const;
  },

  eventShare(eventId: string) {
    return {
      pathname: ROUTES.modals.eventShare,
      params: { eventId },
    } as const;
  },

  reportTarget(
    target: { kind: "event"; id: string } | { kind: "host"; id: string },
  ) {
    return {
      pathname: ROUTES.modals.eventReport,
      params: {
        targetKind: target.kind,
        targetId: target.id,
      },
    } as const;
  },
};

export type AppRoute =
  | (typeof ROUTES.public)[keyof typeof ROUTES.public]
  | (typeof ROUTES.consumer)[keyof typeof ROUTES.consumer]
  | (typeof ROUTES.creator)[keyof typeof ROUTES.creator]
  | (typeof ROUTES.modals)[keyof typeof ROUTES.modals];
