# LIIT Frontend Foundation Architecture

## 1. Layer Responsibilities

```
+-------------------------------------------------------+
|  Expo Router Screens & Route Shells (app/*)          |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Shared UI Primitives & Design System Tokens (src/*) |
+-------------------------------------------------------+
             |                               |
             v                               v
+------------------------+       +----------------------+
| TanStack Query Client  |       | Zustand State Store  |
| (Asynchronous Cache)   |       | (Transient Scenario) |
+------------------------+       +----------------------+
             |
             v
+-------------------------------------------------------+
|  Repository Contracts & Mock Implementations          |
|  (src/repositories/contracts vs mock)                 |
+-------------------------------------------------------+
             |
             v
+-------------------------------------------------------+
|  Pure Domain Entities & Fixtures (src/domain/*)       |
+-------------------------------------------------------+
```

1. **Route Components (`app/`)**: Thin components responsible for routing, safe-area padding, layout assembly, and invoking domain queries.
2. **Design Tokens (`src/design-system/`)**: Centralized semantic theme (`Midnight Kinetic`) containing colors, typography, radii, spacing, motion, and touch bounds.
3. **Domain Contracts (`src/repositories/contracts/`)**: TypeScript interface contracts decoupling UI components from concrete data access implementations.
4. **Mock Infrastructure (`src/repositories/mock/`)**: Local repository classes simulating network latency, success, failure, and empty results.
5. **State Layer (`src/state/`)**: TanStack Query handles async server data caching; Zustand handles client-side transient scenario state (mode switching, onboarding status, scenario overrides).

---

## 2. Supabase Integration Strategy

Future instructions will introduce Supabase authentication and backend database persistence.
Because components interact strictly with `Repository` interfaces (e.g. `EventRepository`), swapping mock storage for Supabase requires only replacing `mockEventRepository` with a `SupabaseEventRepository` without mutating UI code or route structures.
