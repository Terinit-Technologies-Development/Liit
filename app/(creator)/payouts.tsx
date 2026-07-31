import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { theme } from "../../src/design-system/theme";
import { ROUTES } from "../../src/navigation/routes";

export default function CreatorPayouts() {
  const router = useRouter();
  return (
    <Screen style={styles.container}>
      <AppHeader title="Payouts" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading">Payouts Summary</AppText>
        <AppButton
          label="Request Payout"
          onPress={() => router.push(ROUTES.modals.requestPayout as any)}
        />
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md },
});
