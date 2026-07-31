import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { theme } from "../../../../src/design-system/theme";

export default function EventContent() {
  return (
    <Screen style={styles.container}>
      <AppHeader title="Content" />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading">Content Posts</AppText>
        <AppText variant="body" color="textMuted">
          Post list will go here...
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md },
});
