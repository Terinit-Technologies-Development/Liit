import { TicketTier } from "../event-detail";
import { CheckoutQuote } from ".";
import { calculateServiceFeeMinor } from "./fee-policy";

export type TierQuantities = Record<string, number>;

export function buildCheckoutQuote(
  eventId: string,
  tiers: TicketTier[],
  quantities: TierQuantities,
): CheckoutQuote {
  const lines = tiers
    .map((tier) => {
      const quantity = quantities[tier.id] ?? 0;

      if (quantity <= 0) {
        return null;
      }

      if (quantity > tier.maxPerOrder) {
        throw new Error(`${tier.name} exceeds its per-order limit.`);
      }

      if (tier.remaining !== null && quantity > tier.remaining) {
        throw new Error(
          `${tier.name} does not have enough remaining inventory.`,
        );
      }

      if (tier.state === "sold_out") {
        throw new Error(`${tier.name} is sold out.`);
      }

      return {
        tierId: tier.id,
        tierName: tier.name,
        quantity,
        unitPriceMinor: tier.priceMinor,
        lineTotalMinor: tier.priceMinor * quantity,
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  const subtotalMinor = lines.reduce(
    (sum, line) => sum + line.lineTotalMinor,
    0,
  );

  const serviceFeeMinor = calculateServiceFeeMinor(subtotalMinor);

  return {
    eventId,
    currency: "ZAR",
    lines,
    totalQuantity,
    subtotalMinor,
    serviceFeeMinor,
    totalMinor: subtotalMinor + serviceFeeMinor,
  };
}
