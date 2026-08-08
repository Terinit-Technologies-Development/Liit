import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { ErrorState } from "../../../src/components/ui/ErrorState";
import { SegmentedControl } from "../../../src/components/ui/SegmentedControl";
import { TicketStatusPill } from "../../../src/components/ticketing/TicketStatusPill";
import { AppImage } from "../../../src/components/ui/AppImage";
import { getImageSource } from "../../../src/assets/image-registry";
import { useAppStore } from "../../../src/state/useAppStore";
import { useTicketWalletQuery } from "../../../src/hooks/ticketing/useTicketWalletQuery";
import { useDemoNowIso } from "../../../src/hooks/useDemoNowIso";
import { WalletTicket } from "../../../src/domain/ticketing";
import { classifyWalletTicket } from "../../../src/domain/ticketing/wallet";
import { routeBuilders } from "../../../src/navigation/routes";
import { formatDate, formatTime } from "../../../src/utils/format";
import { theme } from "../../../src/design-system/theme";

type WalletTab = "upcoming" | "past";

export default function TicketsIndexScreen() {
  const router = useRouter();
  const scenario = useAppStore((s) => s.scenario);
  const walletQuery = useTicketWalletQuery(scenario);
  const nowIso = useDemoNowIso();

  const [activeTab, setActiveTab] = React.useState<WalletTab>("upcoming");

  const tickets = walletQuery.data ?? [];
  const filteredTickets = tickets.filter(
    (t) => classifyWalletTicket(t, nowIso) === activeTab,
  );

  const renderTicket = ({ item }: { item: WalletTicket }) => (
    <Pressable
      key={item.id}
      onPress={() => router.push(routeBuilders.fullTicket(item.id))}
      accessibilityRole="button"
      accessibilityLabel={`${item.eventSnapshot.title} ticket`}
      style={({ pressed }) => [styles.ticketCard, pressed && styles.pressed]}
      testID={`wallet-ticket-${item.id}`}
    >
      <AppImage
        source={getImageSource(item.eventSnapshot.imageKey)}
        style={styles.cardImage}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <AppText
            variant="bodyStrong"
            numberOfLines={1}
            style={styles.cardTitle}
          >
            {item.eventSnapshot.title}
          </AppText>
          <TicketStatusPill status={item.status} />
        </View>

        <AppText variant="caption" color={theme.colors.textMuted}>
          {item.tierName}
        </AppText>

        <AppText variant="caption" color={theme.colors.textSecondary}>
          {formatDate(item.eventSnapshot.startTime)} ·{" "}
          {formatTime(item.eventSnapshot.startTime)}
        </AppText>

        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          numberOfLines={1}
        >
          {item.eventSnapshot.venueName}, {item.eventSnapshot.venueSuburb}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <Screen gutter={false} style={styles.screen}>
      <AppHeader title="My Wallet" showDevControls />

      <View style={styles.tabRow}>
        <SegmentedControl
          accessibilityLabel="Filter tickets by time"
          options={[
            { label: "Upcoming", value: "upcoming" },
            { label: "Past", value: "past" },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(v as WalletTab)}
          testID="wallet-tab-control"
        />
      </View>

      {walletQuery.isLoading ? (
        <View style={styles.center}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Loading your tickets…
          </AppText>
        </View>
      ) : walletQuery.isError ? (
        <ErrorState
          title="Wallet error"
          description="Could not load your tickets."
          actionLabel="Retry"
          onAction={() => walletQuery.refetch()}
        />
      ) : filteredTickets.length === 0 ? (
        <View style={styles.center} testID="wallet-empty-state">
          <AppText variant="heading" align="center">
            {activeTab === "upcoming"
              ? "No upcoming tickets"
              : "No past tickets"}
          </AppText>
          <AppText variant="body" color={theme.colors.textMuted} align="center">
            {activeTab === "upcoming"
              ? "Browse events and purchase tickets to see them here."
              : "Attended events will appear here."}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  tabRow: {
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  ticketCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
  },
  pressed: {
    opacity: 0.8,
  },
  cardImage: {
    width: 80,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
  },
  cardTitle: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
});
