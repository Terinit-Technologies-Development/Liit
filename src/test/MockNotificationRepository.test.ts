import { mockNotificationRepository } from "../repositories/mock/MockNotificationRepository";

describe("MockNotificationRepository", () => {
  beforeEach(() => {
    mockNotificationRepository.reset();
  });

  it("lists notifications by filter", async () => {
    const all = await mockNotificationRepository.list("all");
    const events = await mockNotificationRepository.list("events");
    const activity = await mockNotificationRepository.list("activity");

    expect(all.length).toBeGreaterThan(0);
    expect(events.length + activity.length).toBe(all.length);
  });

  it("marks a notification as read and marks all as read", async () => {
    const initial = await mockNotificationRepository.list("all");
    const unreadItem = initial.find((item) => item.readState === "unread");
    expect(unreadItem).toBeDefined();

    if (unreadItem) {
      await mockNotificationRepository.markRead(unreadItem.id);
      const afterSingle = await mockNotificationRepository.list("all");
      const updated = afterSingle.find((item) => item.id === unreadItem.id);
      expect(updated?.readState).toBe("read");
    }

    await mockNotificationRepository.markAllRead();
    const afterAll = await mockNotificationRepository.list("all");
    expect(afterAll.every((item) => item.readState === "read")).toBe(true);
  });
});
