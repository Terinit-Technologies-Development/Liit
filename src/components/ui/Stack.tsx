import React from "react";
import { View, ViewStyle, FlexStyle } from "react-native";
import { theme } from "../../design-system/theme";

export interface StackProps {
  children: React.ReactNode;
  gap?: keyof typeof theme.spacing | number;
  align?: FlexStyle["alignItems"];
  justify?: FlexStyle["justifyContent"];
  style?: ViewStyle;
}

export const Stack: React.FC<StackProps> = ({
  children,
  gap = "md",
  align = "stretch",
  justify = "flex-start",
  style,
}) => {
  const gapValue = typeof gap === "number" ? gap : theme.spacing[gap];
  return (
    <View
      style={[
        { gap: gapValue, alignItems: align, justifyContent: justify },
        style,
      ]}
    >
      {children}
    </View>
  );
};
