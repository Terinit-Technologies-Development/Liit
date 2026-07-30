import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";
import { FeedEntry } from "../../domain/discovery";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface LiveContentPlaceholderCardProps {
  entry: Extract<FeedEntry, { kind: "live_placeholder" }>;
  onPress(): void;
}

export function LiveContentPlaceholderCard({
  entry,
  onPress,
}: LiveContentPlaceholderCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open live stream preview ${entry.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
    >
      <Card radius="xl" padding="none" style={styles.card}>
        <Image
          source={getImageSource(entry.previewImageKey)}
          style={styles.image}
        />
        <View style={styles.overlay}>
          <View style={styles.topRow}>
            <StatusPill label="PROTOTYPE LIVE" type="live" />
            <View style={styles.viewerBadge}>
              <AppText variant="caption" style={styles.viewerText}>
                👁 {entry.viewerCount} watching
              </AppText>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <AppText variant="heading" style={styles.title}>
              {entry.title}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Hosted by {entry.host.name} • No live video stream connected
            </AppText>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: theme.spacing.xs,
  },
  card: {
    height: 200,
    backgroundColor: theme.colors.surfacePrimary,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    padding: theme.spacing.md,
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 13, 22, 0.4)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewerBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  viewerText: {
    color: "#fff",
    fontSize: 11,
  },
  bottomRow: {
    gap: 4,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
