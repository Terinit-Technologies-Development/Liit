import React from "react";
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native";
import { theme } from "../../design-system/theme";

export interface GlassSurfaceProps {
  children: React.ReactNode;
  radius?: keyof typeof theme.radii;
  padding?: keyof typeof theme.spacing;
  border?: boolean;
  intensity?: "low" | "medium" | "high" | string;
  style?: StyleProp<ViewStyle>;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  radius = "xl",
  padding = "lg",
  border = true,
  intensity: _intensity = "medium",
  style,
}) => {
  return (
    <View
      style={[
        styles.glass,
        {
          borderRadius: theme.radii[radius],
          padding: theme.spacing[padding],
          borderWidth: border ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glass: {
    backgroundColor: theme.colors.glass,
    borderColor: theme.colors.ghostBorder,
    overflow: "hidden",
  },
});
