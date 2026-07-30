import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapFiltersModal from "../../app/(modals)/map-filters";
import {
  useMapDiscoveryStore,
  DEFAULT_VIEWPORT,
} from "../state/useMapDiscoveryStore";
import { DEFAULT_MAP_FILTERS } from "../domain/map/map-filter-schema";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Map Filters Modal Rendered Integration", () => {
  beforeEach(() => {
    useMapDiscoveryStore.setState({
      displayMode: "map",
      selectedEventId: "evt-midnight-grooves",
      viewport: DEFAULT_VIEWPORT,
      filters: DEFAULT_MAP_FILTERS,
      locationState: "available",
    });
    mockBack.mockClear();
  });

  it("does not commit a Map filter draft when closed", () => {
    const screen = render(<MapFiltersModal />);

    fireEvent.press(screen.getByText("Music"));
    fireEvent.press(screen.getByText("Close"));

    expect(mockBack).toHaveBeenCalled();
    expect(useMapDiscoveryStore.getState().filters.categories).toEqual([]);
  });

  it("commits filters only when Apply Filters is pressed", async () => {
    const screen = render(<MapFiltersModal />);

    fireEvent.press(screen.getByText("Music"));
    fireEvent.press(screen.getByTestId("map-filters-apply"));

    await waitFor(() => {
      expect(useMapDiscoveryStore.getState().filters.categories).toContain(
        "music",
      );
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it("keeps Reset as a draft until Apply", async () => {
    useMapDiscoveryStore.setState({
      filters: {
        ...DEFAULT_MAP_FILTERS,
        freeOnly: true,
      },
    });

    const screen = render(<MapFiltersModal />);

    fireEvent.press(screen.getByText("Reset"));

    expect(useMapDiscoveryStore.getState().filters.freeOnly).toBe(true);

    fireEvent.press(screen.getByTestId("map-filters-apply"));

    await waitFor(() => {
      expect(useMapDiscoveryStore.getState().filters.freeOnly).toBe(false);
    });
  });

  it("preserves display mode and selected event when filters are updated", async () => {
    const screen = render(<MapFiltersModal />);

    fireEvent.press(screen.getByText("Music"));
    fireEvent.press(screen.getByTestId("map-filters-apply"));

    await waitFor(() => {
      expect(useMapDiscoveryStore.getState().displayMode).toBe("map");
      expect(useMapDiscoveryStore.getState().selectedEventId).toBe(
        "evt-midnight-grooves",
      );
    });
  });
});
