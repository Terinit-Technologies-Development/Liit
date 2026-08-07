/**
 * Instruction 7 — Demo clock and prototype overrides
 *
 * Verifies the fixed demo clock arithmetic and store, per-event status
 * overrides applied across mock repositories, and ticket status mutation
 * with persisted state.
 */

import { demoNowIso, useDemoClockStore } from "../../src/state/useDemoClockStore";
import { usePrototypeOverridesStore } from "../../src/state/usePrototypeOverridesStore";
import { MockEventRepository } from "../../src/repositories/mock/MockEventRepository";
import { MockDiscoveryRepository } from "../../src/repositories/mock/MockDiscoveryRepository";
import { MockMapDiscoveryRepository } from "../../src/repositories/mock/MockMapDiscoveryRepository";
import { MockTicketingRepository } from "../../src/repositories/mock/MockTicketingRepository";
import { InMemoryTicketingStorage } from "../../src/repositories/mock/InMemoryTicketingStorage";
import { classifyWalletTicket } from "../../src/domain/ticketing/wallet";
import { DEMO_NOW_ISO } from "../../src/fixtures/discovery/demo-clock";

describe("Demo clock", () => {
  beforeEach(() => {
    useDemoClockStore.getState().resetClock();
  });

  it("starts at the fixed demo base time", () => {
    expect(demoNowIso(0)).toBe(DEMO_NOW_ISO);
  });

  it("advances by the stored offset", () => {
    useDemoClockStore.getState().advanceClock(60 * 60 * 1000);
    const expected = new Date(
      new Date(DEMO_NOW_ISO).getTime() + 60 * 60 * 1000,
    ).toISOString();
    expect(demoNowIso(useDemoClockStore.getState().offsetMs)).toBe(expected);
  });

  it("resets the offset to zero", () => {
    useDemoClockStore.getState().advanceClock(24 * 60 * 60 * 1000);
    useDemoClockStore.getState().resetClock();
    expect(useDemoClockStore.getState().offsetMs).toBe(0);
    expect(demoNowIso(0)).toBe(DEMO_NOW_ISO);
  });
});

describe("Per-event status overrides", () => {
  let eventRepo: MockEventRepository;
  let discoveryRepo: MockDiscoveryRepository;
  let mapRepo: MockMapDiscoveryRepository;

  beforeEach(() => {
    usePrototypeOverridesStore.getState().resetPrototypeOverrides();
    eventRepo = new MockEventRepository();
    discoveryRepo = new MockDiscoveryRepository();
    mapRepo = new MockMapDiscoveryRepository();
  });

  afterEach(() => {
    usePrototypeOverridesStore.getState().resetPrototypeOverrides();
  });

  it("applies a cancelled override to getEventById and getEventDetail", async () => {
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-midnight-grooves", "cancelled");

    const event = await eventRepo.getEventById("evt-midnight-grooves", {
      latencyMs: 0,
    });
    expect(event?.status).toBe("cancelled");

    const detail = await eventRepo.getEventDetail("evt-midnight-grooves", {
      latencyMs: 0,
    });
    expect(detail?.event.status).toBe("cancelled");
  });

  it("applies a sold_out override to discovery search results", async () => {
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-rosebank-art-jazz", "sold_out");

    const results = await discoveryRepo.search(
      {
        query: "rosebank",
        filters: {
          category: null,
          date: "any",
          distanceKm: null,
          maxPriceMinor: null,
          availabilityOnly: false,
          liveOnly: false,
        },
      },
      { latencyMs: 0 },
    );

    expect(results.events[0]?.status).toBe("sold_out");
  });

  it("applies a live override to the map snapshot", async () => {
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-deep-house-rooftop", "live");

    const snapshot = await mapRepo.getSnapshot(
      {
        city: "Johannesburg",
        filters: {
          categories: [],
          statuses: [],
          distanceKm: null,
          freeOnly: false,
        },
        scenario: "normal",
      },
      { latencyMs: 0 },
    );

    const target = snapshot.events.find(
      (e) => e.id === "evt-deep-house-rooftop",
    );
    expect(target?.status).toBe("live");
  });

  it("clears the override back to the fixture status", async () => {
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-midnight-grooves", "completed");
    usePrototypeOverridesStore
      .getState()
      .setEventStatusOverride("evt-midnight-grooves", null);

    const event = await eventRepo.getEventById("evt-midnight-grooves", {
      latencyMs: 0,
    });
    expect(event?.status).not.toBe("completed");
  });
});

describe("Ticket status override", () => {
  it("persists a status change and affects wallet classification", async () => {
    const repo = new MockTicketingRepository(new InMemoryTicketingStorage());
    await repo.reset();

    const seedTicket = (await repo.listWalletTickets())[0];
    expect(seedTicket).toBeTruthy();

    const updated = await repo.setTicketStatus(seedTicket!.id, "used");
    expect(updated?.status).toBe("used");

    const fetched = await repo.getTicket(seedTicket!.id);
    expect(fetched?.status).toBe("used");

    expect(classifyWalletTicket(fetched!, DEMO_NOW_ISO)).toBe("past");

    const cancelled = await repo.setTicketStatus(seedTicket!.id, "cancelled");
    expect(cancelled?.status).toBe("cancelled");
  });

  it("returns null when the ticket does not exist", async () => {
    const repo = new MockTicketingRepository(new InMemoryTicketingStorage());
    await repo.reset();

    const result = await repo.setTicketStatus("ticket-missing", "valid");
    expect(result).toBeNull();
  });
});
