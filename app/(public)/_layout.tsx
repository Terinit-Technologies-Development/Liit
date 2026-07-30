import React from "react";
import { Stack } from "expo-router";
import { theme } from "../../src/design-system/theme";

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvas },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="location" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
