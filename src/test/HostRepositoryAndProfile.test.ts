import { mockHostRepository } from "../repositories/mock/MockHostRepository";

describe("MockHostRepository & Host Profiles", () => {
  it("returns public host profile with metrics and highlights for host-1", async () => {
    const profile = await mockHostRepository.getPublicProfile("host-1");
    expect(profile).not.toBeNull();
    expect(profile?.host.name).toBe("Groove Co.");
    expect(profile?.metrics.length).toBeGreaterThan(0);
    expect(profile?.upcomingEventIds).toEqual([
      "evt-midnight-grooves",
      "evt-deep-house-rooftop",
    ]);
  });

  it("lists upcoming events for host-1 resolved against canonical discovery events", async () => {
    const events = await mockHostRepository.listUpcomingEvents("host-1");
    expect(events.length).toBe(2);
    expect(events[0].id).toBe("evt-midnight-grooves");
  });

  it("returns host profile with no upcoming events for host-4", async () => {
    const profile = await mockHostRepository.getPublicProfile("host-4");
    expect(profile).not.toBeNull();
    expect(profile?.upcomingEventIds).toEqual([]);

    const events = await mockHostRepository.listUpcomingEvents("host-4");
    expect(events).toEqual([]);
  });

  it("returns null for non-existent host ID", async () => {
    const profile = await mockHostRepository.getPublicProfile("host-invalid");
    expect(profile).toBeNull();
  });
});
