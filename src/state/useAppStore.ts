import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProductMode, PermissionState } from "../domain/identity";

export type PrototypeScenario =
  | "normal"
  | "sold_out"
  | "offline"
  | "payment_decline"
  | "live_event"
  | "empty_discovery"
  | "discovery_error"
  | "notifications_disabled";

export interface AppState {
  activeMode: ProductMode;
  scenario: PrototypeScenario;
  hasCompletedOnboarding: boolean;
  permissions: PermissionState;
  hasHydrated: boolean;

  // Actions
  setActiveMode: (mode: ProductMode) => void;
  setMode: (mode: ProductMode) => void;
  setScenario: (scenario: PrototypeScenario) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  completeOnboarding: () => void;
  setPermission: (
    key: keyof PermissionState,
    value: "granted" | "denied" | "prompt",
  ) => void;
  setHasHydrated: (hydrated: boolean) => void;
  resetPrototype: () => void;
}

const initialAppState = {
  activeMode: "consumer" as ProductMode,
  scenario: "normal" as PrototypeScenario,
  hasCompletedOnboarding: false,
  permissions: {
    location: "prompt" as const,
    notifications: "prompt" as const,
    camera: "prompt" as const,
  },
  hasHydrated: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialAppState,

      setActiveMode: (mode: ProductMode) => set({ activeMode: mode }),
      setMode: (mode: ProductMode) => set({ activeMode: mode }),
      setScenario: (scenario: PrototypeScenario) => set({ scenario }),
      setOnboardingCompleted: (completed: boolean) =>
        set({ hasCompletedOnboarding: completed }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setPermission: (key, value) =>
        set((state) => ({
          permissions: { ...state.permissions, [key]: value },
        })),
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
      resetPrototype: () => set({ ...initialAppState, hasHydrated: true }),
    }),
    {
      name: "liit-prototype-state-v1",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
