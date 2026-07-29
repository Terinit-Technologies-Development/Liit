import React, { useState } from "react";
import { View, StyleSheet, StyleProp, ImageStyle } from "react-native";
import { Image, ImageProps } from "expo-image";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface AppImageProps extends Omit<ImageProps, "onError"> {
  fallbackIcon?: string;
  style?: StyleProp<ImageStyle>;
}

export const AppImage: React.FC<AppImageProps> = ({
  source,
  style,
  contentFit = "cover",
  accessibilityLabel,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !source) {
    return (
      <View style={[styles.fallbackContainer, style as any]}>
        <Icon name="sparkles" size="lg" color={theme.colors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={[styles.image, style]}
      contentFit={contentFit}
      transition={300}
      onError={() => setHasError(true)}
      accessibilityLabel={accessibilityLabel || "Image content"}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: theme.colors.surfacePrimary,
  },
  fallbackContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderRadius: theme.radii.md,
  },
});
