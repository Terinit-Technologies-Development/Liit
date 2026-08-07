import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockCreatorRepository } from "../../repositories/mock/MockCreatorRepository";
import {
  CreatorActivationDraft,
  CreatorContentDraft,
  CreatorEventProjection,
} from "../../domain/creator";

export const creatorKeys = {
  all: ["creator"] as const,
  profile: () => [...creatorKeys.all, "profile"] as const,
  stats: (period?: string) =>
    period
      ? ([...creatorKeys.all, "stats", period] as const)
      : ([...creatorKeys.all, "stats"] as const),
  events: (filter?: string) =>
    filter
      ? ([...creatorKeys.all, "events", filter] as const)
      : ([...creatorKeys.all, "events"] as const),
  event: (eventId: string) => [...creatorKeys.all, "event", eventId] as const,
  activeEventProgress: () =>
    [...creatorKeys.all, "activeEventProgress"] as const,
  priorityAlerts: () => [...creatorKeys.all, "priorityAlerts"] as const,
  payoutsOverview: () => [...creatorKeys.all, "payoutsOverview"] as const,
  payoutHistory: () => [...creatorKeys.all, "payoutHistory"] as const,
  contentPosts: (eventId?: string) =>
    eventId
      ? ([...creatorKeys.all, "contentPosts", eventId] as const)
      : ([...creatorKeys.all, "contentPosts"] as const),
  eventAnalytics: (eventId: string) =>
    [...creatorKeys.all, "eventAnalytics", eventId] as const,
  /**
   * Family root for a single Event's guest queries. Every filter/search
   * variant extends this root so check-in mutations invalidate the family.
   */
  eventGuestsRoot: (eventId: string) =>
    [...creatorKeys.all, "eventGuests", eventId] as const,
  eventGuests: (eventId: string, filter?: string, search?: string) =>
    [
      ...creatorKeys.eventGuestsRoot(eventId),
      filter || "all",
      search || "",
    ] as const,
  /**
   * Family root for creator notifications. Every category key extends this
   * root so mark-read mutations invalidate every category cache.
   */
  notificationsRoot: () => [...creatorKeys.all, "notifications"] as const,
  notifications: (category?: string) =>
    [...creatorKeys.notificationsRoot(), category || "all"] as const,
  verification: () => [...creatorKeys.all, "verification"] as const,
};

export function useCreatorProfile() {
  return useQuery({
    queryKey: creatorKeys.profile(),
    queryFn: () => mockCreatorRepository.getCreatorProfile(),
  });
}

export function useCreatorStats(period: string = "30d") {
  return useQuery({
    queryKey: creatorKeys.stats(period),
    queryFn: () => mockCreatorRepository.getCreatorStats(period),
  });
}

export function useCreatorEvents(filter: string = "all") {
  return useQuery({
    queryKey: creatorKeys.events(filter),
    queryFn: () => mockCreatorRepository.getCreatorEvents(filter),
  });
}

export function useCreatorEvent(eventId: string) {
  return useQuery({
    queryKey: creatorKeys.event(eventId),
    queryFn: () => mockCreatorRepository.getCreatorEvent(eventId),
    enabled: !!eventId,
  });
}

export function useActiveEventProgress() {
  return useQuery({
    queryKey: creatorKeys.activeEventProgress(),
    queryFn: () => mockCreatorRepository.getActiveEventProgress(),
  });
}

export function usePriorityAlerts() {
  return useQuery({
    queryKey: creatorKeys.priorityAlerts(),
    queryFn: () => mockCreatorRepository.getPriorityAlerts(),
  });
}

export function usePayoutsOverview() {
  return useQuery({
    queryKey: creatorKeys.payoutsOverview(),
    queryFn: () => mockCreatorRepository.getPayoutsOverview(),
  });
}

export function usePayoutHistory() {
  return useQuery({
    queryKey: creatorKeys.payoutHistory(),
    queryFn: () => mockCreatorRepository.getPayoutHistory(),
  });
}

