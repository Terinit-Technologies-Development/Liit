import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { EventBuilderForm } from "../../../src/components/creator/EventBuilderForm";
import { theme } from "../../../src/design-system/theme";

export default function CreateEventScreen() {
  return (
    <Screen style={styles.container} testID="creator-create-screen">
      <AppHeader title="Create Event" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <EventBuilderForm isEditMode={false} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
});
