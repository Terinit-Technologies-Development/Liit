import { NotificationRepository } from "../contracts/NotificationRepository";
import { NotificationItem } from "../../domain/notifications";
import { mockNotifications } from "../../fixtures";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockNotificationRepository implements NotificationRepository {
  async listNotifications(options?: MockOptions): Promise<NotificationItem[]> {
    return simulateMockOperation(() => [...mockNotifications], options);
  }
}

export const mockNotificationRepository = new MockNotificationRepository();
