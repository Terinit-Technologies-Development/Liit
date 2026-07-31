import { CONSUMER_TAB_ROUTES } from "../../src/navigation/routes";
import { existsSync } from "fs";
import { resolve } from "path";

describe("Instruction 4 Route Resolution Unit Test", () => {
  it("Confirms CONSUMER_TAB_ROUTES has exactly 5 visible routes", () => {
    const visibleRoutes = CONSUMER_TAB_ROUTES.filter((r) => r.visible);
    expect(visibleRoutes.length).toBe(5);
  });

  it("Confirms checkout is in hidden routes with hideTabBar:true", () => {
    const checkoutRoute = CONSUMER_TAB_ROUTES.find(
      (r) => r.name === "checkout",
    );
    expect(checkoutRoute).toBeDefined();
    expect(checkoutRoute?.visible).toBe(false);
    expect(checkoutRoute?.hideTabBar).toBe(true);
  });

  it("Confirms tickets route exists and is visible", () => {
    const ticketsRoute = CONSUMER_TAB_ROUTES.find((r) => r.name === "tickets");
    expect(ticketsRoute).toBeDefined();
    expect(ticketsRoute?.visible).toBe(true);
  });

  it("Confirms there is no tickets.tsx file alongside tickets/ directory", () => {
    const ticketsFilePath = resolve(
      process.cwd(),
      "app/(consumer)/tickets.tsx",
    );
    expect(existsSync(ticketsFilePath)).toBe(false);
  });
});
