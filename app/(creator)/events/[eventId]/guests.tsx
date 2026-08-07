import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppButton } from "../../../../src/components/ui/AppButton";
import { TextField } from "../../../../src/components/forms/TextField";
import { Chip } from "../../../../src/components/ui/Chip";
import { Icon } from "../../../../src/design-system/icons/Icon";
import { theme } from "../../../../src/design-system/theme";
import {
  useEventGuests,
  useToggleGuestCheckInMutation,
  useCreatorEvent,
} from "../../../../src/hooks/creator/useCreatorQueries";
import { EmptyState } from "../../../../src/components/feedback/EmptyState";

const FILTER_CHIPS = ["All", "Confirmed", "Checked In", "Pending", "Cancelled"];

export default function EventGuestsScreen() {
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const {
    data: guests,
    isLoading,
    isError,
    refetch,
  } = useEventGuests(eventId, filter, search);
  const { data: projection, isLoading: isEventLoading } =
    useCreatorEvent(eventId);
  const toggleCheckInMutation = useToggleGuestCheckInMutation();

  // Capture "now" once via a lazy initializer so the not-started comparison
  // stays pure during render.
  const [nowMs] = useState(() => Date.now());

  const handleToggleCheckIn = (guestId: string) => {
    toggleCheckInMutation.mutate({ eventId, guestId });
  };

  const handleExportCsv = () => {
    Alert.alert(
      "Export Guest List [PROTOTYPE]",
      "LIIT PROTOTYPE — Simulated CSV export of attendee roster completed. No real file exported to disk.",
    );
  };

  const notStarted =
    projection &&
    new Date(projection.event.occurrence.startTime).getTime() > nowMs;

  return (
    <Screen style={styles.container} testID="creator-guests-screen">
      <AppHeader
        title="Guest Roster"
        rightElement={
          <Pressable style={styles.exportBtn} onPress={handleExportCsv}>
            <Icon name="share" size="xs" color={theme.colors.accentStart} />
            <AppText
              variant="caption"
              color="accentStart"
              style={{ fontWeight: "bold" }}
            >
              Export CSV
            </AppText>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading || isEventLoading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={theme.colors.accentStart} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.stateArea}>
            <AppText variant="heading" color="textPrimary">
              Guest Roster Unavailable
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 4, textAlign: "center" }}
            >
              Simulated failure while loading the roster. Retry to reload.
            </AppText>
            <AppButton
              label="Retry"
              variant="primary"
              onPress={() => refetch()}
              style={{ marginTop: theme.spacing.md }}
              testID="guests-retry-button"
            />
          </View>
        ) : !projection ? (
          <EmptyState
            title="Event Not Found"
            description={`No Event exists for ID "${eventId}". Guest rosters are only available for real Events.`}
            icon="warning"
          />
        ) : notStarted ? (
          <EmptyState
            title="Event Has Not Started"
            description={`"${projection.event.title}" has not started yet — no attendee check-ins can occur.`}
            icon="calendar"
          />
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchSection}>
              <TextField
                placeholder="Search guest name or reference (e.g. LIIT-REF-9901)..."
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Filter Chips */}
            <View style={styles.chipRow}>
              {FILTER_CHIPS.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  selected={filter === chip}
                  onPress={() => setFilter(chip)}
                />
              ))}
            </View>

            {/* Roster Items */}
            {guests && guests.length > 0 ? (
              guests.map((guest) => {
                const isCheckedIn = guest.checkInStatus === "checked_in";
                return (
                  <View key={guest.id} style={styles.guestCard}>
                    <View style={styles.guestMain}>
                      <View style={styles.avatarCircle}>
                        <AppText variant="label" color="accentStart">
                          {guest.displayName.charAt(0)}
                        </AppText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <AppText variant="label" color="textPrimary">
                            {guest.displayName}
                          </AppText>
                          <View
                            style={[
                              styles.statusBadge,
                              guest.registrationStatus === "confirmed"
                                ? styles.badgeConfirmed
                                : guest.registrationStatus === "pending"
                                  ? styles.badgePending
                                  : styles.badgeCancelled,
                            ]}
                          >
                            <AppText variant="caption" style={styles.badgeText}>
                              {guest.registrationStatus.toUpperCase()}
                            </AppText>
                          </View>
                        </View>

                        <AppText
                          variant="caption"
                          color="textMuted"
                          style={{ marginTop: 2 }}
                        >
                          {guest.ticketType} • Ref: {guest.mockReference}
                        </AppText>

                        {isCheckedIn && (
                          <AppText
                            variant="caption"
                            color="success"
                            style={{ marginTop: 2 }}
                          >
                            Checked in at {guest.checkInTime || "21:15 SAST"}
                          </AppText>
                        )}
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.checkInBtn,
                        isCheckedIn
                          ? styles.btnCheckedIn
                          : styles.btnNotCheckedIn,
                      ]}
                      onPress={() => handleToggleCheckIn(guest.id)}
                      testID={`check-in-${guest.id}`}
                    >
                      <Icon
                        name={isCheckedIn ? "check" : "add"}
                        size="xs"
                        color={isCheckedIn ? "#FFF" : theme.colors.textPrimary}
                      />
                      <AppText
                        variant="caption"
                        style={{
                          color: isCheckedIn
                            ? "#FFF"
                            : theme.colors.textPrimary,
                          fontWeight: "bold",
                        }}
                      >
                        {isCheckedIn ? "Checked In" : "Check In"}
                      </AppText>
                    </Pressable>
                  </View>
                );
              })
            ) : (
              <EmptyState
                title="No Guests Found"
                description={
                  search
                    ? `No guests match "${search}".`
                    : `No ${filter} guests found for this event.`
                }
                icon="tickets"
              />
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 4 },
  searchSection: { marginBottom: theme.spacing.sm },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  loadingArea: { padding: theme.spacing.xxl, alignItems: "center" },
  stateArea: { padding: theme.spacing.xxl, alignItems: "center" },
  guestCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  guestMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(149, 145, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeConfirmed: { backgroundColor: "rgba(0, 200, 120, 0.15)" },
  badgePending: { backgroundColor: "rgba(255, 170, 0, 0.15)" },
  badgeCancelled: { backgroundColor: "rgba(255, 77, 77, 0.15)" },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  checkInBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
    gap: 4,
  },
  btnCheckedIn: { backgroundColor: theme.colors.success },
  btnNotCheckedIn: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
});
