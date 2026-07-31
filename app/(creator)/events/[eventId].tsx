import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { AppButton } from "../../../src/components/ui/AppButton";
import { theme } from "../../../src/design-system/theme";
import { ROUTES, routeBuilders } from "../../../src/navigation/routes";
import { useCreatorEvents } from "../../../src/hooks/creator/useCreatorQueries";
import { Icon } from "../../../src/design-system/icons/Icon";

export default function EventOpsHub() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { data: events } = useCreatorEvents();
  const event = events?.find((e) => e.eventId === eventId);

  return (
    <Screen style={styles.container}>
      <AppHeader title={event?.title || "Event Ops Hub"} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading" style={{ marginBottom: theme.spacing.md }}>
          Operations
        </AppText>
        <AppButton
          label="Edit Event"
          variant="secondary"
          onPress={() =>
            router.push(`/(creator)/events/${eventId}/edit` as any)
          }
        />
        <View style={{ height: theme.spacing.md }} />
        <AppButton
          label="Preview Event"
          variant="secondary"
          onPress={() =>
            router.push(`/(creator)/events/${eventId}/preview` as any)
          }
        />
        <View style={{ height: theme.spacing.md }} />
        <AppButton
          label="Analytics"
          variant="secondary"
          onPress={() =>
            router.push(`/(creator)/events/${eventId}/analytics` as any)
          }
        />
        <View style={{ height: theme.spacing.md }} />
        <AppButton
          label="Guests"
          variant="secondary"
          onPress={() =>
            router.push(`/(creator)/events/${eventId}/guests` as any)
          }
        />
        <View style={{ height: theme.spacing.md }} />
        <AppButton
          label="Content"
          variant="secondary"
          onPress={() =>
            router.push(`/(creator)/events/${eventId}/content` as any)
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md },
});
