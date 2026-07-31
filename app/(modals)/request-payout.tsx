import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { Screen } from "../../src/components/ui/Screen";
import { Spacer } from "../../src/components/ui/Spacer";
import { PrototypeBadge } from "../../src/components/ui/PrototypeBadge";

export default function RequestPayoutModal() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const availableBalance = 4500;

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || val > availableBalance) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  const val = parseFloat(amount);
  return (
    <Screen safeAreaEdges={["bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="heading" color="textPrimary">
            Request Payout
          </AppText>
          <PrototypeBadge />
        </View>
        <Spacer size="md" />

        <AppText variant="body" color="textSecondary">
          Available Balance: ZAR {availableBalance}
        </AppText>
        <Spacer size="xl" />

        <View style={styles.inputContainer}>
          <AppText variant="bodyStrong">ZAR </AppText>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#666"
          />
        </View>

        <Spacer size="xxxl" />

        <AppButton
          label="Submit Request"
          onPress={handleSubmit}
          disabled={
            !amount ||
            isNaN(Number(amount)) ||
            Number(amount) <= 0 ||
            Number(amount) > availableBalance
          }
          loading={status === "processing"}
        />
        <Spacer size="md" />
        <AppButton
          label="Cancel"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    borderRadius: 8,
    height: 56,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
  },
});
