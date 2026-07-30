import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { VenueSummary } from "../../domain/discovery";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";
import { Icon } from "../../design-system/icons/Icon";

export interface VenueCardProps {
  venue: VenueSummary;
  onPress(): void;
  testID?: string;
}

export function VenueCard({ venue, onPress, testID }: VenueCardProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${venue.name}, ${venue.suburb}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={getImageSource(venue.imageKey)}
        style={styles.image}
        accessibilityLabel={`${venue.name} venue photo`}
      />
      <View style={styles.content}>
        <AppText variant="heading" numberOfLines={1}>
          {venue.name}
        </AppText>
        <View style={styles.locationRow}>
          <Icon name="mapPin" size={12} color={theme.colors.textMuted} />
          <AppText variant="caption" color={theme.colors.textMuted}>
            {venue.suburb}, {venue.city}
          </AppText>
        </View>
        <AppText variant="caption" color={theme.colors.accentStart}>
          {venue.eventCount} upcoming events • {venue.followerCount} followers
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.xl,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
