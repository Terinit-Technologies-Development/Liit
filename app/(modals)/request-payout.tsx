import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { Screen } from "../../src/components/ui/Screen";
import { TextField } from "../../src/components/forms/TextField";
import { Icon } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import {
  usePayoutsOverview,
  useRequestPayoutMutation,
} from "../../src/hooks/creator/useCreatorQueries";
import { formatCurrency } from "../../src/utils/format";
import { PayoutRequestState } from "../../src/domain/creator";

export default function RequestPayoutModal() {
  const router = useRouter();
  const { data: overview } = usePayoutsOverview();
  const requestMutation = useRequestPayoutMutation();

  const availableMinor = overview?.availableMinor || 1500000; // R15,000.00
  const [amountZar, setAmountZar] = useState("");
  const [state, setState] = useState<PayoutRequestState>("editing");
  const [errorMessage, setErrorMessage] = useState("");
  const [payoutReference, setPayoutReference] = useState("");

  const parsedAmountZar = parseFloat(amountZar || "0");
  const amountMinor = Math.round(parsedAmountZar * 100);

  const isValidAmount =
    !isNaN(parsedAmountZar) &&
    parsedAmountZar > 0 &&
    amountMinor <= availableMinor;

  const handleSubmit = () => {
    if (!isValidAmount) return;
    setState("processing");
    setErrorMessage("");

    requestMutation.mutate(amountMinor, {
      onSuccess: (data) => {
        setPayoutReference(data.reference || "PAY-REQ-9921");
        setState("success");
      },
      onError: (err: any) => {
        setErrorMessage(err?.message || "Failed to process payout request.");
        setState("failure");
      },
    });
  };

  return (
    <Screen
      style={styles.screen}
      safeAreaEdges={["bottom"]}
      testID="request-payout-modal"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="heading" color="textPrimary">
            Request Payout
          </AppText>
          <AppText variant="caption" color="textMuted">
            Transfer cleared earnings to linked bank account
          </AppText>
        </View>

        {/* Editing State */}
        {state === "editing" && (
          <>
            <View style={styles.card}>
              <AppText variant="caption" color="textMuted">
                Available for Immediate Payout:
              </AppText>
              <AppText variant="title" color="success" style={{ marginTop: 2 }}>
                {formatCurrency(availableMinor, "ZAR")}
              </AppText>
            </View>

            <View style={styles.fieldGroup}>
              <AppText variant="label" style={styles.label}>
                Payout Amount (ZAR)
              </AppText>
              <TextField
                placeholder="e.g. 5000.00"
                value={amountZar}
                onChangeText={setAmountZar}
                keyboardType="numeric"
              />
              {amountZar.trim() !== "" && (
                <AppText
                  variant="caption"
                  color={isValidAmount ? "textMuted" : "destructive"}
                  style={{ marginTop: 4 }}
                >
                  {isValidAmount
                    ? `Requesting: ${formatCurrency(amountMinor, "ZAR")}`
                    : parsedAmountZar <= 0
                      ? "Amount must be greater than R 0.00"
                      : "Amount exceeds available cleared balance"}
                </AppText>
              )}
            </View>

            <View style={styles.bankCard}>
              <Icon name="card" size="sm" color={theme.colors.accentStart} />
              <View style={{ flex: 1 }}>
                <AppText variant="label" color="textPrimary">
                  Destination Account
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {overview?.bankName || "Standard Bank South Africa"} (••••{" "}
                  {overview?.bankAccountLast4 || "4092"})
                </AppText>
              </View>
            </View>

            {/* Prototype Disclosure Banner */}
            <View style={styles.disclosureBanner}>
              <Icon name="info" size="xs" color={theme.colors.accentStart} />
              <AppText variant="caption" color="textMuted" style={{ flex: 1 }}>
                LIIT PROTOTYPE — no real bank transfer or payout has occurred.
              </AppText>
            </View>

            <View style={styles.actionRow}>
              <AppButton
                label="Submit Request"
                variant="primary"
                onPress={handleSubmit}
                disabled={!isValidAmount}
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

        {/* Processing State */}
        {state === "processing" && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.colors.accentStart} />
            <AppText
              variant="heading"
              color="textPrimary"
              style={{ marginTop: theme.spacing.md }}
            >
              Processing Payout Request...
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 4 }}
            >
              Communicating with South African clearing simulation.
            </AppText>
          </View>
        )}

        {/* Success State */}
        {state === "success" && (
          <View style={styles.centerBox}>
            <View style={styles.successIcon}>
              <Icon name="check" size="lg" color="#FFF" />
            </View>
            <AppText
              variant="heading"
              color="textPrimary"
              style={{ marginTop: theme.spacing.md }}
            >
              Payout Requested!
            </AppText>
            <AppText
              variant="body"
              color="textMuted"
              style={{ marginTop: 4, textAlign: "center" }}
            >
              {formatCurrency(amountMinor, "ZAR")} is being transferred to
              Standard Bank (•••• 4092).
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 4 }}
            >
              Reference ID: {payoutReference}
            </AppText>

            <View style={{ width: "100%", marginTop: theme.spacing.xl }}>
              <AppButton
                label="Done"
                variant="primary"
                onPress={() => router.back()}
              />
            </View>
          </View>
        )}

        {/* Failure State */}
        {state === "failure" && (
          <View style={styles.centerBox}>
            <View style={styles.failIcon}>
              <Icon name="close" size="lg" color="#FFF" />
            </View>
            <AppText
              variant="heading"
              color="textPrimary"
              style={{ marginTop: theme.spacing.md }}
            >
              Payout Failed
            </AppText>
            <AppText
              variant="body"
              color="destructive"
              style={{ marginTop: 4, textAlign: "center" }}
            >
              {errorMessage || "Simulated banking communication failure."}
            </AppText>

            <View
              style={{
                width: "100%",
                marginTop: theme.spacing.xl,
                gap: theme.spacing.sm,
              }}
            >
              <AppButton
                label="Retry Payout Request"
                variant="primary"
                onPress={() => setState("editing")}
              />
              <AppButton
                label="Cancel"
                variant="secondary"
                onPress={() => router.back()}
              />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  container: { padding: theme.spacing.xl, flex: 1, justifyContent: "center" },
  header: { marginBottom: theme.spacing.lg },
  card: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.lg,
  },
  fieldGroup: { marginBottom: theme.spacing.md },
  label: { marginBottom: theme.spacing.xs },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  disclosureBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  actionRow: { flexDirection: "row", gap: theme.spacing.sm },
  centerBox: { alignItems: "center", paddingVertical: theme.spacing.xl },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  failIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
});
