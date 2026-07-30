import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton } from "../ui/IconButton";
import { theme } from "../../design-system/theme";

export interface MapControlsProps {
  onRecenter(): void;
  onZoomIn(): void;
  onZoomOut(): void;
}

export function MapControls({
  onRecenter,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  return (
    <View style={styles.container}>
      <IconButton
        testID="map-recenter"
        icon="location"
        accessibilityLabel="Recenter map to Johannesburg city centre"
        onPress={onRecenter}
        variant="surface"
        size="md"
      />
      <IconButton
        testID="map-zoom-in"
        icon="create"
        accessibilityLabel="Zoom in map"
        onPress={onZoomIn}
        variant="surface"
        size="md"
      />
      <IconButton
        testID="map-zoom-out"
        icon="close"
        accessibilityLabel="Zoom out map"
        onPress={onZoomOut}
        variant="surface"
        size="md"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: theme.spacing.md,
    top: theme.spacing.md,
    gap: theme.spacing.xs,
    zIndex: 10,
  },
});
