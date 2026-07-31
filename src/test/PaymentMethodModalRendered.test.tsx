import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PaymentMethodModal from "../../app/(modals)/payment-method";
import { useCheckoutStore } from "../state/useCheckoutStore";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("PaymentMethodModalRendered Integration", () => {
  beforeEach(() => {
    mockBack.mockClear();
    useCheckoutStore.setState({
      draft: {
        eventId: "evt-midnight-grooves",
        quantities: {},
        quote: null,
        paymentMethodId: "pm-demo-visa-4242",
        activeAttemptId: null,
        latestAttempt: null,
      },
    });
  });

  it("Renders the modal with payment methods", () => {
    const screen = render(<PaymentMethodModal />);
    expect(screen.getByText("Choose payment method")).toBeTruthy();
    expect(screen.getByText("Demo Visa •••• 4242")).toBeTruthy();
  });

  it.todo(
    "Selecting a method updates local selection but does NOT immediately commit to store",
  );

  it.todo("Apply button commits to store and calls router.back()");

  it("Cancel (close) calls router.back() without changing the store", () => {
    const screen = render(<PaymentMethodModal />);
    const closeBtn = screen.getByTestId("payment-method-close");

    fireEvent.press(closeBtn);

    expect(mockBack).toHaveBeenCalled();
    expect(useCheckoutStore.getState().draft?.paymentMethodId).toBe(
      "pm-demo-visa-4242",
    );
  });
});
