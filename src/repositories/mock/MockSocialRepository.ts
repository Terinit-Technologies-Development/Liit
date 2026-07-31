import AsyncStorage from "@react-native-async-storage/async-storage";
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
import {
  SocialRepository,
  SocialRepositoryState,
} from "../contracts/SocialRepository";
import {
  seedComments,
  seedDirectConversations,
  seedInquiryConversations,
  seedMessagesMap,
} from "../../fixtures/social/conversations";

const STORAGE_KEY = "liit-social-state-v1";

function createSeedSocialState(): SocialRepositoryState {
  return {
    conversations: [
      ...structuredClone(seedDirectConversations),
      ...structuredClone(seedInquiryConversations),
    ],
    messages: structuredClone(seedMessagesMap),
    comments: structuredClone(seedComments),
    blockedUserIds: ["usr-sipho-mthethwa"],
  };
}

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockSocialRepository implements SocialRepository {
  private mutationQueue: Promise<void> = Promise.resolve();

  private runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutationQueue.then(operation, operation);
    this.mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async loadState(): Promise<SocialRepositoryState> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          conversations: parsed.conversations ?? [],
          messages: parsed.messages ?? {},
          comments: parsed.comments ?? [],
          blockedUserIds: parsed.blockedUserIds ?? [],
        };
      }
    } catch {
      // Fallback on error
    }
    const seeded = createSeedSocialState();
    await this.saveState(seeded);
    return seeded;
  }

  private async saveState(state: SocialRepositoryState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors in test/fallback
    }
  }

  async listConversations(kind?: ConversationKind): Promise<Conversation[]> {
    await delayMs(200);
    const state = await this.loadState();
    let list = state.conversations;
    if (kind) {
      list = list.filter((c) => c.kind === kind);
    }
    // Sort by updatedAt descending
    list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return structuredClone(list);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    await delayMs(150);
    const state = await this.loadState();
    const found = state.conversations.find((c) => c.id === id) ?? null;
    return found ? structuredClone(found) : null;
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    await delayMs(200);
    const state = await this.loadState();
    const msgs = state.messages[conversationId] ?? [];
    return structuredClone(msgs);
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    return this.runExclusive(async () => {
      await delayMs(300);
      const state = await this.loadState();

      const conv = state.conversations.find(
        (c) => c.id === input.conversationId,
      );
      if (!conv) {
        throw new Error("Conversation not found");
      }

      const targetId =
        conv.kind === "direct" ? conv.participantId : conv.hostId;

      if (state.blockedUserIds.includes(targetId) || conv.isBlocked) {
        throw new Error("Conversation is blocked");
      }

      if (conv.kind === "inquiry" && conv.isClosed) {
        throw new Error("Inquiry is closed");
      }

      const now = new Date().toISOString();

      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        conversationId: input.conversationId,
        senderId: "usr-001",
        senderName: "Keketso",
        senderAvatarUrl: "userAvatarDefault",
        senderType: "consumer",
        content: input.content,
        sentAt: now,
        status: "delivered",
        isIncoming: false,
      };

      if (!state.messages[input.conversationId]) {
        state.messages[input.conversationId] = [];
      }
      state.messages[input.conversationId].push(newMessage);

      conv.lastMessage = newMessage;
      conv.updatedAt = now;

      await this.saveState(state);
      return structuredClone(newMessage);
    });
  }

  async retryMessage(
    conversationId: string,
    messageId: string,
  ): Promise<Message> {
    return this.runExclusive(async () => {
      await delayMs(200);
      const state = await this.loadState();
      const msgs = state.messages[conversationId] ?? [];
      const msg = msgs.find((m) => m.id === messageId);
      if (!msg) {
        throw new Error("Message not found");
      }

      msg.status = "delivered";
      await this.saveState(state);
      return structuredClone(msg);
    });
  }

  async markConversationRead(conversationId: string): Promise<void> {
    return this.runExclusive(async () => {
      const state = await this.loadState();
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.unreadCount = 0;
        await this.saveState(state);
      }
    });
  }

  async blockUser(userId: string): Promise<void> {
    return this.runExclusive(async () => {
      const state = await this.loadState();
      if (!state.blockedUserIds.includes(userId)) {
        state.blockedUserIds.push(userId);
      }
      state.conversations.forEach((c) => {
        const matches =
          (c.kind === "direct" && c.participantId === userId) ||
          (c.kind === "inquiry" && c.hostId === userId);
        if (matches) {
          c.isBlocked = true;
        }
      });
      await this.saveState(state);
    });
  }

  async unblockUser(userId: string): Promise<void> {
    return this.runExclusive(async () => {
      const state = await this.loadState();
      state.blockedUserIds = state.blockedUserIds.filter((id) => id !== userId);
      state.conversations.forEach((c) => {
        const matches =
          (c.kind === "direct" && c.participantId === userId) ||
          (c.kind === "inquiry" && c.hostId === userId);
        if (matches) {
          c.isBlocked = false;
        }
      });
      await this.saveState(state);
    });
  }

  async closeInquiry(conversationId: string): Promise<void> {
    return this.runExclusive(async () => {
      const state = await this.loadState();
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv && conv.kind === "inquiry") {
        conv.isClosed = true;
        await this.saveState(state);
      }
    });
  }

  async listComments(eventId: string): Promise<Comment[]> {
    await delayMs(200);
    const state = await this.loadState();
    const comments = state.comments.filter((c) => c.eventId === eventId);
    comments.sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
    return structuredClone(comments);
  }

  async postComment(input: PostCommentInput): Promise<Comment> {
    return this.runExclusive(async () => {
      await delayMs(400);
      const state = await this.loadState();

      const newComment: Comment = {
        id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: input.eventId,
        authorId: "usr-001",
        authorName: "Keketso",
        authorAvatarUrl: "userAvatarDefault",
        content: input.content,
        postedAt: new Date().toISOString(),
        reactionsCount: 0,
        userReacted: false,
        status: "synced",
      };

      state.comments.unshift(newComment);
      await this.saveState(state);
      return structuredClone(newComment);
    });
  }

  async toggleCommentReaction(commentId: string): Promise<Comment> {
    return this.runExclusive(async () => {
      await delayMs(200);
      const state = await this.loadState();
      const comment = state.comments.find((c) => c.id === commentId);
      if (!comment) {
        throw new Error("Comment not found");
      }

      if (comment.userReacted) {
        comment.userReacted = false;
        comment.reactionsCount = Math.max(0, comment.reactionsCount - 1);
      } else {
        comment.userReacted = true;
        comment.reactionsCount += 1;
      }

      await this.saveState(state);
      return structuredClone(comment);
    });
  }

  async retryComment(commentId: string): Promise<Comment> {
    return this.runExclusive(async () => {
      await delayMs(200);
      const state = await this.loadState();
      const comment = state.comments.find((c) => c.id === commentId);
      if (!comment) {
        throw new Error("Comment not found");
      }
      comment.status = "synced";
      await this.saveState(state);
      return structuredClone(comment);
    });
  }

  async listMessageRecipients(query?: string): Promise<MessageRecipient[]> {
    await delayMs(150);
    const state = await this.loadState();
    const recipients: MessageRecipient[] = state.conversations.map((c) => {
      if (c.kind === "direct") {
        return {
          id: c.participantId,
          name: c.participantName,
          handle: c.participantHandle,
          avatarUrl: c.participantAvatarUrl,
          kind: "direct",
          targetConversationId: c.id,
          subtitle: "Friend",
        };
      } else {
        return {
          id: c.hostId,
          name: c.hostName,
          handle: c.hostHandle,
          avatarUrl: c.hostAvatarUrl,
          kind: "inquiry",
          targetConversationId: c.id,
          subtitle: `Host · ${c.eventContext.eventTitle}`,
        };
      }
    });

    if (!query || !query.trim()) return recipients;
    const q = query.toLowerCase().trim();
    return recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.handle.toLowerCase().includes(q),
    );
  }

  async reportContent(
    input: ReportContentInput,
  ): Promise<{ success: boolean; reportId: string }> {
    await delayMs(300);
    return {
      success: true,
      reportId: `report-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
  }

  async reset(): Promise<void> {
    return this.runExclusive(async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await this.saveState(createSeedSocialState());
    });
  }
}

export const mockSocialRepository = new MockSocialRepository();
