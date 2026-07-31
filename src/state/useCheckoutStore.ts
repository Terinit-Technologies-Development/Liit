import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CheckoutQuote, PaymentAttempt } from "../domain/ticketing";

interface CheckoutDraft {
  eventId: string;
  quantities: Record<string, number>;
  quote: CheckoutQuote | null;
  paymentMethodId: string | null;
  /** Set atomically by tryBeginAttempt; cleared by releaseAttempt or clearCheckout. */
  activeAttemptId: string | null;
  latestAttempt: PaymentAttempt | null;
}

interface CheckoutState {
  draft: CheckoutDraft | null;
  hasHydrated: boolean;

  beginCheckout(eventId: string, initialTierId?: string): void;
  setQuantity(tierId: string, quantity: number): void;
  setQuote(quote: CheckoutQuote): void;
  setPaymentMethod(paymentMethodId: string): void;

  /**
   * Atomically set the activeAttemptId only when no attempt is already in
   * progress. Returns true if the attempt was accepted, false if rejected.
   * Use this instead of beginAttempt to prevent rapid double-submission.
   */
  tryBeginAttempt(attemptId: string): boolean;

  /** Clear the active attempt (called on declined / network_error so the user can retry). */
  releaseAttempt(): void;

  setLatestAttempt(attempt: PaymentAttempt): void;
  clearCheckout(): void;
  resetCheckout(): void;
}

const initialState = {
  draft: null,
  hasHydrated: false,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      beginCheckout: (eventId, initialTierId) =>
        set({
          draft: {
            eventId,
            quantities: initialTierId ? { [initialTierId]: 1 } : {},
            quote: null,
            paymentMethodId: "pm-demo-visa-4242",
            activeAttemptId: null,
            latestAttempt: null,
          },
        }),

      setQuantity: (tierId, quantity) =>
        set((state) => {
          if (!state.draft) return state;
          return {
            draft: {
              ...state.draft,
              quantities: {
                ...state.draft.quantities,
                [tierId]: Math.max(0, quantity),
              },
            },
          };
        }),

      setQuote: (quote) =>
        set((state) =>
          state.draft ? { draft: { ...state.draft, quote } } : state,
        ),

      setPaymentMethod: (paymentMethodId) =>
        set((state) =>
          state.draft ? { draft: { ...state.draft, paymentMethodId } } : state,
        ),

      tryBeginAttempt: (attemptId) => {
        let accepted = false;
        set((state) => {
          if (!state.draft || state.draft.activeAttemptId) {
            return state;
          }
          accepted = true;
          return {
            draft: {
              ...state.draft,
              activeAttemptId: attemptId,
            },
          };
        });
        return accepted;
      },

      releaseAttempt: () =>
        set((state) =>
          state.draft
            ? { draft: { ...state.draft, activeAttemptId: null } }
            : state,
        ),

      setLatestAttempt: (latestAttempt) =>
        set((state) =>
          state.draft ? { draft: { ...state.draft, latestAttempt } } : state,
        ),

      clearCheckout: () => set({ draft: null }),

      resetCheckout: () => set({ draft: null, hasHydrated: true }),
    }),
    {
      name: "liit-checkout-state-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...persisted }) => persisted,
      onRehydrateStorage: () => () => {
        useCheckoutStore.setState({ hasHydrated: true });
      },
    },
  ),
);
