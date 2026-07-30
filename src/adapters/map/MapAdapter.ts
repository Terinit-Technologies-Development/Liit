import { GeoCoordinate, MapRenderNode, MapViewport } from "../../domain/map";

export interface MapCanvasSize {
  width: number;
  height: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapAdapter {
  project(
    coordinate: GeoCoordinate,
    bounds: MapBounds,
    size: MapCanvasSize,
  ): ProjectedPoint;

  buildRenderNodes(
    points: {
      id: string;
      eventId: string;
      coordinate: GeoCoordinate;
      clusterKey?: string;
    }[],
    viewport: MapViewport,
  ): MapRenderNode[];
}
