import {
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
      startTime: "2026-07-31T18:00:00Z", // Friday
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

  it("matchesDatePreset correctly handles any, today, tomorrow, and this_weekend", () => {
    const nowIso = "2026-07-30T20:00:00.000Z"; // Thursday

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
