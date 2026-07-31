import {
  CONSUMER_TAB_ROUTES,
  routeBuilders,
  ROUTES,
} from "../navigation/routes";

describe("Instruction 3 Routes and Tab Visibility", () => {
  it("exposes exactly five visible tabs", () => {
    const visibleTabs = CONSUMER_TAB_ROUTES.filter(
      (route) => route.visible,
    ).map((route) => route.name);

    expect(visibleTabs).toEqual([
      "feed",
      "explore",
      "map",
      "tickets",
      "profile",
    ]);
  });

  it("configures events, hosts, and checkout as hidden contextual routes with tab bar hidden", () => {
    const hiddenTabRoutes = CONSUMER_TAB_ROUTES.filter(
      (route) => "hideTabBar" in route && route.hideTabBar,
    ).map((route) => route.name);

    expect(hiddenTabRoutes).toEqual(["events", "hosts", "checkout", "inbox"]);
  });

  it("builds typed route parameters for event detail, host profile, share and report", () => {
    expect(routeBuilders.eventDetail("evt-123")).toEqual({
      pathname: ROUTES.consumer.eventDetail,
      params: { eventId: "evt-123" },
    });

    expect(routeBuilders.hostProfile("host-456")).toEqual({
      pathname: ROUTES.consumer.hostProfile,
      params: { hostId: "host-456" },
    });

    expect(routeBuilders.eventShare("evt-123")).toEqual({
      pathname: ROUTES.modals.eventShare,
      params: { eventId: "evt-123" },
    });

    expect(
      routeBuilders.reportTarget({ kind: "event", id: "evt-123" }),
    ).toEqual({
      pathname: ROUTES.modals.eventReport,
      params: { targetKind: "event", targetId: "evt-123" },
    });

    expect(
      routeBuilders.reportTarget({ kind: "host", id: "host-456" }),
    ).toEqual({
      pathname: ROUTES.modals.eventReport,
      params: { targetKind: "host", targetId: "host-456" },
    });
  });
});
