import { IdentityRepository } from "../contracts/IdentityRepository";
import { User, PermissionState } from "../../domain/identity";
import { mockUser } from "../../fixtures";
import { simulateMockOperation } from "../../utils/mock-operation";

export class MockIdentityRepository implements IdentityRepository {
  private currentUser: User = { ...mockUser };
  private permissions: PermissionState = {
    location: "prompt",
    notifications: "prompt",
    camera: "prompt",
  };

  async getCurrentUser(): Promise<User> {
    return simulateMockOperation(() => ({ ...this.currentUser }));
  }

  async updateUserMode(mode: "consumer" | "creator"): Promise<User> {
    return simulateMockOperation(() => {
      this.currentUser = { ...this.currentUser, activeMode: mode };
      return { ...this.currentUser };
    });
  }

  async getPermissions(): Promise<PermissionState> {
    return simulateMockOperation(() => ({ ...this.permissions }));
  }
}

export const mockIdentityRepository = new MockIdentityRepository();
