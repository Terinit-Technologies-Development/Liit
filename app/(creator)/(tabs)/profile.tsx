import React from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { theme } from "../../../src/design-system/theme";
import { useCreatorProfile } from "../../../src/hooks/creator/useCreatorQueries";
import { EventStatusPill } from "../../../src/components/creator/EventStatusPill";
import { ROUTES } from "../../../src/navigation/routes";
import { Icon } from "../../../src/design-system/icons/Icon";

export default function CreatorProfileScreen() {
  const router = useRouter();
  const { data: profile } = useCreatorProfile();

  return (
    <Screen style={styles.container}>
      <AppHeader title="Profile" showBack={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {profile && (
          <View style={styles.header}>
            <View style={styles.avatarPlaceholder} />
            <AppText
              variant="heading"
              color="textPrimary"
              style={{ marginVertical: theme.spacing.sm }}
            >
              {profile.brandName}
            </AppText>
            <EventStatusPill status="published" />
            <AppText
              variant="body"
              color="textMuted"
              style={{ marginTop: theme.spacing.md, textAlign: "center" }}
            >
              {profile.bio}
            </AppText>
            <AppText
              variant="label"
              color="textMuted"
              style={{ marginTop: theme.spacing.md }}
            >
              0 Followers • 0 Events Hosted
            </AppText>
          </View>
        )}

        <Pressable
          style={styles.row}
          onPress={() => router.push(ROUTES.creator.payouts as any)}
        >
          <AppText variant="body" color="textPrimary">
            Payouts
          </AppText>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        <AppText
          variant="heading"
          color="textPrimary"
          style={styles.sectionTitle}
        >
          Settings
        </AppText>

        <Pressable
          style={styles.row}
          onPress={() => Alert.alert("Edit Profile", "Prototype only")}
        >
          <AppText variant="body" color="textPrimary">
            Edit Profile [PROTOTYPE]
          </AppText>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        <Pressable style={styles.row} onPress={() => {}}>
          <AppText variant="body" color="textPrimary">
            Social Links
          </AppText>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        <Pressable style={styles.row} onPress={() => {}}>
          <AppText variant="body" color="textPrimary">
            Privacy
          </AppText>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.row}
          onPress={() => router.push(ROUTES.modals.modeSwitch as any)}
        >
          <AppText variant="body" color="accentStart">
            Switch Mode
          </AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceElevated,
  },
  sectionTitle: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
});
