import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { SegmentedControl } from "../../src/components/ui/SegmentedControl";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { EmptyState } from "../../src/components/feedback/EmptyState";
import { OfflineBanner } from "../../src/components/feedback/OfflineBanner";
import { Skeleton } from "../../src/components/feedback/Skeleton";
import { IconButton } from "../../src/components/ui/IconButton";
import { Chip } from "../../src/components/ui/Chip";
import { MockMapCanvas } from "../../src/components/map/MockMapCanvas";
import { MapControls } from "../../src/components/map/MapControls";
import { MapEventPreview } from "../../src/components/map/MapEventPreview";
import { MapListView } from "../../src/components/map/MapListView";
import {
  DEFAULT_VIEWPORT,
  useMapDiscoveryStore,
} from "../../src/state/useMapDiscoveryStore";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { useAppStore } from "../../src/state/useAppStore";
import { useMapDiscoveryQuery } from "../../src/hooks/map/useMapDiscoveryQuery";
import { discoveryEvents, DEMO_NOW_ISO } from "../../src/fixtures/discovery";
import { routeBuilders, ROUTES } from "../../src/navigation/routes";
import { mockMapAdapter } from "../../src/adapters/map/MockMapAdapter";
import { DEFAULT_MAP_FILTERS } from "../../src/domain/map/map-filter-schema";
import { MapDisplayMode } from "../../src/domain/map";
import { theme } from "../../src/design-system/theme";

function MapLocationDisabledState({
  onChooseJohannesburg,
}: {
  onChooseJohannesburg(): void;
}) {
  return (
    <Screen style={styles.disabledScreen}>
      <AppHeader title="Map Discovery" showDevControls />
      <EmptyState
        title="Location is disabled"
        description="Location permissions are disabled in this prototype scenario. Select Johannesburg manually to view events."
        actionLabel="Use Johannesburg Fixtures"
        onAction={onChooseJohannesburg}
      />
    </Screen>
  );
}

