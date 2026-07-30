import { HostRepository } from "../contracts/HostRepository";
import { PublicHostProfile } from "../../domain/hosts/public-host";
import { Event } from "../../domain/events";
import { publicHostProfiles } from "../../fixtures/hosts";
import { discoveryEvents } from "../../fixtures/discovery";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockHostRepository implements HostRepository {
  async getPublicProfile(
    hostId: string,
    options?: MockOptions,
  ): Promise<PublicHostProfile | null> {
    return simulateMockOperation(() => {
      const profile = publicHostProfiles[hostId];
      if (!profile) {
        return null;
      }
      return JSON.parse(JSON.stringify(profile));
    }, options);
  }

  async listUpcomingEvents(
    hostId: string,
    options?: MockOptions,
  ): Promise<Event[]> {
    return simulateMockOperation(() => {
      const profile = publicHostProfiles[hostId];
      if (!profile || !profile.upcomingEventIds) {
        return [];
      }

      return profile.upcomingEventIds
        .map((id) => discoveryEvents.find((evt) => evt.id === id))
        .filter((evt): evt is Event => Boolean(evt));
    }, options);
  }
}

export const mockHostRepository = new MockHostRepository();
