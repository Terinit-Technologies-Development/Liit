import { mockEventRepository } from "../repositories/mock/MockEventRepository";
import { getEventConversionModel } from "../domain/event-detail/conversion-model";
import { eventDetailById } from "../fixtures/event-detail";
import { discoveryEvents, DEMO_NOW_ISO } from "../fixtures/discovery";
import { getEventDisplayStatus } from "../domain/discovery/event-presentation";

describe.each([
  ["paid", "evt-midnight-grooves", "Choose tickets"],
  ["free", "evt-soweto-food-market", "Register free"],
  ["live", "evt-amapiano-fest", "Choose tickets"],
  ["sold out", "evt-deep-house-rooftop", "Join waitlist"],
  ["completed", "evt-completed-highlight", null],
])("%s Event Detail", (_label, eventId, expectedAction) => {
  it("derives the expected conversion action", async () => {
    const detail = await mockEventRepository.getEventDetail(eventId);
    expect(detail).not.toBeNull();

    const model = getEventConversionModel(detail!);
    expect(model.primaryLabel).toBe(expectedAction);
  });
});

describe.each([
  ["evt-amapiano-fest", "Live", "paid", "Choose tickets"],
  ["evt-deep-house-rooftop", "Sold Out", "waitlist", "Join waitlist"],
  ["evt-completed-highlight", "Completed", "none", null],
])(
  "%s canonical state",
  (eventId, expectedStatus, expectedMode, expectedAction) => {
    it("keeps status and conversion consistent", async () => {
      const detail = await mockEventRepository.getEventDetail(eventId);
      expect(detail).not.toBeNull();

      expect(getEventDisplayStatus(detail!.event, DEMO_NOW_ISO)).toBe(
        expectedStatus,
      );

      const conversion = getEventConversionModel(detail!);
      expect(conversion.mode).toBe(expectedMode);
      expect(conversion.primaryLabel).toBe(expectedAction);
    });
  },
);

describe("Event Detail Fixtures Integrity", () => {
  it("ensures event detail payload references canonical Event fixtures rather than duplicating them", () => {
    const canonicalIds = discoveryEvents.map((e) => e.id);
    const detailIds = Object.keys(eventDetailById);

    detailIds.forEach((id) => {
      if (id !== "evt-completed-highlight") {
        expect(canonicalIds).toContain(id);
      }
    });
  });
});
