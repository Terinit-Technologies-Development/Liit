import React from "react";
import { View, ViewStyle } from "react-native";
import { theme } from "../../design-system/theme";

export interface DividerProps {
  color?: string;
  marginVertical?: keyof typeof theme.spacing | number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  color = theme.colors.divider,
  marginVertical = "md",
  style,
}) => {
  const mv =
    typeof marginVertical === "number"
      ? marginVertical
      : theme.spacing[marginVertical];

  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: color,
          marginVertical: mv,
          width: "100%",
        },
        style,
      ]}
    />
  );
};
