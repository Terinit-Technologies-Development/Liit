import {
  getWeekendRange,
  haversineKm,
  matchesDatePreset,
  mockDiscoveryRepository,
} from "../repositories/mock/MockDiscoveryRepository";
import { Event } from "../domain/events";

describe("Search Date & Distance Filtering Logic", () => {
  const baseEvent: Event = {
    id: "evt_test_01",
    title: "Friday Fest",
    tagline: "Weekend kick-off",
    description: "Friday evening vibes",
    category: "nightlife",
    status: "published",
    host: {
      id: "h1",
      name: "Host 1",
      handle: "h1",
      avatarUrl: "https://example.com/avatar.png",
      isVerified: true,
    },
    venue: {
      id: "v1",
      name: "Braam Rooftop",
      address: "Juta St",
      suburb: "Braamfontein",
      city: "Johannesburg",
      province: "Gauteng",
      latitude: -26.1929,
      longitude: 28.0373,
    },
    occurrence: {
      id: "occ1",
      startTime: "2026-07-31T18:00:00Z", // Friday Jul 31 20:00 SAST
      endTime: "2026-07-31T23:00:00Z",
      doorsOpen: "2026-07-31T17:00:00Z",
    },
    heroImageKey: "eventMidnightGrooves",
    galleryImageKeys: [],
    startingPriceMinor: 20000,
    currency: "ZAR",
    totalCapacity: 200,
    remainingTickets: 50,
  };

  it("matchesDatePreset correctly handles any, today, tomorrow, and this_weekend relative to fixture clock", () => {
    const nowIso = "2026-07-30T20:00:00.000Z"; // Thursday Jul 30

    expect(matchesDatePreset(baseEvent, "any", nowIso)).toBe(true);

    const todayEvent = {
      ...baseEvent,
      occurrence: {
        ...baseEvent.occurrence,
        startTime: "2026-07-30T18:00:00Z",
      },
    };
    expect(matchesDatePreset(todayEvent, "today", nowIso)).toBe(true);
    expect(matchesDatePreset(baseEvent, "today", nowIso)).toBe(false);

    const tomorrowEvent = {
      ...baseEvent,
      occurrence: {
        ...baseEvent.occurrence,
        startTime: "2026-07-31T18:00:00Z",
      },
    };
    expect(matchesDatePreset(tomorrowEvent, "tomorrow", nowIso)).toBe(true);

    expect(matchesDatePreset(baseEvent, "this_weekend", nowIso)).toBe(true);
  });

  it("calculates getWeekendRange accurately across Thursday, Friday, Saturday, and Sunday in Johannesburg timezone", () => {
    // Thursday Jul 30 2026 (SAST) -> Friday is Jul 31 00:00 SAST (Jul 30 22:00 UTC)
    const thursdayNow = "2026-07-30T20:00:00.000Z";
    const rangeThursday = getWeekendRange(thursdayNow);
    expect(new Date(rangeThursday.start).toISOString()).toBe(
      "2026-07-30T22:00:00.000Z",
    ); // Friday 00:00 SAST
    expect(new Date(rangeThursday.end).toISOString()).toBe(
      "2026-08-02T22:00:00.000Z",
    ); // Monday 00:00 SAST

    // Friday Jul 31 2026 14:00 SAST (12:00 UTC)
    const fridayNow = "2026-07-31T12:00:00.000Z";
    const rangeFriday = getWeekendRange(fridayNow);
    expect(rangeFriday.start).toBe(rangeThursday.start);

    // Saturday Aug 1 2026 14:00 SAST (12:00 UTC) -> retains current weekend
    const saturdayNow = "2026-08-01T12:00:00.000Z";
    const rangeSaturday = getWeekendRange(saturdayNow);
    expect(rangeSaturday.start).toBe(rangeThursday.start);

    // Sunday Aug 2 2026 14:00 SAST (12:00 UTC) -> retains current weekend
    const sundayNow = "2026-08-02T12:00:00.000Z";
    const rangeSunday = getWeekendRange(sundayNow);
    expect(rangeSunday.start).toBe(rangeThursday.start);
  });

  it("includes an event at 00:30 Friday SAST (Thursday 22:30 UTC)", () => {
    const nowIso = "2026-07-30T20:00:00.000Z"; // Thursday evening
    const earlyFridayEvent = {
      ...baseEvent,
      occurrence: {
        ...baseEvent.occurrence,
        startTime: "2026-07-30T22:30:00.000Z", // Friday 00:30 SAST
      },
    };

    expect(matchesDatePreset(earlyFridayEvent, "this_weekend", nowIso)).toBe(
      true,
    );
  });

  it("excludes an event occurring after 00:00 Monday SAST (Sunday 22:00 UTC)", () => {
    const nowIso = "2026-07-30T20:00:00.000Z";
    const mondayEvent = {
      ...baseEvent,
      occurrence: {
        ...baseEvent.occurrence,
        startTime: "2026-08-02T22:05:00.000Z", // Monday 00:05 SAST
      },
    };

    expect(matchesDatePreset(mondayEvent, "this_weekend", nowIso)).toBe(false);
  });

  it("excludes a future weekend event beyond the current weekend interval", () => {
    const nowIso = "2026-07-30T20:00:00.000Z"; // Thursday Jul 30
    const futureWeekendEvent = {
      ...baseEvent,
      occurrence: {
        ...baseEvent.occurrence,
        startTime: "2026-08-14T18:00:00Z", // 2 weeks later
      },
    };

    expect(matchesDatePreset(futureWeekendEvent, "this_weekend", nowIso)).toBe(
      false,
    );
  });

  it("calculates metric distance accurately using haversine formula", () => {
    const jhbCentre = { latitude: -26.2041, longitude: 28.0473 };
    const braam = { latitude: -26.1929, longitude: 28.0373 };

    const distance = haversineKm(jhbCentre, braam);
    expect(distance).toBeGreaterThan(0.5);
    expect(distance).toBeLessThan(5.0);
  });

  it("filters search results by distance and date presets", async () => {
    const searchDateResult = await mockDiscoveryRepository.search({
      query: "",
      filters: {
        category: null,
        date: "this_weekend",
        distanceKm: 10,
        maxPriceMinor: null,
        availabilityOnly: false,
        liveOnly: false,
      },
    });

    expect(searchDateResult.events.length).toBeGreaterThan(0);
    searchDateResult.events.forEach((evt) => {
      const dist = haversineKm(
        { latitude: -26.2041, longitude: 28.0473 },
        evt.venue,
      );
      expect(dist).toBeLessThanOrEqual(10);
    });
  });
});
