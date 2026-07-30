import { mockHostRepository } from "../repositories/mock/MockHostRepository";
import { discoveryEvents } from "../fixtures/discovery";

describe("MockHostRepository & Host Profiles", () => {
  it("resolves every Event host through the public Host repository", async () => {
    const uniqueHostIds = [
      ...new Set(discoveryEvents.map((event) => event.host.id)),
    ];

    for (const hostId of uniqueHostIds) {
      const profile = await mockHostRepository.getPublicProfile(hostId);
      expect(profile).not.toBeNull();
      expect(profile?.host.id).toBe(hostId);
    }
  });

  it("returns public host profile with metrics and highlights for host-groove-co", async () => {
    const profile = await mockHostRepository.getPublicProfile("host-groove-co");
    expect(profile).not.toBeNull();
    expect(profile?.host.name).toBe("Groove Co.");
    expect(profile?.metrics.length).toBeGreaterThan(0);
    expect(profile?.upcomingEventIds).toEqual([
      "evt-midnight-grooves",
      "evt-deep-house-rooftop",
    ]);
  });

  it("lists upcoming events for host-groove-co resolved against canonical discovery events", async () => {
    const events =
      await mockHostRepository.listUpcomingEvents("host-groove-co");
    expect(events.length).toBe(2);
    expect(events[0].id).toBe("evt-midnight-grooves");
  });

  it("returns host profile with no upcoming events for host-amapiano-pulse", async () => {
    const profile = await mockHostRepository.getPublicProfile(
      "host-amapiano-pulse",
    );
    expect(profile).not.toBeNull();
    expect(profile?.upcomingEventIds).toEqual([]);

    const events = await mockHostRepository.listUpcomingEvents(
      "host-amapiano-pulse",
    );
    expect(events).toEqual([]);
  });

  it("returns null for non-existent host ID", async () => {
    const profile = await mockHostRepository.getPublicProfile("host-invalid");
    expect(profile).toBeNull();
  });
});
