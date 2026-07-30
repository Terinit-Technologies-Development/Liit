import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { AppText } from "./AppText";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface AvatarProps {
  uri?: string;
  source?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isVerified?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  source,
  name = "User",
  size = "md",
  isVerified = false,
  style,
}) => {
  const imageUri = uri || source;
  const dimension =
    size === "sm" ? 32 : size === "lg" ? 56 : size === "xl" ? 80 : 44;

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`${name}'s avatar`}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: theme.colors.surfaceElevated,
            },
          ]}
        >
          <AppText variant="button" color={theme.colors.accentStart}>
            {initials}
          </AppText>
        </View>
      )}

      {isVerified ? (
        <View
          style={[
            styles.badge,
            {
              bottom: 0,
              right: 0,
              backgroundColor: theme.colors.accentSolid,
              borderColor: theme.colors.canvas,
            },
          ]}
        >
          <Icon name="check" size={10} color={theme.colors.textInverse} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: theme.colors.surfacePrimary,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  badge: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
