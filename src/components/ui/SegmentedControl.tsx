import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { theme } from "../../design-system/theme";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  badgeCount?: number;
  testID?: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentOption<T>[];
  onChange(value: T): void;
  accessibilityLabel: string;
  testID?: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
  testID,
}: SegmentedControlProps<T>) {
  return (
    <View
      testID={testID}
      style={styles.container}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            testID={option.testID ?? `segment-${option.value}`}
            accessibilityRole="tab"
            accessibilityLabel={
              option.badgeCount !== undefined
                ? `${option.label}, ${option.badgeCount}`
                : option.label
            }
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              isSelected && styles.segmentSelected,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="label"
              color={
                isSelected
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary
              }
            >
              {option.label}
            </AppText>
            {option.badgeCount !== undefined && option.badgeCount > 0 ? (
              <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                <AppText variant="caption" style={styles.badgeText}>
                  {option.badgeCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radii.pill,
    padding: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  segment: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    minHeight: 44,
  },
  segmentSelected: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  pressed: {
    opacity: 0.8,
  },
  badge: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSelected: {
    backgroundColor: theme.colors.purple,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
});
