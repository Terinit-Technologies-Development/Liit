import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { AppImage } from "../ui/AppImage";
import { getImageSource } from "../../assets/image-registry";
import { EventInquiryContext } from "../../domain/social";
import { theme } from "../../design-system/theme";

export interface EventContextCardProps {
  context: EventInquiryContext;
  onPressEvent?(): void;
  testID?: string;
}

export const EventContextCard: React.FC<EventContextCardProps> = ({
  context,
  onPressEvent,
  testID = "event-context-card",
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Event context: ${context.eventTitle}`}
      onPress={onPressEvent}
      style={({ pressed }) => [
        styles.container,
        pressed && onPressEvent && styles.pressed,
      ]}
      testID={testID}
    >
      <AppImage
        source={getImageSource(context.eventImageKey)}
        style={styles.thumbnail}
        contentFit="cover"
      />
      <View style={styles.content}>
        <AppText variant="subheading" style={styles.title} numberOfLines={1}>
          {context.eventTitle}
        </AppText>
        <AppText
          variant="caption"
          color={theme.colors.accentStart}
          numberOfLines={1}
        >
          {context.eventDateText}
        </AppText>
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          numberOfLines={1}
        >
          {context.eventVenueText}
        </AppText>
      </View>
      {onPressEvent ? (
        <View style={styles.actionChip}>
          <AppText variant="caption" style={styles.actionChipText}>
            View Event
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  actionChip: {
    backgroundColor: "rgba(149, 145, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: "rgba(149, 145, 255, 0.3)",
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.accentStart,
  },
});
