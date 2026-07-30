import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MapScreen from "../../app/(consumer)/map";
import PrototypeControlsScreen from "../../app/(modals)/prototype-controls";
import { useAppStore } from "../state/useAppStore";
import {
  useMapDiscoveryStore,
  DEFAULT_VIEWPORT,
} from "../state/useMapDiscoveryStore";
import { DEFAULT_MAP_FILTERS } from "../domain/map/map-filter-schema";
import { discoveryEvents } from "../fixtures/discovery";
import { mapEventPoints } from "../fixtures/map";

const mockNormalSnapshot = {
  city: "Johannesburg" as const,
  events: [discoveryEvents[0]],
  eventIds: [discoveryEvents[0].id],
  points: [mapEventPoints[0]],
};

const mockEmptySnapshot = {
  city: "Johannesburg" as const,
  events: [],
  eventIds: [],
  points: [],
};

jest.mock("../hooks/map/useMapDiscoveryQuery", () => ({
  useMapDiscoveryQuery: jest.fn(
    ({ scenario, filters }: { scenario: string; filters: any }) => ({
      data:
        scenario === "discovery_error" || scenario === "loading"
          ? undefined
          : scenario === "map_no_results" || filters.distanceKm === 5
            ? mockEmptySnapshot
            : mockNormalSnapshot,
      isLoading: scenario === "loading",
      isError: scenario === "discovery_error",
      refetch: jest.fn(),
    }),
  ),
}));

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

  it("exits the real location-disabled Map state when Use Johannesburg Fixtures is pressed", async () => {
    useAppStore.setState({ scenario: "map_location_disabled" });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <MapScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Location is disabled")).toBeTruthy();

    fireEvent.press(screen.getByText("Use Johannesburg Fixtures"));

    await waitFor(() => {
      expect(useAppStore.getState().scenario).toBe("normal");
      expect(useMapDiscoveryStore.getState().locationState).toBe("manual_city");
      expect(screen.getByTestId("mock-map-canvas")).toBeTruthy();
    });
  });

  it("restores results through the real Map empty-state action when Restore Map results is pressed", async () => {
    useAppStore.setState({ scenario: "map_no_results" });
    useMapDiscoveryStore.setState({
      selectedEventId: "evt-midnight-grooves",
      filters: { ...DEFAULT_MAP_FILTERS, freeOnly: true },
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <MapScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText("No nearby events")).toBeTruthy();

    fireEvent.press(screen.getByText("Restore Map results"));

    await waitFor(() => {
      expect(useAppStore.getState().scenario).toBe("normal");
      expect(useMapDiscoveryStore.getState().filters).toEqual(
        DEFAULT_MAP_FILTERS,
      );
      expect(useMapDiscoveryStore.getState().selectedEventId).toBeNull();
      expect(screen.getByTestId("mock-map-canvas")).toBeTruthy();
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

  it("clears an excluded selection when distance filter excludes the selected event", async () => {
    useMapDiscoveryStore.setState({
      selectedEventId: discoveryEvents[0].id,
      filters: { ...DEFAULT_MAP_FILTERS, distanceKm: 5 },
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <MapScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(useMapDiscoveryStore.getState().selectedEventId).toBeNull();
      expect(screen.queryByTestId("map-event-preview")).toBeNull();
    });
  });

  it("does not render preview card when discovery_error occurs", async () => {
    useAppStore.setState({ scenario: "discovery_error" });
    useMapDiscoveryStore.setState({
      selectedEventId: discoveryEvents[0].id,
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <MapScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByText("The event map did not load")).toBeTruthy();
    expect(screen.queryByTestId("map-event-preview")).toBeNull();
  });

  it("does not render preview card during query loading state", async () => {
    useAppStore.setState({ scenario: "loading" as any });
    useMapDiscoveryStore.setState({
      selectedEventId: discoveryEvents[0].id,
    });

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <MapScreen />
      </QueryClientProvider>,
    );

    expect(screen.queryByTestId("map-event-preview")).toBeNull();
  });
});
