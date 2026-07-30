import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { Chip } from "../../src/components/ui/Chip";
import { TextField } from "../../src/components/forms/TextField";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { showToast } from "../../src/components/ui/Toast";
import { theme } from "../../src/design-system/theme";

const reportSchema = z.object({
  reason: z.enum(["misleading", "unsafe", "spam", "harassment", "other"]),
  details: z.string().max(500).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const REASONS: { id: ReportFormValues["reason"]; label: string }[] = [
  { id: "misleading", label: "Misleading Information" },
  { id: "unsafe", label: "Unsafe or Illegal Content" },
  { id: "spam", label: "Spam or Scam" },
  { id: "harassment", label: "Harassment or Hate Speech" },
  { id: "other", label: "Other Concern" },
];

export default function EventReportModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    targetKind?: "event" | "host";
    targetId?: string;
  }>();

  const isHost = params.targetKind === "host";
  const [blocked, setBlocked] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "misleading",
      details: "",
    },
  });

  const submit = form.handleSubmit(() => {
    showToast(
      "Report simulated",
      `Your report for this ${isHost ? "host" : "event"} has been submitted locally.`,
      "success",
    );
    router.back();
  });

  const handleBlockHost = () => {
    setBlocked(true);
    showToast(
      "Host blocked locally",
      "This host will be hidden in your local prototype sessions.",
      "info",
    );
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.screen}>
      <AppHeader
        title={isHost ? "Report / Block Host" : "Report Event"}
        showBack={false}
        rightAction={{
          label: "Cancel",
          onPress: () => router.back(),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="subheading" style={styles.sectionTitle}>
          Why are you reporting this {isHost ? "host" : "event"}?
        </AppText>

        <Controller
          control={form.control}
          name="reason"
          render={({ field: { value, onChange } }) => (
            <View style={styles.reasonsGrid}>
              {REASONS.map((r) => (
                <Chip
                  key={r.id}
                  label={r.label}
                  active={value === r.id}
                  onPress={() => onChange(r.id)}
                />
              ))}
            </View>
          )}
        />

        <Controller
          control={form.control}
          name="details"
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Additional Details (Optional)"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="Provide context for moderation..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          )}
        />

        {isHost ? (
          <View style={styles.blockSection}>
            <AppText variant="subheading" style={styles.sectionTitle}>
              Block Host
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Blocking prevents you from seeing events hosted by this user in
              your prototype discovery feed.
            </AppText>
            <SecondaryButton
              label={blocked ? "Host Blocked" : "Block Host"}
              disabled={blocked}
              onPress={handleBlockHost}
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton label="Submit Report" onPress={submit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  reasonsGrid: {
    gap: theme.spacing.xs,
  },
  blockSection: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surfacePrimary,
  },
});
