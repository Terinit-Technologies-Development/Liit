import React from "react";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { PrototypePlaceholder } from "../../src/components/feedback/PrototypePlaceholder";

export default function TicketsScreen() {
  return (
    <Screen scrollable>
      <AppHeader title="My Tickets" showDevControls={true} />
      <PrototypePlaceholder
        title="Owned Tickets Wallet"
        routePurpose="Ticket QR codes, order history, and door entry pass validation."
        reason="not_implemented_in_this_pr"
        icon="tickets"
      />
    </Screen>
  );
}
