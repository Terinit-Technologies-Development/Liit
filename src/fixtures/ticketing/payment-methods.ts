import { PaymentMethod } from "../../domain/ticketing";

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm-demo-visa-4242",
    type: "saved_card",
    label: "Demo Visa •••• 4242",
    description: "Prototype payment method",
    brand: "visa",
    last4: "4242",
    enabled: true,
  },
  {
    id: "pm-demo-new-card",
    type: "demo_new_card",
    label: "New demo card",
    description: "Displays fake non-editable card details",
    enabled: true,
  },
  {
    id: "pm-wallet-placeholder",
    type: "wallet_placeholder",
    label: "LIIT Wallet",
    description: "Wallet payment is not connected in this prototype",
    enabled: false,
    disabledReason: "Wallet payment arrives in a later LIIT instruction.",
  },
];
