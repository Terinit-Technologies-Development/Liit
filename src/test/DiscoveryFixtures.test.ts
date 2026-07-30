import { discoveryEvents, discoveryVenues } from "../fixtures/discovery";

describe("Discovery Fixtures Integrity", () => {
  it("uses the canonical Johannesburg locale and ZAR currency", () => {
    const fixtureText = JSON.stringify({ discoveryEvents, discoveryVenues });

    expect(fixtureText).not.toMatch(/\bUSD\b|London|Berlin|New York/i);
    expect(fixtureText).toContain("Johannesburg");
    expect(fixtureText).toContain("ZAR");
  });
});