export default function MapScreen() {
  const router = useRouter();

  const {
    displayMode,
    setDisplayMode,
    selectedEventId,
    selectEvent,
    viewport,
    setViewport,
    filters,
    locationState,
    setLocationState,
    setFilters,
  } = useMapDiscoveryStore();

  const { scenario, setScenario } = useAppStore();
  const savedEventIds = useDiscoveryStore((state) => state.savedEventIds);
  const toggleSavedEvent = useDiscoveryStore((state) => state.toggleSavedEvent);

  const mapQuery = useMapDiscoveryQuery({
    filters,
    scenario,
  });

  useEffect(() => {
    if (!selectedEventId || !mapQuery.data) {
      return;
    }

    if (!mapQuery.data.eventIds.includes(selectedEventId)) {
      selectEvent(null);
    }
  }, [mapQuery.data, selectEvent, selectedEventId]);

  const eventLookup = useMemo(
    () =>
      Object.fromEntries(
        (mapQuery.data?.events ?? discoveryEvents).map((event) => [
          event.id,
          event,
        ]),
      ),
    [mapQuery.data?.events],
  );

  const selectedEvent = selectedEventId ? eventLookup[selectedEventId] : null;

  const selectedPoint = useMemo(
    () =>
      mapQuery.data?.points.find((p) => p.eventId === selectedEventId) ?? null,
    [mapQuery.data, selectedEventId],
  );

  const mapRenderNodes = useMemo(() => {
    if (!mapQuery.data) return [];
    return mockMapAdapter.buildRenderNodes(mapQuery.data.points, viewport);
  }, [mapQuery.data, viewport]);

  const visibleEvents = useMemo(() => {
    if (!mapQuery.data) return [];
    return mapQuery.data.eventIds
      .map((id) => eventLookup[id])
      .filter((evt): evt is (typeof discoveryEvents)[0] => Boolean(evt));
  }, [mapQuery.data, eventLookup]);

  const isLocationDisabled =
    locationState === "disabled" ||
    (scenario === "map_location_disabled" && locationState !== "manual_city");

  if (isLocationDisabled) {
    return (
      <MapLocationDisabledState
        onChooseJohannesburg={() => {
          setLocationState("manual_city");
          setScenario("normal");
        }}
      />
    );
  }

  return (
    <Screen safeAreaEdges={["top"]} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.cityRow}>
          <AppText variant="subheading" style={styles.cityText}>
            📍 Johannesburg
          </AppText>
          <View style={styles.actionsRight}>
            <IconButton
              testID="map-open-filters"
              icon="filter"
              accessibilityLabel="Open map filters"
              onPress={() => router.push(ROUTES.modals.mapFilters)}
              variant="surface"
              size="sm"
            />
            <IconButton
              icon="search"
              accessibilityLabel="Open search"
              onPress={() => router.push(ROUTES.consumer.search)}
              variant="surface"
              size="sm"
            />
          </View>
        </View>

        {/* Filter summary chips */}
        <View style={styles.chipRail}>
          {filters.categories.map((cat) => (
            <Chip key={cat} label={cat} active size="sm" />
          ))}
          {filters.freeOnly ? (
            <Chip label="Free only" active size="sm" />
          ) : null}
          {filters.distanceKm ? (
            <Chip label={`< ${filters.distanceKm}km`} active size="sm" />
          ) : null}
        </View>

        <SegmentedControl
          options={[
            {
              value: "map",
              label: "Map",
              testID: "map-mode-switch-item-map",
            },
            {
              value: "list",
              label: "List",
              testID: "map-mode-switch-item-list",
            },
          ]}
          value={displayMode}
          onChange={(val) => setDisplayMode(val as MapDisplayMode)}
          accessibilityLabel="Switch map or list view"
          testID="map-mode-switch"
        />
      </View>

      {scenario === "offline" ? (
        <OfflineBanner message="Viewing cached Johannesburg map fixtures." />
      ) : null}

      {mapQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <Skeleton width="100%" height={400} borderRadius={16} />
        </View>
      ) : mapQuery.isError ? (
        <ErrorState
          title="The event map did not load"
          description="Try the Johannesburg map fixtures again."
          actionLabel="Retry"
          onAction={() => mapQuery.refetch()}
        />
      ) : mapQuery.data && mapQuery.data.points.length === 0 ? (
        <EmptyState
          title="No nearby events"
          description="Adjust your filters or restore the normal Map fixtures."
          actionLabel="Restore Map results"
          onAction={() => {
            setFilters(DEFAULT_MAP_FILTERS);
            setScenario("normal");
            selectEvent(null);
          }}
        />
      ) : displayMode === "map" ? (
        <View style={styles.mapArea}>
          <MockMapCanvas
            nodes={mapRenderNodes}
            eventsById={eventLookup}
            selectedEventId={selectedEventId}
            viewport={viewport}
            onSelectEvent={selectEvent}
            onOpenCluster={(eventIds) => {
              setViewport({
                ...viewport,
                zoom: Math.min(viewport.zoom + 1, 3) as 1 | 2 | 3,
              });
              selectEvent(eventIds[0] ?? null);
            }}
          />

          <MapControls
            onRecenter={() => setViewport(DEFAULT_VIEWPORT)}
            onZoomIn={() =>
              setViewport({
                ...viewport,
                zoom: Math.min(viewport.zoom + 1, 3) as 1 | 2 | 3,
              })
            }
            onZoomOut={() =>
              setViewport({
                ...viewport,
                zoom: Math.max(viewport.zoom - 1, 1) as 1 | 2 | 3,
              })
            }
          />
        </View>
      ) : (
        <MapListView
          events={visibleEvents}
          selectedEventId={selectedEventId}
          onSelectEvent={selectEvent}
          onViewDetails={(eventId) =>
            router.push(routeBuilders.eventDetail(eventId))
          }
        />
      )}

      {selectedEvent ? (
        <MapEventPreview
          event={selectedEvent}
          distanceKm={selectedPoint?.distanceKm ?? 0}
          nowIso={DEMO_NOW_ISO}
          isSaved={savedEventIds.includes(selectedEvent.id)}
          onToggleSaved={() => toggleSavedEvent(selectedEvent.id)}
          onDismiss={() => selectEvent(null)}
          onViewDetails={() =>
            router.push(routeBuilders.eventDetail(selectedEvent.id))
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  disabledScreen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cityText: {
    fontWeight: "700",
  },
  actionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  chipRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  mapArea: {
    flex: 1,
    position: "relative",
  },
});
