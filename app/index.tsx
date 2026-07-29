import { Redirect } from "expo-router";
import { useAppStore } from "../src/state/useAppStore";

export default function IndexRoute() {
  const { hasCompletedOnboarding, activeMode } = useAppStore();

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(public)/welcome" />;
  }

  if (activeMode === "creator") {
    return <Redirect href="/(creator)/dashboard" />;
  }

  return <Redirect href="/(consumer)/feed" />;
}
