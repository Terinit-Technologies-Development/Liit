import { mockSocialRepository } from "../repositories/mock/MockSocialRepository";
import { useSocialStore } from "../state/useSocialStore";
import { DirectConversation } from "../domain/social";

describe("Instruction 5 Social Repository & Store Unit Tests", () => {
  beforeEach(async () => {
    await mockSocialRepository.reset();
    useSocialStore.getState().resetSocialStore();
  });

  it("lists direct and inquiry conversations", async () => {
    const all = await mockSocialRepository.listConversations();
    expect(all.length).toBeGreaterThanOrEqual(4);

    const direct = await mockSocialRepository.listConversations("direct");
    expect(direct.every((c) => c.kind === "direct")).toBe(true);

    const inquiry = await mockSocialRepository.listConversations("inquiry");
    expect(inquiry.every((c) => c.kind === "inquiry")).toBe(true);
  });

  it("retrieves a conversation by ID", async () => {
    const conv = await mockSocialRepository.getConversation("conv-direct-alex");
    expect(conv).toBeDefined();
    expect(conv?.id).toBe("conv-direct-alex");
    expect(conv?.kind).toBe("direct");
  });

  it("sends a message in a conversation and updates state", async () => {
    const newMessage = await mockSocialRepository.sendMessage({
      conversationId: "conv-direct-alex",
      content: "Testing repository message send",
    });

    expect(newMessage.id).toBeDefined();
    expect(newMessage.content).toBe("Testing repository message send");
    expect(newMessage.senderType).toBe("consumer");

    const messages =
      await mockSocialRepository.listMessages("conv-direct-alex");
    expect(
      messages.some((m) => m.content === "Testing repository message send"),
    ).toBe(true);
  });

  it("blocks and unblocks a user", async () => {
    await mockSocialRepository.blockUser("usr-alex-khumalo");
    let conv = await mockSocialRepository.getConversation("conv-direct-alex");
    expect((conv as DirectConversation)?.isBlocked).toBe(true);

    await mockSocialRepository.unblockUser("usr-alex-khumalo");
    conv = await mockSocialRepository.getConversation("conv-direct-alex");
    expect((conv as DirectConversation)?.isBlocked).toBe(false);
  });

  it("lists, posts, and toggles reactions on comments", async () => {
    const initialComments = await mockSocialRepository.listComments(
      "evt-midnight-grooves",
    );
    expect(initialComments.length).toBeGreaterThanOrEqual(2);

    const newComment = await mockSocialRepository.postComment({
      eventId: "evt-midnight-grooves",
      content: "Excited for Midnight Grooves!",
    });
    expect(newComment.content).toBe("Excited for Midnight Grooves!");

    const updatedComments = await mockSocialRepository.listComments(
      "evt-midnight-grooves",
    );
    expect(
      updatedComments.some(
        (c) => c.content === "Excited for Midnight Grooves!",
      ),
    ).toBe(true);

    const toggled = await mockSocialRepository.toggleCommentReaction(
      newComment.id,
    );
    expect(toggled.userReacted).toBe(true);
    expect(toggled.reactionsCount).toBe(1);
  });

  it("submits content reports", async () => {
    const reportRes = await mockSocialRepository.reportContent({
      targetKind: "user",
      targetId: "usr-alex-khumalo",
      reason: "Spam",
      details: "Test report",
    });
    expect(reportRes.success).toBe(true);
    expect(reportRes.reportId).toBeDefined();
  });

  it("useSocialStore manages UI state correctly", () => {
    const store = useSocialStore.getState();
    expect(store.inboxTab).toBe("direct");

    store.setInboxTab("inquiry");
    expect(useSocialStore.getState().inboxTab).toBe("inquiry");

    store.setSearchQuery("Alex");
    expect(useSocialStore.getState().searchQuery).toBe("Alex");

    store.setDraft("conv-1", "Hello draft");
    expect(useSocialStore.getState().drafts["conv-1"]).toBe("Hello draft");

    store.clearDraft("conv-1");
    expect(useSocialStore.getState().drafts["conv-1"]).toBeUndefined();
  });
});
