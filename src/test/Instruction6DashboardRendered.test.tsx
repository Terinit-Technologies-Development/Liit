import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreatorDashboard from "../../app/(creator)/(tabs)/dashboard";

describe("LIIT Instruction 6: Dashboard Screen", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("renders the dashboard successfully", async () => {
    const { getByText, queryByText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CreatorDashboard />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(getByText(/Dashboard/i)).toBeTruthy();
      expect(getByText(/Performance/i)).toBeTruthy();
      expect(getByText(/Active Events/i)).toBeTruthy();
    });
  });
});
