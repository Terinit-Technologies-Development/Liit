import { User, PermissionState } from "../../domain/identity";

export interface IdentityRepository {
  getCurrentUser(): Promise<User>;
  updateUserMode(mode: "consumer" | "creator"): Promise<User>;
  getPermissions(): Promise<PermissionState>;
}
