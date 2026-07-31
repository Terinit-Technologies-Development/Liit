import React from "react";
import { Pressable, ViewStyle, StyleSheet, StyleProp } from "react-native";
import { theme } from "../../design-system/theme";

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  radius?: "xl" | "xxl";
  padding?: keyof typeof theme.spacing;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  radius = "xl",
  padding = "lg",
  accessibilityLabel,
  style,
  testID,
}) => {
  const content = (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: theme.radii[radius],
          padding: theme.spacing[padding],
          backgroundColor: pressed
            ? theme.colors.surfaceElevated
            : theme.colors.surfaceCard,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: "hidden",
  },
});

export const SurfaceCard = Card;
