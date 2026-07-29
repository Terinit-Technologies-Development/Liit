import { mockEvents } from "../fixtures";

describe("SavedEventsFiltering", () => {
  it("correctly filters events with isSaved true", () => {
    const saved = mockEvents.filter((e) => e.isSaved);
    const unsaved = mockEvents.filter((e) => !e.isSaved);

    expect(saved.length).toBeGreaterThan(0);
    expect(saved.every((e) => e.isSaved === true)).toBe(true);

    expect(unsaved.length).toBeGreaterThan(0);
    expect(unsaved.every((e) => !e.isSaved)).toBe(true);
  });
});
