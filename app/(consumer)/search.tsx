import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { SearchField } from "../../src/components/forms/SearchField";
import { IconButton } from "../../src/components/ui/IconButton";
import { Chip } from "../../src/components/ui/Chip";
import { SegmentedControl } from "../../src/components/ui/SegmentedControl";
import { ErrorState } from "../../src/components/ui/ErrorState";
import {
  EventCard,
  EventCardSkeleton,
} from "../../src/components/discovery/EventCard";
import { HostRow } from "../../src/components/discovery/HostRow";
import { VenueCard } from "../../src/components/discovery/VenueCard";
import { useDiscoverySearchQuery } from "../../src/hooks/discovery/useDiscoverySearchQuery";
import { useDebouncedValue } from "../../src/hooks/discovery/useDebouncedValue";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { useToast } from "../../src/hooks/useToast";
import {
  DEMO_NOW_ISO,
  discoveryCategories,
} from "../../src/fixtures/discovery";
import {
  DiscoveryFilters,
  DiscoverySearchRouteParams,
  SearchResultTab,
} from "../../src/domain/discovery";
import { EventCategory } from "../../src/domain/events";
import { ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";
import { Icon } from "../../src/design-system/icons/Icon";

export function filtersFromRoute(
  params: DiscoverySearchRouteParams,
  current: DiscoveryFilters,
): DiscoveryFilters {
  if (params.category) {
    return {
      ...current,
      category: params.category as EventCategory,
    };
  }

  if (params.collection === "this_weekend") {
    return {
      ...current,
      date: "this_weekend",
    };
  }

  if (params.collection === "nearby") {
    return {
      ...current,
      distanceKm: 10,
    };
  }

  return current;
}

function countActiveFilters(filters: DiscoveryFilters): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.date !== "any") count++;
  if (filters.distanceKm) count++;
  if (filters.maxPriceMinor !== null) count++;
  if (filters.availabilityOnly) count++;
  if (filters.liveOnly) count++;
  return count;
}

