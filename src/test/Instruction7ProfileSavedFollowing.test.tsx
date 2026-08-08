/**
 * Instruction 7 — Profile saved/following state
 *
 * Verifies that Profile stats and tabs are driven by the discovery store
 * (savedEventIds / followedHostIds) rather than static fixtures, and that
 * the saved + following screens reflect store mutations immediately.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfileScreen from "../../app/(consumer)/profile/index";
import SavedEventsScreen from "../../app/(consumer)/profile/saved";
import FollowingScreen from "../../app/(consumer)/profile/following";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { useSessionStore } from "../../src/state/useSessionStore";
import { useAppStore } from "../../src/state/useAppStore";
import { useDemoClockStore } from "../../src/state/useDemoClockStore";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockBack }),
  useNavigation: () => ({ getParent: () => ({ setOptions: jest.fn() }) }),
  useFocusEffect: (cb: any) => {
    const React = require("react");
    React.useEffect(() => {
      const cleanup = cb();
      return () => {
        if (cleanup) cleanup();
      };
    }, [cb]);
  },
  useLocalSearchParams: () => ({}),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Profile saved/following state", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    useDiscoveryStore.getState().resetDiscovery();
    useSessionStore.getState().resetSession();
    useSessionStore.getState().setAuthenticatedUser();
    useAppStore.getState().resetPrototype();
    useDemoClockStore.getState().resetClock();
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("reflects store saved counts and content on the Profile screen", async () => {
    useDiscoveryStore.getState().toggleSavedEvent("evt-jozi-run-club");

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Jozi Sunset 5K & Social")).toBeTruthy();
    });

    // 3 saved (2 seed + 1 toggled) rendered in the stats row
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("renders the Saved screen from store ids and unsaves optimistically", async () => {
    useDiscoveryStore.getState().toggleSavedEvent("evt-jozi-run-club");

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <SavedEventsScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Jozi Sunset 5K & Social")).toBeTruthy();
    });

    const unsaveButtons = screen.getAllByLabelText(
      /Remove Jozi Sunset 5K & Social from saved events/,
    );
    fireEvent.press(unsaveButtons[0]);

    await waitFor(() => {
      expect(
        useDiscoveryStore
          .getState()
          .savedEventIds.includes("evt-jozi-run-club"),
      ).toBe(false);
    });
  });

  it("renders the Following screen from store followedHostIds", async () => {
    useDiscoveryStore.getState().toggleHostFollow("host-groove-co");

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <FollowingScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Groove Co.")).toBeTruthy();
    });
  });

  it("shows the Following tab content on the Profile screen", async () => {
    useDiscoveryStore.getState().toggleHostFollow("host-groove-co");

    const screen = render(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>,
    );

    const followingChips = screen.getAllByText("Following");
    fireEvent.press(followingChips[followingChips.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("Groove Co.")).toBeTruthy();
    });
  });
});
