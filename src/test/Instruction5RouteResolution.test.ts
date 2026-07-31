import {
  CONSUMER_TAB_ROUTES,
  ROUTES,
  routeBuilders,
} from "../navigation/routes";

describe("Instruction 5 Messaging Routes & Tab Visibility Configuration", () => {
  it("Confirms CONSUMER_TAB_ROUTES has inbox configured as a hidden route with hideTabBar: true", () => {
    const inboxRoute = CONSUMER_TAB_ROUTES.find((r) => r.name === "inbox");

    expect(inboxRoute).toBeDefined();
    expect(inboxRoute?.visible).toBe(false);
    expect("hideTabBar" in inboxRoute! && inboxRoute.hideTabBar).toBe(true);
  });

  it("Confirms ROUTES consumer and modal endpoints", () => {
    expect(ROUTES.consumer.inbox).toBe("/(consumer)/inbox");
    expect(ROUTES.consumer.directThread).toBe(
      "/(consumer)/inbox/direct/[conversationId]",
    );
    expect(ROUTES.consumer.inquiryThread).toBe(
      "/(consumer)/inbox/inquiries/[conversationId]",
    );
    expect(ROUTES.modals.newMessage).toBe("/(modals)/new-message");
    expect(ROUTES.modals.conversationActions).toBe(
      "/(modals)/conversation-actions",
    );
    expect(ROUTES.modals.reportContent).toBe("/(modals)/report-content");
  });

  it("Confirms routeBuilders generate valid pathname and params objects", () => {
    expect(routeBuilders.inbox()).toEqual({
      pathname: "/(consumer)/inbox",
    });

    expect(routeBuilders.directThread("conv-123")).toEqual({
      pathname: "/(consumer)/inbox/direct/[conversationId]",
      params: { conversationId: "conv-123" },
    });

    expect(routeBuilders.inquiryThread("conv-inquiry-123")).toEqual({
      pathname: "/(consumer)/inbox/inquiries/[conversationId]",
      params: { conversationId: "conv-inquiry-123" },
    });

    expect(routeBuilders.newMessageModal()).toEqual({
      pathname: "/(modals)/new-message",
    });

    expect(routeBuilders.conversationActionsModal("conv-123")).toEqual({
      pathname: "/(modals)/conversation-actions",
      params: { conversationId: "conv-123" },
    });

    expect(
      routeBuilders.reportContentModal({
        targetKind: "user",
        targetId: "usr-001",
      }),
    ).toEqual({
      pathname: "/(modals)/report-content",
      params: {
        targetKind: "user",
        targetId: "usr-001",
      },
    });
  });
});
