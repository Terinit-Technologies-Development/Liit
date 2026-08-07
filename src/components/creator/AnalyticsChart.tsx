import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface ChartDataPoint {
  label: string;
  value: number;
  formattedValue?: string;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  title?: string;
  unit?: string;
  accentColor?: string;
}

export function AnalyticsChart({
  data,
  title,
  unit = "",
  accentColor = theme.colors.accentStart,
}: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText variant="caption" color="textMuted">
          No chart data available
        </AppText>
      </View>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 120;

  const accessibleSummary = data
    .map(
      (d) =>
        `${d.label}: ${d.formattedValue || `${d.value}${unit ? ` ${unit}` : ""}`}`,
    )
    .join(", ");

  return (
    <View style={styles.container}>
      {title && (
        <AppText variant="label" style={styles.title}>
          {title}
        </AppText>
      )}

      {/* Visual Chart */}
      <View
        style={[styles.chartArea, { height: chartHeight }]}
        accessibilityLabel={`${title || "Analytics Chart"}: ${accessibleSummary}`}
        accessibilityRole="summary"
      >
        {data.map((item, idx) => {
          const barHeight = (item.value / max) * (chartHeight - 24);
          return (
            <View key={idx} style={styles.column}>
              <AppText
                variant="caption"
                color="textMuted"
                style={styles.valueText}
              >
                {item.formattedValue || item.value}
              </AppText>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 6),
                      backgroundColor: accentColor,
                    },
                  ]}
                />
              </View>
              <AppText
                variant="caption"
                color="textMuted"
                style={styles.labelText}
              >
                {item.label}
              </AppText>
            </View>
          );
        })}
      </View>

      {/* Accessible Text Alternative Table */}
      <View style={styles.accessibleTable}>
        <AppText
          variant="caption"
          color="textMuted"
          style={styles.tableHeading}
        >
          Data Summary:
        </AppText>
        {data.map((d, i) => (
          <View key={i} style={styles.tableRow}>
            <AppText variant="caption" color="textMuted">
              {d.label}
            </AppText>
            <AppText
              variant="caption"
              color="textPrimary"
              style={{ fontWeight: "600" }}
            >
              {d.formattedValue || `${d.value} ${unit}`}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginVertical: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  barTrack: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  bar: {
    width: "80%",
    maxWidth: 28,
    borderRadius: 4,
  },
  valueText: {
    fontSize: 10,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    marginTop: 4,
  },
  accessibleTable: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  tableHeading: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
});
