import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { TextField } from "../../src/components/forms/TextField";
import { Icon } from "../../src/design-system/icons/Icon";
import { useReportContentMutation } from "../../src/hooks/social/useSocialQueries";
import { useToast } from "../../src/hooks/useToast";
import { theme } from "../../src/design-system/theme";

const REPORT_REASONS = [
  "Spam or Unsolicited Promotion",
  "Harassment or Hate Speech",
  "Inappropriate or Adult Content",
  "Scam, Fraud, or Fake Event",
  "Other Policy Violation",
];

function normaliseId(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (Array.isArray(value) && value.length > 0) return value[0] ?? null;
  return null;
}

export default function ReportContentModal() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    targetKind?: string | string[];
    targetId?: string | string[];
  }>();

  const targetKind = normaliseId(params.targetKind) ?? "content";
  const targetId = normaliseId(params.targetId) ?? "unknown";

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");

  const reportMutation = useReportContentMutation();

  const handleSubmit = () => {
    reportMutation.mutate(
      {
        targetKind: targetKind as any,
        targetId,
        reason: selectedReason,
        details,
      },
      {
        onSuccess: (data) => {
          showToast(
            "Report Submitted",
            `Thank you. Our moderation team is reviewing report ${data.reportId}.`,
            "info",
          );
          router.back();
        },
        onError: () => {
          showToast(
            "Submission Error",
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
        title={`Report ${targetKind}`}
        showBack={false}
        rightAction={{
          icon: "close",
          accessibilityLabel: "Close modal",
          onPress: () => router.back(),
          testID: "report-content-close",
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <AppText variant="subheading" style={styles.sectionTitle}>
          Select a reason
        </AppText>
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.sectionDesc}
        >
          Help us keep LIIT safe and inclusive for everyone in our community.
        </AppText>

        <View style={styles.reasonsGroup}>
          {REPORT_REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <Pressable
                key={reason}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={reason}
                onPress={() => setSelectedReason(reason)}
                style={({ pressed }) => [
                  styles.reasonCard,
                  isSelected && styles.reasonCardSelected,
                  pressed && styles.pressed,
                ]}
                testID={`report-reason-${reason.toLowerCase().replace(/[^a-z]/g, "-")}`}
              >
                <AppText
                  variant="body"
                  style={[
                    styles.reasonText,
                    isSelected && styles.reasonTextSelected,
                  ]}
                >
                  {reason}
                </AppText>
                {isSelected ? (
                  <Icon
                    name="checkmark"
                    size={16}
                    color={theme.colors.accentStart}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.detailsGroup}>
          <TextField
            label="Additional Details (Optional)"
            value={details}
            onChangeText={setDetails}
            placeholder="Provide context or details for our moderators…"
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
          disabled={reportMutation.isPending}
          style={styles.submitButton}
          testID="report-submit-button"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  sectionDesc: {
    marginBottom: theme.spacing.md,
  },
  reasonsGroup: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderSubtle,
  },
  reasonCardSelected: {
    borderColor: theme.colors.accentStart,
    backgroundColor: "rgba(149, 145, 255, 0.1)",
  },
  reasonText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  reasonTextSelected: {
    fontWeight: "700",
    color: theme.colors.accentStart,
  },
  detailsGroup: {
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
