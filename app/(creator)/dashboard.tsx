import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function CreatorDashboardScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Creator Dashboard" showDevControls={true} />
      <PrototypePlaceholder
        title="Creator Analytics & Overview"
        routePurpose="Ticket sales metrics, gross revenue, payout schedules, and event performance."
        reason="not_implemented_in_this_pr"
        icon="dashboard"
        activeMode="creator"
      />
    </Screen>
  );
}
