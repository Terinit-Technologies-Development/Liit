import { WalletTicket } from ".";

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
