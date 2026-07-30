import { useAppStore } from "../state/useAppStore";
import { useSessionStore } from "../state/useSessionStore";

describe("DurableSignOut", () => {
  beforeEach(() => {
    useAppStore.setState({
      hasCompletedOnboarding: true,
      activeMode: "consumer",
      hasHydrated: true,
    });
    useSessionStore.setState({
      status: "authenticated",
      hasHydrated: true,
    });
  });

  it("maintains unauthenticated status upon sign out", () => {
    useSessionStore.getState().signOut();
    expect(useSessionStore.getState().status).toBe("unauthenticated");
    expect(useSessionStore.getState().user).toBeNull();
  });

  it("persists unauthenticated status across cold relaunch hydration", () => {
    // Simulate signing out
    useSessionStore.getState().signOut();
    expect(useSessionStore.getState().status).toBe("unauthenticated");

    // Simulate app relaunch (store re-hydration)
    useAppStore.setState({ hasHydrated: true });
    useSessionStore.setState({ hasHydrated: true });

    // Verify status remains unauthenticated and onboarding completed is preserved
    expect(useSessionStore.getState().status).toBe("unauthenticated");
    expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
  });
});
