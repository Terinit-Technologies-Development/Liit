import React from "react";
import { TicketStatus } from "../../domain/ticketing";
import { StatusPill } from "../ui/StatusPill";

export interface TicketStatusPillProps {
  status: TicketStatus;
}

export function TicketStatusPill({ status }: TicketStatusPillProps) {
  switch (status) {
    case "valid":
      return <StatusPill label="Valid" type="success" />;
    case "pending":
      return <StatusPill label="Pending" type="warning" />;
    case "used":
      return <StatusPill label="Used" type="neutral" />;
    case "cancelled":
      return <StatusPill label="Cancelled" type="sold_out" />;
    case "refunded":
      return <StatusPill label="Refunded" type="sold_out" />;
  }
}
