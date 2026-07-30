import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_MAP_FILTERS,
  MapFiltersFormValues,
} from "../domain/map/map-filter-schema";
import { MapDisplayMode, MapLocationState, MapViewport } from "../domain/map";

export const DEFAULT_VIEWPORT: MapViewport = {
  centre: {
    latitude: -26.2041,
    longitude: 28.0473,
  },
  zoom: 2,
};

interface MapDiscoveryState {
  displayMode: MapDisplayMode;
  selectedEventId: string | null;
  viewport: MapViewport;
  filters: MapFiltersFormValues;
  locationState: MapLocationState;
  hasHydrated: boolean;

  setDisplayMode(mode: MapDisplayMode): void;
  selectEvent(eventId: string | null): void;
  setViewport(viewport: MapViewport): void;
  setFilters(filters: MapFiltersFormValues): void;
  setLocationState(state: MapLocationState): void;
  resetMapDiscovery(): void;
}

export const useMapDiscoveryStore = create<MapDiscoveryState>()(
  persist(
    (set) => ({
      displayMode: "map",
      selectedEventId: null,
      viewport: DEFAULT_VIEWPORT,
      filters: DEFAULT_MAP_FILTERS,
      locationState: "available",
      hasHydrated: false,

      setDisplayMode: (displayMode) => set({ displayMode }),

      selectEvent: (selectedEventId) => set({ selectedEventId }),

      setViewport: (viewport) => set({ viewport }),

      setFilters: (filters) => set({ filters }),

      setLocationState: (locationState) => set({ locationState }),

      resetMapDiscovery: () =>
        set({
          displayMode: "map",
          selectedEventId: null,
          viewport: DEFAULT_VIEWPORT,
          filters: DEFAULT_MAP_FILTERS,
          locationState: "available",
          hasHydrated: true,
        }),
    }),
    {
      name: "liit-map-discovery-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        selectedEventId: _selectedEventId,
        hasHydrated: _hasHydrated,
        ...persisted
      }) => persisted,
      onRehydrateStorage: () => () => {
        useMapDiscoveryStore.setState({ hasHydrated: true });
      },
    },
  ),
);
