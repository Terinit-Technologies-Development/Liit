/**
 * Identity Domain Models
 */

export type ProductMode = "consumer" | "creator";

export interface CreatorCapability {
  isVerified: boolean;
  canHostEvents: boolean;
  canCollectPayouts: boolean;
  tier: "emerging" | "verified" | "headline";
}

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  city: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile;
  creatorCapability: CreatorCapability;
  activeMode: ProductMode;
  createdAt: string;
}

export interface PermissionState {
  location: "granted" | "denied" | "prompt";
  notifications: "granted" | "denied" | "prompt";
  camera: "granted" | "denied" | "prompt";
}
