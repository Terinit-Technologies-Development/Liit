import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface TypingIndicatorProps {
  name: string;
  testID?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  name,
  testID = "typing-indicator",
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.bubble}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotMiddle]} />
        <View style={styles.dot} />
      </View>
      <AppText variant="caption" color={theme.colors.textMuted}>
        {name} is typing…
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfacePrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentStart,
    opacity: 0.6,
  },
  dotMiddle: {
    opacity: 0.9,
  },
});
