import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SearchFiltersModal from "../../app/(modals)/search-filters";
import {
  useDiscoveryStore,
  DEFAULT_DISCOVERY_FILTERS,
} from "../state/useDiscoveryStore";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Search Filters Modal Integration", () => {
  beforeEach(() => {
    useDiscoveryStore.setState({
      filters: DEFAULT_DISCOVERY_FILTERS,
    });
    mockBack.mockClear();
  });

  it("closing modal without applying does not mutate store filters", () => {
    const { getByLabelText } = render(<SearchFiltersModal />);

    const closeBtn = getByLabelText("Close filters");
    fireEvent.press(closeBtn);

    expect(mockBack).toHaveBeenCalled();
    expect(useDiscoveryStore.getState().filters).toEqual(
      DEFAULT_DISCOVERY_FILTERS,
    );
  });

  it("selecting options and tapping Apply commits draft to store filters", async () => {
    const { getByText, getByTestId } = render(<SearchFiltersModal />);

    fireEvent.press(getByText("This Weekend"));
    fireEvent.press(getByText("Within 10 km"));

    const applyBtn = getByTestId("filters-apply");
    fireEvent.press(applyBtn);

    await waitFor(() => {
      expect(useDiscoveryStore.getState().filters.date).toBe("this_weekend");
      expect(useDiscoveryStore.getState().filters.distanceKm).toBe(10);
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it("reset changes draft state but does not commit to store until Apply is pressed", async () => {
    useDiscoveryStore.setState({
      filters: {
        ...DEFAULT_DISCOVERY_FILTERS,
        date: "this_weekend",
        distanceKm: 10,
      },
    });

    const { getByText, getByTestId } = render(<SearchFiltersModal />);

    // Tap Reset button
    fireEvent.press(getByText("Reset"));

    // Store should still hold previous values until Apply is explicitly pressed
    expect(useDiscoveryStore.getState().filters.date).toBe("this_weekend");

    // Now tap Apply
    fireEvent.press(getByTestId("filters-apply"));

    await waitFor(() => {
      expect(useDiscoveryStore.getState().filters.date).toBe("any");
      expect(useDiscoveryStore.getState().filters.distanceKm).toBeNull();
    });
  });
});
