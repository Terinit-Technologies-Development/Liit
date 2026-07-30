# Map Discovery, Event Detail, and Public Host Profile Architecture

## Overview

This document describes the architectural design for LIIT's Map discovery, canonical Event Detail, and public Host Profile conversion journey introduced in Instruction 3.

## 1. Map Discovery Architecture

- **Mock Map Canvas & Visual Adapter (`MockMapAdapter`)**:  
  Calculates normalized projected screen coordinates `(x, y)` for Johannesburg bounding box `[-26.25, -26.15, 28.00, 28.10]`. At zoom levels 1–2, points with matching `clusterKey` combine into `MapClusterNode`s. At zoom level 3, points decompose into individual `MapEventNode` pins.
- **Repository (`MockMapDiscoveryRepository`)**:  
  Serves deterministic `MapSnapshot` data containing map points and matching event IDs filtered by category, status (`live`, `available`, `sold_out`), distance radius, and free-only pricing.
- **State (`useMapDiscoveryStore`)**:  
  Persists user's `displayMode` (`map` or `list`), `viewport`, `filters`, and `locationState`. `selectedEventId` remains transient.

## 2. Canonical Event Detail Architecture

- **Data-Driven Module Flags**:  
  A single screen (`app/(consumer)/events/[eventId].tsx`) dynamically renders features through payload module flags: `lineup`, `ticketTiers`, `attendeeProof`, `eventPosts`, `relatedEvents`.
- **Event Conversion Model (`getEventConversionModel`)**:  
  Pure domain mapping that evaluates `conversionMode` (`paid`, `free_registration`, `waitlist`, `none`) to determine sticky CTA label, supporting text, and disabled state.
- **Fixture Variants**:
  - `evt-midnight-grooves`: Standard paid event ("Choose tickets")
  - `evt-soweto-food-market`: Free registration ("Register free")
  - `evt-amapiano-fest`: Live event with host updates/posts ("Choose tickets")
  - `evt-deep-house-rooftop`: Sold out event ("Join waitlist")
  - `evt-completed-highlight` / `evt-fashion-week-popup`: Completed event (no CTA)

## 3. Public Host Profile Architecture

- **Data Model (`PublicHostProfile`)**:  
  Defines host identity header, cover artwork, verified state, bio, metric cards (`followers`, `rating`, `events_hosted`), upcoming event IDs resolved against canonical discovery events, and past highlights.
- **State Persistence**:  
  Follow state (`followedHostIds`) and save state (`savedEventIds`) are shared and persisted in `useDiscoveryStore`.

## 4. Deferred External Dependencies

- Real map SDK (Google Maps / Mapbox / Apple Maps)
- Device GPS permissions
- Ticket checkout & payment processing
- Real host messaging & backend APIs
