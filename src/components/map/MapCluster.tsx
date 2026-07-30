import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface MapClusterProps {
  count: number;
  onPress(): void;
  testID?: string;
}

export function MapCluster({ count, onPress, testID }: MapClusterProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${count} events in this area`}
      accessibilityHint="Zooms into the event cluster"
      onPress={onPress}
      style={({ pressed }) => [styles.cluster, pressed && styles.pressed]}
    >
      <AppText variant="label" color="#FFFFFF" style={styles.text}>
        {count}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cluster: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accentStart,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    fontWeight: "800",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
