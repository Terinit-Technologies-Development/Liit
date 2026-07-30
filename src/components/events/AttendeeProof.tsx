import React from "react";
import { StyleSheet, View } from "react-native";
import { ImageAssetKey } from "../../assets/image-registry";
import { AppText } from "../ui/AppText";
import { AttendeeStack } from "../discovery/AttendeeStack";
import { Card } from "../ui/Card";
import { theme } from "../../design-system/theme";

export interface AttendeeProofProps {
  imageKeys: ImageAssetKey[];
  count: number;
}

export function AttendeeProof({ imageKeys, count }: AttendeeProofProps) {
  return (
    <Card radius="xl" padding="md" style={styles.card}>
      <View style={styles.row}>
        <AttendeeStack avatarKeys={imageKeys} count={count} maxVisible={3} />
        <AppText variant="caption" color={theme.colors.textSecondary}>
          <AppText variant="caption" style={styles.bold}>
            {count}+ people
          </AppText>{" "}
          attending or interested
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  bold: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
});
