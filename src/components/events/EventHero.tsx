import React from "react";
import { StyleSheet, View } from "react-native";
import { Event } from "../../domain/events";
import { AppImage } from "../ui/AppImage";
import { IconButton } from "../ui/IconButton";
import { GlassSurface } from "../ui/GlassSurface";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface EventHeroProps {
  event: Event;
  onBack(): void;
  isSaved: boolean;
  onToggleSaved(): void;
  onShare(): void;
  onReport(): void;
}

export function EventHero({
  event,
  onBack,
  isSaved,
  onToggleSaved,
  onShare,
  onReport,
}: EventHeroProps) {
  return (
    <View style={styles.hero}>
      <AppImage
        source={getImageSource(event.heroImageKey)}
        style={styles.image}
        accessibilityLabel={`${event.title} event artwork`}
      />

      <GlassSurface style={styles.topActions} intensity="low">
        <IconButton
          icon="arrowLeft"
          accessibilityLabel="Navigate back"
          onPress={onBack}
          variant="glass"
        />

        <View style={styles.rightActions}>
          <IconButton
            testID="event-detail-save"
            icon={isSaved ? "bookmarkFilled" : "bookmark"}
            accessibilityLabel={
              isSaved
                ? `Remove ${event.title} from saved events`
                : `Save ${event.title}`
            }
            accessibilityState={{
              selected: isSaved,
            }}
            onPress={onToggleSaved}
            variant="glass"
          />

          <IconButton
            testID="event-detail-share"
            icon="share"
            accessibilityLabel={`Share ${event.title}`}
            onPress={onShare}
            variant="glass"
          />

          <IconButton
            testID="event-detail-report"
            icon="more"
            accessibilityLabel={`More actions for ${event.title}`}
            onPress={onReport}
            variant="glass"
          />
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 320,
    width: "100%",
    position: "relative",
    backgroundColor: theme.colors.surfacePrimary,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topActions: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.xs,
    borderRadius: theme.radii.pill,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
});
