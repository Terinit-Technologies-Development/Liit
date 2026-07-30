import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrototypeControlsScreen from "../../app/(modals)/prototype-controls";
import { EmptyState } from "../components/feedback/EmptyState";
import { useAppStore } from "../state/useAppStore";
import {
  useMapDiscoveryStore,
  DEFAULT_VIEWPORT,
} from "../state/useMapDiscoveryStore";
import { DEFAULT_MAP_FILTERS } from "../domain/map/map-filter-schema";

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Map Screen State Actions Rendered Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
    useAppStore.setState({ scenario: "normal" });
    useMapDiscoveryStore.setState({
      displayMode: "map",
      selectedEventId: null,
      viewport: DEFAULT_VIEWPORT,
      filters: DEFAULT_MAP_FILTERS,
      locationState: "available",
    });
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("renders Location Disabled action and exits disabled scenario when pressed", async () => {
    useAppStore.setState({ scenario: "map_location_disabled" });

    const handleChooseJohannesburg = () => {
      useMapDiscoveryStore.getState().setLocationState("manual_city");
      useAppStore.getState().setScenario("normal");
    };

    const screen = render(
      <EmptyState
        title="Location is disabled"
        description="Location permissions are disabled in this prototype scenario."
        actionLabel="Use Johannesburg Fixtures"
        onAction={handleChooseJohannesburg}
      />,
    );

    expect(screen.getByText("Location is disabled")).toBeTruthy();

    fireEvent.press(screen.getByText("Use Johannesburg Fixtures"));

    await waitFor(() => {
      expect(useAppStore.getState().scenario).toBe("normal");
      expect(useMapDiscoveryStore.getState().locationState).toBe("manual_city");
    });
  });

  it("renders No Nearby Events action and restores Map results when pressed", async () => {
    useAppStore.setState({ scenario: "map_no_results" });
    useMapDiscoveryStore.setState({
      selectedEventId: "evt-1",
      filters: { ...DEFAULT_MAP_FILTERS, freeOnly: true },
    });

    const handleRestoreMapResults = () => {
      useMapDiscoveryStore.getState().setFilters(DEFAULT_MAP_FILTERS);
      useAppStore.getState().setScenario("normal");
      useMapDiscoveryStore.getState().selectEvent(null);
    };

    const screen = render(
      <EmptyState
        title="No nearby events"
        description="Adjust your filters or restore the normal Map fixtures."
        actionLabel="Restore Map results"
        onAction={handleRestoreMapResults}
      />,
    );

    fireEvent.press(screen.getByText("Restore Map results"));

    await waitFor(() => {
      expect(useAppStore.getState().scenario).toBe("normal");
      expect(useMapDiscoveryStore.getState().filters).toEqual(
        DEFAULT_MAP_FILTERS,
      );
      expect(useMapDiscoveryStore.getState().selectedEventId).toBeNull();
    });
  });

  it("renders Prototype Controls Reset All action and resets Map store to defaults", async () => {
    useMapDiscoveryStore.setState({
      displayMode: "list",
      selectedEventId: "evt-midnight-grooves",
      filters: { ...DEFAULT_MAP_FILTERS, freeOnly: true },
      locationState: "disabled",
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <PrototypeControlsScreen />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByText("Reset All Prototype State"));

    await waitFor(() => {
      const state = useMapDiscoveryStore.getState();
      expect(state.displayMode).toBe("map");
      expect(state.selectedEventId).toBeNull();
      expect(state.filters.freeOnly).toBe(false);
      expect(state.locationState).toBe("available");
    });
  });
});
