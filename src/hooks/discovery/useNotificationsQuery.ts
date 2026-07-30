import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockNotificationRepository } from "../../repositories/mock/MockNotificationRepository";
import { NotificationFilter } from "../../repositories/contracts/NotificationRepository";
import { queryKeys } from "../../state/query-keys";
import { useAppStore } from "../../state/useAppStore";

export function useNotificationsQuery(filter: NotificationFilter = "all") {
  const queryClient = useQueryClient();
  const scenario = useAppStore((state) => state.scenario);

  const query = useQuery({
    queryKey: queryKeys.notifications.list(filter),
    queryFn: () =>
      mockNotificationRepository.list(filter, {
        shouldFail: scenario === "discovery_error",
      }),
  });

  const markAllRead = useMutation({
    mutationFn: () => mockNotificationRepository.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => mockNotificationRepository.markRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });

  return {
    ...query,
    markAllRead: markAllRead.mutate,
    markRead: markRead.mutate,
    markingAllRead: markAllRead.isPending,
  };
}
