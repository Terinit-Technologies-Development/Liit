import { creatorKeys } from "../hooks/creator/useCreatorQueries";
import { ROUTES, routeBuilders } from "../navigation/routes";

describe("LIIT Instruction 6: Creator Routes & Keys", () => {
  it("should have correct query keys defined for all creator routes", () => {
    expect(creatorKeys.profile()).toEqual(["creator", "profile"]);
    expect(creatorKeys.stats()).toEqual(["creator", "stats"]);
    expect(creatorKeys.events()).toEqual(["creator", "events"]);
    expect(creatorKeys.activeEventProgress()).toEqual([
      "creator",
      "activeEventProgress",
    ]);
    expect(creatorKeys.priorityAlerts()).toEqual(["creator", "priorityAlerts"]);
    expect(creatorKeys.payoutsOverview()).toEqual([
      "creator",
      "payoutsOverview",
    ]);
    expect(creatorKeys.payoutHistory()).toEqual(["creator", "payoutHistory"]);
    expect(creatorKeys.contentPosts()).toEqual(["creator", "contentPosts"]);
    expect(creatorKeys.eventAnalytics("123")).toEqual([
      "creator",
      "eventAnalytics",
      "123",
    ]);
  });

  it("should define all new creator routes", () => {
    const expectedCreatorRoutes = [
      "activation",
      "verification",
      "eventsOpsHub",
      "eventsOpsEdit",
      "eventsOpsPreview",
      "eventsOpsAnalytics",
      "eventsOpsGuests",
      "eventsOpsContent",
      "payouts",
      "notifications",
    ] as const;

    expectedCreatorRoutes.forEach((key) => {
      expect(typeof ROUTES.creator[key]).toBe("string");
      expect(ROUTES.creator[key].length).toBeGreaterThan(0);
    });
  });

  it("should define new modal routes", () => {
    expect(typeof ROUTES.modals.publishConfirmation).toBe("string");
    expect(ROUTES.modals.publishConfirmation.length).toBeGreaterThan(0);
    expect(typeof ROUTES.modals.requestPayout).toBe("string");
    expect(ROUTES.modals.requestPayout.length).toBeGreaterThan(0);
  });

  it("should produce correct pathname and params in route builders", () => {
    expect(routeBuilders.creatorEventOpsHub("event-123")).toEqual({
      pathname: ROUTES.creator.eventsOpsHub,
      params: { eventId: "event-123" },
    });

    expect(routeBuilders.creatorActivation()).toEqual({
      pathname: ROUTES.creator.activation,
    });

    expect(routeBuilders.creatorPayouts()).toEqual({
      pathname: ROUTES.creator.payouts,
    });

    expect(routeBuilders.creatorNotifications()).toEqual({
      pathname: ROUTES.creator.notifications,
    });
  });
});
