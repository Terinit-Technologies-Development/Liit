import { CONSUMER_TAB_ROUTES } from "../../src/navigation/routes";

describe("Instruction 4 Tab Bar Visibility Configuration & Nested Behavior", () => {
  it("Confirms CONSUMER_TAB_ROUTES has tickets visible and checkout hidden with hideTabBar:true", () => {
    const ticketsRoute = CONSUMER_TAB_ROUTES.find((r) => r.name === "tickets");
    const checkoutRoute = CONSUMER_TAB_ROUTES.find(
      (r) => r.name === "checkout",
    );

    expect(ticketsRoute).toBeDefined();
    expect(ticketsRoute?.visible).toBe(true);

    expect(checkoutRoute).toBeDefined();
    expect(checkoutRoute?.visible).toBe(false);
    expect(checkoutRoute?.hideTabBar).toBe(true);
  });
});
