import { creatorKeys } from "../hooks/creator/useCreatorQueries";

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
});
