import { CONSUMER_TAB_ROUTES } from "../navigation/routes";

describe("Consumer Bottom Tabs Visibility", () => {
  it("preserves exactly five visible consumer tabs (Feed, Explore, Map, Tickets, Profile)", () => {
    const visibleRoutes = CONSUMER_TAB_ROUTES.filter(
      (route) => route.visible,
    ).map((route) => route.name);

    expect(visibleRoutes).toEqual([
      "feed",
      "explore",
      "map",
      "tickets",
      "profile",
    ]);
  });

  it("hides contextual routes (settings, search, notifications, events, hosts, checkout) from bottom navigation", () => {
    const hiddenRoutes = CONSUMER_TAB_ROUTES.filter(
      (route) => !route.visible,
    ).map((route) => route.name);

    expect(hiddenRoutes).toEqual([
      "settings",
      "search",
      "notifications",
      "events",
      "hosts",
      "checkout",
      "inbox",
    ]);
  });
});
