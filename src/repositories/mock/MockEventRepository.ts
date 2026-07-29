import { EventRepository } from "../contracts/EventRepository";
import { Event } from "../../domain/events";
import { mockEvents } from "../../fixtures";
import { simulateMockOperation, MockOptions } from "../../utils/mock-operation";

export class MockEventRepository implements EventRepository {
  private events: Event[] = [...mockEvents];

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
}

export const mockEventRepository = new MockEventRepository();
