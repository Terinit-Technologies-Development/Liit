import { PublicHostProfile } from "../../domain/hosts/public-host";
import { Event } from "../../domain/events";
import { MockOptions } from "../../utils/mock-operation";

export interface HostRepository {
  getPublicProfile(
    hostId: string,
    options?: MockOptions,
  ): Promise<PublicHostProfile | null>;

  listUpcomingEvents(hostId: string, options?: MockOptions): Promise<Event[]>;
}
