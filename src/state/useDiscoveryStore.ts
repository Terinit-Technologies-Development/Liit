import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DiscoveryFilters,
  FeedMode,
  SearchResultTab,
} from "../domain/discovery";

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  category: null,
  date: "any",
  distanceKm: null,
  maxPriceMinor: null,
  availabilityOnly: false,
  liveOnly: false,
};

interface DiscoveryState {
  feedMode: FeedMode;
  resultTab: SearchResultTab;
  recentSearches: string[];
  filters: DiscoveryFilters;
  followedHostIds: string[];
  hasHydrated: boolean;

  setFeedMode(mode: FeedMode): void;
  setResultTab(tab: SearchResultTab): void;
  addRecentSearch(query: string): void;
  clearRecentSearches(): void;
  setFilters(filters: DiscoveryFilters): void;
  toggleHostFollow(hostId: string): void;
  resetDiscovery(): void;
}

const initialState = {
  feedMode: "live_recent" as FeedMode,
  resultTab: "events" as SearchResultTab,
  recentSearches: ["Amapiano", "Braamfontein", "This weekend"],
  filters: DEFAULT_DISCOVERY_FILTERS,
  followedHostIds: [] as string[],
  hasHydrated: false,
};

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setFeedMode: (feedMode) => set({ feedMode }),

      setResultTab: (resultTab) => set({ resultTab }),

      addRecentSearch: (value) => {
        const query = value.trim();

        if (!query) {
          return;
        }

        const recentSearches = [
          query,
          ...get().recentSearches.filter(
            (item) => item.toLocaleLowerCase() !== query.toLocaleLowerCase(),
          ),
        ].slice(0, 8);

        set({ recentSearches });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      setFilters: (filters) => set({ filters }),

      toggleHostFollow: (hostId) => {
        const current = get().followedHostIds;

        set({
          followedHostIds: current.includes(hostId)
            ? current.filter((id) => id !== hostId)
            : [...current, hostId],
        });
      },

      resetDiscovery: () =>
        set({
          ...initialState,
          hasHydrated: true,
        }),
    }),
    {
      name: "liit-discovery-state-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...persisted }) => persisted,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);
