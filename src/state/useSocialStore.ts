import { create } from "zustand";

export type InboxTab = "direct" | "inquiry";

interface SocialStoreState {
  inboxTab: InboxTab;
  searchQuery: string;
  drafts: Record<string, string>; // conversationId -> text draft
  isTypingMap: Record<string, boolean>; // conversationId -> typing simulation state

  setInboxTab(tab: InboxTab): void;
  setSearchQuery(query: string): void;
  setDraft(conversationId: string, text: string): void;
  setTyping(conversationId: string, isTyping: boolean): void;
  clearDraft(conversationId: string): void;
  resetSocialStore(): void;
  resetSocial(): void;
}

const initialState = {
  inboxTab: "direct" as InboxTab,
  searchQuery: "",
  drafts: {},
  isTypingMap: {},
};

export const useSocialStore = create<SocialStoreState>()((set) => ({
  ...initialState,

  setInboxTab: (inboxTab) => set({ inboxTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDraft: (conversationId, text) =>
    set((state) => ({
      drafts: { ...state.drafts, [conversationId]: text },
    })),
  setTyping: (conversationId, isTyping) =>
    set((state) => ({
      isTypingMap: { ...state.isTypingMap, [conversationId]: isTyping },
    })),
  clearDraft: (conversationId) =>
    set((state) => {
      const next = { ...state.drafts };
      delete next[conversationId];
      return { drafts: next };
    }),
  resetSocialStore: () => set({ ...initialState }),
  resetSocial: () => set({ ...initialState }),
}));
