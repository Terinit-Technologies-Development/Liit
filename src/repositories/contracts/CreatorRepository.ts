import {
  CreatorProfile,
  CreatorEventSummary,
  PayoutSummary,
} from "../../domain/creator";

export interface CreatorRepository {
  getCreatorProfile(): Promise<CreatorProfile>;
  getCreatorEvents(): Promise<CreatorEventSummary[]>;
  getPayouts(): Promise<PayoutSummary[]>;
}
