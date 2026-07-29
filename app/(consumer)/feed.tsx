import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";
import { OfflineBanner } from "../../src/components/feedback/OfflineBanner";
import { Card } from "../../src/components/ui/Card";
import { AppText } from "../../src/components/ui/AppText";
import { Stack } from "../../src/components/ui/Stack";
import { LoadingView } from "../../src/components/feedback/LoadingView";
import { mockEventRepository } from "../../src/repositories/mock/MockEventRepository";
import { queryKeys } from "../../src/state/query-keys";
import { useAppStore } from "../../src/state/useAppStore";
import { formatCurrency, formatDate } from "../../src/utils/format";

export default function FeedScreen() {
  const { scenario, activeMode } = useAppStore();

  const isOffline = scenario === "offline";

  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.events.featured(),
    queryFn: () =>
      mockEventRepository.listFeaturedEvents({
        shouldFail: scenario === "payment_decline", // Prove error handling path
      }),
  });

  return (
    <Screen scrollable>
      <AppHeader title="Consumer Feed" showDevControls={true} />
      {isOffline ? (
        <OfflineBanner message="Offline Scenario Active — Using cached fixture state." />
      ) : null}

      <Stack gap="lg" style={{ marginTop: 16 }}>
        <PrototypePlaceholder
          title="Event Feed Baseline"
          routePurpose="Editorial, algorithmic, and social discovery feed of live events."
          reason="not_implemented_in_this_pr"
          icon="feed"
          activeMode={activeMode}
        />

        <AppText variant="heading">Sample Repository Query Proof</AppText>

        {isLoading ? (
          <LoadingView message="Fetching events from MockEventRepository..." />
        ) : isError ? (
          <AppText color="red">
            Sample Query Error (Triggered by active scenario)
          </AppText>
        ) : (
          events?.map((event) => (
            <Card key={event.id} radius="xl" padding="md">
              <Stack gap="xs">
                <AppText variant="heading">{event.title}</AppText>
                <AppText variant="body" color="#B5AEC4">
                  {event.venue.name} • {event.venue.suburb}, {event.venue.city}
                </AppText>
                <AppText variant="caption" color="#FF4D7D">
                  From{" "}
                  {formatCurrency(event.startingPriceMinor, event.currency)} •{" "}
                  {formatDate(event.occurrence.startTime)}
                </AppText>
              </Stack>
            </Card>
          ))
        )}
      </Stack>
    </Screen>
  );
}
