import { useAppStore } from "../state/useAppStore";
import { useSessionStore } from "../state/useSessionStore";

describe("ColdLaunchHydration", () => {
  beforeEach(() => {
    useAppStore.setState({
      hasCompletedOnboarding: true,
      activeMode: "consumer",
      hasHydrated: false,
    });
    useSessionStore.setState({
      status: "authenticated",
      hasHydrated: false,
    });
  });

  it("initially reports non-hydrated state before rehydration completes", () => {
    expect(useAppStore.getState().hasHydrated).toBe(false);
    expect(useSessionStore.getState().hasHydrated).toBe(false);
  });

  it("updates hasHydrated to true when hydration action is called", () => {
    useAppStore.getState().setHasHydrated(true);
    useSessionStore.getState().setHasHydrated(true);

    expect(useAppStore.getState().hasHydrated).toBe(true);
    expect(useSessionStore.getState().hasHydrated).toBe(true);
    expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
  });
});
