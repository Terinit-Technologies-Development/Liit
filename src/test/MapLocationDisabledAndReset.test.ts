import { useAppStore } from "../state/useAppStore";
import {
  useMapDiscoveryStore,
  DEFAULT_VIEWPORT,
} from "../state/useMapDiscoveryStore";
import { DEFAULT_MAP_FILTERS } from "../domain/map/map-filter-schema";

describe("Map Location Disabled & Map Reset Interactions", () => {
  beforeEach(() => {
    useAppStore.setState({ scenario: "normal" });
    useMapDiscoveryStore.setState({
      displayMode: "map",
      selectedEventId: null,
      viewport: DEFAULT_VIEWPORT,
      filters: DEFAULT_MAP_FILTERS,
      locationState: "available",
    });
  });

  it("exits map_location_disabled state when Use Johannesburg Fixtures is pressed", () => {
    useAppStore.setState({ scenario: "map_location_disabled" });

    // Action executed when "Use Johannesburg Fixtures" is pressed:
    useMapDiscoveryStore.getState().setLocationState("manual_city");
    useAppStore.getState().setScenario("normal");

    expect(useAppStore.getState().scenario).toBe("normal");
    expect(useMapDiscoveryStore.getState().locationState).toBe("manual_city");

    const isLocationDisabled =
      useMapDiscoveryStore.getState().locationState === "disabled" ||
      (useAppStore.getState().scenario === "map_location_disabled" &&
        useMapDiscoveryStore.getState().locationState !== "manual_city");

    expect(isLocationDisabled).toBe(false);
  });

  it("exits map_no_results state when Restore Map results is pressed", () => {
    useAppStore.setState({ scenario: "map_no_results" });
    useMapDiscoveryStore.setState({ selectedEventId: "evt-1" });

    // Action executed when "Restore Map results" is pressed:
    useMapDiscoveryStore.getState().setFilters(DEFAULT_MAP_FILTERS);
    useAppStore.getState().setScenario("normal");
    useMapDiscoveryStore.getState().selectEvent(null);

    expect(useAppStore.getState().scenario).toBe("normal");
    expect(useMapDiscoveryStore.getState().filters).toEqual(
      DEFAULT_MAP_FILTERS,
    );
    expect(useMapDiscoveryStore.getState().selectedEventId).toBeNull();
  });

  it("resets map discovery state via resetMapDiscovery", () => {
    useMapDiscoveryStore.setState({
      displayMode: "list",
      selectedEventId: "evt-1",
      filters: { ...DEFAULT_MAP_FILTERS, freeOnly: true },
      locationState: "disabled",
    });

    useMapDiscoveryStore.getState().resetMapDiscovery();

    const state = useMapDiscoveryStore.getState();
    expect(state.displayMode).toBe("map");
    expect(state.selectedEventId).toBeNull();
    expect(state.filters.freeOnly).toBe(false);
    expect(state.locationState).toBe("available");
  });
});
