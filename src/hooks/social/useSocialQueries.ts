import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
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
import { mockSocialRepository } from "../../repositories/mock/MockSocialRepository";
import { queryKeys } from "../../state/query-keys";

export function useConversationsQuery(kind?: ConversationKind) {
  return useQuery<Conversation[]>({
    queryKey: queryKeys.social.conversations(kind),
    queryFn: () => mockSocialRepository.listConversations(kind),
  });
}

export function useConversationDetailQuery(id: string | null) {
  return useQuery<Conversation | null>({
    queryKey: queryKeys.social.conversationDetail(id ?? ""),
    queryFn: () => (id ? mockSocialRepository.getConversation(id) : null),
    enabled: Boolean(id),
  });
}

export function useMessagesQuery(conversationId: string | null) {
  return useQuery<Message[]>({
    queryKey: queryKeys.social.messages(conversationId ?? ""),
    queryFn: () =>
      conversationId ? mockSocialRepository.listMessages(conversationId) : [],
    enabled: Boolean(conversationId),
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation<Message, Error, SendMessageInput>({
    mutationFn: (input) => mockSocialRepository.sendMessage(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationDetail(variables.conversationId),
      });
    },
  });
}

export function useRetryMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    Message,
    Error,
    { conversationId: string; messageId: string }
  >({
    mutationFn: ({ conversationId, messageId }) =>
      mockSocialRepository.retryMessage(conversationId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationsRoot(),
      });
    },
  });
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (conversationId) =>
      mockSocialRepository.markConversationRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationDetail(conversationId),
      });
    },
  });
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (userId) => mockSocialRepository.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.all,
      });
    },
  });
}

export function useUnblockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (userId) => mockSocialRepository.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.all,
      });
    },
  });
}

export function useCloseInquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (conversationId) =>
      mockSocialRepository.closeInquiry(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationDetail(conversationId),
      });
    },
  });
}

export function useCommentsQuery(eventId: string | null) {
  return useQuery<Comment[]>({
    queryKey: queryKeys.social.comments(eventId ?? ""),
    queryFn: () => (eventId ? mockSocialRepository.listComments(eventId) : []),
    enabled: Boolean(eventId),
  });
}

interface PostCommentContext {
  previous: Comment[];
  optimisticId: string;
}

export function usePostCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, PostCommentInput, PostCommentContext>({
    mutationFn: (input) => mockSocialRepository.postComment(input),
    onMutate: async (input) => {
      const key = queryKeys.social.comments(input.eventId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Comment[]>(key) ?? [];
      const optimisticId = input.clientMutationId
        ? `optimistic-${input.clientMutationId}`
        : `optimistic-${Date.now()}`;

      const optimistic: Comment = {
        id: optimisticId,
        eventId: input.eventId,
        authorId: "usr-001",
        authorName: "Keketso",
        authorAvatarUrl: "userAvatarDefault",
        content: input.content,
        postedAt: new Date().toISOString(),
        reactionsCount: 0,
        userReacted: false,
        status: "optimistic",
      };

      queryClient.setQueryData<Comment[]>(key, (current = []) => {
        const exists = current.some((c) => c.id === optimisticId);
        if (exists) {
          return current.map((c) =>
            c.id === optimisticId ? { ...c, status: "optimistic" } : c,
          );
        }
        return [optimistic, ...current];
      });

      return { previous, optimisticId };
    },
    onError: (_err, variables, context) => {
      if (!context) return;
      const key = queryKeys.social.comments(variables.eventId);
      queryClient.setQueryData<Comment[]>(key, (current = []) =>
        current.map((comment) =>
          comment.id === context.optimisticId
            ? { ...comment, status: "failed" }
            : comment,
        ),
      );
    },
    onSuccess: (newComment, variables, context) => {
      const key = queryKeys.social.comments(variables.eventId);
      queryClient.setQueryData<Comment[]>(key, (current = []) =>
        current.map((comment) =>
          comment.id === context.optimisticId ? newComment : comment,
        ),
      );
    },
  });
}

export function useRetryCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, { commentId: string; eventId: string }>({
    mutationFn: ({ commentId }) => mockSocialRepository.retryComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.comments(variables.eventId),
      });
    },
  });
}

export function useToggleReactionMutation() {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, { commentId: string; eventId: string }>({
    mutationFn: ({ commentId }) =>
      mockSocialRepository.toggleCommentReaction(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.comments(variables.eventId),
      });
    },
  });
}

export function useSimulateHostReplyMutation() {
  const queryClient = useQueryClient();
  return useMutation<Message | null, Error, string>({
    mutationFn: (conversationId) =>
      mockSocialRepository.simulateHostReply(conversationId),
    onSuccess: (reply, conversationId) => {
      if (!reply) {
        return;
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationDetail(conversationId),
      });
    },
  });
}

/**
 * Orchestrates the simulated host reply after a user message: the inquiry
 * thread shows the typing indicator, then the once-per-reset canned reply
 * arrives and invalidates the message/conversation queries.
 */
export function useInquiryReplySimulation(conversationId: string | null) {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    if (!conversationId) {
      return;
    }
    const reply =
      await mockSocialRepository.maybeSchedulePrototypeHostReply(
        conversationId,
      );
    if (!reply) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.social.messages(conversationId),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.social.conversationsRoot(),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.social.conversationDetail(conversationId),
    });
  }, [conversationId, queryClient]);
}

export function useMessageRecipientsQuery(query?: string) {
  return useQuery<MessageRecipient[]>({
    queryKey: [...queryKeys.social.all, "recipients", query ?? ""],
    queryFn: () => mockSocialRepository.listMessageRecipients(query),
  });
}

export function useReportContentMutation() {
  return useMutation<
    { success: boolean; reportId: string },
    Error,
    ReportContentInput
  >({
    mutationFn: (input) => mockSocialRepository.reportContent(input),
  });
}
