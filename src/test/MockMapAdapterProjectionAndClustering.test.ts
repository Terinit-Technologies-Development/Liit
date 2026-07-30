import { mockMapAdapter } from "../adapters/map/MockMapAdapter";
import { JOHANNESBURG_BOUNDS, MapViewport } from "../domain/map";
import { mapEventPoints } from "../fixtures/map";

describe("MockMapAdapter Projection & Clustering", () => {
  it("projects Johannesburg coordinates inside the canvas dimensions", () => {
    const point = mockMapAdapter.project(
      {
        latitude: -26.2041,
        longitude: 28.0473,
      },
      JOHANNESBURG_BOUNDS,
      {
        width: 400,
        height: 700,
      },
    );

    expect(point.x).toBeGreaterThanOrEqual(0);
    expect(point.x).toBeLessThanOrEqual(400);
    expect(point.y).toBeGreaterThanOrEqual(0);
    expect(point.y).toBeLessThanOrEqual(700);
  });

  it("projects every Map fixture inside a safe canvas margin", () => {
    const width = 400;
    const height = 700;
    const margin = 24;

    for (const fixture of mapEventPoints) {
      const point = mockMapAdapter.project(
        fixture.coordinate,
        JOHANNESBURG_BOUNDS,
        {
          width,
          height,
        },
      );

      expect(point.x).toBeGreaterThanOrEqual(margin);
      expect(point.x).toBeLessThanOrEqual(width - margin);
      expect(point.y).toBeGreaterThanOrEqual(margin);
      expect(point.y).toBeLessThanOrEqual(height - margin);
    }
  });

  it("clusters points sharing clusterKey at zoom levels 1 and 2", () => {
    const points = [
      {
        id: "p1",
        eventId: "e1",
        coordinate: { latitude: -26.19, longitude: 28.03 },
        clusterKey: "braam",
      },
      {
        id: "p2",
        eventId: "e2",
        coordinate: { latitude: -26.195, longitude: 28.035 },
        clusterKey: "braam",
      },
      {
        id: "p3",
        eventId: "e3",
        coordinate: { latitude: -26.24, longitude: 27.9 },
        clusterKey: "soweto",
      },
    ];

    const viewportZoom2: MapViewport = {
      centre: { latitude: -26.2, longitude: 28.0 },
      zoom: 2,
    };

    const nodes = mockMapAdapter.buildRenderNodes(points, viewportZoom2);

    expect(nodes.length).toBe(2);
    const braamCluster = nodes.find((n) => n.id === "cluster-braam");
    expect(braamCluster).toBeDefined();
    if (braamCluster && braamCluster.kind === "cluster") {
      expect(braamCluster.count).toBe(2);
      expect(braamCluster.eventIds).toEqual(["e1", "e2"]);
    }
  });

  it("returns individual event nodes at zoom level 3", () => {
    const points = [
      {
        id: "p1",
        eventId: "e1",
        coordinate: { latitude: -26.19, longitude: 28.03 },
        clusterKey: "braam",
      },
      {
        id: "p2",
        eventId: "e2",
        coordinate: { latitude: -26.195, longitude: 28.035 },
        clusterKey: "braam",
      },
    ];

    const viewportZoom3: MapViewport = {
      centre: { latitude: -26.2, longitude: 28.0 },
      zoom: 3,
    };

    const nodes = mockMapAdapter.buildRenderNodes(points, viewportZoom3);

    expect(nodes.length).toBe(2);
    expect(nodes.every((n) => n.kind === "event")).toBe(true);
  });
});
