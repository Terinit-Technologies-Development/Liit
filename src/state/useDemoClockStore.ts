import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEMO_NOW_ISO } from "../fixtures/discovery/demo-clock";

const BASE_DEMO_NOW = new Date(DEMO_NOW_ISO).getTime();

export function demoNowIso(offsetMs: number): string {
  return new Date(BASE_DEMO_NOW + offsetMs).toISOString();
}

interface DemoClockState {
  offsetMs: number;
  hasHydrated: boolean;
  advanceClock(ms: number): void;
  resetClock(): void;
  setHasHydrated(hydrated: boolean): void;
}

export const useDemoClockStore = create<DemoClockState>()(
  persist(
    (set) => ({
      offsetMs: 0,
      hasHydrated: false,
      advanceClock: (ms) => set((state) => ({ offsetMs: state.offsetMs + ms })),
      resetClock: () => set({ offsetMs: 0 }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "liit-demo-clock-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...persisted }) => persisted,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
