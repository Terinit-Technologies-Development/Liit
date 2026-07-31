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
  {
    name: "checkout",
    title: "Checkout",
    visible: false,
    hideTabBar: true,
  },
  {
    name: "inbox",
    title: "Inbox",
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
    checkoutTickets: "/(consumer)/checkout/[eventId]/tickets",
    checkoutPayment: "/(consumer)/checkout/[eventId]/payment",
    checkoutProcessing: "/(consumer)/checkout/[eventId]/processing",
    checkoutResult: "/(consumer)/checkout/[eventId]/result",
    fullTicket: "/(consumer)/tickets/[ticketId]",
    inbox: "/(consumer)/inbox",
    directThread: "/(consumer)/inbox/direct/[conversationId]",
    inquiryThread: "/(consumer)/inbox/inquiries/[conversationId]",
  },
  creator: {
    dashboard: "/(creator)/dashboard",
    create: "/(creator)/create",
    events: "/(creator)/events",
    tools: "/(creator)/tools",
    profile: "/(creator)/profile",
    activation: "/(creator)/activation",
    verification: "/(creator)/verification",
    eventsOpsHub: "/(creator)/events/[eventId]",
    eventsOpsEdit: "/(creator)/events/[eventId]/edit",
    eventsOpsPreview: "/(creator)/events/[eventId]/preview",
    eventsOpsAnalytics: "/(creator)/events/[eventId]/analytics",
    eventsOpsGuests: "/(creator)/events/[eventId]/guests",
    eventsOpsContent: "/(creator)/events/[eventId]/content",
    payouts: "/(creator)/payouts",
    notifications: "/(creator)/notifications",
  },
  modals: {
    modeSwitch: "/(modals)/mode-switch",
    prototypeControls: "/(modals)/prototype-controls",
    componentPreview: "/(modals)/component-preview",
    searchFilters: "/(modals)/search-filters",
    mapFilters: "/(modals)/map-filters",
    eventShare: "/(modals)/event-share",
    eventReport: "/(modals)/event-report",
    paymentMethod: "/(modals)/payment-method",
    ticketTerms: "/(modals)/ticket-terms",
    newMessage: "/(modals)/new-message",
    conversationActions: "/(modals)/conversation-actions",
    reportContent: "/(modals)/report-content",
    eventComments: "/(modals)/event-comments",
    publishConfirmation: "/(modals)/publish-confirmation",
    requestPayout: "/(modals)/request-payout",
  },
} as const;

export interface CheckoutTicketsRouteParams {
  eventId: string;
  initialTierId?: string;
}

export interface CheckoutPaymentRouteParams {
  eventId: string;
}

export interface CheckoutProcessingRouteParams {
  eventId: string;
  attemptId: string;
}

export type CheckoutResultKind =
  "paid_success" | "free_success" | "declined" | "network_error";

export interface CheckoutResultRouteParams {
  eventId: string;
  result: CheckoutResultKind;
  orderId?: string;
  ticketId?: string;
  attemptId?: string;
  [key: string]: string | undefined;
}

export interface FullTicketRouteParams {
  ticketId: string;
}

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

  creatorEventOpsHub(eventId: string) {
    return {
      pathname: ROUTES.creator.eventsOpsHub,
      params: { eventId },
    } as const;
  },

  creatorActivation() {
    return {
      pathname: ROUTES.creator.activation,
    } as const;
  },

  creatorPayouts() {
    return {
      pathname: ROUTES.creator.payouts,
    } as const;
  },

  creatorNotifications() {
    return {
      pathname: ROUTES.creator.notifications,
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

  checkoutTickets(eventId: string, initialTierId?: string) {
    return {
      pathname: ROUTES.consumer.checkoutTickets,
      params: {
        eventId,
        ...(initialTierId ? { initialTierId } : {}),
      },
    } as const;
  },

  checkoutPayment(eventId: string) {
    return {
      pathname: ROUTES.consumer.checkoutPayment,
      params: { eventId },
    } as const;
  },

  checkoutProcessing(eventId: string, attemptId: string) {
    return {
      pathname: ROUTES.consumer.checkoutProcessing,
      params: { eventId, attemptId },
    } as const;
  },

  checkoutResult(params: CheckoutResultRouteParams) {
    return {
      pathname: ROUTES.consumer.checkoutResult,
      params,
    } as const;
  },

  fullTicket(ticketId: string) {
    return {
      pathname: ROUTES.consumer.fullTicket,
      params: { ticketId },
    } as const;
  },

  inbox() {
    return {
      pathname: ROUTES.consumer.inbox,
    } as const;
  },

  directThread(conversationId: string) {
    return {
      pathname: ROUTES.consumer.directThread,
      params: { conversationId },
    } as const;
  },

  inquiryThread(conversationId: string) {
    return {
      pathname: ROUTES.consumer.inquiryThread,
      params: { conversationId },
    } as const;
  },

  newMessageModal() {
    return {
      pathname: ROUTES.modals.newMessage,
    } as const;
  },

  conversationActionsModal(conversationId: string) {
    return {
      pathname: ROUTES.modals.conversationActions,
      params: { conversationId },
    } as const;
  },

  reportContentModal(target: {
    targetKind: "event" | "host" | "comment" | "message" | "user";
    targetId: string;
  }) {
    return {
      pathname: ROUTES.modals.reportContent,
      params: target,
    } as const;
  },

  eventCommentsModal(eventId: string) {
    return {
      pathname: ROUTES.modals.eventComments,
      params: { eventId },
    } as const;
  },
};

export type AppRoute =
  | (typeof ROUTES.public)[keyof typeof ROUTES.public]
  | (typeof ROUTES.consumer)[keyof typeof ROUTES.consumer]
  | (typeof ROUTES.creator)[keyof typeof ROUTES.creator]
  | (typeof ROUTES.modals)[keyof typeof ROUTES.modals];
