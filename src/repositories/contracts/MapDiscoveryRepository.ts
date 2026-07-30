import { MapFilters, MapSnapshot } from "../../domain/map";
import { PrototypeScenario } from "../../state/useAppStore";
import { MockOptions } from "../../utils/mock-operation";

export interface MapDiscoveryRequest {
  city: "Johannesburg";
  filters: MapFilters;
  scenario: PrototypeScenario;
}

export interface MapDiscoveryRepository {
  getSnapshot(
    request: MapDiscoveryRequest,
    options?: MockOptions,
  ): Promise<MapSnapshot>;
}
