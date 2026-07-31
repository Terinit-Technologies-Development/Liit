import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { theme } from "../../src/design-system/theme";
import { Spacer } from "../../src/components/ui/Spacer";
import { PrototypeBadge } from "../../src/components/ui/PrototypeBadge";

export default function PublishConfirmationModal() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  return (
    <Screen safeAreaEdges={["bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="heading" color="textPrimary">
            Ready to Publish?
          </AppText>
          <PrototypeBadge />
        </View>
        <Spacer size="md" />

        <AppButton
          label="Publish Event"
          onPress={() => {
            setSuccess(true);
            setTimeout(() => router.back(), 2000);
          }}
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
    padding: theme.spacing.xl,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
