import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function MapScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="Map" showDevControls={true} />
      <PrototypePlaceholder
        title="Interactive Event Map"
        routePurpose="Geospatial venue discovery and live night-out heatmap representation."
        reason="not_implemented_in_this_pr"
        icon="map"
      />
    </Screen>
  );
}
