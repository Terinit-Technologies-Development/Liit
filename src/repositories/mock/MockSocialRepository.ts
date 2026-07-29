import { SocialRepository } from "../contracts/SocialRepository";
import { ConversationSummary } from "../../domain/social";
import { mockConversations } from "../../fixtures";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockSocialRepository implements SocialRepository {
  async listConversations(
    options?: MockOptions,
  ): Promise<ConversationSummary[]> {
    return simulateMockOperation(() => [...mockConversations], options);
  }
}

export const mockSocialRepository = new MockSocialRepository();