export default function SearchScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    q?: string;
    tab?: string;
    category?: string;
    collection?: string;
    source?: string;
  }>();

  const [query, setQuery] = useState(params.q ?? "");
  const debouncedQuery = useDebouncedValue(query, 300);

  const {
    resultTab,
    setResultTab,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    filters,
    setFilters,
    followedHostIds,
    toggleHostFollow,
  } = useDiscoveryStore();

  useEffect(() => {
    if (params.tab && ["events", "hosts", "venues"].includes(params.tab)) {
      setResultTab(params.tab as SearchResultTab);
    }
    if (params.category || params.collection) {
      setFilters(
        filtersFromRoute(params as DiscoverySearchRouteParams, filters),
      );
    }
  }, [params.tab, params.category, params.collection]);

  const searchQuery = useDiscoverySearchQuery(
    debouncedQuery,
    filters,
    params.collection,
  );

  const activeFiltersCount = countActiveFilters(filters);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
  };

  const handleEventPress = (eventId: string) => {
    showToast(
      "Event details",
      `Event ${eventId} will open in the later Event Detail instruction.`,
      "info",
    );
  };

  const handleHostPress = (hostId: string) => {
    showToast(
      "Host Profile",
      `Host profile ${hostId} will open in a later instruction.`,
      "info",
    );
  };

  const handleVenuePress = (venueId: string) => {
    showToast(
      "Venue details",
      `Venue ${venueId} will open in a later instruction.`,
      "info",
    );
  };

  const data = searchQuery.data;
  const isQueryEmpty =
    debouncedQuery.trim().length === 0 &&
    activeFiltersCount === 0 &&
    !params.collection;

  if (searchQuery.isError) {
    return (
      <Screen safeAreaEdges={["top"]} style={styles.screen}>
        <View style={styles.header}>
          <IconButton
            icon="arrowLeft"
            accessibilityLabel="Navigate back"
            onPress={() => router.back()}
            variant="surface"
            size="sm"
          />
          <View style={styles.inputWrapper}>
            <SearchField
              testID="search-input"
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
              placeholder="Search events, hosts, or venues..."
            />
          </View>
        </View>
        <ErrorState
          title="Search did not load"
          description="Try the Johannesburg discovery fixtures again."
          actionLabel="Retry"
          onAction={() => searchQuery.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={["top"]} style={styles.screen}>
      {/* Search Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrowLeft"
          accessibilityLabel="Navigate back"
          onPress={() => router.back()}
          variant="surface"
          size="sm"
        />

        <View style={styles.inputWrapper}>
          <SearchField
            testID="search-input"
            autoFocus={!params.q && !params.category && !params.collection}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            onClear={() => setQuery("")}
            placeholder="Search events, hosts, or venues..."
          />
        </View>

        <IconButton
          testID="search-open-filters"
          icon="filter"
          accessibilityLabel={
            activeFiltersCount > 0
              ? `Open search filters, ${activeFiltersCount} active`
              : "Open search filters"
          }
          onPress={() => router.push(ROUTES.modals.searchFilters as any)}
          variant={activeFiltersCount > 0 ? "gradient" : "surface"}
          size="sm"
        />
      </View>

      {/* Main Content Area */}
      {isQueryEmpty ? (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <AppText variant="subheading">Recent Searches</AppText>
            {recentSearches.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear recent searches"
                onPress={clearRecentSearches}
              >
                <AppText variant="caption" color={theme.colors.accentStart}>
                  Clear all
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {recentSearches.length > 0 ? (
            <View style={styles.chipsRow}>
              {recentSearches.map((term) => (
                <Chip key={term} label={term} onPress={() => setQuery(term)} />
              ))}
            </View>
          ) : (
            <AppText variant="caption" color={theme.colors.textMuted}>
              No recent search history.
            </AppText>
          )}

          <View style={styles.popularSection}>
            <AppText variant="subheading">Popular Categories</AppText>
            <View style={styles.chipsRow}>
              {discoveryCategories.slice(0, 5).map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  selected={filters.category === cat.id}
                  onPress={() => {
                    setFilters({ ...filters, category: cat.id });
                    setQuery("");
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {/* Result Tabs */}
          <View style={styles.tabRow}>
            <SegmentedControl
              value={resultTab}
              onChange={(tab) => setResultTab(tab as SearchResultTab)}
              accessibilityLabel="Search result categories"
              options={[
                {
                  value: "events",
                  label: "Events",
                  badgeCount: data?.events.length,
                  testID: "search-tab-events",
                },
                {
                  value: "hosts",
                  label: "Hosts",
                  badgeCount: data?.hosts.length,
                  testID: "search-tab-hosts",
                },
                {
                  value: "venues",
                  label: "Venues",
                  badgeCount: data?.venues.length,
                  testID: "search-tab-venues",
                },
              ]}
            />
          </View>

          {searchQuery.isLoading ? (
            <View style={styles.skeletonContainer}>
              <EventCardSkeleton />
              <EventCardSkeleton />
            </View>
          ) : resultTab === "events" ? (
            <FlatList
              data={data?.events ?? []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon
                    name="search"
                    size={32}
                    color={theme.colors.textMuted}
                  />
                  <AppText variant="heading" style={styles.emptyTitle}>
                    {query ? `No events for “${query}”` : "No matching events"}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    Try a broader term or adjust your search filters.
                  </AppText>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.eventRow}>
                  <EventCard
                    event={item}
                    variant="compact"
                    nowIso={DEMO_NOW_ISO}
                    onPress={() => handleEventPress(item.id)}
                  />
                </View>
              )}
            />
          ) : resultTab === "hosts" ? (
            <FlatList
              data={data?.hosts ?? []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon name="users" size={32} color={theme.colors.textMuted} />
                  <AppText variant="heading" style={styles.emptyTitle}>
                    {query
                      ? `No hosts found for “${query}”`
                      : "No matching hosts"}
                  </AppText>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.hostRowWrapper}>
                  <HostRow
                    host={item}
                    followed={followedHostIds.includes(item.id)}
                    onToggleFollow={() => toggleHostFollow(item.id)}
                    onPress={() => handleHostPress(item.id)}
                  />
                </View>
              )}
            />
          ) : (
            <FlatList
              data={data?.venues ?? []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon
                    name="mapPin"
                    size={32}
                    color={theme.colors.textMuted}
                  />
                  <AppText variant="heading" style={styles.emptyTitle}>
                    {query
                      ? `No venues found for “${query}”`
                      : "No matching venues"}
                  </AppText>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.venueRowWrapper}>
                  <VenueCard
                    venue={item}
                    onPress={() => handleVenuePress(item.id)}
                  />
                </View>
              )}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  recentSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  popularSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  resultsContainer: {
    flex: 1,
  },
  tabRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  eventRow: {
    marginVertical: 2,
  },
  hostRowWrapper: {
    marginVertical: 2,
  },
  venueRowWrapper: {
    alignItems: "center",
    marginVertical: theme.spacing.xs,
  },
  skeletonContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  emptyTitle: {
    textAlign: "center",
  },
});
