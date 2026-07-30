import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { IconButton } from "../ui/IconButton";
import { StatusPill } from "../ui/StatusPill";
import { PriceLabel } from "./PriceLabel";
import { AttendeeStack } from "./AttendeeStack";
import { Event } from "../../domain/events";
import {
  EventDisplayStatus,
  toEventCardViewModel,
} from "../../domain/discovery/event-presentation";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export type EventCardVariant = "featured" | "standard" | "compact";

export interface EventCardProps {
  event: Event;
  variant: EventCardVariant;
  nowIso: string;
  attendeeCount?: number;
  attendeeAvatarKeys?: string[];
  onPress(): void;
  onSave?(): void;
  testID?: string;
}

function statusTone(status: EventDisplayStatus) {
  switch (status) {
    case "Live":
      return "live" as const;
    case "Selling Fast":
      return "warning" as const;
    case "Sold Out":
      return "sold_out" as const;
    case "Free":
      return "free" as const;
    case "Upcoming":
      return "info" as const;
    case "Completed":
      return "info" as const;
    case "Cancelled":
      return "neutral" as const;
  }
}

export function EventCard({
  event,
  variant,
  nowIso,
  attendeeCount = 0,
  attendeeAvatarKeys = [],
  onPress,
  onSave,
  testID,
}: EventCardProps) {
  const model = toEventCardViewModel(event, {
    nowIso,
    attendeeCount,
  });

  const imageSource = getImageSource(model.imageKey);

  if (variant === "compact") {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Open ${model.title}`}
        onPress={onPress}
        style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}
      >
        <Image
          source={imageSource}
          style={styles.compactImage}
          accessibilityLabel={`${model.title} event artwork`}
        />
        <View style={styles.compactContent}>
          <View style={styles.topLine}>
            <StatusPill label={model.status} type={statusTone(model.status)} />
            <PriceLabel label={model.priceLabel} />
          </View>
          <AppText variant="subheading" numberOfLines={1}>
            {model.title}
          </AppText>
          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            numberOfLines={1}
          >
            {model.dateLabel} • {model.venueLine}
          </AppText>
        </View>
      </Pressable>
    );
  }

  if (variant === "featured") {
    return (
      <Pressable
        testID={testID ?? "feed-featured-event"}
        accessibilityRole="button"
        accessibilityLabel={`Open featured event ${model.title}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.featuredWrapper,
          pressed && styles.pressed,
        ]}
      >
        <Card radius="xxl" padding="none" style={styles.featuredCard}>
          <Image
            source={imageSource}
            style={styles.featuredImage}
            accessibilityLabel={`${model.title} featured artwork`}
          />
          <View style={styles.featuredOverlay}>
            <View style={styles.topLine}>
              <StatusPill
                label={model.status}
                type={statusTone(model.status)}
              />
              {onSave ? (
                <IconButton
                  icon={model.isSaved ? "bookmarkFilled" : "bookmark"}
                  onPress={onSave}
                  accessibilityLabel={
                    model.isSaved
                      ? `Remove ${model.title} from saved events`
                      : `Save ${model.title}`
                  }
                  variant="surface"
                  size="sm"
                />
              ) : null}
            </View>

            <View style={styles.featuredBottom}>
              <AppText variant="caption" color={theme.colors.accentStart}>
                EDITORIAL PICK • {model.category.toUpperCase()}
              </AppText>
              <AppText variant="title" numberOfLines={2}>
                {model.title}
              </AppText>
              <AppText
                variant="body"
                color={theme.colors.textSecondary}
                numberOfLines={1}
              >
                {model.dateLabel} • {model.venueLine}
              </AppText>
              <View style={styles.bottomLine}>
                <PriceLabel label={model.priceLabel} />
                {attendeeCount > 0 ? (
                  <AttendeeStack
                    imageKeys={attendeeAvatarKeys}
                    count={attendeeCount}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  }

  // Standard Variant
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Open ${model.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.standardWrapper,
        pressed && styles.pressed,
      ]}
    >
      <Card radius="xl" padding="none" style={styles.standardCard}>
        <Image
          source={imageSource}
          style={styles.standardImage}
          accessibilityLabel={`${model.title} event artwork`}
        />
        <View style={styles.standardContent}>
          <View style={styles.topLine}>
            <StatusPill label={model.status} type={statusTone(model.status)} />
            {onSave ? (
              <IconButton
                icon={model.isSaved ? "bookmarkFilled" : "bookmark"}
                onPress={onSave}
                accessibilityLabel={
                  model.isSaved
                    ? `Remove ${model.title} from saved events`
                    : `Save ${model.title}`
                }
                variant="surface"
                size="sm"
              />
            ) : null}
          </View>

          <AppText variant="heading" numberOfLines={2}>
            {model.title}
          </AppText>

          <AppText
            variant="caption"
            color={theme.colors.textMuted}
            numberOfLines={1}
          >
            {model.dateLabel} • {model.venueLine}
          </AppText>

          <View style={styles.bottomLine}>
            <PriceLabel label={model.priceLabel} />
            {attendeeCount > 0 ? (
              <AttendeeStack
                imageKeys={attendeeAvatarKeys}
                count={attendeeCount}
              />
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export function EventCardSkeleton() {
  return (
    <Card radius="xl" padding="none" style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonPill} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSub} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  featuredWrapper: {
    marginVertical: theme.spacing.xs,
  },
  featuredCard: {
    height: 320,
    backgroundColor: theme.colors.surfacePrimary,
    overflow: "hidden",
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    padding: theme.spacing.lg,
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 13, 22, 0.65)",
  },
  featuredBottom: {
    gap: theme.spacing.xs,
  },
  standardWrapper: {
    width: 240,
  },
  standardCard: {
    backgroundColor: theme.colors.surfacePrimary,
    overflow: "hidden",
  },
  standardImage: {
    width: "100%",
    height: 140,
  },
  standardContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  compactCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    padding: theme.spacing.sm,
    gap: theme.spacing.md,
    alignItems: "center",
  },
  compactImage: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.md,
  },
  compactContent: {
    flex: 1,
    gap: 4,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: theme.spacing.xs,
  },
  skeletonCard: {
    height: 220,
    backgroundColor: theme.colors.surfacePrimary,
    marginVertical: theme.spacing.xs,
  },
  skeletonImage: {
    height: 120,
    backgroundColor: theme.colors.surfaceElevated,
  },
  skeletonBody: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  skeletonPill: {
    width: 80,
    height: 20,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.full,
  },
  skeletonTitle: {
    width: "70%",
    height: 20,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 4,
  },
  skeletonSub: {
    width: "40%",
    height: 14,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
