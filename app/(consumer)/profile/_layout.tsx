import React from "react";
import { Stack } from "expo-router";
import { theme } from "../../../src/design-system/theme";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvas },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="activity" />
    </Stack>
  );
}
