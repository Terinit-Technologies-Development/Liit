import React from "react";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";
import { AppButton } from "../../src/components/ui/AppButton";
import { Stack } from "../../src/components/ui/Stack";
import { useAppStore } from "../../src/state/useAppStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingCompleted = useAppStore(
    (state) => state.setOnboardingCompleted,
  );

  const handleComplete = () => {
    setOnboardingCompleted(true);
    router.replace("/(consumer)/feed");
  };

  return (
    <Screen scrollable>
      <AppHeader title="LIIT Onboarding" showDevControls={true} />
      <Stack gap="lg" style={{ marginTop: 16 }}>
        <PrototypePlaceholder
          title="Onboarding Flow"
          routePurpose="Initial user orientation, preference setup, and city selection foundation."
          reason="not_implemented_in_this_pr"
          icon="sparkles"
        />
        <AppButton
          label="Enter LIIT Prototype Shell"
          onPress={handleComplete}
          variant="primary"
          fullWidth
        />
      </Stack>
    </Screen>
  );
}
