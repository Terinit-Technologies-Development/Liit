import {
  Comment,
  Conversation,
  ConversationKind,
  HostInquiryConversation,
  Message,
  MessageRecipient,
  PostCommentInput,
  ReportContentInput,
  SendMessageInput,
} from "../../domain/social";

export interface SocialRepositoryState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  comments: Comment[];
  blockedUserIds: string[];
  failedCommentAttempts?: Record<string, boolean>;
  simulatedReplyConversationIds?: string[];
}

export interface GetOrCreateInquiryContextInput {
  hostId: string;
  eventId?: string;
}

export interface SocialRepository {
  listConversations(kind?: ConversationKind): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  listMessages(conversationId: string): Promise<Message[]>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  retryMessage(conversationId: string, messageId: string): Promise<Message>;
  markConversationRead(conversationId: string): Promise<void>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  closeInquiry(conversationId: string): Promise<void>;
  /**
   * Deterministically resolves (and lazily creates) the canonical local
   * inquiry conversation for a host, optionally scoped to an event. Repeated
   * calls with the same host/event return the same conversation.
   */
  getOrCreateInquiryContext(
    input: GetOrCreateInquiryContextInput,
  ): Promise<HostInquiryConversation>;
  /**
   * Orchestrates the simulated host reply for an inquiry: shows the typing
   * indicator, waits, then appends the once-per-reset canned reply.
   */
  maybeSchedulePrototypeHostReply(
    conversationId: string,
  ): Promise<Message | null>;
  listComments(eventId: string): Promise<Comment[]>;
  postComment(input: PostCommentInput): Promise<Comment>;
  retryComment(commentId: string): Promise<Comment>;
  toggleCommentReaction(commentId: string): Promise<Comment>;
  reportContent(
    input: ReportContentInput,
  ): Promise<{ success: boolean; reportId: string }>;
  listMessageRecipients(query?: string): Promise<MessageRecipient[]>;
  simulateHostReply(conversationId: string): Promise<Message | null>;
  reset(): Promise<void>;
}
