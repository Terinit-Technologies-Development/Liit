import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreatorVerification from "../../app/(creator)/verification";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useNavigation: () => ({
    setOptions: jest.fn(),
    getParent: () => ({ setOptions: jest.fn() }),
  }),
  useLocalSearchParams: () => ({}),
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Verification Gating Behaviour", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockReplace.mockClear();
    mockPush.mockClear();
  });

  const renderVerification = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <CreatorVerification />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  const getCompleteButton = (screen: ReturnType<typeof renderVerification>) =>
    screen.getByTestId("complete-verification-button");

  const completeAllItems = (screen: ReturnType<typeof renderVerification>) => {
    for (let i = 1; i <= 6; i++) {
      fireEvent.press(screen.getByTestId(`verification-item-vcheck-${i}`));
    }
  };

  const setScenario = (
    screen: ReturnType<typeof renderVerification>,
    scenario: string,
  ) => {
    fireEvent.press(screen.getByTestId(`verification-scenario-${scenario}`));
  };

  it("begins NOT_STARTED with nothing complete — completion disabled", async () => {
    const screen = renderVerification();
    await waitFor(() => {
      expect(
        screen.getByText(/Verification Status: NOT STARTED/i),
      ).toBeTruthy();
    });
    expect(useCreatorStore.getState().verificationState).toBe("not_started");
    expect(useCreatorStore.getState().completedVerificationItems).toEqual([]);
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it("disables completion for incomplete, under_review, rejected and not_started", async () => {
    const screen = renderVerification();
    await waitFor(() => {
      expect(screen.getByText(/Creator Profile Complete/i)).toBeTruthy();
    });

    setScenario(screen, "incomplete");
    completeAllItems(screen);
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      true,
    );

    setScenario(screen, "under_review");
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      true,
    );

    setScenario(screen, "rejected");
    expect(screen.getByText(/Verification Status: REJECTED/i)).toBeTruthy();
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      true,
    );

    setScenario(screen, "not_started");
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it("verified + incomplete checklist stays disabled", async () => {
    const screen = renderVerification();
    await waitFor(() => {
      expect(screen.getByText(/Creator Profile Complete/i)).toBeTruthy();
    });
    setScenario(screen, "verified");
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it("unchecking an item disables completion", async () => {
    const screen = renderVerification();
    await waitFor(() => {
      expect(screen.getByText(/Creator Profile Complete/i)).toBeTruthy();
    });
    setScenario(screen, "verified");
    completeAllItems(screen);
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      false,
    );

    fireEvent.press(screen.getByTestId("verification-item-vcheck-3"));
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it("verified + complete enables completion, updates activation state and routes to Dashboard", async () => {
    const screen = renderVerification();
    await waitFor(() => {
      expect(screen.getByText(/Creator Profile Complete/i)).toBeTruthy();
    });
    setScenario(screen, "verified");
    completeAllItems(screen);
    expect(getCompleteButton(screen).props.accessibilityState?.disabled).toBe(
      false,
    );

    fireEvent.press(getCompleteButton(screen));

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith({
          pathname: "/(creator)/dashboard",
        });
      },
      { timeout: 10000 },
    );
    expect(useCreatorStore.getState().activationStatus).toBe("verified");

    const profile = await mockCreatorRepository.getCreatorProfile();
    expect(profile.activationStatus).toBe("verified");
    expect(profile.isVerified).toBe(true);
  });
});
