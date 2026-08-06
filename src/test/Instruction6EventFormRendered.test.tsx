import React from "react";
import { render } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CreateEventScreen from "../../app/(creator)/(tabs)/create";
import EventPreview from "../../app/(creator)/events/[eventId]/preview";
import PublishConfirmationModal from "../../app/(modals)/publish-confirmation";

describe("LIIT Instruction 6: Event Builder, Preview & Publish Modal Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders Create Event screen with EventBuilderForm", async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CreateEventScreen />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(getByTestId("creator-create-screen")).toBeTruthy();
    expect(getByText(/1. Event Media & Poster/i)).toBeTruthy();
    expect(getByText(/5. Ticket Tiers & Pricing/i)).toBeTruthy();

    const titleInput = getByPlaceholderText("e.g. Midnight Kinetic Grooves");
    expect(titleInput.props.value).toBe("Midnight Grooves JHB");
  });

  it("renders Event Preview with Preview banner and disabled checkout button", async () => {
    const { getByTestId, getByText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <EventPreview />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(getByTestId("creator-preview-screen")).toBeTruthy();
    expect(getByText(/PREVIEW MODE — Unsaved Draft/i)).toBeTruthy();
    expect(getByText(/Checkout Disabled \(Preview Mode\)/i)).toBeTruthy();
    expect(getByText(/Return to Edit Form/i)).toBeTruthy();
  });

  it("renders Publish Confirmation modal state machine", async () => {
    const { getByTestId, getByText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <PublishConfirmationModal />
        </QueryClientProvider>
      </SafeAreaProvider>,
    );

    expect(getByTestId("publish-confirmation-modal")).toBeTruthy();
    expect(getByText(/Confirm Event Publishing/i)).toBeTruthy();
    expect(getByText(/Confirm & Publish Live/i)).toBeTruthy();
  });
});
