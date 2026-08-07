/**
 * Instruction 7 — Save/follow optimistic rollback
 *
 * Verifies that save and follow toggles apply optimistically and revert
 * visibly when the Save/Follow failure simulation or the offline scenario
 * is active, while remaining durable otherwise.
 */

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { useSaveFollowActions } from "../../src/hooks/useSaveFollowActions";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { usePrototypeControlsStore } from "../../src/state/usePrototypeControlsStore";
import { useAppStore } from "../../src/state/useAppStore";
import { useToast } from "../../src/hooks/useToast";

function Harness() {
  const { toggleSaved, toggleFollow } = useSaveFollowActions();
  const savedEventIds = useDiscoveryStore((state) => state.savedEventIds);
  const followedHostIds = useDiscoveryStore((state) => state.followedHostIds);
  return (
    <>
      <Pressable
        testID="save"
        accessibilityLabel="Save event"
        onPress={() => toggleSaved("evt-jozi-run-club")}
      >
        <Text>save</Text>
      </Pressable>
      <Pressable
        testID="follow"
        accessibilityLabel="Follow host"
        onPress={() => toggleFollow("host-club-vibez")}
      >
        <Text>follow</Text>
      </Pressable>
      <Text testID="saved-state">
        {savedEventIds.includes("evt-jozi-run-club") ? "saved" : "unsaved"}
      </Text>
      <Text testID="followed-state">
        {followedHostIds.includes("host-club-vibez")
          ? "followed"
          : "unfollowed"}
      </Text>
    </>
  );
}

function resetAll() {
  useDiscoveryStore.getState().resetDiscovery();
  usePrototypeControlsStore.getState().resetPrototypeControls();
  useAppStore.getState().resetPrototype();
  useToast.getState().hideToast();
}

describe("Save/Follow optimistic rollback", () => {
  beforeEach(() => {
    resetAll();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("applies a save optimistically and keeps it when no failure is simulated", async () => {
    const screen = render(<Harness />);
    expect(screen.getByTestId("saved-state").props.children).toBe("unsaved");

    act(() => {
      fireEvent.press(screen.getByTestId("save"));
    });

    expect(screen.getByTestId("saved-state").props.children).toBe("saved");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("saved-state").props.children).toBe("saved");
  });

  it("reverts a save optimistically when save/follow failure is simulated", async () => {
    usePrototypeControlsStore.getState().setSaveFollowFailure(true);

    const screen = render(<Harness />);

    act(() => {
      fireEvent.press(screen.getByTestId("save"));
    });

    expect(screen.getByTestId("saved-state").props.children).toBe("saved");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("saved-state").props.children).toBe("unsaved");

    const toast = useToast.getState().toast;
    expect(toast?.type).toBe("error");
    expect(toast?.title).toContain("Could not save");
  });

  it("reverts a follow when the offline scenario is active", async () => {
    useAppStore.getState().setScenario("offline");

    const screen = render(<Harness />);

    act(() => {
      fireEvent.press(screen.getByTestId("follow"));
    });

    expect(screen.getByTestId("followed-state").props.children).toBe(
      "followed",
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("followed-state").props.children).toBe(
      "unfollowed",
    );
  });

  it("does not revert a follow when no failure is simulated", async () => {
    const screen = render(<Harness />);

    act(() => {
      fireEvent.press(screen.getByTestId("follow"));
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("followed-state").props.children).toBe(
      "followed",
    );
  });
});
