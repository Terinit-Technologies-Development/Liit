import { Event } from "../../domain/events";
import { EventDetailPayload } from "../../domain/event-detail";

export interface EventRepository {
  listFeaturedEvents(): Promise<Event[]>;
  listEventsByIds(ids: string[]): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  searchEvents(query: string): Promise<Event[]>;
  getEventDetail(id: string): Promise<EventDetailPayload | null>;
  listRelatedEvents(eventId: string, limit?: number): Promise<Event[]>;
}
