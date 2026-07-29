import React from "react";
import { View } from "react-native";
import { theme } from "../../design-system/theme";

export interface SpacerProps {
  size?: keyof typeof theme.spacing | number;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = "md",
  horizontal = false,
}) => {
  const pixelSize = typeof size === "number" ? size : theme.spacing[size];
  return (
    <View
      style={
        horizontal
          ? { width: pixelSize, height: 1 }
          : { height: pixelSize, width: 1 }
      }
    />
  );
};
