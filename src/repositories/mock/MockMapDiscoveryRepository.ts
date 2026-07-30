import { MapFilters, MapSnapshot } from "../../domain/map";
import { Event } from "../../domain/events";
import { discoveryEvents } from "../../fixtures/discovery";
import { mapEventPoints } from "../../fixtures/map";
import { MockOptions, simulateMockOperation } from "../../utils/mock-operation";
import {
  MapDiscoveryRepository,
  MapDiscoveryRequest,
} from "../contracts/MapDiscoveryRepository";

function matchesMapFilters(event: Event, filters: MapFilters): boolean {
  if (
    filters.categories.length > 0 &&
    !filters.categories.includes(event.category)
  ) {
    return false;
  }

  if (filters.freeOnly && event.startingPriceMinor > 0) {
    return false;
  }

  if (filters.statuses.length > 0) {
    const isLive = event.status === "live";
    const isSoldOut = event.status === "sold_out";
    const isAvailable =
      event.status === "published" && event.remainingTickets > 0;

    const matches = filters.statuses.some((st) => {
      if (st === "live") return isLive;
      if (st === "sold_out") return isSoldOut;
      if (st === "available") return isAvailable;
      return false;
    });

    if (!matches) return false;
  }

  return true;
}

export class MockMapDiscoveryRepository implements MapDiscoveryRepository {
  async getSnapshot(
    request: MapDiscoveryRequest,
    options?: MockOptions,
  ): Promise<MapSnapshot> {
    return simulateMockOperation(() => {
      if (request.scenario === "map_no_results") {
        return {
          city: "Johannesburg",
          points: [],
          eventIds: [],
        };
      }

      const filteredEvents = discoveryEvents.filter((event) =>
        matchesMapFilters(event, request.filters),
      );

      const eventIds = filteredEvents.map((event) => event.id);

      const points = mapEventPoints.filter((point) => {
        if (!eventIds.includes(point.eventId)) {
          return false;
        }

        if (
          request.filters.distanceKm !== null &&
          point.distanceKm > request.filters.distanceKm
        ) {
          return false;
        }

        return true;
      });

      return {
        city: "Johannesburg",
        eventIds: points.map((p) => p.eventId),
        points,
      };
    }, options);
  }
}

export const mockMapDiscoveryRepository = new MockMapDiscoveryRepository();
