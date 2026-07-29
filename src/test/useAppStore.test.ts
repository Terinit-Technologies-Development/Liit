import { useAppStore } from "../state/useAppStore";

describe("useAppStore Zustand State", () => {
  beforeEach(() => {
    useAppStore.getState().resetPrototype();
  });

  it("initializes with default consumer mode and normal scenario", () => {
    const state = useAppStore.getState();
    expect(state.activeMode).toBe("consumer");
    expect(state.scenario).toBe("normal");
  });

  it("switches product mode cleanly", () => {
    useAppStore.getState().setActiveMode("creator");
    expect(useAppStore.getState().activeMode).toBe("creator");

    useAppStore.getState().setActiveMode("consumer");
    expect(useAppStore.getState().activeMode).toBe("consumer");
  });

  it("updates scenario overrides", () => {
    useAppStore.getState().setScenario("offline");
    expect(useAppStore.getState().scenario).toBe("offline");
  });

  it("resets prototype back to initial defaults", () => {
    useAppStore.getState().setActiveMode("creator");
    useAppStore.getState().setScenario("sold_out");
    useAppStore.getState().resetPrototype();

    const state = useAppStore.getState();
    expect(state.activeMode).toBe("consumer");
    expect(state.scenario).toBe("normal");
  });
});
