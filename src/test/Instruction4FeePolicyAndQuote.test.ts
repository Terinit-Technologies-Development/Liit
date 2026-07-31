/**
 * Instruction 4 — Fee Policy and Quote building
 *
 * Verifies that calculateServiceFeeMinor and buildCheckoutQuote apply
 * the 5% fee correctly for paid tiers and zero fee for free tiers.
 */

import { calculateServiceFeeMinor } from "../../src/domain/ticketing/fee-policy";
import { buildCheckoutQuote } from "../../src/domain/ticketing/quote";
import { TicketTier } from "../../src/domain/event-detail";

const makeTier = (overrides: Partial<TicketTier>): TicketTier => ({
  id: "tier-test",
  name: "General",
  priceMinor: 10000,
  currency: "ZAR",
  state: "available",
  remaining: 50,
  maxPerOrder: 5,
  ...overrides,
});

describe("Fee Policy — calculateServiceFeeMinor", () => {
  it("applies 5% fee on paid order subtotals", () => {
    // 10000 minor (R100) × 5% = 500 minor (R5)
    expect(calculateServiceFeeMinor(10000)).toBe(500);
  });

  it("applies 5% and rounds to the nearest integer", () => {
    // 9999 × 0.05 = 499.95 → 500 (Math.round)
    expect(calculateServiceFeeMinor(9999)).toBe(500);
  });

  it("returns 0 for a zero subtotal (free event)", () => {
    expect(calculateServiceFeeMinor(0)).toBe(0);
  });

  it("throws on negative subtotal", () => {
    expect(() => calculateServiceFeeMinor(-1)).toThrow();
  });
});

describe("buildCheckoutQuote", () => {
  const paidTier = makeTier({ id: "t1", priceMinor: 25000 }); // R250
  const freeTier = makeTier({ id: "t2", priceMinor: 0 });

  it("builds a quote with one paid tier and correct fee", () => {
    const quote = buildCheckoutQuote("evt-1", [paidTier], { t1: 2 });

    expect(quote.eventId).toBe("evt-1");
    expect(quote.totalQuantity).toBe(2);

    const line = quote.lines[0];
    expect(line.tierId).toBe("t1");
    expect(line.quantity).toBe(2);
    expect(line.unitPriceMinor).toBe(25000);
    expect(line.lineTotalMinor).toBe(50000); // 2 × 25000

    expect(quote.subtotalMinor).toBe(50000);
    expect(quote.serviceFeeMinor).toBe(2500); // 5% of 50000
    expect(quote.totalMinor).toBe(52500); // 50000 + 2500
  });

  it("builds a quote with one free tier and zero fee", () => {
    const quote = buildCheckoutQuote("evt-2", [freeTier], { t2: 1 });

    expect(quote.subtotalMinor).toBe(0);
    expect(quote.serviceFeeMinor).toBe(0);
    expect(quote.totalMinor).toBe(0);
  });

  it("excludes tiers with quantity 0", () => {
    const quote = buildCheckoutQuote("evt-3", [paidTier, freeTier], {
      t1: 0,
      t2: 1,
    });

    expect(quote.lines).toHaveLength(1);
    expect(quote.lines[0].tierId).toBe("t2");
    expect(quote.totalQuantity).toBe(1);
  });

  it("returns totalQuantity 0 when all quantities are 0", () => {
    const quote = buildCheckoutQuote("evt-4", [paidTier], { t1: 0 });
    expect(quote.totalQuantity).toBe(0);
    expect(quote.lines).toHaveLength(0);
  });

  it("sums multiple paid lines correctly", () => {
    const tier2 = makeTier({ id: "t3", priceMinor: 15000 }); // R150
    const quote = buildCheckoutQuote("evt-5", [paidTier, tier2], {
      t1: 1,
      t3: 2,
    });

    // subtotal = 25000 + 30000 = 55000
    expect(quote.subtotalMinor).toBe(55000);
    expect(quote.serviceFeeMinor).toBe(Math.round(55000 * 0.05)); // 2750
    expect(quote.totalMinor).toBe(55000 + 2750);
    expect(quote.totalQuantity).toBe(3);
  });

  it("throws when quantity exceeds maxPerOrder", () => {
    expect(() =>
      buildCheckoutQuote("evt-6", [paidTier], { t1: 99 }),
    ).toThrow();
  });

  it("throws when sold_out tier is selected", () => {
    const soldOut = makeTier({ id: "t4", state: "sold_out" });
    expect(() =>
      buildCheckoutQuote("evt-7", [soldOut], { t4: 1 }),
    ).toThrow();
  });
});
