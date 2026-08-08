import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppText } from "../../../src/components/ui/AppText";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { HostRow } from "../../../src/components/discovery/HostRow";
import { EmptyState } from "../../../src/components/feedback/EmptyState";
import { useDiscoveryStore } from "../../../src/state/useDiscoveryStore";
import { useSaveFollowActions } from "../../../src/hooks/useSaveFollowActions";
import { usePublicHostsByIdsQuery } from "../../../src/hooks/hosts/usePublicHostQuery";
import { routeBuilders } from "../../../src/navigation/routes";
import { theme } from "../../../src/design-system/theme";

export default function FollowingScreen() {
  const router = useRouter();
  const followedHostIds = useDiscoveryStore((state) => state.followedHostIds);
  const { toggleFollow } = useSaveFollowActions();
  const hostsQuery = usePublicHostsByIdsQuery(followedHostIds);

  const followed = (hostsQuery.data ?? []).filter(
    (profile): profile is NonNullable<typeof profile> => Boolean(profile),
  );

  return (
    <Screen safeAreaEdges={["top"]} style={styles.container}>
      <AppHeader title="Following" showBack onBack={() => router.back()} />

      <FlatList
        data={followed}
        keyExtractor={(item) => item.host.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          hostsQuery.isLoading ? (
            <View style={styles.emptyState}>
              <AppText variant="body" color={theme.colors.textMuted}>
                Loading hosts...
              </AppText>
            </View>
          ) : (
            <EmptyState
              title="Not following anyone yet"
              description="Follow hosts from their profiles or search results to see their events here."
              actionLabel="Explore Hosts"
              onAction={() =>
                router.push({
                  pathname: routeBuilders.search().pathname,
                  params: { tab: "hosts" },
                })
              }
              icon="users"
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <HostRow
              host={item.host}
              followed
              onToggleFollow={() => toggleFollow(item.host.id)}
              onPress={() =>
                router.push(routeBuilders.hostProfile(item.host.id))
              }
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
  },
  listContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  row: {
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: "center",
  },
});