export function useContentPosts(eventId?: string) {
  return useQuery({
    queryKey: creatorKeys.contentPosts(eventId),
    queryFn: () => mockCreatorRepository.getContentPosts(eventId),
  });
}

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: creatorKeys.eventAnalytics(eventId),
    queryFn: () => mockCreatorRepository.getEventAnalytics(eventId),
    enabled: !!eventId,
  });
}

export function useEventGuests(
  eventId: string,
  filter: string = "all",
  search: string = "",
) {
  return useQuery({
    queryKey: creatorKeys.eventGuests(eventId, filter, search),
    queryFn: () =>
      mockCreatorRepository.getEventGuests(eventId, filter, search),
    enabled: !!eventId,
  });
}

export function useCreatorNotifications(category: string = "all") {
  return useQuery({
    queryKey: creatorKeys.notifications(category),
    queryFn: () => mockCreatorRepository.getCreatorNotifications(category),
  });
}

export function useVerificationChecklist() {
  return useQuery({
    queryKey: creatorKeys.verification(),
    queryFn: () => mockCreatorRepository.getVerificationChecklist(),
  });
}

// --- Mutations ---

export function useSaveActivationDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: CreatorActivationDraft) =>
      mockCreatorRepository.saveActivationDraft(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.profile() });
    },
  });
}

export function useCompleteActivationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mockCreatorRepository.completeActivation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.profile() });
      queryClient.invalidateQueries({ queryKey: creatorKeys.verification() });
    },
  });
}

export function useSaveEventDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: Partial<CreatorEventProjection>) =>
      mockCreatorRepository.saveEventDraft(draft),
    onSuccess: (data) => {
      // Invalidate the whole events family (every status-filter variant) plus
      // the single-event cache.
      queryClient.invalidateQueries({ queryKey: creatorKeys.events() });
      queryClient.invalidateQueries({
        queryKey: creatorKeys.event(data.event.id),
      });
    },
  });
}

export function usePublishEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      mockCreatorRepository.simulatePublish(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.events() });
      queryClient.invalidateQueries({ queryKey: creatorKeys.event(eventId) });
    },
  });
}

export function useRequestPayoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amountMinor: number) =>
      mockCreatorRepository.simulatePayoutRequest(amountMinor),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.payoutsOverview(),
      });
      queryClient.invalidateQueries({ queryKey: creatorKeys.payoutHistory() });
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mockCreatorRepository.markCreatorNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.notificationsRoot(),
      });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mockCreatorRepository.markAllCreatorNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.notificationsRoot(),
      });
    },
  });
}

export function useToggleGuestCheckInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, guestId }: { eventId: string; guestId: string }) =>
      mockCreatorRepository.toggleGuestCheckIn(eventId, guestId),
    onSuccess: (_, { eventId }) => {
      // Invalidate every filter/search variant for this Event.
      queryClient.invalidateQueries({
        queryKey: creatorKeys.eventGuestsRoot(eventId),
      });
      queryClient.invalidateQueries({
        queryKey: creatorKeys.eventAnalytics(eventId),
      });
    },
  });
}

// --- Content mutations ---

export function useCreateContentPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: CreatorContentDraft) =>
      mockCreatorRepository.createContentPost(draft),
    onSuccess: (post) => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.contentPosts(post.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: creatorKeys.contentPosts(),
      });
      queryClient.invalidateQueries({ queryKey: creatorKeys.events() });
    },
  });
}

export function useUpdateContentPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      patch,
    }: {
      postId: string;
      patch: Partial<import("../../domain/creator").CreatorContentPost>;
    }) => mockCreatorRepository.updateContentPost(postId, patch),
    onSuccess: (post) => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.contentPosts(post.eventId),
      });
    },
  });
}

export function useToggleContentPinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      mockCreatorRepository.toggleContentPin(postId),
    onSuccess: (post) => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.contentPosts(post.eventId),
      });
      queryClient.invalidateQueries({ queryKey: creatorKeys.events() });
    },
  });
}

export function useToggleContentVisibilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      mockCreatorRepository.toggleContentVisibility(postId),
    onSuccess: (post) => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.contentPosts(post.eventId),
      });
    },
  });
}

export function useDeleteContentPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      mockCreatorRepository.deleteContentPost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({
        queryKey: creatorKeys.contentPosts(),
      });
    },
  });
}
