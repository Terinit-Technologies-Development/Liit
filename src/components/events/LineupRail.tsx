import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { LineupMember } from "../../domain/event-detail";
import { AppText } from "../ui/AppText";
import { AppImage } from "../ui/AppImage";
import { Card } from "../ui/Card";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface LineupRailProps {
  members: LineupMember[];
}

export function LineupRail({ members }: LineupRailProps) {
  if (members.length === 0) return null;

  return (
    <View style={styles.container}>
      <AppText variant="subheading" style={styles.sectionTitle}>
        Lineup
      </AppText>

      <FlatList
        horizontal
        data={members}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        renderItem={({ item }) => (
          <Card radius="xl" padding="sm" style={styles.memberCard}>
            <AppImage
              source={getImageSource(item.imageKey)}
              style={styles.avatar}
              accessibilityLabel={`${item.name} artwork`}
            />

            <AppText variant="label" numberOfLines={1} style={styles.name}>
              {item.name}
            </AppText>

            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              numberOfLines={1}
            >
              {item.role}
            </AppText>

            {item.startTimeLabel ? (
              <AppText variant="caption" color={theme.colors.accentStart}>
                ⏱️ {item.startTimeLabel}
              </AppText>
            ) : null}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  railContent: {
    gap: theme.spacing.sm,
  },
  memberCard: {
    width: 140,
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    gap: 4,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 4,
  },
  name: {
    fontWeight: "700",
    textAlign: "center",
  },
});
