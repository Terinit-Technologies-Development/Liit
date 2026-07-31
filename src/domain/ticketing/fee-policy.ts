export const PROTOTYPE_SERVICE_FEE_RATE_BPS = 500;

export const PROTOTYPE_SERVICE_FEE_LABEL = "Prototype service fee (5%)";

export function calculateServiceFeeMinor(subtotalMinor: number): number {
  if (!Number.isInteger(subtotalMinor) || subtotalMinor < 0) {
    throw new Error("Subtotal must be a non-negative integer in minor units.");
  }

  if (subtotalMinor === 0) {
    return 0;
  }

  return Math.round((subtotalMinor * PROTOTYPE_SERVICE_FEE_RATE_BPS) / 10_000);
}
