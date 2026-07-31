import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { TextField } from "../../src/components/forms/TextField";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { Icon } from "../../src/design-system/icons/Icon";
import { useReportContentMutation } from "../../src/hooks/social/useSocialQueries";
import { useToast } from "../../src/hooks/useToast";
import { ReportContentInput } from "../../src/domain/social";
import { theme } from "../../src/design-system/theme";

const REPORT_TARGETS = ["event", "host", "comment", "message", "user"] as const;

function isValidTargetKind(
  value: unknown,
): value is ReportContentInput["targetKind"] {
  return (
    typeof value === "string" &&
    REPORT_TARGETS.includes(value as ReportContentInput["targetKind"])
  );
}

function normaliseString(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

const REPORT_REASONS = [
  "Spam or Unsolicited Promotion",
  "Harassment or Bullying",
  "Hate Speech or Discrimination",
  "Nudity or Sexually Explicit Content",
  "Scam or Fraudulent Event/Ticket",
  "Other Policy Violation",
];

export default function ReportContentModal() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    targetKind?: string | string[];
    targetId?: string | string[];
  }>();

  const rawTargetKind = normaliseString(params.targetKind);
  const rawTargetId = normaliseString(params.targetId);

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [detailsText, setDetailsText] = useState("");

  const reportMutation = useReportContentMutation();

  const isValid =
    isValidTargetKind(rawTargetKind) &&
    rawTargetId !== null &&
    rawTargetId.length > 0;

  if (!isValid) {
    return (
      <Screen
        safeAreaEdges={["top"]}
        gutter={false}
        testID="report-invalid-target"
      >
        <ErrorState
          title="Invalid Report Target"
          description="The item you are attempting to report is invalid or specified incorrectly."
          onAction={() => router.back()}
          actionLabel="Close"
        />
      </Screen>
    );
  }

  const targetKind = rawTargetKind as ReportContentInput["targetKind"];
  const targetId = rawTargetId as string;

  const handleSubmit = () => {
    reportMutation.mutate(
      {
        targetKind,
        targetId,
        reason: selectedReason,
        details: detailsText.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast(
            "Report Submitted",
            "Thank you. Our safety team will review this within 24 hours.",
            "success",
          );
          router.back();
        },
        onError: () => {
          showToast(
            "Error",
            "Could not submit report. Please try again.",
            "error",
          );
        },
      },
    );
  };

  return (
    <Screen
      safeAreaEdges={["top"]}
      gutter={false}
      testID="report-content-modal"
    >
      <AppHeader
        title="Report Content"
        showBack={false}
        rightAction={{
          icon: "close",
          accessibilityLabel: "Close modal",
          onPress: () => router.back(),
          testID: "report-content-close",
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText variant="subheading" style={styles.sectionTitle}>
          Why are you reporting this {targetKind}?
        </AppText>

        <View style={styles.reasonsList}>
          {REPORT_REASONS.map((reason) => {
            const isSelected = reason === selectedReason;
            return (
              <Pressable
                key={reason}
                style={[
                  styles.reasonOption,
                  isSelected && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
                testID={`report-reason-${reason.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              >
                <AppText
                  variant="body"
                  color={
                    isSelected
                      ? theme.colors.textPrimary
                      : theme.colors.textMuted
                  }
                  style={styles.reasonText}
                >
                  {reason}
                </AppText>
                {isSelected ? (
                  <Icon
                    name="check"
                    size={20}
                    color={theme.colors.accentStart}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.detailsSection}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Additional Details (Optional)
          </AppText>
          <TextField
            value={detailsText}
            onChangeText={setDetailsText}
            placeholder="Describe the issue or context…"
            multiline
            numberOfLines={4}
            testID="report-details-input"
          />
        </View>

        <AppButton
          label={reportMutation.isPending ? "Submitting…" : "Submit Report"}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          fullWidth
          disabled={reportMutation.isPending}
          testID="report-submit-button"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.gutter,
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  reasonsList: {
    gap: theme.spacing.xs,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  reasonOptionSelected: {
    borderColor: theme.colors.accentStart,
    backgroundColor: "rgba(149, 145, 255, 0.1)",
  },
  reasonText: {
    fontWeight: "600",
    flex: 1,
  },
  detailsSection: {
    gap: theme.spacing.xs,
  },
});
