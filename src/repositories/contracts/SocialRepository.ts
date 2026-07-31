import {
  Comment,
  Conversation,
  ConversationKind,
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
  listComments(eventId: string): Promise<Comment[]>;
  postComment(input: PostCommentInput): Promise<Comment>;
  retryComment(commentId: string): Promise<Comment>;
  toggleCommentReaction(commentId: string): Promise<Comment>;
  reportContent(
    input: ReportContentInput,
  ): Promise<{ success: boolean; reportId: string }>;
  listMessageRecipients(query?: string): Promise<MessageRecipient[]>;
  reset(): Promise<void>;
}
