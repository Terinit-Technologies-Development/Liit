# ADR 0004: Mock Ticketing, Payment Simulation, Persisted Storage, and Non-Scannable Entry Passes

## Status
Accepted

## Context
LIIT Instruction 4 requires establishing the complete prototype commerce-to-entry journey: Event Detail → Ticket Selection → Payment Simulation → Order Processing → Order Result Confirmation → LIIT Ticket Wallet → Full Entry Pass (and Free Registration flow).

Integrating production payment gateways (e.g. Stripe, Paystack), real banking SDKs, Supabase database schemas, or production Aztec/QR generation at this prototype phase would introduce external network dependencies, authentication complexity, and setup overhead.

## Decision

1. **Mock Payment Simulation with Scenario Controls**:
   Implement a scenario-aware simulation engine (`MockTicketingRepository.simulatePayment`) capable of returning `paid`, `declined`, or `network_error` outcomes controlled globally by `useAppStore.scenario`.

2. **Atomic Attempt Guard and Idempotency Keys**:
   Use an atomic `tryBeginAttempt(attemptId)` action in `useCheckoutStore` to prevent rapid double-submissions from duplicate touch events. Pass `registrationId` in `createFreeRegistration` and `attemptId` in `simulatePayment` as idempotency keys.

3. **Pluggable Persisted Storage Interface**:
   Define `TicketingStorage` with two implementations: `AsyncStorageTicketingStorage` (for production-equivalent prototype persistence across app restarts) and `InMemoryTicketingStorage` (for clean, fast, isolated unit testing).

4. **Non-Scannable Prototype Entry Passes**:
   Render visual QR placeholders (`QrPlaceholder`) for paid tickets and Profile Verification badges for free registrations. Entry presentation is strictly gated by ticket status: only `valid` status enables entry codes, while `pending`, `used`, `cancelled`, and `refunded` statuses display appropriate disabled notices. High-brightness mode is visual-only without system device brightness mutations.

5. **Strict Confirmation Route Validation**:
   Result screens strictly validate the `result` parameter and load the full `TicketOrder` and `EventDetail` data via React Query hooks. Unrecognized or missing parameters display an invalid confirmation error rather than defaulting to success.

## Consequences
- Complete end-to-end prototype commerce journey without real payment processor or external service dependencies.
- Reliable local state persistence across cold app relaunches.
- Clear separation between prototype presentation and future production payment/ticketing backend integration.
