import { useQuery } from "@tanstack/react-query";
import { mockCreatorRepository } from "../../repositories/mock/MockCreatorRepository";

export const creatorKeys = {
  all: ["creator"] as const,
  profile: () => [...creatorKeys.all, "profile"] as const,
  stats: () => [...creatorKeys.all, "stats"] as const,
  events: () => [...creatorKeys.all, "events"] as const,
  activeEventProgress: () =>
    [...creatorKeys.all, "activeEventProgress"] as const,
  priorityAlerts: () => [...creatorKeys.all, "priorityAlerts"] as const,
  payoutsOverview: () => [...creatorKeys.all, "payoutsOverview"] as const,
  payoutHistory: () => [...creatorKeys.all, "payoutHistory"] as const,
  contentPosts: () => [...creatorKeys.all, "contentPosts"] as const,
  eventAnalytics: (eventId: string) =>
    [...creatorKeys.all, "eventAnalytics", eventId] as const,
};

export function useCreatorProfile() {
  return useQuery({
    queryKey: creatorKeys.profile(),
    queryFn: () => mockCreatorRepository.getCreatorProfile(),
  });
}

export function useCreatorStats() {
  return useQuery({
    queryKey: creatorKeys.stats(),
    queryFn: () => mockCreatorRepository.getCreatorStats(),
  });
}

export function useCreatorEvents() {
  return useQuery({
    queryKey: creatorKeys.events(),
    queryFn: () => mockCreatorRepository.getCreatorEvents(),
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

export function useContentPosts() {
  return useQuery({
    queryKey: creatorKeys.contentPosts(),
    queryFn: () => mockCreatorRepository.getContentPosts(),
  });
}

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: creatorKeys.eventAnalytics(eventId),
    queryFn: () => mockCreatorRepository.getEventAnalytics(eventId),
    enabled: !!eventId,
  });
}
