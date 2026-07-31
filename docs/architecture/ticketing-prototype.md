# Ticketing Prototype Architecture

_LIIT Instruction 4 — Ticket Selection, Payment Simulation, Confirmations, Wallet, and Full Entry Pass_

## Overview

This document describes the architecture of the LIIT prototype ticketing and commerce journey. All payment, order, and wallet data is simulated locally with no network calls to a real payment processor or backend.

## Journey flow

```
Event Detail
  ↓ beginCheckout(eventId, tierId?) + navigate
Ticket Selection
  ├─ free path: createFreeRegistration → invalidate → Result (free_success)
  └─ paid path: setQuote → navigate
Payment
  ↓ tryBeginAttempt(nanoid) → navigate (atomic: rejects if attempt already set)
Processing
  ↓ usePaymentSimulationMutation → invalidates ticketing cache
  ├─ paid:          clearCheckout → Result (paid_success)
  ├─ declined:      releaseAttempt → Result (declined)
  └─ network_error: releaseAttempt → Result (network_error)
Result
  ├─ paid_success:    View Ticket | Wallet | Share | Back to Feed
  ├─ free_success:    View Pass | Wallet | Add to Calendar | Share | Back to Feed
  ├─ declined:        Retry | Change Payment Method
  └─ network_error:   Retry | Return to Event
Wallet (Tickets tab)
  └─ Full Ticket / Registration Pass
```

## Domain models

| Type | Location | Purpose |
|---|---|---|
| `CheckoutQuote` | `src/domain/ticketing/index.ts` | Immutable quote snapshot with fee |
| `TicketSelectionLine` | `src/domain/ticketing/index.ts` | Per-tier line item |
| `PaymentMethod` | `src/domain/ticketing/index.ts` | Available prototype payment methods |
| `PaymentAttempt` | `src/domain/ticketing/index.ts` | Payment attempt result record |
| `TicketOrder` | `src/domain/ticketing/index.ts` | Confirmed order record |
| `WalletTicket` | `src/domain/ticketing/index.ts` | Issued ticket with event snapshot |

## Fee policy

```
Rate: 500 bps (5.00%)
fee = Math.round(subtotalMinor × 500 / 10_000)
fee = 0 when subtotalMinor = 0 (free event)
```

Implemented in `src/domain/ticketing/fee-policy.ts`.

## Checkout state (`useCheckoutStore`)

The Zustand store manages a `CheckoutDraft` that persists across the checkout stack:

```typescript
interface CheckoutDraft {
  eventId: string;
  quantities: Record<string, number>;
  quote: CheckoutQuote | null;
  paymentMethodId: string | null;
  activeAttemptId: string | null;  // atomic duplicate-submit guard
  latestAttempt: PaymentAttempt | null;
}
```

### Duplicate-submit protection

`tryBeginAttempt(attemptId): boolean` — atomically sets `activeAttemptId` only when no attempt is in progress. Returns `false` without mutating state if an attempt is already active. The Payment screen calls this before navigating to Processing; the button is disabled while `activeAttemptId` is non-null.

`releaseAttempt()` — clears `activeAttemptId` after a declined or network-error result so the user can retry.

`clearCheckout()` — called after a successful paid result; removes the entire draft.

## Repository

`MockTicketingRepository` implements `TicketingRepository`:

| Method | Behaviour |
|---|---|
| `listPaymentMethods()` | Returns fixture payment methods |
| `simulatePayment(input)` | Scenario-driven: `normal` → `paid`, `payment_decline` → `declined`, `payment_network_error` → `network_error` |
| `createFreeRegistration(input)` | Creates `TicketOrder` + `WalletTicket[]`, persists to storage |
| `getOrder(orderId)` | Loads from storage |
| `listWalletTickets()` | Loads all tickets from storage |
| `getTicket(ticketId)` | Loads single ticket from storage |
| `reset()` | Clears storage and re-seeds from fixture data |

### Idempotency

`createFreeRegistration` accepts a `registrationId` field. The repository stores this as the order ID anchor to enable future idempotency enforcement (e.g. dedup on retry).

## Storage layer

| Implementation | Used by |
|---|---|
| `AsyncStorageTicketingStorage` | Production-equivalent prototype flow (real device/simulator) |
| `InMemoryTicketingStorage` | Unit and integration tests (no AsyncStorage dependency) |

## Payment Method modal

The `/(modals)/payment-method` modal maintains a _local draft_ of the selected method. The store is only mutated when the user presses Apply. Pressing Cancel or closing the modal discards the local selection and preserves the previously applied method.

## Wallet classification

`classifyWalletTicket(ticket, nowIso)` returns `"upcoming"` or `"past"`:

- `used | cancelled | refunded` → always `"past"`
- `valid | pending` with future event end → `"upcoming"`
- `valid | pending` with past event end → `"past"`

## Full Ticket screen

`getTicketEntryPresentation(ticket)` gates QR display:

| Status | `canDisplayEntryCode` |
|---|---|
| `valid` (paid source) | `true` — QR placeholder enabled |
| `valid` (free source) | `false` — Profile Verification shown instead |
| `pending` | `false` — pending confirmation message |
| `used` | `false` — already used message |
| `cancelled` | `false` — cancelled message |
| `refunded` | `false` — refunded message |

A high-brightness Switch is available for paid QR tickets. It changes the background to `#FFFFFF` (no actual device brightness API is called — prototype-safe).

## Routes

| Route | Kind | Tab bar |
|---|---|---|
| `/(consumer)/tickets/` | Nested Stack | Visible (Tickets tab) |
| `/(consumer)/tickets/index` | Wallet | Visible |
| `/(consumer)/tickets/[ticketId]` | Full Ticket | Hidden (nested) |
| `/(consumer)/checkout/[eventId]/tickets` | Ticket Selection | Hidden (`hideTabBar: true`) |
| `/(consumer)/checkout/[eventId]/payment` | Payment | Hidden |
| `/(consumer)/checkout/[eventId]/processing` | Processing | Hidden |
| `/(consumer)/checkout/[eventId]/result` | Result | Hidden |
| `/(modals)/ticket-terms` | Modal | — |
| `/(modals)/payment-method` | Modal | — |

Five visible tabs remain unchanged: `feed`, `explore`, `map`, `tickets`, `profile`.

Note: `app/(consumer)/tickets.tsx` has been deleted. Only the directory-based route (`tickets/index.tsx`) exists.

## Known prototype limitations

- QR codes are visual placeholders. No real Aztec/QR generation is performed.
- Profile verification entry is text-only (no photo capture or biometric check).
- Payment processing uses a fixed simulated delay (≈1800ms).
- No refund, cancellation, or payout flows.
- No push notification on purchase confirmation.
- No Supabase or real payment provider integration.
