import { WalletTicket, TicketStatus } from ".";

export type WalletTab = "upcoming" | "past";

export function classifyWalletTicket(
  ticket: WalletTicket,
  nowIso: string,
): WalletTab {
  if (
    ticket.status === "used" ||
    ticket.status === "cancelled" ||
    ticket.status === "refunded"
  ) {
    return "past";
  }

  const eventEnded =
    Date.parse(ticket.eventSnapshot.endTime) < Date.parse(nowIso);

  return eventEnded ? "past" : "upcoming";
}

export type EffectiveTicketState =
  | TicketStatus
  | "expired";

/**
 * Prototype presentation state for a wallet ticket: the persisted ticket
 * status wins, except a `valid` ticket whose event has ended under the demo
 * clock is presented as `expired` so entry presentation never shows an
 * active code for a finished event.
 */
export function getEffectiveTicketState(
  ticket: WalletTicket,
  nowIso: string,
): EffectiveTicketState {
  if (ticket.status !== "valid") {
    return ticket.status;
  }
  const eventEnded =
    Date.parse(ticket.eventSnapshot.endTime) < Date.parse(nowIso);
  return eventEnded ? "expired" : "valid";
}
