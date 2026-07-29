import React from "react";
import { View, ViewStyle, FlexStyle } from "react-native";
import { theme } from "../../design-system/theme";

export interface RowProps {
  children: React.ReactNode;
  gap?: keyof typeof theme.spacing | number;
  align?: FlexStyle["alignItems"];
  justify?: FlexStyle["justifyContent"];
  wrap?: boolean;
  style?: ViewStyle;
}

export const Row: React.FC<RowProps> = ({
  children,
  gap = "md",
  align = "center",
  justify = "flex-start",
  wrap = false,
  style,
}) => {
  const gapValue = typeof gap === "number" ? gap : theme.spacing[gap];
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: gapValue,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : "nowrap",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
