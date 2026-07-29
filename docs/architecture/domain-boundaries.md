# LIIT Domain Boundaries Specification

> [!NOTE]
> These domain models are provisional baseline abstractions established during Instruction 0 and will be refined once the PRD and design direction documents are merged.

## 1. Core Subdomains

### 1.1 Identity
- Shared single identity model for both Consumer and Creator operating modes.
- Entitlements and creator capabilities are modeled as flags on `User` rather than separate accounts.

### 1.2 Events
- Represents live events, occurrences, hosts, venues, categories, and ticket availability.
- Canonical default location: Johannesburg, Gauteng, South Africa.

### 1.3 Commerce
- Ticket products, pricing tiers (minor units, ZAR currency), order summaries, and QR-coded owned tickets.

### 1.4 Creator
- Host profile metrics, hosted event summaries, draft event state, and payout tracking.

### 1.5 Social & Notifications
- Direct conversations, message threads, follow state, and system notification items.
