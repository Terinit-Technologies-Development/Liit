import {
  useDiscoveryStore,
  DEFAULT_DISCOVERY_FILTERS,
} from "../state/useDiscoveryStore";

describe("useDiscoveryStore", () => {
  beforeEach(() => {
    useDiscoveryStore.getState().resetDiscovery();
  });

  it("manages recent search terms without duplicates", () => {
    const store = useDiscoveryStore.getState();
    store.addRecentSearch("Amapiano");
    store.addRecentSearch("Soweto");
    store.addRecentSearch("Amapiano");

    const searches = useDiscoveryStore.getState().recentSearches;
    expect(searches[0]).toBe("Amapiano");
    expect(searches.filter((s) => s === "Amapiano").length).toBe(1);
  });

  it("toggles followed host IDs", () => {
    const store = useDiscoveryStore.getState();
    store.toggleHostFollow("host-groove-co");
    expect(useDiscoveryStore.getState().followedHostIds).toContain(
      "host-groove-co",
    );

    store.toggleHostFollow("host-groove-co");
    expect(useDiscoveryStore.getState().followedHostIds).not.toContain(
      "host-groove-co",
    );
  });

  it("resets to initial state", () => {
    const store = useDiscoveryStore.getState();
    store.setFeedMode("upcoming");
    store.toggleHostFollow("host-1");
    store.resetDiscovery();

    expect(useDiscoveryStore.getState().feedMode).toBe("live_recent");
    expect(useDiscoveryStore.getState().followedHostIds).toEqual([]);
    expect(useDiscoveryStore.getState().filters).toEqual(
      DEFAULT_DISCOVERY_FILTERS,
    );
  });
});
