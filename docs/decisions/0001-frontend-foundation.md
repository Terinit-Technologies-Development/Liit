# ADR 0001: Mobile-First React Native Application Foundation

## Status
Accepted

## Context
LIIT requires a modern, production-shaped mobile-first application foundation capable of supporting iOS, Android, and Web platforms with rapid prototyping, high design fidelity, and robust state management.

## Decision
1. Adopt **Expo SDK 57** with **TypeScript** and **Expo Router** file-based navigation.
2. Establish the **Midnight Kinetic** provisional design system with centralized semantic tokens.
3. Decouple UI components from backend services using repository interfaces (`src/repositories/contracts/`) and mock fixture implementations (`src/repositories/mock/`).
4. Separate asynchronous server-state caching (**TanStack Query**) from transient prototype scenario management (**Zustand**).
5. Establish a unified identity model supporting seamless mode switching between Consumer and Creator experiences.

## Consequences
- Fast screen development without upfront backend coupling.
- Deterministic testing of edge cases (sold out, offline, payment decline) via scenario controls.
- Seamless upgrade path for future Supabase data bindings.
