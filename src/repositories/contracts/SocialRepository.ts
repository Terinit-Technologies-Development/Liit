import { ConversationSummary } from "../../domain/social";

export interface SocialRepository {
  listConversations(): Promise<ConversationSummary[]>;
}
