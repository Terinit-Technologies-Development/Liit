import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function CreateEventScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Create Event" showDevControls={true} />
      <PrototypePlaceholder
        title="Event Creation Builder"
        routePurpose="Multi-step event creation, ticketing configuration, line-up drafting, and venue mapping."
        reason="not_implemented_in_this_pr"
        icon="create"
        activeMode="creator"
      />
    </Screen>
  );
}
