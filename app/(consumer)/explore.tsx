import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function ExploreScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Explore" showDevControls={true} />
      <PrototypePlaceholder
        title="Explore & Search"
        routePurpose="Category browsing, search filters, and curated venue/host discovery."
        reason="not_implemented_in_this_pr"
        icon="explore"
      />
    </Screen>
  );
}
