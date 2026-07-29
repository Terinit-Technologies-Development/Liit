import React from "react";
import { Stack } from "expo-router";
import { theme } from "../../src/design-system/theme";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvas },
      }}
    >
      <Stack.Screen name="prototype-controls" />
      <Stack.Screen name="component-preview" />
    </Stack>
  );
}
