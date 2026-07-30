import React from "react";
import { Share, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppImage } from "../../src/components/ui/AppImage";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { PrototypeBadge } from "../../src/components/ui/PrototypeBadge";
import { Card } from "../../src/components/ui/Card";
import { discoveryEvents } from "../../src/fixtures/discovery";
import { getImageSource } from "../../src/assets/image-registry";
import { showToast } from "../../src/components/ui/Toast";
import { theme } from "../../src/design-system/theme";

export default function EventShareModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId ?? "";

  const event = discoveryEvents.find((e) => e.id === eventId);
  const shareUrl = `https://liit.app/events/${eventId}`;

  const handleNativeShare = async () => {
    try {
      if (event) {
        await Share.share({
          title: event.title,
          message: `${event.title}\n${event.venue.name}\n${shareUrl}`,
        });
      }
    } catch {
      showToast("Share", "Unable to launch native share sheet.", "info");
    }
  };

  const handleCopyLink = () => {
    showToast("Link copied", `Prototype link copied: ${shareUrl}`, "success");
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.screen}>
      <AppHeader
        title="Share Event"
        showBack={false}
        rightAction={{
          label: "Close",
          onPress: () => router.back(),
        }}
      />

      <View style={styles.content}>
        <PrototypeBadge label="LIIT PROTOTYPE PREVIEW" />

        {event ? (
          <Card radius="xl" padding="lg" style={styles.card}>
            <AppImage
              source={getImageSource(event.heroImageKey)}
              style={styles.heroImage}
              accessibilityLabel={event.title}
            />

            <AppText variant="subheading" style={styles.title}>
              {event.title}
            </AppText>

            <AppText variant="caption" color={theme.colors.textMuted}>
              📍 {event.venue.name}, {event.venue.suburb}
            </AppText>

            <View style={styles.linkBox}>
              <AppText
                variant="caption"
                color={theme.colors.accentStart}
                numberOfLines={1}
              >
                {shareUrl}
              </AppText>
            </View>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <GradientButton label="Share Event" onPress={handleNativeShare} />
          <SecondaryButton label="Copy Link" onPress={handleCopyLink} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: 180,
    borderRadius: theme.radii.lg,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  linkBox: {
    width: "100%",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    alignItems: "center",
  },
  actions: {
    width: "100%",
    gap: theme.spacing.md,
  },
});
