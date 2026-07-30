/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

describe("Asset Integrity", () => {
  it("verifies all event, venue, host, and avatar images have distinct SHA-256 hashes", () => {
    const files = [
      "assets/images/events/midnight-grooves.png",
      "assets/images/events/rosebank-art-jazz.png",
      "assets/images/events/soweto-food-market.png",
      "assets/images/events/jozi-run-club.png",
      "assets/images/events/deep-house-rooftop.png",
      "assets/images/events/amapiano-sunset.png",
      "assets/images/events/fashion-week-popup.png",
      "assets/images/venues/braam-rooftop.png",
      "assets/images/venues/keyes-art-mile.png",
      "assets/images/venues/soweto-theatre.png",
      "assets/images/venues/maboneng-precinct.png",
      "assets/images/hosts/groove-co.png",
      "assets/images/hosts/jozi-vibe-tribe.png",
      "assets/images/hosts/art-hub-jhb.png",
      "assets/images/hosts/amapiano-pulse.png",
      "assets/images/avatars/avatar-1.png",
      "assets/images/avatars/avatar-2.png",
      "assets/images/avatars/avatar-3.png",
      "assets/images/avatars/avatar-4.png",
    ];

    const hashes = files.map((relativePath: string) => {
      const buffer = fs.readFileSync(path.join(process.cwd(), relativePath));
      return crypto.createHash("sha256").update(buffer).digest("hex");
    });

    expect(new Set(hashes).size).toBe(files.length);
  });
});
