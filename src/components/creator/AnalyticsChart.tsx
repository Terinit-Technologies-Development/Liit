import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../../design-system/theme";

interface AnalyticsChartProps {
  data: number[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const height = 100;

  return (
    <View style={[styles.container, { height }]}>
      {data.map((val, idx) => {
        const barHeight = (val / max) * height;
        return (
          <View key={idx} style={styles.barContainer}>
            <View style={[styles.bar, { height: Math.max(barHeight, 4) }]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    gap: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  bar: {
    width: "80%",
    backgroundColor: theme.colors.accentStart,
    borderRadius: 2,
    opacity: 0.8,
  },
});
