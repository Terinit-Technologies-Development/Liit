import { Redirect } from "expo-router";
import { useAppStore } from "../src/state/useAppStore";

export default function Index() {
  const { activeMode, hasCompletedOnboarding } = useAppStore();

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  if (activeMode === "creator") {
    return <Redirect href="/(creator)/dashboard" />;
  }

  return <Redirect href="/(consumer)/feed" />;
}
