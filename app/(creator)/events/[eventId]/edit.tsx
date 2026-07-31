import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { AppButton } from "../../../../src/components/ui/AppButton";
import { theme } from "../../../../src/design-system/theme";

export default function EventEdit() {
  return (
    <Screen style={styles.container}>
      <AppHeader title="Edit Event" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading">Event Details</AppText>
        <AppButton label="Save Changes" onPress={() => {}} />
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md },
});
