import { Event } from "../../domain/events";

export interface EventRepository {
  listFeaturedEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  searchEvents(query: string): Promise<Event[]>;
}
