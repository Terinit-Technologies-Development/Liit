/**
 * Typed route helper constants for LIIT navigation.
 */

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
  },
} as const;

export type AppRoute =
  | (typeof ROUTES.public)[keyof typeof ROUTES.public]
  | (typeof ROUTES.consumer)[keyof typeof ROUTES.consumer]
  | (typeof ROUTES.creator)[keyof typeof ROUTES.creator]
  | (typeof ROUTES.modals)[keyof typeof ROUTES.modals];
