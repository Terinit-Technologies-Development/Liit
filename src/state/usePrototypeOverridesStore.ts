import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event, EventStatus } from "../domain/events";

type EventStatusOverride = Exclude<EventStatus, "draft" | "published">;

interface PrototypeOverridesState {
  eventStatusOverrides: Record<string, EventStatusOverride>;
  hasHydrated: boolean;
  setEventStatusOverride(
    eventId: string,
    status: EventStatusOverride | null,
  ): void;
  clearAllOverrides(): void;
  resetPrototypeOverrides(): void;
  setHasHydrated(hydrated: boolean): void;
}

export const usePrototypeOverridesStore = create<PrototypeOverridesState>()(
  persist(
    (set) => ({
      eventStatusOverrides: {},
      hasHydrated: false,
      setEventStatusOverride: (eventId, status) =>
        set((state) => {
          const next = { ...state.eventStatusOverrides };
          if (status === null) {
            delete next[eventId];
          } else {
            next[eventId] = status;
          }
          return { eventStatusOverrides: next };
        }),
      clearAllOverrides: () => set({ eventStatusOverrides: {} }),
      resetPrototypeOverrides: () =>
        set({ eventStatusOverrides: {}, hasHydrated: true }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "liit-prototype-overrides-v1",
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

export function applyEventStatusOverride(event: Event): Event {
  const overrides = usePrototypeOverridesStore.getState().eventStatusOverrides;
  const status = overrides[event.id];
  if (!status || event.status === status) {
    return event;
  }
  return { ...event, status };
}

export function applyEventStatusOverrides(events: Event[]): Event[] {
  const overrides = usePrototypeOverridesStore.getState().eventStatusOverrides;
  const hasOverrides = Object.keys(overrides).length > 0;
  if (!hasOverrides) {
    return events;
  }
  return events.map((event) => {
    const status = overrides[event.id];
    if (!status || event.status === status) {
      return event;
    }
    return { ...event, status };
  });
}
