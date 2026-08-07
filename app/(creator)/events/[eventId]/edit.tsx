import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../../src/components/ui/Screen";
import { AppHeader } from "../../../../src/components/navigation/AppHeader";
import { AppText } from "../../../../src/components/ui/AppText";
import { EventBuilderForm } from "../../../../src/components/creator/EventBuilderForm";
import { theme } from "../../../../src/design-system/theme";
import { useCreatorEvent } from "../../../../src/hooks/creator/useCreatorQueries";

export default function EventEdit() {
  const params = useLocalSearchParams<{ eventId?: string; mode?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";
  const isDuplicate = params.mode === "duplicate";

  const { data: projection, isLoading } = useCreatorEvent(eventId);

  return (
    <Screen style={styles.container} testID="creator-edit-screen">
      <AppHeader title={isDuplicate ? "Duplicate Event" : "Edit Event"} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={theme.colors.accentStart} size="large" />
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 8 }}
            >
              Loading event draft...
            </AppText>
          </View>
        ) : (
          <EventBuilderForm
            initialData={
              isDuplicate && projection
                ? {
                    ...projection,
                    event: {
                      ...projection.event,
                      id: `evt-copy-${projection.event.id}`,
                      title: `[Copy] ${projection.event.title}`,
                    },
                  }
                : projection || undefined
            }
            isEditMode={!isDuplicate}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  loadingArea: {
    padding: theme.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
});
