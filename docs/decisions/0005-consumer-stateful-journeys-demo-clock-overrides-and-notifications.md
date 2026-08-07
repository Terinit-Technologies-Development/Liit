# ADR 0005: Consumer Stateful Journeys — Demo Clock, Prototype Overrides, Notification Persistence, and Save/Follow Optimism

## Status
Accepted

## Context
LIIT Instruction 7 requires turning the consumer screens from PRs 1–5 into a connected, locally stateful product: first-launch onboarding that resumes, shared discovery state across Feed/Explore/Search/Map, save/follow with optimistic failure, paid booking and free registration that create orders, tickets, and notifications automatically, notification rows that deep-link to the right context, and development-only prototype controls for failure, status, and time simulation — all without a backend.

The repository already used TanStack Query for repository reads and Zustand with AsyncStorage persistence for app/session/discovery/checkout state. Instruction 7 must extend that pattern deterministically without coupling screens to fixture objects.

## Decision

1. **Fixed demo clock with persisted offset** (`useDemoClockStore`, key `liit-demo-clock-v1`):
   All consumer time classifications (wallet upcoming/past, ticket validity, event display status) derive from `useDemoNowIso()`, which offsets the fixed `DEMO_NOW_ISO` base. Prototype Controls advance or reset the clock; the offset persists across restarts.

2. **Per-event status overrides** (`usePrototypeOverridesStore`, key `liit-prototype-overrides-v1`):
   A persisted map of `eventId → live | sold_out | completed | cancelled` is applied inside the mock discovery/event/map repositories after scenario transforms, so the override wins deterministically across Feed, Explore, Search, Map, and Event Detail without mutating fixtures.

3. **Development-only failure toggles** (`usePrototypeControlsStore`, key `liit-prototype-controls-v1`):
   `saveFollowFailure` drives optimistic revert of save/follow toggles (`useSaveFollowActions`: optimistic flip → 400ms delay → revert + error toast, only if the store still matches the optimistic value); `commentFailure` makes the first comment per `clientMutationId` fail (recoverable via retry). The offline scenario additionally reverts save/follow and resolves payments as network errors.

4. **Persistent consumer notifications** (`MockNotificationRepository`, key `liit-notifications-v1`):
   Notification items and a monotonic id sequence persist; read state survives restarts. The ticketing repository publishes `ticket_confirmed` / `booking_confirmed` notifications through an injected `NotificationRepository` on paid success / free registration, so booking actions create notifications at the repository boundary.

5. **Notification deep links**:
   Rows resolve `event`, `host`, `message`, `tickets`, `search`, and `profile` targets to their routes; message targets resolve conversation kind through the social repository before pushing the direct or inquiry thread.

6. **Session-created bookings define Event Detail ownership**:
   Event Detail shows "View your pass / View your ticket" only for tickets created during the demo session (non-`ticket-liit-seed-*` ids). Seeded wallet tickets remain demo history so the accepted "Choose tickets" / "Register free" checkout entry flows are unchanged.

7. **Simulated host replies** (`MockSocialRepository.simulateHostReply`):
   Deterministic canned replies for inquiry conversations, once per reset (persisted flag), surfaced through the inquiry thread with a typing indicator — never a real network request.

8. **Profile state is store-driven**:
   Saved/Following counts and tab content derive from `useDiscoveryStore.savedEventIds` / `followedHostIds` via `listEventsByIds` / host profile queries, replacing the previous fixture-filtered lists.

## Consequences
- All consumer journeys run fully offline with deterministic, reproducible state.
- Screens never mutate fixture objects; repositories remain the single mutation boundary, so later Supabase adapters can replace the mocks.
- Development controls are clearly separated from product UI behind the documented Prototype Controls surface.
- The seeded ticket carve-out is an explicit, documented deviation preserving accepted checkout behaviour.
