import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SectionHeader } from "../ui/SectionHeader";
import { theme } from "../../design-system/theme";

export interface CollectionRailProps<T> {
  title: string;
  subtitle?: string;
  items: T[];
  keyExtractor(item: T): string;
  renderItem(item: T, index: number): React.ReactElement;
  onSeeAll?(): void;
  seeAllTestID?: string;
}

export function CollectionRail<T>({
  title,
  subtitle,
  items,
  keyExtractor,
  renderItem,
  onSeeAll,
  seeAllTestID,
}: CollectionRailProps<T>) {
  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actionLabel={onSeeAll ? "See All" : undefined}
        onAction={onSeeAll}
        actionTestID={seeAllTestID}
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.itemWrapper}>{renderItem(item, index)}</View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  itemWrapper: {
    justifyContent: "center",
  },
});
