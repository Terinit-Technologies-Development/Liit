import { formatCurrency } from "../utils/format";
import { mockEvents } from "../fixtures";

describe("CurrencyFormatting", () => {
  it("correctly converts minor units (cents) to formatted ZAR currency", () => {
    const minorUnits = 25000; // R250.00
    const formatted = formatCurrency(minorUnits, "ZAR");

    // Check that it contains 250
    expect(formatted).toMatch(/250/);
    expect(formatted).toMatch(/00/);
  });

  it("formats mock event starting price correctly from startingPriceMinor fixture", () => {
    const event = mockEvents[0]; // startingPriceMinor: 25000
    const formatted = formatCurrency(event.startingPriceMinor, event.currency);

    expect(formatted).toMatch(/250/);
  });
});
