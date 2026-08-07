import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { Chip } from "../../src/components/ui/Chip";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { EmptyState } from "../../src/components/feedback/EmptyState";
import {
  DiscoveryCollection,
  ExplorePayload,
} from "../../src/domain/discovery";
import { CollectionRail } from "../../src/components/discovery/CollectionRail";
import {
  EventCard,
  EventCardSkeleton,
} from "../../src/components/discovery/EventCard";
import { VenueCard } from "../../src/components/discovery/VenueCard";
import { useExploreQuery } from "../../src/hooks/discovery/useExploreQuery";
import { useDiscoveryStore } from "../../src/state/useDiscoveryStore";
import { useAppStore } from "../../src/state/useAppStore";
import { useSaveFollowActions } from "../../src/hooks/useSaveFollowActions";
import { useDemoNowIso } from "../../src/hooks/useDemoNowIso";
import { useToast } from "../../src/hooks/useToast";
import { discoveryCategories } from "../../src/fixtures/discovery";
import { EventCategory } from "../../src/domain/events";
import { routeBuilders, ROUTES } from "../../src/navigation/routes";
import { theme } from "../../src/design-system/theme";
import { Icon } from "../../src/design-system/icons/Icon";

function isExplorePayloadEmpty(data: ExplorePayload): boolean {
  return (
    data.trending.length === 0 &&
    data.featuredVenues.length === 0 &&
    data.recommended.length === 0 &&
    data.thisWeekend.length === 0 &&
    data.nearby.length === 0
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const exploreQuery = useExploreQuery();
  const scenario = useAppStore((state) => state.scenario);
  const { filters, setFilters, savedEventIds } = useDiscoveryStore();
  const { toggleSaved } = useSaveFollowActions();
  const nowIso = useDemoNowIso();

  const handleEventPress = (eventId: string) => {
    router.push(routeBuilders.eventDetail(eventId));
  };

  const handleVenuePress = (venueId: string) => {
    showToast(
      "Venue details",
      `Venue ${venueId} will open in a later instruction.`,
      "info",
    );
  };

  const openSearchWithCategory = (category: EventCategory) => {
    setFilters({ ...filters, category });
    router.push({
      pathname: ROUTES.consumer.search as any,
      params: { category, source: "explore" },
    });
  };

  const openSearchCollection = (collectionName: DiscoveryCollection) => {
    router.push({
      pathname: ROUTES.consumer.search as any,
      params: {
        collection: collectionName,
        tab: collectionName === "venues" ? "venues" : "events",
        source: "explore",
      },
    });
  };

  const data = exploreQuery.data;

  return (
    <Screen safeAreaEdges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <AppText variant="title">Explore</AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Discover events, venues & communities in Johannesburg
          </AppText>
        </View>

        {scenario === "offline" ? (
          <View style={styles.offlineBanner}>
            <AppText variant="caption" color="#000" style={styles.offlineText}>
              ⚡ Offline state — viewing cached Johannesburg discovery
              collections.
            </AppText>
          </View>
        ) : null}

        {/* Search Bar Entry */}
        <View style={styles.searchBarContainer}>
          <Pressable
            testID="explore-search-entry"
            accessibilityRole="button"
            accessibilityLabel="Search events, hosts, or venues in Johannesburg"
            onPress={() => router.push(ROUTES.consumer.search as any)}
            style={({ pressed }) => [
              styles.searchBar,
              pressed && styles.pressed,
            ]}
          >
            <Icon name="search" size={16} color={theme.colors.textMuted} />
            <AppText variant="body" color={theme.colors.textMuted}>
              Search events, hosts, or venues...
            </AppText>
          </Pressable>
        </View>

        {/* Category Pills */}
        <View style={styles.categoriesContainer}>
          <SectionHeader title="Categories" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {discoveryCategories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                selected={filters.category === cat.id}
                onPress={() => openSearchWithCategory(cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {exploreQuery.isLoading ? (
          <View style={styles.skeletonContainer}>
            <EventCardSkeleton />
            <EventCardSkeleton />
          </View>
        ) : exploreQuery.isError ? (
          <ErrorState
            title="Explore did not load"
            description="Please check your connection and try again."
            actionLabel="Retry"
            onAction={() => exploreQuery.refetch()}
          />
        ) : data && isExplorePayloadEmpty(data) ? (
          <EmptyState
            title="Nothing to explore yet"
            description="Johannesburg discovery is empty in this prototype scenario."
            actionLabel="Open prototype controls"
            onAction={() => router.push(ROUTES.modals.prototypeControls as any)}
          />
        ) : data ? (
          <View style={styles.railsContainer}>
            {/* Trending Now */}
            <CollectionRail
              title="Trending Now"
              subtitle="What Johannesburg is moving toward"
              items={data.trending}
              keyExtractor={(evt) => evt.id}
              onSeeAll={() => openSearchCollection("trending")}
              seeAllTestID="explore-see-all-trending"
              renderItem={(evt) => (
                <EventCard
                  event={evt}
                  variant="standard"
                  nowIso={nowIso}

                  onPress={() => handleEventPress(evt.id)}

                  isSaved={savedEventIds.includes(evt.id)}

                  onSave={() => toggleSaved(evt.id)}
                />
              )}
            />

            {/* Featured Venues */}
            <CollectionRail
              title="Featured Venues"
              subtitle="Popular spots across Gauteng"
              items={data.featuredVenues}
              keyExtractor={(v) => v.id}
              onSeeAll={() => openSearchCollection("venues")}
              renderItem={(v) => (
                <VenueCard venue={v} onPress={() => handleVenuePress(v.id)} />
              )}
            />

            {/* Recommended For You */}
            <CollectionRail
              title="Recommended For You"
              subtitle="Based on your Johannesburg interests"
              items={data.recommended}
              keyExtractor={(evt) => evt.id}
              onSeeAll={() => openSearchCollection("recommended")}
              renderItem={(evt) => (
                <EventCard
                  event={evt}
                  variant="standard"
                  nowIso={nowIso}

                  onPress={() => handleEventPress(evt.id)}

                  isSaved={savedEventIds.includes(evt.id)}

                  onSave={() => toggleSaved(evt.id)}
                />
              )}
            />

            {/* This Weekend */}
            <CollectionRail
              title="This Weekend in Jozi"
              subtitle="Don't miss out on Friday through Sunday vibes"
              items={data.thisWeekend}
              keyExtractor={(evt) => evt.id}
              onSeeAll={() => openSearchCollection("this_weekend")}
              renderItem={(evt) => (
                <EventCard
                  event={evt}
                  variant="standard"
                  nowIso={nowIso}

                  onPress={() => handleEventPress(evt.id)}

                  isSaved={savedEventIds.includes(evt.id)}

                  onSave={() => toggleSaved(evt.id)}
                />
              )}
            />

            {/* Nearby */}
            <CollectionRail
              title="Nearby Events"
              subtitle="Within metric walking or driving distance"
              items={data.nearby}
              keyExtractor={(evt) => evt.id}
              onSeeAll={() => openSearchCollection("nearby")}
              renderItem={(evt) => (
                <EventCard
                  event={evt}
                  variant="standard"
                  nowIso={nowIso}

                  onPress={() => handleEventPress(evt.id)}

                  isSaved={savedEventIds.includes(evt.id)}

                  onSave={() => toggleSaved(evt.id)}
                />
              )}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: 4,
  },
  offlineBanner: {
    backgroundColor: theme.colors.accentStart,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    alignItems: "center",
  },
  offlineText: {
    fontWeight: "700",
  },
  searchBarContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    minHeight: 48,
  },
  categoriesContainer: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  railsContainer: {
    gap: theme.spacing.xl,
  },
  skeletonContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
});
