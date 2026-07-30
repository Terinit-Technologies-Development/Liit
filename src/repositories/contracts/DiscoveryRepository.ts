import {
  DiscoverySearchInput,
  DiscoverySearchResult,
  ExplorePayload,
  ExploreRequest,
  FeedPage,
  FeedRequest,
} from "../../domain/discovery";
import { MockOptions } from "../../utils/mock-operation";

export interface DiscoveryRepository {
  getFeed(request: FeedRequest, options?: MockOptions): Promise<FeedPage>;
  getExplore(
    request: ExploreRequest,
    options?: MockOptions,
  ): Promise<ExplorePayload>;
  search(
    input: DiscoverySearchInput,
    options?: MockOptions,
  ): Promise<DiscoverySearchResult>;
}
