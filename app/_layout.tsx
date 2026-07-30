import React from "react";
import { Stack } from "expo-router";
import { AppProviders } from "../src/providers/AppProviders";
import { ToastBanner } from "../src/components/ui/Toast";
import { theme } from "../src/design-system/theme";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.canvas },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(consumer)" />
        <Stack.Screen name="(creator)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
      <ToastBanner />
    </AppProviders>
  );
}
