import { useDiscoveryStore } from "../state/useDiscoveryStore";
import { formatCurrency } from "../utils/format";

describe("Instruction 3 Shared Save, Follow State & Currency", () => {
  beforeEach(() => {
    useDiscoveryStore.getState().resetDiscovery();
  });

  it("toggles and persists saved event IDs across discovery surfaces", () => {
    const store = useDiscoveryStore.getState();
    const eventId = "evt-test-99";

    expect(store.savedEventIds.includes(eventId)).toBe(false);

    store.toggleSavedEvent(eventId);
    expect(useDiscoveryStore.getState().savedEventIds.includes(eventId)).toBe(
      true,
    );

    store.toggleSavedEvent(eventId);
    expect(useDiscoveryStore.getState().savedEventIds.includes(eventId)).toBe(
      false,
    );
  });

  it("toggles and persists followed host IDs", () => {
    const store = useDiscoveryStore.getState();
    const hostId = "host-test-88";

    expect(store.followedHostIds.includes(hostId)).toBe(false);

    store.toggleHostFollow(hostId);
    expect(useDiscoveryStore.getState().followedHostIds.includes(hostId)).toBe(
      true,
    );

    store.toggleHostFollow(hostId);
    expect(useDiscoveryStore.getState().followedHostIds.includes(hostId)).toBe(
      false,
    );
  });

  it("formats minor currency units without pre-dividing", () => {
    expect(formatCurrency(25000, "ZAR")).toContain("250");
  });
});
