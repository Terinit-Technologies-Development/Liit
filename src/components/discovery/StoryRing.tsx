import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { AppText } from "../ui/AppText";
import { getImageSource, ImageAssetKey } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface StoryRingItem {
  id: string;
  name: string;
  avatarKey: ImageAssetKey;
  hasUnseen?: boolean;
}

export interface StoryRingProps {
  item: StoryRingItem;
  onPress(): void;
}

export function StoryRing({ item, onPress }: StoryRingProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name} story`}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.ringBorder,
          item.hasUnseen ? styles.unseenBorder : styles.seenBorder,
        ]}
      >
        <Avatar source={getImageSource(item.avatarKey)} size="md" />
      </View>
      <AppText
        variant="caption"
        color={theme.colors.textSecondary}
        numberOfLines={1}
        style={styles.label}
      >
        {item.name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 68,
    gap: 4,
  },
  ringBorder: {
    padding: 2,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
  },
  unseenBorder: {
    borderColor: theme.colors.accentStart,
  },
  seenBorder: {
    borderColor: theme.colors.surfaceElevated,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
