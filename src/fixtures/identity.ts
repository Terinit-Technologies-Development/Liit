import { User, Profile, CreatorCapability } from "../domain/identity";

export const mockProfile: Profile = {
  id: "prof_jhb_001",
  handle: "thabo_m",
  displayName: "Thabo Mbeki",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  bio: "Music enthusiast, nightlife curator & event creator based in Rosebank, Johannesburg.",
  city: "Johannesburg",
  country: "South Africa",
};

export const mockCreatorCapability: CreatorCapability = {
  isVerified: true,
  canHostEvents: true,
  canCollectPayouts: true,
  tier: "headline",
};

export const mockIdentityUser: User = {
  id: "usr_jhb_001",
  email: "thabo@liit.app",
  profile: mockProfile,
  creatorCapability: mockCreatorCapability,
  activeMode: "consumer",
  createdAt: "2025-01-15T08:00:00Z",
};

export const mockProfileStats = {
  attendedCount: 14,
  savedCount: 8,
  followingCount: 32,
};
