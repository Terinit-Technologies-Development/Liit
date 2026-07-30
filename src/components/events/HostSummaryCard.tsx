import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { HostSummary } from "../../domain/events";
import { Card } from "../ui/Card";
import { AppText } from "../ui/AppText";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../../design-system/icons/Icon";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface HostSummaryCardProps {
  host: HostSummary;
  onPress(): void;
}

export function HostSummaryCard({ host, onPress }: HostSummaryCardProps) {
  return (
    <Card radius="xl" padding="md" style={styles.card}>
      <Pressable
        testID="event-host-card"
        accessibilityRole="button"
        accessibilityLabel={`Hosted by ${host.name}. Tap to view public host profile`}
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <Avatar
          source={getImageSource(host.avatarImageKey)}
          name={host.name}
          size="md"
        />

        <View style={styles.infoCol}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Hosted by
          </AppText>
          <View style={styles.nameRow}>
            <AppText variant="subheading" style={styles.name}>
              {host.name}
            </AppText>
            {host.isVerified ? (
              <Icon
                name="checkmark"
                size="sm"
                color={theme.colors.accentStart}
              />
            ) : null}
          </View>
        </View>

        <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  name: {
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
});
