import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { MapPinVisualState } from "../../domain/map";
import { Icon } from "../../design-system/icons/Icon";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface MapPinProps {
  state: MapPinVisualState;
  title: string;
  onPress(): void;
  testID?: string;
}

export function MapPin({ state, title, onPress, testID }: MapPinProps) {
  const label =
    state === "live"
      ? `Live event: ${title}`
      : state === "sold_out"
        ? `Sold out event: ${title}`
        : state === "selected"
          ? `Selected event: ${title}`
          : `Event: ${title}`;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        selected: state === "selected",
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pin,
        styles[state],
        pressed && styles.pressed,
      ]}
    >
      <Icon
        name={
          state === "sold_out"
            ? "close"
            : state === "live"
              ? "sparkles"
              : "location"
        }
        size="sm"
        color={
          state === "selected" || state === "live"
            ? "#FFFFFF"
            : theme.colors.textPrimary
        }
      />

      {state === "live" ? (
        <AppText variant="caption" color="#FFFFFF" style={styles.liveText}>
          LIVE
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pin: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surfacePrimary,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  default: {
    backgroundColor: theme.colors.surfacePrimary,
  },
  selected: {
    backgroundColor: theme.colors.accentStart,
    borderColor: "#FFFFFF",
  },
  live: {
    backgroundColor: theme.colors.statusLive,
    borderColor: "#FFFFFF",
  },
  sold_out: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.textMuted,
    opacity: 0.8,
  },
  liveText: {
    fontWeight: "800",
    fontSize: 10,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
