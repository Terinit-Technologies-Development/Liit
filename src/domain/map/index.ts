import { Event, EventCategory } from "../events";

export type MapDisplayMode = "map" | "list";

export type MapLocationState = "available" | "disabled" | "manual_city";

export type MapPinVisualState = "default" | "selected" | "live" | "sold_out";

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapViewport {
  centre: GeoCoordinate;
  zoom: 1 | 2 | 3;
}

export interface MapFilters {
  categories: EventCategory[];
  statuses: ("live" | "available" | "sold_out")[];
  distanceKm: 5 | 10 | 25 | 50 | null;
  freeOnly: boolean;
}

export interface MapEventPoint {
  id: string;
  eventId: string;
  coordinate: GeoCoordinate;
  clusterKey?: string;
  distanceKm: number;
}

export interface MapClusterNode {
  id: string;
  kind: "cluster";
  coordinate: GeoCoordinate;
  count: number;
  eventIds: string[];
}

export interface MapEventNode {
  id: string;
  kind: "event";
  eventId: string;
  coordinate: GeoCoordinate;
}

export type MapRenderNode = MapClusterNode | MapEventNode;

export interface MapSnapshot {
  city: "Johannesburg";
  events: Event[];
  eventIds: string[];
  points: MapEventPoint[];
}

export const JOHANNESBURG_BOUNDS = {
  north: -26.15,
  south: -26.25,
  west: 28.0,
  east: 28.1,
} as const;
