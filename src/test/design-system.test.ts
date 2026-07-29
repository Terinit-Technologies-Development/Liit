import { theme } from "../design-system/theme";

describe("Design System Tokens", () => {
  it("has semantic colors defined", () => {
    expect(theme.colors.canvas).toBe("#0F0D16");
    expect(theme.colors.textPrimary).toBe("#F5EEFC");
    expect(theme.colors.accentStart).toBe("#9591FF");
  });

  it("has typography tokens defined", () => {
    expect(theme.typography.display.fontSize).toBe(34);
    expect(theme.typography.body.fontSize).toBe(15);
  });

  it("has radii tokens meeting card guidelines", () => {
    expect(theme.radii.xl).toBeGreaterThanOrEqual(24);
  });

  it("meets touch target height guideline", () => {
    expect(theme.layout.minTouchTarget).toBeGreaterThanOrEqual(44);
  });
});
