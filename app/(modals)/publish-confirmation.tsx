import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { Icon } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import { ROUTES } from "../../src/navigation/routes";
import {
  usePublishEventMutation,
  useCreatorEvent,
} from "../../src/hooks/creator/useCreatorQueries";
import { PublishSimulationState } from "../../src/domain/creator";

export default function PublishConfirmationModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const { data: projection } = useCreatorEvent(eventId);
  const publishMutation = usePublishEventMutation();

  const [state, setState] = useState<PublishSimulationState>("review");
  const [forceFail, setForceFail] = useState(false);

  const eventTitle = projection?.event.title || "Midnight Kinetic Grooves";

  const checklistItems = [
    { label: "Media & Cover Poster Selected", valid: true },
    { label: "Title & Detailed Description", valid: true },
    { label: "SAST Event Schedule Configured", valid: true },
    { label: "Venue Location Confirmed", valid: true },
    { label: "Ticket Tiers & Capacity Coherent", valid: true },
    { label: "Creator Identity Verified", valid: true },
  ];

  const handleConfirmPublish = () => {
    setState("processing");

    setTimeout(() => {
      if (forceFail) {
        setState("failure");
      } else {
        publishMutation.mutate(eventId, {
          onSuccess: () => {
            setState("success");
          },
          onError: () => {
            setState("failure");
          },
        });
      }
    }, 1200);
  };

  return (
    <Screen
      style={styles.screen}
      safeAreaEdges={["bottom"]}
      testID="publish-confirmation-modal"
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* State 1: REVIEW */}
        {state === "review" && (
          <>
            <View style={styles.header}>
              <AppText variant="heading" color="textPrimary">
                Confirm Event Publishing
              </AppText>
              <AppText
                variant="caption"
                color="textMuted"
                style={{ marginTop: 4 }}
              >
                Review publishing checklist for &quot;{eventTitle}&quot;
              </AppText>
            </View>

            <View style={styles.checklistCard}>
              <AppText
                variant="label"
                color="textMuted"
                style={{ marginBottom: theme.spacing.sm }}
              >
                Publishing Readiness Checklist:
              </AppText>
              {checklistItems.map((item, idx) => (
                <View key={idx} style={styles.checkRow}>
                  <Icon name="check" size="xs" color={theme.colors.success} />
                  <AppText
                    variant="caption"
                    color="textPrimary"
                    style={styles.checkText}
                  >
                    {item.label}
                  </AppText>
                </View>
              ))}
            </View>

            {/* Prototype simulation disclaimer */}
            <View style={styles.disclosureCard}>
              <Icon name="info" size="xs" color={theme.colors.accentStart} />
              <AppText variant="caption" color="textMuted" style={{ flex: 1 }}>
                LIIT PROTOTYPE — publishing is simulated in memory.
              </AppText>
            </View>

            {/* Deterministic failure scenario toggle for testing */}
            <Pressable
              style={styles.failToggleRow}
              onPress={() => setForceFail(!forceFail)}
            >
              <View
                style={[styles.checkbox, forceFail && styles.checkboxActive]}
              >
                {forceFail && <Icon name="check" size="xs" color="#fff" />}
              </View>
              <AppText variant="caption" color="textMuted">
                Simulate Network Failure Scenario (Testing)
              </AppText>
            </Pressable>

            <View style={styles.actionRow}>
              <AppButton
                label="Confirm & Publish Live"
                variant="primary"
                onPress={handleConfirmPublish}
                style={{ flex: 1 }}
              />
              <AppButton
                label="Cancel"
                variant="secondary"
                onPress={() => router.back()}
                style={{ flex: 1 }}
              />
            </View>
          </>
        )}

        {/* State 2: PROCESSING */}
        {state === "processing" && (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color={theme.colors.accentStart} />
            <AppText
              variant="heading"
              color="textPrimary"
              style={{ marginTop: theme.spacing.md }}
            >
              Publishing Event...
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 4, textAlign: "center" }}
            >
              Verifying SAST schedule &amp; indexation across LIIT discovery
              services.
            </AppText>
          </View>
        )}

        {/* State 3: SUCCESS */}
        {state === "success" && (
          <View style={styles.centerCard}>
            <View style={styles.successIconCircle}>
              <Icon name="check" size="lg" color="#FFF" />
            </View>
            <AppText
              variant="heading"
              color="textPrimary"
              style={{ marginTop: theme.spacing.md }}
            >
              Event Published Successfully!
            </AppText>
            <AppText
              variant="body"
              color="textMuted"
              style={{ marginTop: 6, textAlign: "center" }}
            >
              &quot;{eventTitle}&quot; is now live and accessible in LIIT
              Consumer Discovery.
            </AppText>

            <View style={styles.successActions}>
              <AppButton
                label="View in Creator Events"
                variant="primary"
                onPress={() => {
                  router.dismiss();
                  router.push(ROUTES.creator.events as any);
                }}
              />
              <AppButton
                label="Return to Creator Dashboard"
                variant="secondary"
                onPress={() => {
                  router.dismiss();
                  router.push(ROUTES.creator.dashboard as any);
                }}
                style={{ marginTop: theme.spacing.sm }}
              />
            </View>
          </View>
        )}

        {/* State 4: FAILURE */}
        {state === "failure" && (
          <View style={styles.centerCard}>
            <View style={styles.failIconCircle}>
              <Icon name="close" size="lg" color="#FFF" />
            </View>
            <AppText
              variant="heading"
              color="textPrimary"
              style={{ marginTop: theme.spacing.md }}
            >
              Publishing Failed
            </AppText>
            <AppText
              variant="body"
              color="textMuted"
              style={{ marginTop: 6, textAlign: "center" }}
            >
              Simulated network error while registering event tiers. Your draft
              remains safely saved.
            </AppText>

            <View style={styles.successActions}>
              <AppButton
                label="Retry Publishing"
                variant="primary"
                onPress={() => {
                  setForceFail(false);
                  handleConfirmPublish();
                }}
              />
              <AppButton
                label="Return to Edit Form"
                variant="secondary"
                onPress={() => router.back()}
                style={{ marginTop: theme.spacing.sm }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  container: {
    padding: theme.spacing.xl,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: { marginBottom: theme.spacing.lg },
  checklistCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: theme.spacing.xs,
  },
  checkText: { flex: 1 },
  disclosureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  failToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: theme.colors.destructive,
    borderColor: theme.colors.destructive,
  },
  actionRow: { flexDirection: "row", gap: theme.spacing.sm },
  centerCard: { alignItems: "center", paddingVertical: theme.spacing.xl },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  failIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  successActions: { width: "100%", marginTop: theme.spacing.xl },
});
