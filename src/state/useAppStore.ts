import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProductMode, PermissionState } from "../domain/identity";

export type PrototypeScenario =
  "normal" | "sold_out" | "offline" | "payment_decline" | "live_event";

export interface AppState {
  activeMode: ProductMode;
  scenario: PrototypeScenario;
  hasCompletedOnboarding: boolean;
  permissions: PermissionState;

  // Actions
  setActiveMode: (mode: ProductMode) => void;
  setScenario: (scenario: PrototypeScenario) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setPermission: (
    key: keyof PermissionState,
    value: "granted" | "denied" | "prompt",
  ) => void;
  resetPrototype: () => void;
}

const initialAppState = {
  activeMode: "consumer" as ProductMode,
  scenario: "normal" as PrototypeScenario,
  hasCompletedOnboarding: true,
  permissions: {
    location: "prompt" as const,
    notifications: "prompt" as const,
    camera: "prompt" as const,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialAppState,

      setActiveMode: (mode: ProductMode) => set({ activeMode: mode }),
      setScenario: (scenario: PrototypeScenario) => set({ scenario }),
      setOnboardingCompleted: (completed: boolean) =>
        set({ hasCompletedOnboarding: completed }),
      setPermission: (key, value) =>
        set((state) => ({
          permissions: { ...state.permissions, [key]: value },
        })),
      resetPrototype: () => set({ ...initialAppState }),
    }),
    {
      name: "liit-prototype-state-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
