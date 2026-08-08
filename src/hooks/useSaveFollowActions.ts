import { useCallback } from "react";
import { useAppStore } from "../state/useAppStore";
import { useDiscoveryStore } from "../state/useDiscoveryStore";
import { usePrototypeControlsStore } from "../state/usePrototypeControlsStore";
import { showToast } from "../components/ui/Toast";

const SIMULATED_TOGGLE_LATENCY_MS = 400;

function shouldSimulateToggleFailure(): boolean {
  const scenario = useAppStore.getState().scenario;
  if (scenario === "offline") {
    return true;
  }
  return usePrototypeControlsStore.getState().saveFollowFailure;
}

export function useSaveFollowActions() {
  const toggleSavedEvent = useDiscoveryStore((state) => state.toggleSavedEvent);
  const toggleHostFollow = useDiscoveryStore((state) => state.toggleHostFollow);

  const toggleSaved = useCallback(
    (eventId: string) => {
      const wasSaved = useDiscoveryStore
        .getState()
        .savedEventIds.includes(eventId);
      const optimisticSaved = !wasSaved;

      toggleSavedEvent(eventId);

      if (!shouldSimulateToggleFailure()) {
        return;
      }

      setTimeout(() => {
        const current = useDiscoveryStore
          .getState()
          .savedEventIds.includes(eventId);
        if (current === optimisticSaved) {
          toggleSavedEvent(eventId);
        }
        showToast(
          "Could not save event",
          "The save action failed in this prototype scenario and was reverted.",
          "error",
        );
      }, SIMULATED_TOGGLE_LATENCY_MS);
    },
    [toggleSavedEvent],
  );

  const toggleFollow = useCallback(
    (hostId: string) => {
      const wasFollowing = useDiscoveryStore
        .getState()
        .followedHostIds.includes(hostId);
      const optimisticFollowing = !wasFollowing;

      toggleHostFollow(hostId);

      if (!shouldSimulateToggleFailure()) {
        return;
      }

      setTimeout(() => {
        const current = useDiscoveryStore
          .getState()
          .followedHostIds.includes(hostId);
        if (current === optimisticFollowing) {
          toggleHostFollow(hostId);
        }
        showToast(
          "Could not follow host",
          "The follow action failed in this prototype scenario and was reverted.",
          "error",
        );
      }, SIMULATED_TOGGLE_LATENCY_MS);
    },
    [toggleHostFollow],
  );

  return { toggleSaved, toggleFollow };
}
