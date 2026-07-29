import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Profile } from "../domain/identity";
import { mockUser } from "../fixtures";

export type AuthStatus = "guest" | "authenticated" | "unauthenticated";

export interface SessionState {
  status: AuthStatus;
  selectedCity: string;
  selectedInterests: string[];
  isLocationGranted: boolean;
  user: User | null;

  // Actions
  setGuestMode: () => void;
  setAuthenticatedUser: (user?: User) => void;
  setSelectedCity: (city: string) => void;
  toggleInterest: (interest: string) => void;
  setLocationGranted: (granted: boolean) => void;
  updateProfile: (partial: Partial<Profile>) => void;
  signOut: () => void;
}

const initialSessionState = {
  status: "guest" as AuthStatus,
  selectedCity: "Johannesburg",
  selectedInterests: ["Music", "Nightlife", "Art"],
  isLocationGranted: false,
  user: mockUser,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialSessionState,

      setGuestMode: () => set({ status: "guest" }),
      setAuthenticatedUser: (user = mockUser) =>
        set({ status: "authenticated", user }),
      setSelectedCity: (city: string) => set({ selectedCity: city }),
      toggleInterest: (interest: string) =>
        set((state) => {
          const exists = state.selectedInterests.includes(interest);
          return {
            selectedInterests: exists
              ? state.selectedInterests.filter((i) => i !== interest)
              : [...state.selectedInterests, interest],
          };
        }),
      setLocationGranted: (granted: boolean) =>
        set({ isLocationGranted: granted }),
      updateProfile: (partial: Partial<Profile>) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              profile: {
                ...state.user.profile,
                ...partial,
              },
            },
          };
        }),
      signOut: () => set({ ...initialSessionState, status: "unauthenticated" }),
    }),
    {
      name: "liit-session-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
