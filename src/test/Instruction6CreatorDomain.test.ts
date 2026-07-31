import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";

describe("LIIT Instruction 6: Creator Domain", () => {
  it("should have correct profile fields", async () => {
    const profile = await mockCreatorRepository.getCreatorProfile();
    expect(profile.brandName).toBeDefined();
    expect(profile.bio).toBeDefined();
    expect(profile.totalEventsHosted).toBeGreaterThanOrEqual(0);
    expect(profile.totalTicketsSold).toBeGreaterThanOrEqual(0);
  });

  it("should have events with stats", async () => {
    const events = await mockCreatorRepository.getCreatorEvents();
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];
    expect(event.title).toBeDefined();
    expect(event.status).toMatch(/draft|published|live|completed|cancelled/);
    expect(event.ticketsSold).toBeDefined();
    expect(event.totalCapacity).toBeDefined();
  });

  it("should have payouts overview", async () => {
    const overview = await mockCreatorRepository.getPayoutsOverview();
    expect(overview.availableMinor).toBeDefined();
    expect(overview.currency).toBeDefined();
  });
});
