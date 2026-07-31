import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { formatCurrency } from "../../utils/format";
import { theme } from "../../design-system/theme";

export interface BookingLinkCardProps {
  offer: {
    id: string;
    tierId: string;
    tierName: string;
    priceMinor: number;
    currency: string;
    description: string;
  };
  onSelectOffer(): void;
  testID?: string;
}

export const BookingLinkCard: React.FC<BookingLinkCardProps> = ({
  offer,
  onSelectOffer,
  testID = "booking-link-card",
}) => {
  const formattedPrice = formatCurrency(offer.priceMinor, offer.currency);

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <AppText variant="caption" style={styles.badgeText}>
            HOST OFFER
          </AppText>
        </View>
        <AppText variant="subheading" style={styles.priceText}>
          {formattedPrice}
        </AppText>
      </View>

      <AppText variant="subheading" style={styles.tierName}>
        {offer.tierName}
      </AppText>
      <AppText
        variant="body"
        color={theme.colors.textMuted}
        style={styles.description}
      >
        {offer.description}
      </AppText>

      <AppButton
        label="Select Tickets & Book"
        onPress={onSelectOffer}
        variant="primary"
        size="md"
        style={styles.ctaButton}
        testID="booking-offer-cta"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(149, 145, 255, 0.4)",
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  badge: {
    backgroundColor: "rgba(149, 145, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.accentStart,
    letterSpacing: 0.5,
  },
  priceText: {
    fontWeight: "800",
    color: theme.colors.accentStart,
    fontSize: 16,
  },
  tierName: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  ctaButton: {
    width: "100%",
  },
});
