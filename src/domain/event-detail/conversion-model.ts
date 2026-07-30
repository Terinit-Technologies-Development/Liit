import { EventConversionMode, EventDetailPayload } from ".";

export interface EventConversionModel {
  mode: EventConversionMode;
  primaryLabel: string | null;
  supportingLabel: string;
  disabled: boolean;
}

export function getEventConversionModel(
  detail: EventDetailPayload,
): EventConversionModel {
  switch (detail.conversionMode) {
    case "paid":
      return {
        mode: "paid",
        primaryLabel: "Choose tickets",
        supportingLabel:
          detail.ticketTiers.length > 0
            ? "Select a ticket tier"
            : "Tickets available",
        disabled: false,
      };

    case "free_registration":
      return {
        mode: "free_registration",
        primaryLabel: "Register free",
        supportingLabel: "No payment required",
        disabled: false,
      };

    case "waitlist":
      return {
        mode: "waitlist",
        primaryLabel: "Join waitlist",
        supportingLabel: "This event is sold out",
        disabled: false,
      };

    case "none":
      return {
        mode: "none",
        primaryLabel: null,
        supportingLabel: "This event has ended",
        disabled: true,
      };

    default: {
      const exhaustive: never = detail.conversionMode;
      return exhaustive;
    }
  }
}
