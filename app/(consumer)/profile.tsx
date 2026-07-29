import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function ProfileScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Consumer Profile" showDevControls={true} />
      <PrototypePlaceholder
        title="Consumer Profile & Settings"
        routePurpose="User preferences, saved events, social connections, and account controls."
        reason="not_implemented_in_this_pr"
        icon="profile"
      />
    </Screen>
  );
}
