# ADR 0002: Discovery Repositories, Image Registry, and Presentation Models

## Status
Accepted

## Context
LIIT requires a unified discovery system for Feed, Explore, Search, and Notifications. Discovery surfaces render events, hosts, and venues in various formats (featured cards, standard cards, compact rows, notification lists). The system must decouple internal event lifecycle states from user-facing marketing badges, support local image assets via a typed image registry, and keep notification targets typed for deferred screen navigation.

## Decision
1. **Typed Image Registry**: Replace arbitrary image URLs with a repository-controlled `imageRegistry` mapping `ImageAssetKey` identifiers to local assets. `Event` uses `heroImageKey` and `galleryImageKeys`.
2. **Event Presentation Adapter**: Derives display status (`Live`, `Selling Fast`, `Sold Out`, `Free`, `Upcoming`, `Completed`, `Cancelled`) deterministically based on a fixed demo clock (`DEMO_NOW_ISO`), lifecycle status, ticket availability, and start/end times.
3. **Typed Notification Targets**: Notification items include structured targets (`{ kind: 'event', eventId }`, `{ kind: 'host', hostId }`, etc.) rather than loose string URLs.
4. **Persisted Local Discovery Store**: `useDiscoveryStore` persists active search filters, recent searches, feed mode, and followed host IDs using AsyncStorage.
5. **Decoupled Mock Repositories**: Discovery data is served via `MockDiscoveryRepository` and `MockNotificationRepository`, designed for seamless replacement with Supabase or REST backend services in later instructions.

## Consequences
- Single source of truth for event status formatting across all variants.
- Reliable offline execution without external network image loading dependencies.
- Clear separation between UI presentation state and backend domain entities.
