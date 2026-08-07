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
  useCreatorProfile,
} from "../../src/hooks/creator/useCreatorQueries";
import { PublishSimulationState } from "../../src/domain/creator";
import { toJohannesburgIso } from "../../src/utils/johannesburg";

interface ChecklistItem {
  id: string;
  label: string;
  valid: boolean;
}

export default function PublishConfirmationModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId || "evt-midnight-grooves";

  const { data: projection } = useCreatorEvent(eventId);
  const { data: profile } = useCreatorProfile();
  const publishMutation = usePublishEventMutation();

  const [state, setState] = useState<PublishSimulationState>("review");
  const [forceFail, setForceFail] = useState(false);

  const draft = projection?.eventDraft;
  const event = projection?.event;
  const eventTitle = event?.title || "Untitled Draft";

  // Checklist validity is derived from the ACTUAL draft, never hardcoded.
  const checklistItems: ChecklistItem[] = (() => {
    if (!draft) {
      return [
        { id: "media", label: "Media & Cover Poster Selected", valid: false },
        { id: "title", label: "Title & Detailed Description", valid: false },
        {
          id: "schedule",
          label: "SAST Event Schedule Configured",
          valid: false,
        },
        { id: "venue", label: "Venue Location Confirmed", valid: false },
        {
          id: "tiers",
          label: "Ticket Tiers & Capacity Coherent",
          valid: false,
        },
        { id: "verified", label: "Creator Identity Verified", valid: false },
      ];
    }

    const scheduleCoherent =
      !!draft.startDate &&
      !!draft.startTime &&
      !!draft.endDate &&
      !!draft.endTime &&
      new Date(
        toJohannesburgIso(draft.startDate, draft.startTime || "00:00"),
      ).getTime() <
        new Date(
          toJohannesburgIso(draft.endDate, draft.endTime || "00:00"),
        ).getTime();

    const tiersCoherent =
      draft.tiers.length > 0 &&
      draft.tiers.every(
        (t) =>
          t.capacity > 0 &&
          t.maxPerOrder > 0 &&
          t.maxPerOrder <= t.capacity &&
          (draft.isFree ? t.priceMinor === 0 : t.priceMinor >= 0),
      );

    return [
      {
        id: "media",
        label: "Media & Cover Poster Selected",
        valid: draft.posterUploaded,
      },
      {
        id: "title",
        label: "Title & Detailed Description",
        valid: !!draft.title.trim() && !!draft.description.trim(),
      },
      {
        id: "schedule",
        label: "SAST Event Schedule Configured",
        valid: scheduleCoherent,
      },
      {
        id: "venue",
        label: "Venue Location Confirmed",
        valid: !!draft.venueName.trim(),
      },
      {
        id: "tiers",
        label: "Ticket Tiers & Capacity Coherent",
        valid: tiersCoherent,
      },
      {
        id: "verified",
        label: "Creator Identity Verified",
        valid: profile?.isVerified === true,
      },
    ];
  })();

  const allChecklistValid = checklistItems.every((item) => item.valid);
  const pendingChecklist = checklistItems.filter((item) => !item.valid);

  /**
   * Deterministic publish simulation. `shouldFail` is an explicit parameter —
   * Retry never relies on a stale closure around setForceFail. A short delay
   * guarantees the Processing state is visibly rendered before either the
   * deterministic failure or the repository mutation resolves.
   */
  const publishEvent = (shouldFail = forceFail) => {
    setState("processing");

    setTimeout(() => {
      if (shouldFail) {
        setState("failure");
        return;
      }

      publishMutation.mutate(eventId, {
        onSuccess: () => {
          setState("success");
        },
        onError: () => {
          setState("failure");
        },
      });
    }, 600);
  };

  const handleConfirmPublish = () => {
    if (!allChecklistValid) return;
    publishEvent();
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
              {checklistItems.map((item) => (
                <View key={item.id} style={styles.checkRow}>
                  <Icon
                    name={item.valid ? "check" : "close"}
                    size="xs"
                    color={
                      item.valid
                        ? theme.colors.success
                        : theme.colors.destructive
                    }
                  />
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

            {!allChecklistValid && (
              <View style={styles.invalidNotice}>
                <Icon name="warning" size="xs" color={theme.colors.warning} />
                <AppText
                  variant="caption"
                  color="textPrimary"
                  style={{ flex: 1 }}
                >
                  Publishing is disabled — {pendingChecklist.length} checklist
                  item(s) incomplete:{" "}
                  {pendingChecklist.map((i) => i.label).join(", ")}.
                </AppText>
              </View>
            )}

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
              testID="publish-simulate-failure-toggle"
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
                label={
                  allChecklistValid
                    ? "Confirm & Publish Live"
                    : "Publishing Unavailable"
                }
                variant="primary"
                disabled={!allChecklistValid}
                onPress={handleConfirmPublish}
                style={{ flex: 1 }}
                testID="confirm-publish-button"
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
              Verifying SAST schedule &amp; Creator-side status simulation.
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
              Event Publish Simulated
            </AppText>
            <AppText
              variant="body"
              color="textMuted"
              style={{ marginTop: 6, textAlign: "center" }}
            >
              LIIT PROTOTYPE — the Creator-side event status has been simulated
              as Published. Consumer marketplace propagation is deferred to
              Instruction 8.
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
                  publishEvent(false);
                }}
                testID="retry-publish-button"
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
  invalidNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 170, 0, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
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
