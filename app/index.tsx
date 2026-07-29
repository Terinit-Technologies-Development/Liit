import React from "react";
import { Redirect } from "expo-router";
import { useAppStore } from "../src/state/useAppStore";
import { useSessionStore } from "../src/state/useSessionStore";
import { LoadingView } from "../src/components/feedback/LoadingView";
import { Screen } from "../src/components/ui/Screen";

export default function IndexRoute() {
  const {
    hasCompletedOnboarding,
    activeMode,
    hasHydrated: appHydrated,
  } = useAppStore();
  const { hasHydrated: sessionHydrated } = useSessionStore();

  const isHydrated = appHydrated && sessionHydrated;

  if (!isHydrated) {
    return (
      <Screen style={{ justifyContent: "center", alignItems: "center" }}>
        <LoadingView message="Initializing LIIT prototype..." />
      </Screen>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(public)/welcome" />;
  }

  if (activeMode === "creator") {
    return <Redirect href="/(creator)/dashboard" />;
  }

  return <Redirect href="/(consumer)/feed" />;
}
