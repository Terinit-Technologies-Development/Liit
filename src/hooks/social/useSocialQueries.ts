import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Comment,
  Conversation,
  ConversationKind,
  Message,
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
        queryKey: queryKeys.social.conversations(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.conversationDetail(variables.conversationId),
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
  return useMutation<Comment, Error, PostCommentInput>({
    mutationFn: (input) => mockSocialRepository.postComment(input),
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

export function useReportContentMutation() {
  return useMutation<
    { success: boolean; reportId: string },
    Error,
    ReportContentInput
  >({
    mutationFn: (input) => mockSocialRepository.reportContent(input),
  });
}
