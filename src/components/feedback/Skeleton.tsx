import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../design-system/theme";

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: keyof typeof theme.radii | number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = "md",
  style,
}) => {
  const br =
    typeof borderRadius === "number" ? borderRadius : theme.radii[borderRadius];

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: br,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading skeleton placeholder"
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.skeletonBase,
  },
});
