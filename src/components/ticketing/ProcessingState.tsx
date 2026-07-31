import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export function ProcessingState() {
  return (
    <View
      style={styles.container}
      testID="processing-state"
      accessibilityLabel="Processing prototype payment"
    >
      <ActivityIndicator size="large" color={theme.colors.accentStart} />
      <AppText variant="heading" style={styles.title}>
        Processing prototype payment
      </AppText>
      <AppText
        variant="body"
        color={theme.colors.textMuted}
        style={styles.text}
      >
        Please do not close this screen.
      </AppText>
      <AppText
        variant="caption"
        color={theme.colors.textMuted}
        style={styles.text}
      >
        No real payment is being processed.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  text: {
    textAlign: "center",
  },
});
