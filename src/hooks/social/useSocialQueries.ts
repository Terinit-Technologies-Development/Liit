import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function usePostCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    Comment,
    Error,
    PostCommentInput,
    { previous?: Comment[] }
  >({
    mutationFn: (input) => mockSocialRepository.postComment(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.social.comments(input.eventId),
      });
      const previous = queryClient.getQueryData<Comment[]>(
        queryKeys.social.comments(input.eventId),
      );

      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
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

      queryClient.setQueryData(queryKeys.social.comments(input.eventId), [
        optimistic,
        ...(previous ?? []),
      ]);

      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.social.comments(variables.eventId),
          context.previous,
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.comments(variables.eventId),
      });
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
