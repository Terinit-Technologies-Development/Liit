import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PrototypeControlsState {
  saveFollowFailure: boolean;
  commentFailure: boolean;
  hasHydrated: boolean;
  setSaveFollowFailure(enabled: boolean): void;
  setCommentFailure(enabled: boolean): void;
  resetPrototypeControls(): void;
}

export const usePrototypeControlsStore = create<PrototypeControlsState>()(
  persist(
    (set) => ({
      saveFollowFailure: false,
      commentFailure: false,
      hasHydrated: false,
      setSaveFollowFailure: (saveFollowFailure) => set({ saveFollowFailure }),
      setCommentFailure: (commentFailure) => set({ commentFailure }),
      resetPrototypeControls: () =>
        set({ saveFollowFailure: false, commentFailure: false, hasHydrated: true }),
    }),
    {
      name: "liit-prototype-controls-v1",
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
