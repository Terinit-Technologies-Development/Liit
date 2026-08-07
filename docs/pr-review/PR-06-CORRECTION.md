# LIIT 06 Correction — Complete creator mode surfaces and shared creator entities

## 1. PR Metadata

- **Branch**: `fix/liit-06-creator-surfaces-completion`
- **Title**: `LIIT 06 Correction — Complete creator mode surfaces and shared creator entities`
- **URL**: [https://github.com/Terinit-Technologies-Development/Liit/pull/8](https://github.com/Terinit-Technologies-Development/Liit/pull/8)
- **Base branch**: `main`
- **Base SHA**: `957b8057330875130773071885a8123ff56dec49`
- **Previous reviewed head**: `825c911ec94525177eb0258ed1c3d8efbac078f7`
- **Final head SHA**: `e0885e61330131a9d28a389da2cfbcdf88e8b510` (implementation head; PR also carries this documentation commit on top — the pushed head is reported in the handoff)
- **Commits**: 4 (`23c39b1`, `a22e116`, `825c911`, `e0885e6`)
- **Files Changed**: 61
- **Additions / Deletions**: `+10,085 / −1,245` (vs `main`)
- **PR State**: OPEN
- **Draft Status**: False (non-draft)
- **Mergeability**: MERGEABLE

---

## 2. Objective

Repair the merged Instruction 6 implementation on top of `main` (`957b805`) so that Creator mode is a complete, coherent, stateful advanced prototype projecting canonical Consumer entities (`evt-midnight-grooves`, `host-groove-co`).

Canonical Event IDs: `evt-midnight-grooves`, `evt-rosebank-art-jazz`, `evt-soweto-food-market`.
Canonical Host IDs: `host-groove-co`, `host-art-hub-jhb`, `host-jozi-vibe-tribe`.

---

## 3. Final Correction Pass (head `e0885e6`) — Completed Corrections

1. **SAST serialization** — new `src/utils/johannesburg.ts` with `toJohannesburgIso(date, time)` producing `YYYY-MM-DDTHH:mm:00+02:00` (explicit SAST offset, never a UTC `Z`), plus `formatJohannesburgTime` / `splitJohannesburgIso`. `EventMetadataGrid` renders the wall-clock as stored for `+02:00` timestamps. Round-trip test proves `2026-08-15 18:00 SAST` → stored `2026-08-15T18:00:00+02:00` → displayed `18:00 SAST` (never 20:00/16:00).
2. **Complete Event draft persistence** — `EventDraft` + `EventTierDraft` domain models persist every builder field: title, description, category, visibility, age guidance, poster state, start/end date+time, venue name/address/suburb/city, free-event state; each tier persists stable deterministic IDs (`creator-tier-draft-001`, `-002`…), name, description, price minor, capacity, sales start/end, max per order, availability. No `Date.now()` identity anywhere (draft events use `evt-draft-001`; payout requests use sequential `pay-req-003`; content posts use sequential `creator-post-N`; payout references are `PAY-REQ-####` deterministic).
3. **Builder validation** — duplicate tier names, missing tier description, negative price, invalid capacity, incoherent sales window, sales end before Event start, free-event price conflicts, max-per-order > capacity.
4. **Unsaved-changes guard** — real guard surface with `Continue Editing / Save Draft / Discard Changes`, wired to `beforeRemove` (system/header/back navigation), tab-bar `tabPress`, and in-form Preview/Publish navigation. Pending actions are navigation-only; Discard never saves; Save persists then exits. Tests cover all three options plus `beforeRemove` re-dispatch.
5. **Preview fidelity** — Preview renders the exact saved draft via `CreatorEventProjection.eventDraft → TicketTier[]`; no fabricated `sampleTiers`; free events show Free Registration; unknown drafts show a typed `Draft Not Found` state.
6. **Preview dead controls removed** — save/share/report/tier-selection all provide explicit Preview-mode feedback alerts; ticket selection is non-interactive with a visible reason.
7. **Publish confirmation** — `publishEvent(shouldFail = forceFail)` with an explicit parameter (Retry calls `setForceFail(false); publishEvent(false)` — no stale closure); the readiness checklist is derived from the actual draft (media, title, description, SAST schedule, venue, tiers/price coherence, creator verification) and publish is disabled with a visible reason when invalid; success copy states `LIIT PROTOTYPE — the Creator-side event status has been simulated as Published. Consumer marketplace propagation is deferred to Instruction 8.`
8. **Verification gating** — five deterministic states (`not_started | incomplete | under_review | verified | rejected`); completion requires `verified` + every checklist item complete; button disabled with visible gate reason otherwise; completion updates `useCreatorStore.activationStatus` + repository profile and routes to Dashboard.
9. **Content repository mutations** — `createContentPost / updateContentPost / toggleContentPin / toggleContentVisibility / deleteContentPost` on `MockCreatorRepository`; the screen reads React Query state directly (no stale local array); full editor (title, body, comments enabled, auto-pin, schedule date, Save Draft / Schedule / Publish); states `pinned | public | hidden | scheduled | draft`; invalid-event, empty, error+Retry states.
10. **Query-root keys** — `notificationsRoot()` and `eventGuestsRoot(eventId)` family roots; mark-read/mark-all invalidate the notifications root (every category cache); guest check-in invalidates the event-guests root (every filter/search variant) plus analytics; Event mutations invalidate the whole `events` family.
11. **Payouts** — `overview?.availableMinor ?? 1500000` (zero balance stays zero); deterministic failure toggle + Retry with explicit parameter; success copy `LIIT PROTOTYPE — payout request recorded in the local simulation. No bank transfer has occurred.`; single displayed destination (no false bank-selection claim); ledger entry with deterministic reference; available/pending update.
12. **Error / invalid-ID states** — analytics, guests, content, notifications and the Ops Hub all handle loading, recoverable error with Retry (`simulateErrorFor(key)`), invalid Event (`getCreatorEvent` returns null; `getEventAnalytics` returns null — never fabricated zero analytics), not-started events, empty states.
13. **Reset All** — `prototype-controls` Reset All now calls `useCreatorStore.resetCreatorStore()` (resets activation, verification, event draft, dirty, publish, filters, payout/content/guest/notification mutations, repository state) plus `queryClient.clear()` for the Creator cache.
14. **Maestro** — all five Instruction 6 flows declare `appId: com.liit.app`, `tags: [instruction-06]`, `launchApp: clearState: true`, run `flows/authenticated-onboarding.yaml`, and navigate explicitly into Creator mode via the header mode chip. Flows cover activation → verification → dashboard; create → preview → publish failure/retry/success; events/ops/analytics/guests/content; payouts failure/retry/success + consumer switch; tools/content/notifications/verification states.
15. **Behavioural Jest suites** — 15 Instruction 6 suites with acceptance-level behaviours (see §5).

---

## 4. Architecture — Draft model, query roots, state stores, reset

**Event draft model** (`src/domain/creator/index.ts`):

```
EventDraft { title, description, category, visibility, ageGuidance,
             posterUploaded, startDate, startTime, endDate, endTime,
             venueName, venueAddress, venueSuburb, venueCity, isFree,
             tiers: EventTierDraft[] }
EventTierDraft { id, name, description?, priceMinor, capacity,
                 salesStart?, salesEnd?, maxPerOrder, availability }
```

Persisted on `CreatorEventProjection.eventDraft` by `MockCreatorRepository.saveEventDraft`.

**Query-root keys** (`src/hooks/creator/useCreatorQueries.ts`):

```
creatorKeys.notificationsRoot() = ["creator", "notifications"]
creatorKeys.notifications(category) extends notificationsRoot()
creatorKeys.eventGuestsRoot(eventId) = ["creator", "eventGuests", eventId]
creatorKeys.eventGuests(eventId, filter, search) extends eventGuestsRoot()
creatorKeys.events() family covers every status-filter variant
```

**State stores**: `useCreatorStore` (activation status/draft, active draft event, `eventDraft`, `isFormDirty`, `publishSimulationState`, event filter, notification category, `verificationState`, `completedVerificationItems`) + `MockCreatorRepository` singleton for all creator data.

**Reset behaviour**: `resetCreatorStore()` restores activation `not_started`, empty draft/filters, `review` publish state, `not_started` verification with no completed items, and resets repository projections, payouts, content, notifications, guests and error simulation; `queryClient.clear()` drops the Creator React Query cache.

---

## 5. Local Verification Results (head `e0885e6`)

- **Prettier (`format:check`)**: ✅ All matched files pass formatting check (pre-existing formatting drift across ~46 files was corrected so the gate passes).
- **TypeScript (`typecheck`)**: ✅ `tsc --noEmit` clean with 0 errors.
- **ESLint (`lint`)**: ✅ `expo lint` — **0 errors, 13 warnings** (all 13 warnings pre-existing in consumer screens and older test files; zero warnings in the Instruction 6 correction surface).
- **Jest (`test --runInBand --forceExit`)**: ✅ **75 passed suites / 2 failed suites — 315 passed tests / 3 failed tests, 0 skipped, 0 todo** of 318 tests across 77 suites.
  - All 15 Instruction 6 suites pass: **84 tests, 0 failures, 0 skipped, 0 todo**.
  - The 2 failing suites (`Instruction5InboxRendered`, `Instruction5DirectThreadRendered`, 3 tests) are **pre-existing failures at the previously reviewed head `825c911`** — verified by running those suites at the base head (Inbox 2/5 fail, DirectThread 6/6 fail without the retained local `useFocusEffect`/`getParent` navigation mock fix; 1/6 with it). They are outside the Instruction 6 scope boundary and unchanged by this pass.

---

## 6. Maestro Status

- **Status**: `UNEXECUTED` — no device/emulator runner was available in this environment.
- `instruction-06` tag: declared on all 5 flows (`tags: [instruction-06]`).
- `clearState: true`: declared on all 5 flows.
- Authenticated onboarding flow: `flows/authenticated-onboarding.yaml` referenced by all 5 flows.
- activation-dashboard / create-preview / events-operations / payout-profile / states: written and structurally validated, but NOT executed.
- Device/emulator: none available.
- **Reason**: no Maestro runner or device attached; `test:e2e:instruction-06` remains for CI/device execution. RUNTIME certification is NOT claimed.

**Screenshots / recording / larger-text / keyboard-safe-area review**: NOT produced (no runtime execution).

---

## 7. Known Limitations

- Maestro flows are UNEXECUTED (no runner) — selectors are aligned to committed testIDs/accessibility labels but are not device-verified.
- No screenshots or recordings exist for this PR.
- `component-preview.tsx` renders static design-system gallery buttons with `onPress={() => {}}` — these are inert component-state previews in a developer surface, not product actions.
- Data-driven navigation targets (alert/notification routes from fixtures) are pushed via `Href` casts.
- Pre-existing Instruction 5 test failures (3 tests across 2 suites) are unchanged at the final head and reproducible at the previously reviewed head.
- `Create Event` tab press, system back, header back and in-form navigation all route through the unsaved-changes guard; tab-bar interception is best-effort (route-name matching) and only relevant at runtime.

## 8. Instruction 8 Deferrals (explicitly NOT implemented)

- Consumer marketplace propagation from Creator publish (Creator-side status simulated only).
- Real bank transfers, CSV file export, live broadcasting, and real media uploads remain simulations.
- Bank destination selection is NOT claimed — exactly one destination account is displayed.

## 9. Review Status & Stop Confirmation

- **Recommendation**: `CODE_READY` (Maestro/device runtime certification NOT claimed — `RUNTIME_CERTIFIED` requires executed Maestro runs, screenshots, and a recording).
- **Open review threads**: 0 (no inline review comments on PR #8 at the final head).
- **GitHub Actions**: SKIPPED BY CURRENT USER POLICY — NOT A MERGE GATE
- **Scope Boundary**: CONFIRMED — Instruction 7 and all later LIIT instructions have NOT been inspected or started.
- **Stop Status**: CONFIRMED — Corrective PR #8 is open and has NOT been merged.
