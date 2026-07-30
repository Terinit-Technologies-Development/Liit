import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { HostHighlight } from "../../domain/hosts/public-host";
import { AppText } from "../ui/AppText";
import { AppImage } from "../ui/AppImage";
import { Card } from "../ui/Card";
import { getImageSource } from "../../assets/image-registry";
import { theme } from "../../design-system/theme";

export interface PastHighlightRailProps {
  items: HostHighlight[];
}

export function PastHighlightRail({ items }: PastHighlightRailProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <AppText variant="subheading" style={styles.sectionTitle}>
        Past Highlights
      </AppText>

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        renderItem={({ item }) => (
          <Card radius="xl" padding="sm" style={styles.highlightCard}>
            <AppImage
              source={getImageSource(item.imageKey)}
              style={styles.image}
              accessibilityLabel={item.title}
            />
            <AppText variant="label" numberOfLines={1} style={styles.title}>
              {item.title}
            </AppText>
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              numberOfLines={2}
            >
              {item.caption}
            </AppText>
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
  highlightCard: {
    width: 180,
    backgroundColor: theme.colors.surfacePrimary,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    gap: 4,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: theme.radii.sm,
  },
  title: {
    fontWeight: "700",
  },
});
