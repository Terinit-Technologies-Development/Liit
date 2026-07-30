import {
  MapAdapter,
  MapBounds,
  MapCanvasSize,
  ProjectedPoint,
} from "./MapAdapter";
import { GeoCoordinate, MapRenderNode, MapViewport } from "../../domain/map";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class MockMapAdapter implements MapAdapter {
  project(
    coordinate: GeoCoordinate,
    bounds: MapBounds,
    size: MapCanvasSize,
  ): ProjectedPoint {
    const longitudeRatio =
      (coordinate.longitude - bounds.west) / (bounds.east - bounds.west);

    const latitudeRatio =
      (bounds.north - coordinate.latitude) / (bounds.north - bounds.south);

    return {
      x: clamp(longitudeRatio * size.width, 0, size.width),
      y: clamp(latitudeRatio * size.height, 0, size.height),
    };
  }

  buildRenderNodes(
    points: {
      id: string;
      eventId: string;
      coordinate: GeoCoordinate;
      clusterKey?: string;
    }[],
    viewport: MapViewport,
  ): MapRenderNode[] {
    if (viewport.zoom >= 3) {
      return points.map((point) => ({
        id: point.id,
        kind: "event",
        eventId: point.eventId,
        coordinate: point.coordinate,
      }));
    }

    const groups = new Map<string, typeof points>();

    for (const point of points) {
      const key = point.clusterKey ?? point.eventId;
      groups.set(key, [...(groups.get(key) ?? []), point]);
    }

    return [...groups.entries()].map(([key, grouped]) => {
      if (grouped.length === 1) {
        const [point] = grouped;
        return {
          id: point.id,
          kind: "event",
          eventId: point.eventId,
          coordinate: point.coordinate,
        };
      }

      const latitude =
        grouped.reduce((sum, point) => sum + point.coordinate.latitude, 0) /
        grouped.length;

      const longitude =
        grouped.reduce((sum, point) => sum + point.coordinate.longitude, 0) /
        grouped.length;

      return {
        id: `cluster-${key}`,
        kind: "cluster",
        count: grouped.length,
        eventIds: grouped.map((point) => point.eventId),
        coordinate: {
          latitude,
          longitude,
        },
      };
    });
  }
}

export const mockMapAdapter = new MockMapAdapter();
