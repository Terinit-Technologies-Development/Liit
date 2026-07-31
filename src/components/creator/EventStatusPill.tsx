import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";
import { EventStatus } from "../../domain/creator";

interface EventStatusPillProps {
  status: EventStatus;
}

export function EventStatusPill({ status }: EventStatusPillProps) {
  let backgroundColor = theme.colors.surfaceElevated;
  let color: keyof typeof theme.colors = "textMuted";

  switch (status) {
    case "published":
      color = "accentStart";
      break;
    case "live":
      color = "success";
      break;
    case "completed":
      color = "textPrimary";
      break;
    case "cancelled":
      color = "destructive";
      break;
    case "draft":
    default:
      color = "textMuted";
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <AppText variant="caption" color={color} style={styles.text}>
        {status.toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "bold",
  },
});
