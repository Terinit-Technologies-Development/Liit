import { MapFilters, MapSnapshot } from "../../domain/map";
import { Event } from "../../domain/events";
import { discoveryEvents } from "../../fixtures/discovery";
import { mapEventPoints } from "../../fixtures/map";
import { MockOptions, simulateMockOperation } from "../../utils/mock-operation";
import { PrototypeScenario } from "../../state/useAppStore";
import {
  MapDiscoveryRepository,
  MapDiscoveryRequest,
} from "../contracts/MapDiscoveryRepository";
import { applyEventStatusOverrides } from "../../state/usePrototypeOverridesStore";

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

function applyMapScenario(
  events: Event[],
  scenario: PrototypeScenario,
): Event[] {
  if (scenario === "sold_out") {
    return events.map((event, index) =>
      index === 0
        ? {
            ...event,
            status: "sold_out",
            remainingTickets: 0,
          }
        : event,
    );
  }

  if (scenario === "live_event") {
    return events.map((event, index) =>
      index === 0
        ? {
            ...event,
            status: "live",
            occurrence: {
              ...event.occurrence,
              startTime: "2026-07-30T19:00:00.000Z",
              endTime: "2026-07-30T23:59:00.000Z",
            },
          }
        : event,
    );
  }

  return events;
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
          events: [],
          points: [],
          eventIds: [],
        };
      }

      const baseEvents = applyEventStatusOverrides(
        applyMapScenario(discoveryEvents, request.scenario),
      );

      const candidateEvents = baseEvents.filter((event) =>
        matchesMapFilters(event, request.filters),
      );

      const candidateIds = new Set(candidateEvents.map((event) => event.id));

      const points = mapEventPoints.filter((point) => {
        if (!candidateIds.has(point.eventId)) {
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

      const visibleEventIds = points.map((point) => point.eventId);
      const visibleEventIdSet = new Set(visibleEventIds);

      const visibleEvents = candidateEvents.filter((event) =>
        visibleEventIdSet.has(event.id),
      );

      return {
        city: "Johannesburg",
        events: visibleEvents,
        eventIds: visibleEventIds,
        points,
      };
    }, options);
  }
}

export const mockMapDiscoveryRepository = new MockMapDiscoveryRepository();
