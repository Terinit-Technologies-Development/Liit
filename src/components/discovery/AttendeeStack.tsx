import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { AppText } from "../ui/AppText";
import { getImageSource, ImageAssetKey } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface AttendeeStackProps {
  imageKeys?: (ImageAssetKey | string)[];
  count: number;
}

export function AttendeeStack({ imageKeys = [], count }: AttendeeStackProps) {
  const visibleKeys = imageKeys.slice(0, 3);

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${count} attendees going`}
    >
      <View style={styles.avatarsRow}>
        {visibleKeys.map((key, index) => (
          <View
            key={index}
            style={[styles.avatarWrapper, { marginLeft: index > 0 ? -8 : 0 }]}
          >
            <Avatar source={getImageSource(key)} size="xs" />
          </View>
        ))}
      </View>
      <AppText variant="caption" color={theme.colors.textMuted}>
        +{count} going
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.pill,
  },
});
