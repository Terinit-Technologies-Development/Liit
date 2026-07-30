import React from "react";
import { StyleSheet, View } from "react-native";
import { HostMetric } from "../../domain/hosts/public-host";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { theme } from "../../design-system/theme";

export interface HostMetricsProps {
  metrics: HostMetric[];
}

export function HostMetrics({ metrics }: HostMetricsProps) {
  if (metrics.length === 0) return null;

  return (
    <Card radius="xl" padding="md" style={styles.card}>
      <View style={styles.row}>
        {metrics.map((m, index) => (
          <React.Fragment key={m.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.metricItem}>
              <AppText variant="subheading" style={styles.val}>
                {m.value}
              </AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {m.label}
              </AppText>
            </View>
          </React.Fragment>
        ))}
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
    justifyContent: "space-around",
  },
  metricItem: {
    alignItems: "center",
    gap: 2,
  },
  val: {
    fontWeight: "800",
    color: theme.colors.accentStart,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.borderSubtle,
  },
});
