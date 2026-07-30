import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { AppText } from "../ui/AppText";
import { SecondaryButton } from "../ui/SecondaryButton";
import { HostSummary } from "../../domain/events";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";
import { Icon } from "../../design-system/icons/Icon";

export interface HostRowProps {
  host: HostSummary;
  followed: boolean;
  onToggleFollow(): void;
  onPress(): void;
  testID?: string;
}

export function HostRow({
  host,
  followed,
  onToggleFollow,
  onPress,
  testID,
}: HostRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${host.name}, ${host.handle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Avatar source={getImageSource(host.avatarImageKey)} size="md" />

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <AppText variant="subheading" numberOfLines={1}>
            {host.name}
          </AppText>
          {host.isVerified ? (
            <Icon name="check" size={14} color={theme.colors.accentStart} />
          ) : null}
        </View>
        <AppText variant="caption" color={theme.colors.textMuted}>
          {host.handle}
        </AppText>
      </View>

      <SecondaryButton
        label={followed ? "Following" : "Follow"}
        onPress={onToggleFollow}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.md,
    minHeight: 56,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
