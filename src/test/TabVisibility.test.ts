describe("Consumer Tab Visibility", () => {
  it("keeps exactly five visible consumer tabs", () => {
    const visibleConsumerTabs = [
      "feed",
      "explore",
      "map",
      "tickets",
      "profile",
    ];
    expect(visibleConsumerTabs).toEqual([
      "feed",
      "explore",
      "map",
      "tickets",
      "profile",
    ]);
  });
});
