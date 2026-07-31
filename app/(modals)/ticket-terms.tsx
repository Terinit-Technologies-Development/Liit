import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { IconButton } from "../../src/components/ui/IconButton";
import { Divider } from "../../src/components/ui/Divider";
import { theme } from "../../src/design-system/theme";

export default function TicketTermsModal() {
  const router = useRouter();

  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      gutter={false}
      style={styles.screen}
    >
      <View style={styles.header}>
        <AppText variant="subheading" style={styles.title}>
          Ticket Terms & Conditions
        </AppText>
        <IconButton
          icon="close"
          accessibilityLabel="Close ticket terms"
          onPress={() => router.back()}
          variant="ghost"
          testID="ticket-terms-close"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="bodyStrong" style={styles.heading}>
          LIIT Prototype Terms
        </AppText>

        <AppText variant="body" color={theme.colors.textMuted}>
          All ticket purchases on this prototype are simulated. No real money is
          charged, no real payment is processed, and no real entry entitlement
          is granted.
        </AppText>

        <Divider />

        <AppText variant="bodyStrong" style={styles.heading}>
          No Real Booking
        </AppText>
        <AppText variant="body" color={theme.colors.textMuted}>
          Tickets issued in this prototype are for demonstration purposes only.
          They cannot be used to gain entry to any real event.
        </AppText>

        <Divider />

        <AppText variant="bodyStrong" style={styles.heading}>
          No Refund Policy
        </AppText>
        <AppText variant="body" color={theme.colors.textMuted}>
          Because no real payment is made, no refunds are applicable. In a
          production environment, LIIT would provide a transparent refund and
          cancellation policy.
        </AppText>

        <Divider />

        <AppText variant="bodyStrong" style={styles.heading}>
          Data & Privacy
        </AppText>
        <AppText variant="body" color={theme.colors.textMuted}>
          All data in this prototype is stored locally on your device and is not
          transmitted to any server. Resetting the prototype clears all stored
          data.
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  title: {
    fontWeight: "700",
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heading: {
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
});
