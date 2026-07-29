# LIIT Application Prototype

LIIT is an advanced event, social, and nightlife experience platform.

This repository contains the mobile-first React Native application foundation built with Expo SDK 57, TypeScript, Expo Router, TanStack Query, Zustand, React Hook Form, and Zod.

---

## 1. Prototype Phase & Architecture Scope

- **Phase**: LIIT Instruction 0 — Foundation Baseline
- **Operating Modes**: Dual-mode consumer and creator experience powered by a unified identity model.
- **Design System**: Midnight Kinetic (centralized semantic token system in `src/design-system/`).
- **Data Layer**: Decoupled domain interfaces (`src/domain/`) and mock repository implementations (`src/repositories/mock/`) with deterministic scenario controls.
- **Backend Coupling**: Zero database schema dependencies committed. Prepared for future Supabase repository adapter integration.

---

## 2. Setup & Operating Commands

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Expo Go app (iOS / Android) or Expo Development Build

### Installation
```bash
npm install --legacy-peer-deps
```

### Running Locally
```bash
# Start Expo dev server
npm run start

# Run web target
npm run web

# Run Android target
npm run android

# Run iOS target
npm run ios
```

### Quality & Testing Commands
```bash
# Typecheck
npm run typecheck

# Linting
npm run lint

# Code Formatting Check
npm run format:check

# Run Unit & Component Tests
npm run test

# Run Maestro E2E Smoke Test
npm run test:e2e
```

---

## 3. Directory Overview

- `app/`: Expo Router file-based route groups (`(onboarding)`, `(consumer)`, `(creator)`, `(modals)`).
- `src/components/`: Shared UI primitives, navigation header, form controls, and feedback states.
- `src/design-system/`: Semantic color, typography, spacing, radii, motion, and layout tokens.
- `src/domain/`: Pure TypeScript entity definitions (`identity`, `events`, `commerce`, `social`, `creator`, `notifications`).
- `src/repositories/`: Contracts and mock repository implementations.
- `src/state/`: Zustand store (`useAppStore`) and TanStack Query key factories.
- `src/fixtures/`: Canonical demo data set in Johannesburg, Gauteng (ZAR).
- `docs/`: Frontend architecture specifications, domain boundaries, ADRs, and PR review guides.

---

## 4. Resetting Prototype State

To reset all local prototype overrides, scenario states, and persisted storage:
1. Open the app and navigate to **Prototype Controls** (gear icon in header or mode chip).
2. Tap **"Reset All Prototype State"**.
3. Alternatively, invoke `useAppStore.getState().resetPrototype()` in code or clear AsyncStorage.
