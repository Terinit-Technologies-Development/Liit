import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function CreatorProfileScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Creator Brand Profile" showDevControls={true} />
      <PrototypePlaceholder
        title="Creator Brand Profile"
        routePurpose="Public host brand page, verification badge, bio, payout bank settings, and social links."
        reason="not_implemented_in_this_pr"
        icon="profile"
        activeMode="creator"
      />
    </Screen>
  );
}
