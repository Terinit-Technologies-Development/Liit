import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Event } from "../../domain/events";
import { EventCard } from "../discovery/EventCard";
import { DEMO_NOW_ISO } from "../../fixtures/discovery";
import { SectionHeader } from "../ui/SectionHeader";
import { theme } from "../../design-system/theme";

export interface MapListViewProps {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent(eventId: string): void;
  onViewDetails(eventId: string): void;
}

export function MapListView({
  events,
  selectedEventId,
  onSelectEvent,
  onViewDetails,
}: MapListViewProps) {
  return (
    <View style={styles.container} testID="map-list-view">
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <SectionHeader
            title="Map Results"
            subtitle={`${events.length} events matching current map filters`}
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.cardWrapper,
              selectedEventId === item.id && styles.selectedWrapper,
            ]}
          >
            <EventCard
              event={item}
              variant="standard"
              nowIso={DEMO_NOW_ISO}
              onPress={() => {
                onSelectEvent(item.id);
                onViewDetails(item.id);
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  cardWrapper: {
    borderRadius: theme.radii.lg,
  },
  selectedWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.accentStart,
  },
});
