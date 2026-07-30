# ADR 0003: Mock Map Canvas & Modular Data-Driven Event Detail

## Status
Accepted

## Context
LIIT requires geospatial event discovery, canonical Event Detail presentation for multiple event states (paid, free, live, sold-out, completed), and public Host Profiles. Production map SDKs (e.g. Mapbox, Google Maps) require native native binaries and external API keys not suited for early prototype verification. Furthermore, creating separate screen routes for each event type leads to duplicate code.

## Decision

1. **Deterministic Mock Map Visual Adapter**:
   Implement a lightweight visual adapter (`MockMapAdapter`) that projects coordinates inside a canvas view with cluster aggregation.
2. **Modular Data-Driven Event Detail**:
   Use a single screen (`app/(consumer)/events/[eventId].tsx`) driven by `EventDetailPayload` module flags and a pure `getEventConversionModel` domain helper.
3. **Hidden Contextual Routes**:
   Configure `events` and `hosts` as hidden contextual routes in Expo Router Tabs (`hideTabBar: true`), preserving the 5-tab main consumer navigation shell.
4. **Shared Local Stores**:
   Centralize saved events (`savedEventIds`) and followed hosts (`followedHostIds`) in `useDiscoveryStore`.

## Consequences
- Clean separation between presentation UI and map vendor implementations.
- Easy transition to live map SDKs or Supabase backend in future PRs.
- Zero external API key dependencies.
