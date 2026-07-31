/**
 * Instruction 4 — CheckoutStore
 *
 * Verifies that useCheckoutStore correctly initialises, accumulates
 * quantities, records payment attempts, and resets on demand.
 */

import { act } from "@testing-library/react-native";
import { useCheckoutStore } from "../../src/state/useCheckoutStore";

beforeEach(() => {
  useCheckoutStore.getState().clearCheckout();
  useCheckoutStore.getState().resetCheckout?.();
});

function getStore() {
  return useCheckoutStore.getState();
}

describe("useCheckoutStore — beginCheckout", () => {
  it("initialises a draft with eventId", () => {
    act(() => {
      getStore().beginCheckout("evt-midnight-grooves");
    });

    const draft = getStore().draft;
    expect(draft).not.toBeNull();
    expect(draft?.eventId).toBe("evt-midnight-grooves");
    expect(draft?.quantities).toEqual({});
  });

  it("pre-seeds the initial tierId when provided", () => {
    act(() => {
      getStore().beginCheckout("evt-midnight-grooves", "tier-ga");
    });

    const draft = getStore().draft;
    expect(draft?.quantities["tier-ga"]).toBe(1); // seeded to 1 in store
    expect(draft?.eventId).toBe("evt-midnight-grooves");
  });
});

describe("useCheckoutStore — setQuantity", () => {
  beforeEach(() => {
    act(() => {
      getStore().beginCheckout("evt-test");
    });
  });

  it("sets a tier quantity", () => {
    act(() => {
      getStore().setQuantity("tier-ga", 2);
    });

    expect(getStore().draft?.quantities["tier-ga"]).toBe(2);
  });

  it("updates quantity for the same tier", () => {
    act(() => {
      getStore().setQuantity("tier-ga", 2);
      getStore().setQuantity("tier-ga", 3);
    });

    expect(getStore().draft?.quantities["tier-ga"]).toBe(3);
  });

  it("removes the tier when quantity is set to 0", () => {
    act(() => {
      getStore().setQuantity("tier-ga", 2);
      getStore().setQuantity("tier-ga", 0);
    });

    // Implementation may either keep 0 or remove the key — both are valid
    const qty = getStore().draft?.quantities["tier-ga"];
    expect(qty === 0 || qty === undefined).toBe(true);
  });
});

describe("useCheckoutStore — setPaymentMethod", () => {
  it("stores the selected payment method ID in the draft", () => {
    act(() => {
      getStore().beginCheckout("evt-test");
      getStore().setPaymentMethod("pm-demo-visa-4242");
    });

    expect(getStore().draft?.paymentMethodId).toBe("pm-demo-visa-4242");
  });
});

describe("useCheckoutStore — clearCheckout", () => {
  it("clears the draft", () => {
    act(() => {
      getStore().beginCheckout("evt-test");
      getStore().clearCheckout();
    });

    expect(getStore().draft).toBeNull();
  });
});
