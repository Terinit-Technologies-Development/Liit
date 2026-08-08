import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfileScreen from "../../app/(consumer)/profile/index";
import ModeSwitchModal from "../../app/(modals)/mode-switch";
import { useAppStore } from "../../src/state/useAppStore";
import { useSessionStore } from "../../src/state/useSessionStore";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe("Profile Mode Switch Rendered Flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    useAppStore.setState({ activeMode: "consumer" });
    useSessionStore.getState().setAuthenticatedUser();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("preserves Consumer mode when opening switcher, selecting Creator, and cancelling", () => {
    // 1. Render Consumer Profile
    const { getByText: getProfileText } = render(
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <ProfileScreen />
        </SafeAreaProvider>
      </QueryClientProvider>,
    );
    expect(getProfileText("Thabo Mbeki")).toBeTruthy();

    // Verify initial activeMode is consumer
    expect(useAppStore.getState().activeMode).toBe("consumer");

    // 2. Render ModeSwitchModal
    const { getByText: getModalText } = render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <ModeSwitchModal />
      </SafeAreaProvider>,
    );

    // Select Creator Mode card in modal
    const creatorCard = getModalText("Creator Mode");
    fireEvent.press(creatorCard);

    // Verify activeMode in global store HAS NOT mutated yet
    expect(useAppStore.getState().activeMode).toBe("consumer");

    // 3. User taps Cancel
    const cancelButton = getModalText("Cancel (Keep Current Mode)");
    fireEvent.press(cancelButton);

    // Verify activeMode remains Consumer
    expect(useAppStore.getState().activeMode).toBe("consumer");
  });
});
