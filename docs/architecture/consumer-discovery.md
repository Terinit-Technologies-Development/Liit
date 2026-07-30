# Architecture: LIIT Consumer Discovery

## Overview

The discovery module powers LIIT's primary consumer surfaces: Feed, Explore, Search, Search Filters, and Notifications.

---

## Architectural Principles

1. **Responsibility Separation**
   - **Feed**: Live city pulse (editorial highlights, story rings, creator posts, live event placeholders, mode switching between Live & Recent / Upcoming).
   - **Explore**: Structured browsing (trending collections, categories, featured venues, recommended events, weekend and nearby rails).
   - **Search**: Intentional query-driven discovery grouped into Events, Hosts, and Venues with fine-grained filter controls.
   - **Notifications**: Structured activity updates (event reminders, ticket confirmations, host posts, social reactions) with typed targets.

2. **Repository & Storage Boundaries**
   - Repository contracts (`DiscoveryRepository`, `NotificationRepository`) define domain operations.
   - Mock repositories (`MockDiscoveryRepository`, `MockNotificationRepository`) simulate deterministic latency and failure scenarios.
   - TanStack Query manages async query caching, state invalidation, and background updates.
   - Zustand (`useDiscoveryStore`) handles persisted local UI state (feed mode, recent search terms, applied search filters, followed hosts).

3. **Canonical Domain Model & Image Registry**
   - One canonical `Event` domain model is used across all discovery views and card variants (`featured`, `standard`, `compact`, `live-content`).
   - Image assets are mapped via `imageRegistry` (`src/assets/image-registry.ts`), using strongly-typed `heroImageKey` and `galleryImageKeys`.
