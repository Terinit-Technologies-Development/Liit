import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Event } from "../../domain/events";
import { EventCard } from "../discovery/EventCard";
import { AppText } from "../ui/AppText";
import { DEMO_NOW_ISO } from "../../fixtures/discovery";
import { theme } from "../../design-system/theme";

export interface RelatedEventRailProps {
  title?: string;
  events: Event[];
  onPressEvent(eventId: string): void;
}

export function RelatedEventRail({
  title = "Related Events",
  events,
  onPressEvent,
}: RelatedEventRailProps) {
  if (events.length === 0) return null;

  return (
    <View style={styles.container}>
      <AppText variant="subheading" style={styles.sectionTitle}>
        {title}
      </AppText>

      <FlatList
        horizontal
        data={events}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <EventCard
              event={item}
              variant="standard"
              nowIso={DEMO_NOW_ISO}
              onPress={() => onPressEvent(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  railContent: {
    gap: theme.spacing.md,
  },
  cardWrapper: {
    width: 260,
  },
});
