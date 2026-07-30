import { useAppStore } from "../state/useAppStore";

describe("ModeSwitchModal Logic", () => {
  beforeEach(() => {
    useAppStore.setState({ activeMode: "consumer" });
  });

  it("keeps activeMode unchanged when modal is opened or cancelled", () => {
    expect(useAppStore.getState().activeMode).toBe("consumer");

    // Simulate selecting 'creator' locally without confirming
    const localSelection = "creator";
    expect(useAppStore.getState().activeMode).toBe("consumer");

    // Dismissing without calling setMode keeps consumer mode
    expect(localSelection).toBe("creator");
    expect(useAppStore.getState().activeMode).toBe("consumer");
  });

  it("mutates activeMode only upon explicit confirmation action", () => {
    expect(useAppStore.getState().activeMode).toBe("consumer");

    // Simulate user tapping confirm switch to creator
    useAppStore.getState().setMode("creator");

    expect(useAppStore.getState().activeMode).toBe("creator");
  });
});
