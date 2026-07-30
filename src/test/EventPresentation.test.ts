import {
  getEventDisplayStatus,
  toEventCardViewModel,
} from "../domain/discovery/event-presentation";
import { discoveryEvents } from "../fixtures/discovery/events";
import { DEMO_NOW_ISO } from "../fixtures/discovery/demo-clock";

describe("getEventDisplayStatus", () => {
  const baseEvent = discoveryEvents[0];

  it("prioritises cancellation", () => {
    expect(
      getEventDisplayStatus(
        { ...baseEvent, status: "cancelled" },
        DEMO_NOW_ISO,
      ),
    ).toBe("Cancelled");
  });

  it("derives free events", () => {
    expect(
      getEventDisplayStatus(
        { ...baseEvent, startingPriceMinor: 0 },
        DEMO_NOW_ISO,
      ),
    ).toBe("Free");
  });

  it("derives selling fast when remaining capacity ratio <= 20%", () => {
    expect(
      getEventDisplayStatus(
        { ...baseEvent, totalCapacity: 100, remainingTickets: 10 },
        DEMO_NOW_ISO,
      ),
    ).toBe("Selling Fast");
  });

  it("derives sold out when remaining tickets === 0", () => {
    expect(
      getEventDisplayStatus(
        { ...baseEvent, remainingTickets: 0 },
        DEMO_NOW_ISO,
      ),
    ).toBe("Sold Out");
  });

  it("derives live status during event occurrence window", () => {
    expect(
      getEventDisplayStatus({ ...baseEvent, status: "live" }, DEMO_NOW_ISO),
    ).toBe("Live");
  });
});

describe("toEventCardViewModel", () => {
  it("formats minor currency units once without double dividing", () => {
    const model = toEventCardViewModel(
      {
        ...discoveryEvents[0],
        startingPriceMinor: 25000,
        currency: "ZAR",
      },
      { nowIso: DEMO_NOW_ISO },
    );

    expect(model.priceLabel).toContain("250");
  });
});
