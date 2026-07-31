/**
 * Instruction 4 — EventDetail to Checkout Navigation
 *
 * Verifies that primary CTA actions on Event Detail begin checkout in the store
 * and navigate to the checkoutTickets route with correct parameters for paid and free events.
 */

import { getEventConversionModel } from "../domain/event-detail/conversion-model";
import { mockEventRepository } from "../repositories/mock/MockEventRepository";
import { useCheckoutStore } from "../state/useCheckoutStore";
import { routeBuilders } from "../navigation/routes";

beforeEach(() => {
  useCheckoutStore.getState().clearCheckout();
});

describe("EventDetail to Checkout Navigation Logic", () => {
  it("begins checkout and builds correct route for paid event", async () => {
    const detail = await mockEventRepository.getEventDetail(
      "evt-midnight-grooves",
    );
    expect(detail).not.toBeNull();

    const conversion = getEventConversionModel(detail!);
    expect(conversion.mode).toBe("paid");

    const defaultTierId = detail!.ticketTiers.find(
      (t) => t.state !== "sold_out",
    )?.id;
    expect(defaultTierId).toBeTruthy();

    useCheckoutStore.getState().beginCheckout(detail!.event.id, defaultTierId);

    const draft = useCheckoutStore.getState().draft;
    expect(draft).not.toBeNull();
    expect(draft?.eventId).toBe("evt-midnight-grooves");
    expect(draft?.quantities[defaultTierId!]).toBe(1);

    const route = routeBuilders.checkoutTickets(
      detail!.event.id,
      defaultTierId,
    );
    expect(route.pathname).toBe("/(consumer)/checkout/[eventId]/tickets");
    expect(route.params.eventId).toBe("evt-midnight-grooves");
    expect(route.params.initialTierId).toBe(defaultTierId);
  });

  it("begins checkout and builds correct route for free registration event", async () => {
    const detail = await mockEventRepository.getEventDetail(
      "evt-soweto-food-market",
    );
    expect(detail).not.toBeNull();

    const conversion = getEventConversionModel(detail!);
    expect(conversion.mode).toBe("free_registration");

    const freeTierId = detail!.ticketTiers[0]?.id;
    useCheckoutStore.getState().beginCheckout(detail!.event.id, freeTierId);

    const draft = useCheckoutStore.getState().draft;
    expect(draft).not.toBeNull();
    expect(draft?.eventId).toBe("evt-soweto-food-market");

    const route = routeBuilders.checkoutTickets(detail!.event.id);
    expect(route.pathname).toBe("/(consumer)/checkout/[eventId]/tickets");
    expect(route.params.eventId).toBe("evt-soweto-food-market");
  });
});
