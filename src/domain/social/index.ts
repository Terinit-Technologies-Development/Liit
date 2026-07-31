/**
 * Social & Messaging Domain Models (LIIT Instruction 5)
 */

export type MessageStatus = "sent" | "delivered" | "read" | "failed";
export type MessageSenderType = "consumer" | "host" | "system";
export type ConversationKind = "direct" | "inquiry";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  senderType: MessageSenderType;
  content: string;
  sentAt: string;
  status: MessageStatus;
  isIncoming: boolean;
}

export interface DirectConversation {
  id: string;
  kind: "direct";
  participantId: string;
  participantName: string;
  participantAvatarUrl: string;
  participantHandle: string;
  isOnline: boolean;
  lastSeenText?: string;
  isBlocked?: boolean;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface EventInquiryContext {
  eventId: string;
  eventTitle: string;
  eventDateText: string;
  eventVenueText: string;
  eventImageKey: string;
  bookingOffer?: {
    id: string;
    tierId: string;
    tierName: string;
    priceMinor: number;
    currency: string;
    description: string;
  };
}

export interface HostInquiryConversation {
  id: string;
  kind: "inquiry";
  hostId: string;
  hostName: string;
  hostAvatarUrl: string;
  hostHandle: string;
  isVerified: boolean;
  typicalReplyTime: string;
  eventContext: EventInquiryContext;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
  isClosed?: boolean;
}

export type Conversation = DirectConversation | HostInquiryConversation;

export interface Comment {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  postedAt: string;
  reactionsCount: number;
  userReacted: boolean;
  status?: "optimistic" | "synced" | "failed";
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

export interface PostCommentInput {
  eventId: string;
  content: string;
}

export interface ReportContentInput {
  targetKind: "event" | "host" | "comment" | "message" | "user";
  targetId: string;
  reason: string;
  details?: string;
}

export interface ConversationSummary {
  id: string;
  participantNames: string[];
  participantAvatarUrls: string[];
  lastMessage: Message;
  unreadCount: number;
}

export interface FollowState {
  targetProfileId: string;
  isFollowing: boolean;
}

export interface SavedEventState {
  eventId: string;
  isSaved: boolean;
  savedAt?: string;
}
