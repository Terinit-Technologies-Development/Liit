import React from "react";
import { StyleSheet, View } from "react-native";
import { PublicHostProfile } from "../../domain/hosts/public-host";
import { AppImage } from "../ui/AppImage";
import { Avatar } from "../ui/Avatar";
import { AppText } from "../ui/AppText";
import { IconButton } from "../ui/IconButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import { GradientButton } from "../ui/GradientButton";
import { Icon } from "../../design-system/icons/Icon";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface HostIdentityHeaderProps {
  profile: PublicHostProfile;
  followed: boolean;
  onBack(): void;
  onToggleFollow(): void;
  onMessage(): void;
  onOpenMenu(): void;
}

export function HostIdentityHeader({
  profile,
  followed,
  onBack,
  onToggleFollow,
  onMessage,
  onOpenMenu,
}: HostIdentityHeaderProps) {
  const { host, coverImageKey } = profile;

  return (
    <View style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverBox}>
        <AppImage
          source={getImageSource(coverImageKey)}
          style={styles.coverImage}
          accessibilityLabel={`${host.name} cover artwork`}
        />
        <View style={styles.topBar}>
          <IconButton
            icon="arrowLeft"
            accessibilityLabel="Navigate back"
            onPress={onBack}
            variant="glass"
          />
          <IconButton
            testID="host-more-actions"
            icon="more"
            accessibilityLabel="More host actions"
            onPress={onOpenMenu}
            variant="glass"
          />
        </View>
      </View>

      {/* Avatar & Action Row */}
      <View style={styles.profileHeaderContent}>
        <View style={styles.avatarWrapper}>
          <Avatar
            source={getImageSource(host.avatarImageKey)}
            name={host.name}
            size="lg"
          />
        </View>

        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <AppText variant="display" style={styles.name}>
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

        <View style={styles.actionRow}>
          {followed ? (
            <SecondaryButton
              testID="host-follow"
              label="Following"
              onPress={onToggleFollow}
              style={styles.actionBtn}
            />
          ) : (
            <GradientButton
              testID="host-follow"
              label="Follow"
              onPress={onToggleFollow}
              style={styles.actionBtn}
            />
          )}

          <IconButton
            testID="host-message"
            icon="chat"
            accessibilityLabel={`Message ${host.name}`}
            onPress={onMessage}
            variant="surface"
            size="md"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfacePrimary,
  },
  coverBox: {
    height: 180,
    width: "100%",
    position: "relative",
    backgroundColor: theme.colors.surfaceElevated,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  topBar: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileHeaderContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    marginTop: -40,
  },
  avatarWrapper: {
    borderWidth: 4,
    borderColor: theme.colors.canvas,
    borderRadius: theme.radii.pill,
    alignSelf: "flex-start",
  },
  nameSection: {
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  name: {
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
