import { ImageAssetKey } from "../../assets/image-registry";
import { HostSummary } from "../events";

export interface HostMetric {
  id: "followers" | "rating" | "events_hosted";
  label: string;
  value: string;
}

export interface HostHighlight {
  id: string;
  title: string;
  imageKey: ImageAssetKey;
  caption: string;
}

export interface PublicHostProfile {
  host: HostSummary;
  coverImageKey: ImageAssetKey;
  bio: string;
  metrics: HostMetric[];
  upcomingEventIds: string[];
  pastHighlights: HostHighlight[];
}
