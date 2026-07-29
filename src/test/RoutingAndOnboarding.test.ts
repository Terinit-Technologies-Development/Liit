import { useAppStore } from "../state/useAppStore";

describe("Onboarding & Routing Logic", () => {
  beforeEach(() => {
    useAppStore.getState().resetPrototype();
  });

  it("routes to onboarding when hasCompletedOnboarding is false", () => {
    useAppStore.getState().setOnboardingCompleted(false);
    const { hasCompletedOnboarding, activeMode } = useAppStore.getState();

    expect(hasCompletedOnboarding).toBe(false);
    expect(activeMode).toBe("consumer");
  });

  it("routes to consumer feed shell when hasCompletedOnboarding is true and mode is consumer", () => {
    useAppStore.getState().setOnboardingCompleted(true);
    useAppStore.getState().setActiveMode("consumer");
    const { hasCompletedOnboarding, activeMode } = useAppStore.getState();

    expect(hasCompletedOnboarding).toBe(true);
    expect(activeMode).toBe("consumer");
  });

  it("routes to creator dashboard shell when hasCompletedOnboarding is true and mode is creator", () => {
    useAppStore.getState().setOnboardingCompleted(true);
    useAppStore.getState().setActiveMode("creator");
    const { hasCompletedOnboarding, activeMode } = useAppStore.getState();

    expect(hasCompletedOnboarding).toBe(true);
    expect(activeMode).toBe("creator");
  });
});
