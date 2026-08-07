import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreatorActivation from "../../app/(creator)/activation";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Activation Behaviour", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockPush.mockClear();
  });

  const renderActivation = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <CreatorActivation />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("changes the brand name and persists it in the store on continue", async () => {
    const screen = renderActivation();
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your creator or brand name"),
      "New Brand JHB",
    );

    fireEvent.press(screen.getByText("Continue to Mock Verification"));
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: "/(creator)/verification",
        });
      },
      { timeout: 10000 },
    );

    expect(useCreatorStore.getState().activationDraft.brandName).toBe(
      "New Brand JHB",
    );
    expect(useCreatorStore.getState().activationStatus).toBe(
      "verification_pending",
    );
  });

  it("shows a validation summary for a missing brand name and does not navigate", () => {
    const screen = renderActivation();
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your creator or brand name"),
      "",
    );
    fireEvent.press(screen.getByText("Continue to Mock Verification"));

    expect(
      screen.getByText(
        /Please correct the highlighted errors before continuing/i,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/Brand\/Artist Name is required/i)).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("rejects an invalid contact email with a validation summary", () => {
    const screen = renderActivation();
    fireEvent.changeText(
      screen.getByPlaceholderText("events@yourbrand.co.za"),
      "not-an-email",
    );
    fireEvent.press(screen.getByText("Continue to Mock Verification"));

    expect(
      screen.getByText(/Enter a valid contact email address/i),
    ).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("persists the draft in the repository store on continue", async () => {
    const screen = renderActivation();
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter your creator or brand name"),
      "Repo Brand",
    );
    fireEvent.press(screen.getByText("Continue to Mock Verification"));

    await waitFor(
      async () => {
        const profile = await mockCreatorRepository.getCreatorProfile();
        expect(profile.brandName).toBe("Repo Brand");
        expect(profile.activationStatus).toBe("in_progress");
      },
      { timeout: 10000 },
    );
  });
});
