import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { Icon } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import { ROUTES } from "../../src/navigation/routes";
import { useCreatorStore } from "../../src/state/useCreatorStore";
import {
  useVerificationChecklist,
  useCompleteActivationMutation,
} from "../../src/hooks/creator/useCreatorQueries";

export default function CreatorVerification() {
  const router = useRouter();
  const { setActivationStatus } = useCreatorStore();
  const { data: checklist } = useVerificationChecklist();
  const completeMutation = useCompleteActivationMutation();

  const [verificationState, setVerificationState] = useState<
    "not_started" | "incomplete" | "under_review" | "verified" | "rejected"
  >("verified");

  const [completedItemIds, setCompletedItemIds] = useState<string[]>([
    "vcheck-1",
    "vcheck-2",
    "vcheck-3",
    "vcheck-4",
    "vcheck-5",
    "vcheck-6",
  ]);

  const toggleItem = (id: string) => {
    if (completedItemIds.includes(id)) {
      setCompletedItemIds(completedItemIds.filter((item) => item !== id));
    } else {
      setCompletedItemIds([...completedItemIds, id]);
    }
  };

  const handleComplete = () => {
    setActivationStatus("verified");
    completeMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace(ROUTES.creator.dashboard as any);
      },
    });
  };

  return (
    <Screen style={styles.container} testID="creator-verification-screen">
      <AppHeader title="Creator Verification" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Prototype Disclosure */}
        <View style={styles.disclosureCard}>
          <Icon name="info" size="sm" color={theme.colors.accentStart} />
          <AppText
            variant="caption"
            color="textMuted"
            style={styles.disclosureText}
          >
            LIIT PROTOTYPE — Verification is simulated. No real identity or
            legal documents are requested.
          </AppText>
        </View>

        {/* Overall Status Banner */}
        <View
          style={[
            styles.statusBanner,
            verificationState === "verified"
              ? styles.statusVerified
              : verificationState === "under_review"
                ? styles.statusPending
                : styles.statusIncomplete,
          ]}
        >
          <View style={styles.statusHeader}>
            <Icon
              name={
                verificationState === "verified"
                  ? "check"
                  : verificationState === "under_review"
                    ? "calendar"
                    : "close"
              }
              size="md"
              color={
                verificationState === "verified"
                  ? theme.colors.success
                  : verificationState === "under_review"
                    ? theme.colors.accentEnd
                    : theme.colors.destructive
              }
            />
            <View style={{ flex: 1 }}>
              <AppText variant="label" color="textPrimary">
                Verification Status:{" "}
                {verificationState.replace("_", " ").toUpperCase()}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {verificationState === "verified"
                  ? "Your creator profile is verified and ready to publish events."
                  : verificationState === "under_review"
                    ? "Checklist submitted. Automated simulation review in progress."
                    : "Please complete all checklist items below to activate."}
              </AppText>
            </View>
          </View>
        </View>

        {/* Checklist Section */}
        <AppText
          variant="heading"
          color="textPrimary"
          style={styles.sectionTitle}
        >
          Verification Checklist
        </AppText>

        {checklist?.map((item) => {
          const isDone = completedItemIds.includes(item.id);
          return (
            <View key={item.id} style={styles.checkCard}>
              <Pressable
                style={styles.checkboxTouch}
                onPress={() => toggleItem(item.id)}
              >
                <View
                  style={[styles.checkbox, isDone && styles.checkboxChecked]}
                >
                  {isDone && <Icon name="check" size="xs" color="#fff" />}
                </View>
              </Pressable>

              <View style={styles.cardTextContainer}>
                <View style={styles.cardHeader}>
                  <AppText
                    variant="label"
                    color="textPrimary"
                    style={{ flex: 1 }}
                  >
                    {item.title}
                  </AppText>
                  <View
                    style={[
                      styles.itemPill,
                      isDone ? styles.pillCompleted : styles.pillPending,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: isDone
                          ? theme.colors.success
                          : theme.colors.textMuted,
                        fontSize: 10,
                      }}
                    >
                      {isDone ? "COMPLETED" : "REQUIRED"}
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color="textMuted">
                  {item.description}
                </AppText>

                <Pressable
                  style={styles.actionLink}
                  onPress={() =>
                    Alert.alert(
                      item.title,
                      `Prototype Simulation: ${item.description}`,
                    )
                  }
                >
                  <AppText variant="caption" color="accentStart">
                    {item.actionLabel || "View Details [PROTOTYPE]"} →
                  </AppText>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* State Scenario Picker for Testing */}
        <View style={styles.scenarioCard}>
          <AppText
            variant="caption"
            color="textMuted"
            style={{ marginBottom: 6 }}
          >
            SIMULATION STATUS TOGGLE (PROTOTYPE):
          </AppText>
          <View style={styles.scenarioRow}>
            {(["verified", "under_review", "incomplete"] as const).map((st) => (
              <Pressable
                key={st}
                style={[
                  styles.scenarioBtn,
                  verificationState === st && styles.scenarioBtnActive,
                ]}
                onPress={() => setVerificationState(st)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color:
                      verificationState === st
                        ? theme.colors.textPrimary
                        : theme.colors.textMuted,
                  }}
                >
                  {st.toUpperCase()}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionArea}>
          <AppButton
            label="Complete Verification & Enter Dashboard"
            onPress={handleComplete}
            loading={completeMutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  disclosureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  disclosureText: { flex: 1 },
  statusBanner: {
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
  },
  statusVerified: {
    backgroundColor: "rgba(0, 200, 120, 0.1)",
    borderColor: theme.colors.success,
  },
  statusPending: {
    backgroundColor: "rgba(193, 128, 255, 0.1)",
    borderColor: theme.colors.accentEnd,
  },
  statusIncomplete: {
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    borderColor: theme.colors.destructive,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  sectionTitle: { marginBottom: theme.spacing.md },
  checkCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  checkboxTouch: { paddingTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  cardTextContainer: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillCompleted: { backgroundColor: "rgba(0, 200, 120, 0.15)" },
  pillPending: { backgroundColor: "rgba(255, 255, 255, 0.08)" },
  actionLink: { marginTop: theme.spacing.xs },
  scenarioCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  scenarioRow: { flexDirection: "row", gap: theme.spacing.xs },
  scenarioBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.radii.sm,
  },
  scenarioBtnActive: {
    backgroundColor: theme.colors.accentStart,
  },
  actionArea: { marginTop: theme.spacing.xl },
});
