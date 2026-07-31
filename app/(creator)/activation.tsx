import React from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { TextField } from "../../src/components/forms/TextField";
import { Icon } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import { ROUTES } from "../../src/navigation/routes";

export default function CreatorActivation() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
      <AppHeader title="Creator Account Setup" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Upload */}
        <View style={styles.avatarSection}>
          <Pressable
            style={styles.avatarPlaceholder}
            onPress={() =>
              Alert.alert("Prototype", "Avatar upload not available.")
            }
          >
            <Icon name="add" size="lg" color={theme.colors.textMuted} />
          </Pressable>
          <AppText
            variant="caption"
            color="textMuted"
            style={{ marginTop: theme.spacing.sm }}
          >
            Add Profile Photo
          </AppText>
        </View>

        <View style={styles.spacer} />

        {/* Form Fields */}
        <AppText variant="label" style={styles.label}>
          Brand / Artist Name
        </AppText>
        <TextField
          placeholder="Enter your creator name"
          value=""
          onChangeText={() => {}}
        />

        <View style={styles.spacer} />

        <AppText variant="label" style={styles.label}>
          Bio
        </AppText>
        <TextField
          placeholder="Tell fans about yourself"
          value=""
          onChangeText={() => {}}
          multiline
          style={{ minHeight: 80 }}
        />

        <View style={styles.spacer} />

        <AppText variant="label" style={styles.label}>
          Instagram (Optional)
        </AppText>
        <TextField placeholder="@username" value="" onChangeText={() => {}} />

        <View style={styles.spacer} />

        <AppText variant="label" style={styles.label}>
          TikTok (Optional)
        </AppText>
        <TextField placeholder="@username" value="" onChangeText={() => {}} />

        <View style={styles.spacerLg} />

        <View style={{ alignItems: "center" }}>
          <AppText variant="caption" color="textMuted">
            PROTOTYPE — account setup is simulated
          </AppText>
        </View>

        <View style={styles.spacer} />

        {/* Action */}
        <AppButton
          label="Activate Creator Account"
          onPress={() => router.push(ROUTES.creator.dashboard as any)}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  avatarSection: { alignItems: "center", marginVertical: theme.spacing.xl },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderStyle: "dashed",
  },
  label: { marginBottom: theme.spacing.xs },
  spacer: { height: theme.spacing.md },
  spacerLg: { height: theme.spacing.xxl },
});
