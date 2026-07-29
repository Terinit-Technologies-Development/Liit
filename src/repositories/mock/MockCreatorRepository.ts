import { CreatorRepository } from "../contracts/CreatorRepository";
import {
  CreatorProfile,
  CreatorEventSummary,
  PayoutSummary,
} from "../../domain/creator";
import {
  mockCreatorProfile,
  mockCreatorEvents,
  mockPayouts,
} from "../../fixtures";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockCreatorRepository implements CreatorRepository {
  async getCreatorProfile(options?: MockOptions): Promise<CreatorProfile> {
    return simulateMockOperation(() => ({ ...mockCreatorProfile }), options);
  }

  async getCreatorEvents(
    options?: MockOptions,
  ): Promise<CreatorEventSummary[]> {
    return simulateMockOperation(() => [...mockCreatorEvents], options);
  }

  async getPayouts(options?: MockOptions): Promise<PayoutSummary[]> {
    return simulateMockOperation(() => [...mockPayouts], options);
  }
}

export const mockCreatorRepository = new MockCreatorRepository();
