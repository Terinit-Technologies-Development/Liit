# LIIT 06 Correction — Complete creator mode surfaces and shared creator entities

## 1. PR Metadata

- **Branch**: `fix/liit-06-creator-surfaces-completion`
- **Title**: `LIIT 06 Correction — Complete creator mode surfaces and shared creator entities`
- **URL**: [https://github.com/Terinit-Technologies-Development/Liit/pull/8](https://github.com/Terinit-Technologies-Development/Liit/pull/8)
- **Base branch**: `main`
- **Base SHA**: `957b8057330875130773071885a8123ff56dec49`
- **Previous reviewed head**: `f68b83ec9a25769f9c94cec6843bb7310f80a390`
- **Final implementation head SHA**: `ecf56a159eae88acdbf7433ba1881099ea053b37` (this documentation commit sits on top; the final pushed head is reported in the handoff)
- **Commits**: 6 (`23c39b1`, `a22e116`, `825c911`, `e0885e6`, `f68b83e`, `ecf56a1`)
- **Files Changed**: 59
- **Additions / Deletions**: `+10,194 / −1,053` (vs `main`)
- **PR State**: OPEN
- **Draft Status**: False (non-draft)
- **Mergeability**: MERGEABLE

---

## 2. Objective

Repair the merged Instruction 6 implementation on top of `main` (`957b805`) so that Creator mode is a complete, coherent, stateful advanced prototype projecting canonical Consumer entities (`evt-midnight-grooves`, `host-groove-co`).

Canonical Event IDs: `evt-midnight-grooves`, `evt-rosebank-art-jazz`, `evt-soweto-food-market`.
Canonical Host IDs: `host-groove-co`, `host-art-hub-jhb`, `host-jozi-vibe-tribe`.

---

## 3. Final Regression & Readiness Pass (head `ecf56a1`) — Completed Corrections

1. **Full Jest green** — `77/77 suites`, `323/323 tests`, **0 failed, 0 skipped, 0 todo**.
2. **Instruction 5 regression coverage restored** — the accepted `main` versions of `Instruction5InboxRendered.test.tsx` and `Instruction5DirectThreadRendered.test.tsx` were restored (the PR rewrite had deleted the Feed-badge test and used wrong testIDs). Restored coverage: **Feed unread inbox badge 3 → 1 after opening/marking the direct conversation read**, direct-thread read/focus semantics via `useFocusEffect`, typing-indicator lifecycle (appears after timer, clears on unmount), delivery retry via `retryMessage` without duplicate messages, blocked-user banner, invalid-conversation error state, search filtering, conversation-row navigation, plus a corrected new-message composer navigation test (`inbox-new-message-button`). Mocks (router/focus/navigation/safe-area) were repaired, not deleted.
3. **Social repository timing reverted** — `MockSocialRepository` delivery delay restored from 50ms to **300ms** (matches `main`); the 50ms value was a test-speed hack, not a deliberate product change, and the restored suite passes at 300ms.
4. **Create → Preview Maestro** — `instruction-06-create-preview.yaml` now drives the real dirty-form flow: edit → Preview → `Unsaved Changes` → `guard-save-draft` → `PREVIEW MODE — Draft Preview` → draft title → `18:00 SAST`, then Publish. The publish flow asserts `Publishing Event...` before failure and before success.
5. **Unsaved-changes bypass is one-shot** — `leaveLockRef` is no longer latched permanently. `executePendingAction()` sets it only for the pending navigation and resets it after the dispatch tick (also on a thrown navigation); a failed guard-save resets it via the mutation error path; a `focus` listener re-arms it when returning to the form. New tests: edit → Preview → Save Draft → Preview → return → edit again → guard appears again; failed Save Draft does not permanently suppress future guards.
6. **Publish visibly passes through Processing** — `publishEvent` enters `processing`, then a 600ms deterministic delay precedes the failure branch or the repository mutation. The behavioural test asserts `Publishing Event...` before `Publishing Failed` and again before `Event Publish Simulated`.
7. **Payout visibly passes through Processing** — `submitRequest` enters `processing` with a 600ms deterministic delay before failure or mutation. The test asserts `Processing Payout Request...` before `Payout Failed` and again before `Payout Request Recorded`; the `No bank transfer has occurred` disclosure remains.
8. **Deterministic tier-ID sequence** — `nextTierSeq()` derives from the **highest existing `creator-tier-draft-NNN` suffix** (monotonic), so deleting a middle tier can never reuse an ID. Test: `001/002 → add 003 → delete 002 → add → 004`, all IDs unique.
9. **Activation cover-image implemented** — a visible simulated cover-image control (`activation-cover-upload`) with a selected state is added to Activation, and `coverImageUrl` (plus `avatarUrl` and social links) is persisted in the activation draft and repository. Test proves `Cover Image Selected` renders and `coverImageUrl = "coverSimulated"` persists to store and repository.
10. **Maestro** — all five Instruction 6 flows retain `appId: com.liit.app`, `tags: [instruction-06]`, `launchApp: clearState: true` and the authenticated-onboarding runFlow; create-preview and payout-profile flows updated for the guard and visible Processing states.

All corrections from the previous pass remain in place (SAST serialization, draft persistence, validation, preview fidelity, publish retry/checklist/copy, verification gating, content mutations, query roots, payout zero-balance, error/invalid-ID states, Reset All).

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

Persisted on `CreatorEventProjection.eventDraft` by `MockCreatorRepository.saveEventDraft`. Tier IDs are monotonic (`creator-tier-draft-001`…), never reused after deletion.

**Query-root keys** (`src/hooks/creator/useCreatorQueries.ts`):

```
creatorKeys.notificationsRoot() = ["creator", "notifications"]
creatorKeys.notifications(category) extends notificationsRoot()
creatorKeys.eventGuestsRoot(eventId) = ["creator", "eventGuests", eventId]
creatorKeys.eventGuests(eventId, filter, search) extends eventGuestsRoot()
creatorKeys.events() family covers every status-filter variant
```

**State stores**: `useCreatorStore` (activation status/draft incl. cover image, active draft event, `eventDraft`, `isFormDirty`, `publishSimulationState`, event filter, notification category, `verificationState`, `completedVerificationItems`) + `MockCreatorRepository` singleton for all creator data.

**Reset behaviour**: `resetCreatorStore()` restores activation `not_started`, empty draft/filters, `review` publish state, `not_started` verification with no completed items, and resets repository projections, payouts, content, notifications, guests and error simulation; `queryClient.clear()` drops the Creator React Query cache.

---

## 5. Local Verification Results (head `ecf56a1`)

- **Prettier (`format:check`)**: ✅ All matched files pass formatting check.
- **TypeScript (`typecheck`)**: ✅ `tsc --noEmit` clean with 0 errors.
- **ESLint (`lint`)**: ✅ `expo lint` — **0 errors, 15 warnings** (all 15 genuinely pre-existing — consumer screens and older test files incl. the restored `main` Instruction 5 suites; **zero warnings in the Instruction 6 correction surface**).
- **Jest (`test --runInBand --forceExit`)**: ✅ **77 passed suites / 77 total — 323 passed tests / 323 total, 0 failed, 0 skipped, 0 todo**.
  - Instruction 6 suites: **20 suites / 88 tests, 0 failures, 0 skipped, 0 todo**.
  - Instruction 5 regression suites restored from `main`: `Instruction5InboxRendered` (6 tests) and `Instruction5DirectThreadRendered` (5 tests) — all passing, including the Feed unread-badge 3→1 flow.

---

## 6. Maestro Status

- **Status**: `UNEXECUTED` — no device/emulator runner was available in this environment.
- `instruction-06` tag: declared on all 5 flows (`tags: [instruction-06]`).
- `clearState: true`: declared on all 5 flows.
- Authenticated onboarding flow: `flows/authenticated-onboarding.yaml` referenced by all 5 flows.
- activation-dashboard / create-preview / events-operations / payout-profile / states: written and structurally validated (create-preview and payout-profile updated for the dirty-form guard and visible Processing states), but NOT executed.
- Device/emulator: none available.
- **Reason**: no Maestro runner or device attached; `test:e2e:instruction-06` remains for CI/device execution. RUNTIME certification is NOT claimed.

**Screenshots / recording / larger-text / keyboard-safe-area review**: NOT produced (no runtime execution).

---

## 7. Known Limitations

- Maestro flows are UNEXECUTED (no runner) — selectors are aligned to committed testIDs/accessibility labels but are not device-verified.
- No screenshots or recordings exist for this PR.
- `component-preview.tsx` renders static design-system gallery buttons with `onPress={() => {}}` — these are inert component-state previews in a developer surface, not product actions.
- Data-driven navigation targets (alert/notification routes from fixtures) are pushed via `Href` casts.
- Tab-bar interception in the unsaved-changes guard is best-effort (route-name matching) and only exercised at runtime; stack/back/in-form paths are test-covered.

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
