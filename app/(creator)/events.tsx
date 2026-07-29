import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function CreatorEventsScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Hosted Events" showDevControls={true} />
      <PrototypePlaceholder
        title="Hosted Events & Drafts"
        routePurpose="Management of active, upcoming, draft, and historical events hosted by this creator."
        reason="not_implemented_in_this_pr"
        icon="events"
        activeMode="creator"
      />
    </Screen>
  );
}
