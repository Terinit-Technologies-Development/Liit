import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreatorActivation from "../../app/(creator)/activation";
import CreatorVerification from "../../app/(creator)/verification";

describe("LIIT Instruction 6: Activation & Verification Rendered Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders Activation screen with controlled fields and responsibilities", async () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CreatorActivation />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(getByTestId("creator-activation-screen")).toBeTruthy();
    expect(getByText(/Host Responsibilities/i)).toBeTruthy();
    expect(getByText(/PROTOTYPE — no legal identity/i)).toBeTruthy();

    const nameInput = getByPlaceholderText("Enter your creator or brand name");
    expect(nameInput.props.value).toBe("Groove Co. Johannesburg");
  });

  it("renders Verification screen with checklist items", async () => {
    const { getByText, getByTestId } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CreatorVerification />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(getByTestId("creator-verification-screen")).toBeTruthy();
    await waitFor(() => {
      expect(getByText(/Creator Profile Complete/i)).toBeTruthy();
      expect(getByText(/Payout Account Connected/i)).toBeTruthy();
      expect(getByText(/Complete Verification & Enter Dashboard/i)).toBeTruthy();
    });
  });
});
