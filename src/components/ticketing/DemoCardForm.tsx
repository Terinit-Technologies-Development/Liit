import React from "react";
import { StyleSheet, View } from "react-native";
import { TextField } from "../forms/TextField";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export function DemoCardForm() {
  return (
    <View
      style={styles.container}
      accessibilityLabel="Demo card details. These fields are not editable."
    >
      <TextField
        label="Demo card number"
        value="4242 4242 4242 4242"
        disabled
      />

      <View style={styles.row}>
        <View style={styles.flexHalf}>
          <TextField label="Demo expiry" value="12/34" disabled />
        </View>

        <View style={styles.flexHalf}>
          <TextField
            label="Demo security code"
            value="123"
            disabled
            secureTextEntry
          />
        </View>
      </View>

      <AppText variant="caption" color={theme.colors.textMuted}>
        Prototype only. Do not enter real card information.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  flexHalf: {
    flex: 1,
  },
});
