import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { theme } from "../../design-system/theme";

export type SurfaceLevel = "recessed" | "primary" | "elevated" | "card";

export interface SurfaceProps {
  children: React.ReactNode;
  level?: SurfaceLevel;
  radius?: keyof typeof theme.radii;
  padding?: keyof typeof theme.spacing;
  border?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  level = "primary",
  radius = "md",
  padding = "md",
  border = false,
  style,
}) => {
  const backgroundColor =
    level === "recessed"
      ? theme.colors.surfaceRecessed
      : level === "elevated"
        ? theme.colors.surfaceElevated
        : level === "card"
          ? theme.colors.surfaceCard
          : theme.colors.surfacePrimary;

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: theme.radii[radius],
          padding: theme.spacing[padding],
          borderWidth: border ? 1 : 0,
          borderColor: border ? theme.colors.borderSubtle : "transparent",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
