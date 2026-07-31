import React from "react";
import { Stack } from "expo-router";

export default function CreatorStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activation" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="events/[eventId]" />
      <Stack.Screen name="payouts" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
