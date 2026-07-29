/**
 * Social Domain Models
 */

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  content: string;
  sentAt: string;
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
