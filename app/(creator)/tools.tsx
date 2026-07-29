import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function CreatorToolsScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Creator Tools" showDevControls={true} />
      <PrototypePlaceholder
        title="Host & Venue Tools"
        routePurpose="Door check-in scanner, guestlists, promotional links, and team permission controls."
        reason="not_implemented_in_this_pr"
        icon="tools"
        activeMode="creator"
      />
    </Screen>
  );
}
