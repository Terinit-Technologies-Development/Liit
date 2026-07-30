import { EventRepository } from "../contracts/EventRepository";
import { Event } from "../../domain/events";
import { EventDetailPayload } from "../../domain/event-detail";
import { discoveryEvents } from "../../fixtures/discovery";
import { eventDetailById } from "../../fixtures/event-detail";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockEventRepository implements EventRepository {
  private events: Event[] = [...discoveryEvents];

  async listFeaturedEvents(options?: MockOptions): Promise<Event[]> {
    return simulateMockOperation(() => this.events, options);
  }

  async getEventById(id: string, options?: MockOptions): Promise<Event | null> {
    return simulateMockOperation(() => {
      return this.events.find((e) => e.id === id) || null;
    }, options);
  }

  async searchEvents(query: string, options?: MockOptions): Promise<Event[]> {
    return simulateMockOperation(() => {
      const q = query.toLowerCase();
      return this.events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.city.toLowerCase().includes(q),
      );
    }, options);
  }

  async getEventDetail(
    id: string,
    options?: MockOptions,
  ): Promise<EventDetailPayload | null> {
    return simulateMockOperation(() => {
      const event = this.events.find((item) => item.id === id);
      const detail = eventDetailById[id];

      if (!event || !detail) {
        return null;
      }

      return {
        event,
        ...JSON.parse(JSON.stringify(detail)),
      };
    }, options);
  }

  async listRelatedEvents(
    eventId: string,
    limit = 4,
    options?: MockOptions,
  ): Promise<Event[]> {
    return simulateMockOperation(() => {
      const detail = eventDetailById[eventId];
      if (!detail) {
        return [];
      }

      return detail.relatedEventIds
        .map((id) => this.events.find((event) => event.id === id))
        .filter((event): event is Event => Boolean(event))
        .slice(0, limit);
    }, options);
  }
}

export const mockEventRepository = new MockEventRepository();
