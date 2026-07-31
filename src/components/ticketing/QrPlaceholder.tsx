import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "../../design-system/icons/Icon";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface QrPlaceholderProps {
  ticketId: string;
  enabled: boolean;
  testID?: string;
}

export function QrPlaceholder({
  ticketId,
  enabled,
  testID,
}: QrPlaceholderProps) {
  return (
    <View
      testID={testID ?? "full-ticket-qr-placeholder"}
      accessibilityLabel={
        enabled
          ? "Simulated QR placeholder. Not scannable and not valid for entry."
          : "Entry code unavailable for this ticket status."
      }
      style={[styles.container, !enabled && styles.disabled]}
    >
      <Icon
        name="qr"
        size={64}
        color={enabled ? theme.colors.textPrimary : theme.colors.textMuted}
      />

      <AppText
        variant="label"
        style={styles.boldText}
        color={enabled ? theme.colors.textPrimary : theme.colors.textMuted}
      >
        SIMULATED QR
      </AppText>

      <AppText
        variant="caption"
        color={enabled ? theme.colors.textMuted : theme.colors.textMuted}
      >
        NOT SCANNABLE
      </AppText>

      <AppText
        variant="label"
        color={enabled ? theme.colors.accentStart : theme.colors.textMuted}
      >
        {ticketId}
      </AppText>

      <View pointerEvents="none" style={styles.watermark}>
        <AppText variant="label" style={styles.watermarkText}>
          LIIT PROTOTYPE — NOT VALID FOR ENTRY
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.canvas,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.xs,
    position: "relative",
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.4,
    backgroundColor: theme.colors.surfacePrimary,
  },
  boldText: {
    fontWeight: "800",
    letterSpacing: 1,
  },
  watermark: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    backgroundColor: "rgba(149, 145, 255, 0.15)",
    borderRadius: theme.radii.xs,
  },
  watermarkText: {
    color: theme.colors.accentStart,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
