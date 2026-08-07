import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreateEventScreen from "../../app/(creator)/(tabs)/create";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";
import { useCreatorStore } from "../state/useCreatorStore";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
let mockBeforeRemoveListener: ((e: any) => void) | null = null;
let mockFocusListener: ((e?: any) => void) | null = null;

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    navigate: mockNavigate,
  }),
  useNavigation: () => ({
    addListener: (event: string, cb: (e: any) => void) => {
      if (event === "beforeRemove") mockBeforeRemoveListener = cb;
      if (event === "focus") mockFocusListener = cb;
      return () => {};
    },
    getParent: () => ({ addListener: () => () => {} }),
    dispatch: mockDispatch,
  }),
  useLocalSearchParams: () => ({}),
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe("LIIT Instruction 6: Event Builder Behaviour", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCreatorRepository.resetState();
    useCreatorStore.getState().resetCreatorStore();
    mockBack.mockClear();
    mockPush.mockClear();
    mockNavigate.mockClear();
    mockDispatch.mockClear();
    mockBeforeRemoveListener = null;
    mockFocusListener = null;
  });

  const renderForm = () =>
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <CreateEventScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

  it("renders with persisted default field values", () => {
    const screen = renderForm();
    expect(screen.getByTestId("event-builder-form")).toBeTruthy();
    const titleInput = screen.getByPlaceholderText(
      "e.g. Midnight Kinetic Grooves",
    );
    expect(titleInput.props.value).toBe("Midnight Grooves JHB");
    const startTimeInput = screen.getAllByPlaceholderText("HH:MM")[0];
    expect(startTimeInput.props.value).toBe("18:00");
  });

  it("edits a field, attempts to leave, guard appears, Continue Editing retains values", () => {
    const screen = renderForm();
    const titleInput = screen.getByPlaceholderText(
      "e.g. Midnight Kinetic Grooves",
    );
    fireEvent.changeText(titleInput, "Rooftop Amapiano Takeover");
    expect(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves").props.value,
    ).toBe("Rooftop Amapiano Takeover");
    expect(useCreatorStore.getState().isFormDirty).toBe(true);

    fireEvent.press(screen.getByText("Preview"));
    expect(screen.getByTestId("unsaved-changes-guard")).toBeTruthy();
    expect(screen.getByText("Unsaved Changes")).toBeTruthy();

    fireEvent.press(screen.getByTestId("guard-continue-editing"));
    expect(screen.queryByTestId("unsaved-changes-guard")).toBeNull();
    expect(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves").props.value,
    ).toBe("Rooftop Amapiano Takeover");
    expect(useCreatorStore.getState().isFormDirty).toBe(true);
  });

  it("guard Save Draft persists the full draft and exits to Preview", async () => {
    const screen = renderForm();
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "Rooftop Amapiano Takeover",
    );

    fireEvent.press(screen.getByText("Preview"));
    fireEvent.press(screen.getByTestId("guard-save-draft"));

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: "/(creator)/events/[eventId]/preview",
          }),
        );
      },
      { timeout: 10000 },
    );

    const saved = await mockCreatorRepository.getCreatorEvent("evt-draft-001");
    expect(saved?.eventDraft?.title).toBe("Rooftop Amapiano Takeover");
    expect(saved?.event.occurrence.startTime).toBe("2026-08-15T18:00:00+02:00");
    expect(useCreatorStore.getState().isFormDirty).toBe(false);
  });

  it("guard Discard exits without saving", async () => {
    const screen = renderForm();
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "Discarded Draft Title",
    );

    fireEvent.press(screen.getByText("Preview"));
    fireEvent.press(screen.getByTestId("guard-discard-changes"));

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: "/(creator)/events/[eventId]/preview",
          }),
        );
      },
      { timeout: 10000 },
    );

    const saved = await mockCreatorRepository.getCreatorEvent("evt-draft-001");
    expect(saved).toBeNull();
    expect(useCreatorStore.getState().isFormDirty).toBe(false);
  });

  it("system/back navigation blocked by beforeRemove shows guard, Discard re-dispatches", async () => {
    const screen = renderForm();
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "Back Nav Test",
    );

    expect(mockBeforeRemoveListener).not.toBeNull();
    const preventDefault = jest.fn();
    const action = { type: "GO_BACK" };
    act(() => {
      mockBeforeRemoveListener!({ preventDefault, data: { action } });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(screen.getByTestId("unsaved-changes-guard")).toBeTruthy();

    fireEvent.press(screen.getByTestId("guard-discard-changes"));
    expect(mockDispatch).toHaveBeenCalledWith(action);
    expect(useCreatorStore.getState().isFormDirty).toBe(false);
  });

  it("validates duplicate tier names, negative price, invalid capacity, max-per-order over capacity and incoherent sales window", () => {
    const screen = renderForm();
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "Valid Title",
    );

    fireEvent.changeText(
      screen.getAllByPlaceholderText("Tier Name (e.g. VIP Access)")[1],
      "Early Bird Pass",
    );
    fireEvent.changeText(screen.getAllByPlaceholderText("R 0.00")[0], "-50.00");
    fireEvent.changeText(screen.getAllByPlaceholderText("100")[0], "0");
    fireEvent.changeText(screen.getAllByPlaceholderText("4")[0], "500");
    fireEvent.changeText(
      screen.getAllByPlaceholderText("2026-08-14")[0],
      "2026-07-01",
    );

    fireEvent.press(screen.getByText("Save Draft"));

    expect(screen.getByText(/Duplicate tier name/i)).toBeTruthy();
    expect(screen.getByText(/Price cannot be negative/i)).toBeTruthy();
    expect(screen.getByText(/Invalid capacity/i)).toBeTruthy();
    expect(
      screen.getByText(/Max per order exceeds tier capacity/i),
    ).toBeTruthy();
    expect(screen.getByText(/Sales end before sales start/i)).toBeTruthy();
    expect(
      screen.getByText(
        /Please fix form validation errors before saving or publishing/i,
      ),
    ).toBeTruthy();
  });

  it("adds and deletes tiers with deterministic IDs and reorders them", () => {
    const screen = renderForm();
    fireEvent.press(screen.getByTestId("add-tier-button"));
    const addInput = screen.getAllByPlaceholderText(
      "Tier Name (e.g. VIP Access)",
    )[2];
    expect(addInput.props.value).toBe("Tier 3");

    fireEvent.changeText(addInput, "VIP Rooftop");

    fireEvent.press(screen.getByTestId("move-tier-up-creator-tier-draft-003"));
    fireEvent.press(screen.getByTestId("move-tier-up-creator-tier-draft-003"));
    const tierCards = screen.getAllByText(/^Tier \d+:/);
    expect(tierCards[0].props.children.join("")).toContain("VIP Rooftop");

    fireEvent.press(screen.getByTestId("delete-tier-creator-tier-draft-003"));
    expect(screen.queryByText(/VIP Rooftop/)).toBeNull();
  });

  it("free event toggle zeroes tier prices and persists isFree", async () => {
    const screen = renderForm();
    fireEvent(screen.getByTestId("free-event-toggle"), "valueChange", true);
    const priceInputs = screen.getAllByPlaceholderText("R 0.00");
    expect(priceInputs[0].props.value).toBe("0.00");
    expect(priceInputs[1].props.value).toBe("0.00");

    fireEvent.press(screen.getByText("Save Draft"));
    await waitFor(
      () => {
        expect(useCreatorStore.getState().isFormDirty).toBe(false);
      },
      { timeout: 10000 },
    );

    const saved = await mockCreatorRepository.getCreatorEvent("evt-draft-001");
    expect(saved?.eventDraft?.isFree).toBe(true);
    expect(saved?.event.startingPriceMinor).toBe(0);
    expect(saved?.eventDraft?.tiers.every((t) => t.priceMinor === 0)).toBe(
      true,
    );
  });

  it("persists the complete Event draft (visibility, age guidance, venue, schedule, tiers)", async () => {
    const screen = renderForm();
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "Complete Draft Test",
    );
    fireEvent.changeText(screen.getAllByPlaceholderText("HH:MM")[0], "20:00");
    fireEvent.changeText(
      screen.getAllByPlaceholderText("73 Juta Street")[0],
      "10 Keyes Avenue",
    );
    fireEvent.press(screen.getByText("21+"));

    fireEvent.press(screen.getByText("Save Draft"));
    await waitFor(
      () => {
        expect(useCreatorStore.getState().isFormDirty).toBe(false);
      },
      { timeout: 10000 },
    );

    const saved = await mockCreatorRepository.getCreatorEvent("evt-draft-001");
    expect(saved?.eventDraft?.title).toBe("Complete Draft Test");
    expect(saved?.eventDraft?.ageGuidance).toBe("21+");
    expect(saved?.eventDraft?.venueAddress).toBe("10 Keyes Avenue");
    expect(saved?.eventDraft?.startTime).toBe("20:00");
    expect(saved?.eventDraft?.visibility).toBe("Public");
    expect(saved?.event.occurrence.startTime).toBe("2026-08-15T20:00:00+02:00");
    expect(saved?.eventDraft?.tiers).toHaveLength(2);
    expect(saved?.eventDraft?.tiers[0].id).toBe("creator-tier-draft-001");
    expect(saved?.eventDraft?.tiers[1].id).toBe("creator-tier-draft-002");
  });

  it("re-arms the guard after a saved navigation (one-shot bypass), so a second edit shows the guard again", async () => {
    const screen = renderForm();

    // First cycle: edit -> Preview -> guard -> Save Draft -> navigate.
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "First Edit",
    );
    fireEvent.press(screen.getByText("Preview"));
    expect(screen.getByTestId("unsaved-changes-guard")).toBeTruthy();
    fireEvent.press(screen.getByTestId("guard-save-draft"));
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      },
      { timeout: 10000 },
    );

    // Return to the form (focus re-arms the bypass lock).
    act(() => {
      mockFocusListener?.();
    });

    // Second cycle: edit again and attempt to leave — guard must appear again.
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "Second Edit",
    );
    fireEvent.press(screen.getByText("Preview"));
    expect(screen.getByTestId("unsaved-changes-guard")).toBeTruthy();

    // Discard resolves the second navigation with a fresh one-shot bypass.
    fireEvent.press(screen.getByTestId("guard-discard-changes"));
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledTimes(2);
      },
      { timeout: 10000 },
    );
    expect(useCreatorStore.getState().isFormDirty).toBe(false);
  });

  it("a failed Save Draft does not permanently suppress future guards", async () => {
    mockCreatorRepository.simulateErrorFor("saveDraft", true);
    const screen = renderForm();

    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Midnight Kinetic Grooves"),
      "Edits That Fail To Save",
    );
    fireEvent.press(screen.getByText("Preview"));
    expect(screen.getByTestId("unsaved-changes-guard")).toBeTruthy();
    fireEvent.press(screen.getByTestId("guard-save-draft"));

    // Let the failed save resolve; no navigation occurs and the lock is not
    // latched.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    expect(mockPush).not.toHaveBeenCalled();

    mockCreatorRepository.simulateErrorFor("saveDraft", false);

    // Attempting to leave again must show the guard.
    fireEvent.press(screen.getByText("Preview"));
    expect(screen.getByTestId("unsaved-changes-guard")).toBeTruthy();
  });

  it("never reuses tier IDs after deleting a middle tier (monotonic sequence)", async () => {
    const screen = renderForm();

    fireEvent.press(screen.getByTestId("add-tier-button")); // -> 003
    expect(
      screen.getAllByPlaceholderText("Tier Name (e.g. VIP Access)")[2].props
        .value,
    ).toBe("Tier 3");

    fireEvent.press(screen.getByTestId("delete-tier-creator-tier-draft-002"));

    fireEvent.press(screen.getByTestId("add-tier-button")); // must be 004, not 002
    expect(
      screen.getAllByPlaceholderText("Tier Name (e.g. VIP Access)")[2].props
        .value,
    ).toBe("Tier 4");

    // New tiers require a description before the draft can be saved.
    fireEvent.changeText(
      screen.getAllByPlaceholderText(
        "Tier description (e.g. Includes VIP bar access)",
      )[1],
      "Third tier description",
    );
    fireEvent.changeText(
      screen.getAllByPlaceholderText(
        "Tier description (e.g. Includes VIP bar access)",
      )[2],
      "Fourth tier description",
    );

    fireEvent.press(screen.getByText("Save Draft"));
    await waitFor(
      () => {
        expect(useCreatorStore.getState().isFormDirty).toBe(false);
      },
      { timeout: 10000 },
    );

    const saved = await mockCreatorRepository.getCreatorEvent("evt-draft-001");
    const ids = saved?.eventDraft?.tiers.map((t) => t.id) || [];
    expect(ids).toContain("creator-tier-draft-001");
    expect(ids).toContain("creator-tier-draft-003");
    expect(ids).toContain("creator-tier-draft-004");
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some((id) => id === "creator-tier-draft-002")).toBe(false);
  });
});
