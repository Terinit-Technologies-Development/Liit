import {
  Comment,
  Conversation,
  ConversationKind,
  Message,
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
  markConversationRead(conversationId: string): Promise<void>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  listComments(eventId: string): Promise<Comment[]>;
  postComment(input: PostCommentInput): Promise<Comment>;
  toggleCommentReaction(commentId: string): Promise<Comment>;
  reportContent(
    input: ReportContentInput,
  ): Promise<{ success: boolean; reportId: string }>;
  reset(): Promise<void>;
}
