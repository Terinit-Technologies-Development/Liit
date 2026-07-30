import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface HostBioProps {
  text: string;
}

export function HostBio({ text }: HostBioProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subheading" style={styles.title}>
        About this host
      </AppText>
      <AppText variant="body" color={theme.colors.textSecondary}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  title: {
    fontWeight: "700",
  },
});
