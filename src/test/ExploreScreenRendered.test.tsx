import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import ExploreScreen from "../../app/(consumer)/explore";
import { useAppStore } from "../state/useAppStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Explore Screen Rendered Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
    useAppStore.setState({ scenario: "normal" });
  });

  it("renders empty state when empty_discovery scenario is active and hides collection headings", async () => {
    useAppStore.setState({ scenario: "empty_discovery" });

    const { getByText, queryByText } = render(
      <QueryClientProvider client={queryClient}>
        <ExploreScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(getByText("Nothing to explore yet")).toBeTruthy();
      expect(
        getByText(
          "Johannesburg discovery is empty in this prototype scenario.",
        ),
      ).toBeTruthy();
    });

    expect(queryByText("Trending Now")).toBeNull();
    expect(queryByText("Featured Venues")).toBeNull();
    expect(queryByText("Recommended For You")).toBeNull();
  });
});
